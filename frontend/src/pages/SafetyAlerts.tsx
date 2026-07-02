import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, AlertTriangle, CloudRain, Car, Tornado, ShieldAlert, Loader2 } from 'lucide-react';
import { apiClient } from '../lib/api';
import type { Alert } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';

const getRelativeTime = (ts: string): string => {
  const diffMs = Date.now() - new Date(ts).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case 'critical':
      return {
        card: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10',
        badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
        dot: 'bg-red-500',
        glow: 'shadow-red-100 dark:shadow-red-900/20',
        iconBg: 'bg-red-100 dark:bg-red-900/50',
        iconColor: 'text-red-600 dark:text-red-400',
        label: 'CRITICAL',
      };
    case 'high':
      return {
        card: 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10',
        badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
        dot: 'bg-orange-500',
        glow: 'shadow-orange-100 dark:shadow-orange-900/20',
        iconBg: 'bg-orange-100 dark:bg-orange-900/50',
        iconColor: 'text-orange-600 dark:text-orange-400',
        label: 'HIGH',
      };
    case 'medium':
      return {
        card: 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
        badge: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
        dot: 'bg-yellow-500',
        glow: '',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        label: 'MEDIUM',
      };
    default:
      return {
        card: 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10',
        badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
        dot: 'bg-green-500',
        glow: '',
        iconBg: 'bg-green-100 dark:bg-green-900/50',
        iconColor: 'text-green-600 dark:text-green-400',
        label: 'LOW',
      };
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'weather': return CloudRain;
    case 'traffic': return Car;
    case 'disaster': return Tornado;
    case 'security': return ShieldAlert;
    default: return Bell;
  }
};

const SafetyAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { on, off } = useSocket();

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await apiClient.getActiveAlerts();
      if (res.success && res.data) {
        setAlerts(res.data);
      }
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const handleNewAlert = (alert: Alert) => {
      setAlerts(prev => {
        // Only add if not already in list and is active
        if (!alert.active) return prev;
        const alertId = alert._id || (alert as any).id;
        if (prev.find(a => (a._id || (a as any).id) === alertId)) return prev;
        
        toast.error(`NEW ALERT: ${alert.title}`, {
          icon: '🚨',
          duration: 6000
        });
        
        return [alert, ...prev].sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
      });
    };

    const handleUpdateAlert = (alert: Alert) => {
      setAlerts(prev => {
        // If alert was set to inactive, remove it
        if (!alert.active) {
          const alertId = alert._id || (alert as any).id;
          return prev.filter(a => (a._id || (a as any).id) !== alertId);
        }
        
        // If alert was already in list, update it
        const alertId = alert._id || (alert as any).id;
        const exists = prev.find(a => (a._id || (a as any).id) === alertId);
        if (exists) {
          return prev.map(a => (a._id || (a as any).id) === alertId ? alert : a);
        }
        
        // If alert was not in list but is now active, add it
        return [alert, ...prev].sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
      });
    };

    const handleDeleteAlert = (data: { id: string }) => {
      setAlerts(prev => prev.filter(a => (a._id || (a as any).id) !== data.id));
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

  const critical = alerts.filter(a => a.severity === 'critical');
  const high = alerts.filter(a => a.severity === 'high');
  const rest = alerts.filter(a => a.severity !== 'critical' && a.severity !== 'high');

  const summaryStats = [
    { label: 'Critical', count: critical.length, color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' },
    { label: 'High', count: high.length, color: 'bg-orange-500', textColor: 'text-orange-600 dark:text-orange-400' },
    { label: 'Medium', count: alerts.filter(a => a.severity === 'medium').length, color: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Low', count: alerts.filter(a => a.severity === 'low').length, color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            Safety Alerts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Stay informed about emergencies and hazards in your area
          </p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 font-medium">
            <Clock className="h-4 w-4" />
            {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {summaryStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className={`w-3 h-3 rounded-full ${stat.color} shrink-0`} />
            <div>
              <p className={`text-2xl font-extrabold ${stat.textColor}`}>{stat.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No active alerts</p>
          <p className="text-xs mt-1">Your area is currently safe</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...critical, ...high, ...rest].map((alert, idx) => {
            const cfg = getSeverityConfig(alert.severity);
            const TypeIcon = getTypeIcon(alert.type);
            const isPulsing = alert.severity === 'critical';

            return (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <div className={`rounded-xl ${cfg.card} shadow-sm ${cfg.glow} overflow-hidden`}>
                  <div className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                    <div className={`relative shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${cfg.iconBg} flex items-center justify-center`}>
                      <TypeIcon className={`h-5 w-5 ${cfg.iconColor}`} />
                      {isPulsing && (
                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`} />
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.dot}`} />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{alert.title}</h3>
                        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge} uppercase tracking-wide`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{alert.description}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(alert.createdAt || '')}
                        <span className="mx-1">·</span>
                        <AlertTriangle className="h-3 w-3" />
                        <span className="capitalize">{alert.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SafetyAlerts;
