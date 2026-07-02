import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  FileText, Loader2, RefreshCw, Search, CheckCircle2,
  XCircle, Eye, Clock, MapPin, User, AlertTriangle, Filter
} from 'lucide-react';
import { apiClient, type EmergencyReport } from '../lib/api';
import toast from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';

const statusConfig: Record<string, { label: string; color: string; badge: string }> = {
  submitted: { label: 'Submitted', color: 'text-blue-600', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300' },
  reviewing: { label: 'Reviewing', color: 'text-yellow-600', badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300' },
  resolved:  { label: 'Resolved',  color: 'text-green-600', badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300' },
  rejected:  { label: 'Rejected',  color: 'text-red-600',   badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300' },
};

const severityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
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

const AdminReports = () => {
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selected, setSelected] = useState<EmergencyReport | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const { on, off } = useSocket();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.adminGetReports();
      setReports(res.data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (e: any) {
      toast.error(e.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchReports(); 
  }, [fetchReports]);

  useEffect(() => {
    const handleNewReport = () => {
      toast.success('New Emergency Report Submitted!', {
        icon: '📋',
        duration: 5000
      });
      fetchReports();
    };

    on('new-report', handleNewReport);

    const interval = setInterval(() => {
      fetchReports();
    }, 30000);

    return () => {
      clearInterval(interval);
      off('new-report', handleNewReport);
    };
  }, [on, off, fetchReports]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await apiClient.adminUpdateReportStatus(id, status);
      toast.success(`Report marked as ${status}`);
      fetchReports();
      if (selected?._id === id) setSelected(prev => prev ? { ...prev, status } : null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update report');
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    all: reports.length,
    submitted: reports.filter(r => r.status === 'submitted').length,
    reviewing: reports.filter(r => r.status === 'reviewing').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  };

  const types = ['all', ...Array.from(new Set(reports.map(r => r.type))).sort()];

  const filtered = reports.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchType = filterType === 'all' || r.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Reports Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and verify crowdsourced emergency incident reports.
            {lastUpdate && <span className="ml-2 text-xs font-semibold text-blue-600 dark:text-blue-400">Last updated: {lastUpdate}</span>}
          </p>
        </div>
        <Button variant="outline" onClick={fetchReports} className="gap-2 shrink-0">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'submitted', 'reviewing', 'resolved', 'rejected'] as const).map(key => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filterStatus === key
                ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                : key === 'all' ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400' : statusConfig[key]?.badge || ''
            }`}
          >
            {key === 'all' ? 'All' : statusConfig[key]?.label} ({counts[key]})
          </button>
        ))}
      </div>

      {/* Search and type filter */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports…" className="pl-9" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="flex h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none"
          >
            {types.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1 space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
            {filtered.length === 0 && (
              <div className="text-center py-14 bg-white dark:bg-gray-900 border rounded-xl text-gray-400">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No reports match your filter.</p>
              </div>
            )}
            <AnimatePresence>
              {filtered.map(report => {
                const cfg = statusConfig[report.status] || statusConfig.submitted;
                const isSelected = selected?._id === report._id;
                return (
                  <motion.div
                    key={report._id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => setSelected(isSelected ? null : report)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10 shadow-sm'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 flex-1">{report.title}</h3>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{report.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${severityColors[report.severity || 'low'] || ''}`}>
                        {report.severity || 'low'}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                        <Clock className="h-3 w-3" /> {getRelativeTime(report.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Report Detail Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{selected.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-xs font-semibold capitalize text-gray-500 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">{selected.type}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityColors[selected.severity || 'low']}`}>{selected.severity || 'low'}</span>
                            <span className="text-[11px] text-gray-400"># {selected._id.slice(-8).toUpperCase()}</span>
                          </div>
                        </div>
                        <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${statusConfig[selected.status]?.badge || ''}`}>
                          {selected.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selected.description}</p>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                          <span>{selected.address || `${selected.location?.coordinates?.[1]?.toFixed(4)}, ${selected.location?.coordinates?.[0]?.toFixed(4)}`}</span>
                        </div>
                        {selected.userId && (
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <User className="h-4 w-4 text-gray-400 shrink-0" />
                            <span>{typeof selected.userId === 'object' ? selected.userId?.name : 'Anonymous'}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 font-mono">
                        Submitted: {new Date(selected.createdAt).toLocaleString()}
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Moderation Actions</p>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400"
                            disabled={selected.status === 'reviewing' || updating === selected._id}
                            onClick={() => handleStatusChange(selected._id, 'reviewing')}>
                            {updating === selected._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                            Mark Reviewing
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-green-300 text-green-700 hover:bg-green-50 dark:text-green-400"
                            disabled={selected.status === 'resolved' || updating === selected._id}
                            onClick={() => handleStatusChange(selected._id, 'resolved')}>
                            {updating === selected._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            Verify & Resolve
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs border-red-300 text-red-700 hover:bg-red-50 dark:text-red-400"
                            disabled={selected.status === 'rejected' || updating === selected._id}
                            onClick={() => handleStatusChange(selected._id, 'rejected')}>
                            {updating === selected._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                            Reject / Spam
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="min-h-[400px] flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <div className="text-center text-gray-400">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Select a report to review</p>
                    <p className="text-xs mt-1 opacity-70">Click any incident report from the list</p>
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

export default AdminReports;
