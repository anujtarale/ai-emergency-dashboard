import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  ShieldAlert, Loader2, RefreshCw, Clock, MapPin, User,
  CheckCircle2, AlertTriangle, XCircle, Activity, Radio
} from 'lucide-react';
import { apiClient, type SOSRequest } from '../lib/api';
import toast from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';

const statusConfig = {
  pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300', icon: AlertTriangle, dot: 'bg-yellow-500' },
  active:  { label: 'Active',  color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-300', icon: Radio, dot: 'bg-blue-500' },
  resolved:{ label: 'Resolved',color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-300', icon: CheckCircle2, dot: 'bg-green-500' },
  cancelled:{ label: 'Cancelled', color: 'text-gray-500 bg-gray-50 dark:bg-gray-800 border-gray-300', icon: XCircle, dot: 'bg-gray-400' },
};

const getRelativeTime = (ts: string) => {
  const diffMs = Date.now() - new Date(ts).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

const AdminSOS = () => {
  const [sosList, setSOSList] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SOSRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const { on, off } = useSocket();

  const fetchSOS = useCallback(async () => {
    try {
      const res = await apiClient.adminGetAllSOS();
      setSOSList(res.data);
      setLastUpdate(new Date().toLocaleTimeString());
      setSelected(prev => {
        if (!prev) return null;
        const updated = res.data.find(s => s._id === prev._id);
        return updated || prev;
      });
    } catch (e: any) {
      toast.error(e.message || 'Failed to load SOS requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSOS();
  }, [fetchSOS]);

  // Listen to real-time SOS updates
  useEffect(() => {
    const handleSOSAlert = () => {
      toast.success('New SOS Alert!', {
        icon: '🚨',
        duration: 5000
      });
      fetchSOS();
    };

    on('sos-alert', handleSOSAlert);

    const interval = setInterval(() => {
      fetchSOS();
    }, 30000);

    return () => {
      clearInterval(interval);
      off('sos-alert', handleSOSAlert);
    };
  }, [on, off, fetchSOS]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await apiClient.adminUpdateSOSStatus(id, status);
      toast.success(`SOS request marked as ${status}`);
      fetchSOS();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update status');
    }
  };

  const filtered = sosList.filter(s => filterStatus === 'all' || s.status === filterStatus);

  const counts = {
    pending: sosList.filter(s => s.status === 'pending').length,
    active: sosList.filter(s => s.status === 'active').length,
    resolved: sosList.filter(s => s.status === 'resolved').length,
    cancelled: sosList.filter(s => s.status === 'cancelled').length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            SOS Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Live distress signal tracker — auto-refreshes every 30 seconds.
            {lastUpdate && <span className="ml-2 text-xs font-semibold text-blue-600 dark:text-blue-400">Last updated: {lastUpdate}</span>}
          </p>
        </div>
        <Button variant="outline" onClick={fetchSOS} className="gap-2 shrink-0">
          <RefreshCw className="h-4 w-4" /> Refresh Now
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(key => {
          const cfg = statusConfig[key];
          const Icon = cfg.icon;
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
              className={`p-4 rounded-xl border text-left transition-all ${filterStatus === key ? cfg.color + ' shadow-md' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">{cfg.label}</span>
              </div>
              <p className="text-2xl font-extrabold">{counts[key]}</p>
            </motion.button>
          );
        })}
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SOS List */}
          <div className="lg:col-span-1 space-y-3 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
            {filtered.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-900 border rounded-xl text-gray-400">
                <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No SOS requests found.</p>
              </div>
            )}
            <AnimatePresence>
              {filtered.map(sos => {
                const cfg = statusConfig[sos.status] || statusConfig.pending;
                const isSelected = selected?._id === sos._id;
                const user = typeof sos.userId === 'object' ? sos.userId : null;
                return (
                  <motion.div
                    key={sos._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={() => setSelected(isSelected ? null : sos)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10 shadow-md' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${cfg.dot}`} />
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" /> {getRelativeTime(sos.createdAt)}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium truncate">{user?.name || 'Unknown User'}</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-400" />
                        <span className="text-xs truncate">{sos.address || `${sos.location?.coordinates?.[1]?.toFixed(4)}, ${sos.location?.coordinates?.[0]?.toFixed(4)}`}</span>
                      </div>
                      {sos.emergencyType && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                          <span className="text-xs capitalize text-orange-600 dark:text-orange-400 font-medium">{sos.emergencyType}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* SOS Detail Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Card className="border-gray-200 dark:border-gray-800 shadow-sm h-full">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">SOS Detail</CardTitle>
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">ID: #{selected._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${statusConfig[selected.status]?.color || ''}`}>
                          {selected.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-5">
                      {/* User Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Caller Information</p>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {typeof selected.userId === 'object' ? selected.userId?.name : 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {typeof selected.userId === 'object' ? selected.userId?.email : ''}
                          </p>
                          {typeof selected.userId === 'object' && selected.userId?.phone && (
                            <p className="text-xs font-mono text-blue-600">{selected.userId.phone}</p>
                          )}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Location Details</p>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white flex items-start gap-1.5">
                            <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            {selected.address || 'Address not provided'}
                          </p>
                          <p className="text-xs font-mono text-gray-400">
                            {selected.location?.coordinates?.[1]?.toFixed(6)}, {selected.location?.coordinates?.[0]?.toFixed(6)}
                          </p>
                        </div>
                      </div>

                      {/* Emergency Type & Description */}
                      {(selected.emergencyType || selected.description) && (
                        <div className="space-y-2">
                          {selected.emergencyType && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-semibold capitalize text-orange-600 dark:text-orange-400">
                                Emergency Type: {selected.emergencyType}
                              </span>
                            </div>
                          )}
                          {selected.description && (
                            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3">
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selected.description}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="text-xs text-gray-400 font-mono flex flex-col sm:flex-row gap-1 sm:gap-4">
                        <span>Created: {new Date(selected.createdAt).toLocaleString()}</span>
                        <span>Updated: {new Date(selected.updatedAt).toLocaleString()}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Update Response Status</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(statusConfig).map(([status]) => {
                            return (
                              <Button
                                key={status}
                                size="sm"
                                variant={selected.status === status ? 'default' : 'outline'}
                                className={`gap-1.5 text-xs capitalize ${selected.status === status ? '' : ''}`}
                                disabled={selected.status === status}
                                onClick={() => handleStatusUpdate(selected._id, status)}
                              >
                                {statusConfig[status as keyof typeof statusConfig].label}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
                >
                  <div className="text-center text-gray-400">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Select a distress call to view details</p>
                    <p className="text-xs mt-1 opacity-70">Click any SOS request from the list on the left</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSOS;
