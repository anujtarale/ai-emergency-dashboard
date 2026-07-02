import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  PhoneCall,
  ShieldAlert,
  Bell,
  Users,
  MessageSquare,
  TrendingUp,
  Wifi,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAppStore } from '../store';
import { apiClient } from '../lib/api';
import type { Alert as ApiAlert } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';
import { useCallback } from 'react';

import Map from '../components/Map';

const Dashboard = () => {
  const { user, location, setLocation } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlerts, setActiveAlerts] = useState<ApiAlert[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string; relation: string; phone: string }[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const { on, off } = useSocket();

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await apiClient.getActiveAlerts();
      if (res.success && res.data) {
        setActiveAlerts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            lat: latitude,
            lng: longitude,
            address: 'Your Current Location',
          });
        },
        () => {},
      );
    }
  }, [setLocation]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const handleNewAlert = (alert: ApiAlert) => {
      setActiveAlerts(prev => {
        if (!alert.active) return prev;
        const alertId = alert._id || (alert as any).id;
        if (prev.find(a => (a._id || (a as any).id) === alertId)) return prev;
        
        if (alert.severity === 'critical' || alert.severity === 'high') {
          toast.error(`EMERGENCY: ${alert.title}`, {
            icon: '🚨',
            duration: 8000
          });
        }
        
        return [alert, ...prev].sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
      });
    };

    const handleUpdateAlert = (alert: ApiAlert) => {
      setActiveAlerts(prev => {
        const alertId = alert._id || (alert as any).id;
        if (!alert.active) return prev.filter(a => (a._id || (a as any).id) !== alertId);
        const exists = prev.find(a => (a._id || (a as any).id) === alertId);
        if (exists) return prev.map(a => (a._id || (a as any).id) === alertId ? alert : a);
        return [alert, ...prev].sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
      });
    };

    const handleDeleteAlert = (data: { id: string }) => {
      setActiveAlerts(prev => prev.filter(a => (a._id || (a as any).id) !== data.id));
    };

    on('new-alert', handleNewAlert);
    on('update-alert', handleUpdateAlert);
    on('delete-alert', handleDeleteAlert);

    return () => {
      off('new-alert', handleNewAlert);
      off('update-alert', handleUpdateAlert);
      off('delete-alert', handleDeleteAlert);
    };
  }, [on, off]);

  useEffect(() => {
    apiClient.getContacts()
      .then(res => {
        if (res.success && res.data.length > 0) {
          setContacts(res.data.map((c: any) => ({
            id: c._id,
            name: c.name,
            relation: c.relation || '',
            phone: c.phone
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    { icon: ShieldAlert, label: 'Emergency SOS', to: '/sos', color: 'from-red-500 to-red-600', shadow: 'shadow-red-500/30', desc: 'Activate SOS alert' },
    { icon: MessageSquare, label: 'AI Assistant', to: '/assistant', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/30', desc: 'Get emergency help' },
    { icon: MapPin, label: 'Live Map', to: '/map', color: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/30', desc: 'View real-time map' },
    { icon: PhoneCall, label: 'Nearby Services', to: '/services', color: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/30', desc: 'Hospitals & police' },
  ];

  const criticalAlertCount = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;

  const statsRow = [
    { label: 'Active Alerts', value: loadingAlerts ? '...' : criticalAlertCount.toString(), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Nearby Services', value: '28', icon: PhoneCall, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Safety Score', value: 'Low Risk', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Connection', value: 'Online', icon: Wifi, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').slice(0, 2);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Welcome back, <span className="text-blue-600 dark:text-blue-400">{user?.name || 'User'}</span>!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
            {currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp;
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Area is Currently Safe
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {statsRow.map((stat, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 shadow-sm`}
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
              <p className={`text-base font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + idx * 0.07 }}
            >
              <Link to={action.to}>
                <div className={`group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg ${action.shadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer`}>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-200 rounded-2xl" />
                  <action.icon className="h-8 w-8 text-white mb-3" />
                  <p className="font-bold text-white text-base">{action.label}</p>
                  <p className="text-white/75 text-xs mt-0.5">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Map + Risk Score */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-gray-900 dark:text-white text-base">
                <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                Current Location
              </CardTitle>
              <CardDescription className="text-xs">
                {location?.address || 'Ahmedabad, Gujarat, India'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div style={{ height: '220px' }} className="overflow-hidden">
                {location?.lat && location?.lng ? (
                  <Map
                    center={[location.lat, location.lng]}
                    zoom={14}
                    showUserMarker={true}
                    className="h-full w-full"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 gap-2">
                    <MapPin className="h-8 w-8 animate-pulse text-blue-400" />
                    <p className="text-sm">Detecting current location...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-gray-200 dark:border-gray-700 shadow-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white text-base">
                <ShieldAlert className="mr-2 h-4 w-4 text-green-500" />
                Emergency Risk Score
              </CardTitle>
              <CardDescription>Current risk level in your area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-4 gap-4">
                <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-white leading-tight">Low</p>
                    <p className="text-xs text-white/80 font-medium">Risk</p>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  {[
                    { label: 'Weather', pct: 20, color: 'bg-green-400' },
                    { label: 'Security', pct: 15, color: 'bg-blue-400' },
                    { label: 'Traffic', pct: 40, color: 'bg-yellow-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">{item.label}</span>
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${item.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alerts + Contacts */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 px-3 sm:px-4 py-2 sm:py-3">
              <CardTitle className="flex items-center text-gray-900 dark:text-white text-xs sm:text-sm">
                <Bell className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
                Active Alerts
              </CardTitle>
              <Link to="/alerts">
                <span className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">View all</span>
              </Link>
            </CardHeader>
            <CardContent className="space-y-1.5 sm:space-y-2 px-3 sm:px-4 pb-3 sm:pb-4">
              {criticalAlerts.length > 0 ? criticalAlerts.map((alert) => {
                const id = alert._id || (alert as any).id;
                return (
                  <div key={id} className={`flex items-start gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl border ${alert.severity === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                    : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
                    }`}>
                    <div className={`mt-0.5 p-1 sm:p-1.5 rounded-lg ${alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                      <AlertTriangle className={`h-3 w-3 sm:h-4 sm:w-4 ${alert.severity === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate uppercase tracking-tight">{alert.title}</h4>
                        <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                          {new Date(alert.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2 leading-tight">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 shrink-0" />
                  <p className="text-[11px] sm:text-xs text-green-700 dark:text-green-300 font-medium">No critical alerts in your area</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 py-2 sm:py-3">
              <CardTitle className="flex items-center text-gray-900 dark:text-white text-xs sm:text-sm">
                <Users className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 sm:space-y-2 px-3 sm:px-4 pb-3 sm:pb-4">
              {contacts.length === 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                  <Users className="h-4 w-4 text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">No contacts added yet</p>
                </div>
              ) : contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between gap-1.5 sm:gap-2 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shrink-0">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-[11px] sm:text-xs truncate">{contact.name}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate">{contact.relation}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-2 h-7 sm:h-9 shrink-0">
                    <PhoneCall className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Call
                  </Button>
                </div>
              ))}
              <div className="pt-1">
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="w-full text-[10px] sm:text-xs gap-1.5 sm:gap-2 h-8 sm:h-9">
                    <Users className="h-3.5 w-3.5" />
                    Manage Contacts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
