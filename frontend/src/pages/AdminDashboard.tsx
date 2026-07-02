import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Users, AlertTriangle, Activity, FileText,
  Cpu, Database, MemoryStick, Clock, CheckCircle2, Loader2
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'logs'>('overview');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const { on, off } = useSocket();

  const loadStats = async () => {
    try {
      const res = await apiClient.adminGetStats();
      setStats(res.data);
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load admin stats');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Listen to real-time SOS and Report updates
  useEffect(() => {
    const handleSOSAlert = () => {
      toast.success('New SOS Alert Received!', {
        icon: '🚨',
        duration: 5000
      });
      loadStats();
    };

    const handleNewReport = () => {
      toast.success('New Emergency Report Submitted!', {
        icon: '📋',
        duration: 5000
      });
      loadStats();
    };

    on('sos-alert', handleSOSAlert);
    on('new-report', handleNewReport);
    on('new-alert', loadStats);
    on('update-alert', loadStats);
    on('delete-alert', loadStats);

    const interval = setInterval(() => {
      loadStats();
    }, 30000);

    return () => {
      clearInterval(interval);
      off('sos-alert', handleSOSAlert);
      off('new-report', handleNewReport);
      off('new-alert', loadStats);
      off('update-alert', loadStats);
      off('delete-alert', loadStats);
    };
  }, [on, off]);

  const getRelativeTime = (ts: string) => {
    const diffMs = Date.now() - new Date(ts).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const health = stats?.health || {};
  const users = stats?.users || {};
  const sos = stats?.sos || {};
  const reports = stats?.reports || {};
  const recentLogs = stats?.recentLogs || [];

  const summaryCards = [
    { label: 'Total Users', value: users.total || 0, sub: `${users.active || 0} active sessions`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', trend: '+12%' },
    { label: 'SOS Requests', value: sos.total || 0, sub: `${sos.active || 0} currently active`, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', trend: `${sos.resolved || 0} resolved` },
    { label: 'Emergency Reports', value: reports.total || 0, sub: `${reports.submitted || 0} pending review`, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', trend: `${reports.resolved || 0} resolved` },
    { label: 'System Uptime', value: formatUptime(health.uptime || 0), sub: health.dbConnected ? 'Database Online' : 'DB Offline', icon: Activity, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', trend: 'Healthy' },
  ];

  const healthMetrics = [
    { label: 'Memory Used', value: `${health.memory?.heapUsed || 0} MB`, icon: MemoryStick, sub: `of ${health.memory?.heapTotal || 0} MB heap` },
    { label: 'Free System RAM', value: `${health.memory?.freeMemPercent || 0}%`, icon: Cpu, sub: 'available' },
    { label: 'CPU Cores', value: health.cpu?.cores || 0, icon: Cpu, sub: `Load: ${(health.cpu?.loadAvg?.[0] || 0).toFixed(2)}` },
    { label: 'Database', value: health.dbConnected ? 'Connected' : 'Offline', icon: Database, sub: 'MongoDB' },
    { label: 'Uptime', value: formatUptime(health.uptime || 0), icon: Clock, sub: 'since last restart' },
    { label: 'RSS Memory', value: `${health.memory?.rss || 0} MB`, icon: MemoryStick, sub: 'process total' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Full system overview — real-time statistics and health monitoring.
            {lastUpdate && <span className="ml-2 text-xs font-semibold text-blue-600 dark:text-blue-400">Last updated: {lastUpdate}</span>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={loadStats} className="gap-2 shrink-0">
            <Loader2 className="h-4 w-4" /> Refresh
          </Button>
          <Link to="/admin/users"><Button variant="outline" size="sm">Manage Users</Button></Link>
          <Link to="/admin/features"><Button variant="outline" size="sm">Feature Flags</Button></Link>
          <Link to="/admin/analytics"><Button size="sm">View Analytics</Button></Link>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                    <p className={`text-2xl font-extrabold ${card.color} truncate`}>{card.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.sub}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[{ key: 'overview', label: 'Overview' }, { key: 'health', label: 'System Health' }, { key: 'logs', label: 'Activity Logs' }].map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SOS Summary */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                SOS Request Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Pending', value: sos.pending || 0, color: 'bg-yellow-400' },
                { label: 'Active', value: sos.active || 0, color: 'bg-blue-500' },
                { label: 'Resolved', value: sos.resolved || 0, color: 'bg-green-500' },
                { label: 'Cancelled', value: sos.cancelled || 0, color: 'bg-gray-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-20 shrink-0">{s.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div className={`h-full ${s.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.value / (sos.total || 1)) * 100}%` }}
                      transition={{ duration: 0.8 }} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 w-6 text-right">{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reports Summary */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Emergency Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Submitted', value: reports.submitted || 0, color: 'bg-blue-400' },
                { label: 'Reviewing', value: reports.reviewing || 0, color: 'bg-yellow-400' },
                { label: 'Resolved', value: reports.resolved || 0, color: 'bg-green-500' },
                { label: 'Rejected', value: reports.rejected || 0, color: 'bg-red-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-20 shrink-0">{s.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div className={`h-full ${s.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.value / (reports.total || 1)) * 100}%` }}
                      transition={{ duration: 0.8 }} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 w-6 text-right">{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Tab */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthMetrics.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardContent className="pt-5 pb-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                    <m.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{m.value}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{m.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <div className="sm:col-span-2 lg:col-span-3">
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              health.dbConnected
                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
            }`}>
              <CheckCircle2 className={`h-5 w-5 ${health.dbConnected ? 'text-green-500' : 'text-red-500'}`} />
              <p className={`text-sm font-semibold ${health.dbConnected ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                MongoDB Atlas: {health.dbConnected ? 'Connected & Healthy' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    {['Action', 'User', 'IP Address', 'Time'].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentLogs.map((log: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">{log.action}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 text-xs">{log.userId?.email || log.userId?.name || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs font-mono">{log.ipAddress || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs">{getRelativeTime(log.createdAt)}</td>
                    </tr>
                  ))}
                  {recentLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-400">No activity logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
