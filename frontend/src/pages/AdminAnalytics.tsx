import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Loader2, TrendingUp, AlertTriangle, FileText, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';



const AdminAnalytics = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.adminGetStats();
        setStats(res.data);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const sos = stats?.sos || {};
  const reports = stats?.reports || {};
  const trend: { _id: string; count: number }[] = stats?.reportsTrend || [];
  const maxCount = Math.max(...trend.map((t: any) => t.count), 1);

  const sosDistribution = [
    { label: 'Pending', value: sos.pending || 0, color: 'bg-yellow-500' },
    { label: 'Active', value: sos.active || 0, color: 'bg-blue-500' },
    { label: 'Resolved', value: sos.resolved || 0, color: 'bg-green-500' },
    { label: 'Cancelled', value: sos.cancelled || 0, color: 'bg-gray-400' },
  ];
  const sosTotal = sos.total || 1;

  const reportDistribution = [
    { label: 'Submitted', value: reports.submitted || 0, color: 'bg-blue-400' },
    { label: 'Reviewing', value: reports.reviewing || 0, color: 'bg-yellow-400' },
    { label: 'Resolved', value: reports.resolved || 0, color: 'bg-green-400' },
    { label: 'Rejected', value: reports.rejected || 0, color: 'bg-red-400' },
  ];
  const reportsTotal = reports.total || 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Admin Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Detailed incident trends, SOS distribution, and report analytics.
        </p>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total SOS', value: sos.total || 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Active SOS', value: sos.active || 0, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Total Reports', value: reports.total || 0, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Resolved Reports', value: reports.resolved || 0, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Trend Chart */}
      {trend.length > 0 && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base">Emergency Reports – Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {trend.map((t: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t.count}</span>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-md overflow-hidden" style={{ height: '120px' }}>
                    <motion.div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md"
                      initial={{ height: 0 }}
                      animate={{ height: `${(t.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      style={{ marginTop: 'auto' }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{t._id?.slice(5)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SOS Distribution */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base">SOS Request Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sosDistribution.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{s.label}</span>
                  <span className="text-gray-500 dark:text-gray-400">{s.value} ({Math.round((s.value / sosTotal) * 100)}%)</span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${s.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.value / sosTotal) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reports Distribution */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base">Emergency Reports Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportDistribution.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{s.label}</span>
                  <span className="text-gray-500 dark:text-gray-400">{s.value} ({Math.round((s.value / reportsTotal) * 100)}%)</span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${s.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.value / reportsTotal) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Logs */}
      {stats?.recentLogs?.length > 0 && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    {['Action', 'User', 'IP Address', 'Time'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stats.recentLogs.map((log: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs">
                        {log.userId?.email || log.userId?.name || 'System'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">{log.ipAddress || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAnalytics;
