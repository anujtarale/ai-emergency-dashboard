import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Bell, Plus, Trash2, Edit2, Loader2,
  AlertTriangle, Eye, EyeOff, Calendar, MapPin
} from 'lucide-react';
import { apiClient, type Alert } from '../lib/api';
import toast from 'react-hot-toast';

const severityColors = {
  critical: 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300',
  high: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300',
  medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300',
  low: 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300',
};

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('weather');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('23.0225');
  const [lng, setLng] = useState('72.5714');
  const [expiresAt, setExpiresAt] = useState('');
  const [active, setActive] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.adminGetAlerts();
      setAlerts(res.data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load safety alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const resetForm = () => {
    setTitle('');
    setType('weather');
    setSeverity('medium');
    setDescription('');
    setLat('23.0225');
    setLng('72.5714');
    setExpiresAt('');
    setActive(true);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (alert: Alert) => {
    setEditingId(alert._id || (alert as any).id);
    setTitle(alert.title);
    setType(alert.type);
    setSeverity(alert.severity);
    setDescription(alert.description);
    setLat(alert.location?.coordinates[1]?.toString() || '23.0225');
    setLng(alert.location?.coordinates[0]?.toString() || '72.5714');
    setExpiresAt(alert.expiresAt ? new Date(alert.expiresAt).toISOString().slice(0, 16) : '');
    setActive(alert.active);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !type) {
      toast.error('Title, description, and type are required');
      return;
    }

    const coordinates: [number, number] = [parseFloat(lng), parseFloat(lat)];
    const payload = {
      title,
      type,
      severity,
      description,
      location: {
        type: 'Point' as const,
        coordinates
      },
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      active
    };

    try {
      if (editingId) {
        await apiClient.adminUpdateAlert(editingId, payload);
        toast.success('Alert updated successfully');
      } else {
        await apiClient.adminCreateAlert(payload);
        toast.success('Alert created successfully');
      }
      resetForm();
      fetchAlerts();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save alert');
    }
  };

  const handleToggleActive = async (alert: Alert) => {
    const id = alert._id || (alert as any).id;
    try {
      await apiClient.adminUpdateAlert(id, { active: !alert.active });
      toast.success(`Alert set to ${!alert.active ? 'Active' : 'Inactive'}`);
      fetchAlerts();
    } catch (e: any) {
      toast.error(e.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      await apiClient.adminDeleteAlert(id);
      toast.success('Alert deleted successfully');
      fetchAlerts();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete alert');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Safety Alert Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Broadcast critical warnings, weather updates, or threat indicators to users.</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {isFormOpen ? 'Close Panel' : 'Broadcast New Alert'}
        </Button>
      </div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Broadcast Alert' : 'Create Broadcast Alert'}</CardTitle>
              <CardDescription>Configure the alert properties. Active alerts appear in user safety feeds.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alert Title</label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Severe Flash Flood Warning" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alert Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="weather">Weather Warning</option>
                    <option value="flood">Flooding / Water threat</option>
                    <option value="fire">Wildfire / Structural Fire</option>
                    <option value="traffic">Major Traffic Gridlock</option>
                    <option value="other">Security / Other Hazard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity Level</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full flex h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none"
                  >
                    <option value="low">Low Severity</option>
                    <option value="medium">Medium Severity</option>
                    <option value="high">High Severity</option>
                    <option value="critical">Critical Severity</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiration Time (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Latitude</label>
                  <Input value={lat} onChange={e => setLat(e.target.value)} placeholder="23.0225" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Longitude</label>
                  <Input value={lng} onChange={e => setLng(e.target.value)} placeholder="72.5714" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Alert Description / Emergency Guidance</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide details about the hazard and specific actions citizens should take to stay safe."
                    rows={3}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publish Alert Immediately (Set Active)
                  </label>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit">{editingId ? 'Update Broadcast' : 'Create Broadcast'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map(alert => (
            <motion.div key={alert._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className={`border-l-4 shadow-sm h-full flex flex-col justify-between ${severityColors[alert.severity] || 'border-gray-200 bg-white'}`}>
                <div>
                  <CardHeader className="pb-2 px-4 sm:px-6">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <CardTitle className="text-base font-bold truncate">{alert.title}</CardTitle>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${alert.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-150 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {alert.active ? 'Broadcast Active' : 'Suspended'}
                      </span>
                    </div>
                    <CardDescription className="text-xs capitalize font-semibold tracking-wider text-gray-500 dark:text-gray-400 mt-1">
                      Type: {alert.type} | Severity: {alert.severity}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3 pb-3 px-4 sm:px-6">
                    <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{alert.description}</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                      {alert.location?.coordinates && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Coords: {alert.location.coordinates[1]?.toFixed(3)}, {alert.location.coordinates[0]?.toFixed(3)}
                        </span>
                      )}
                      {alert.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(alert.expiresAt).toLocaleDateString()} {new Date(alert.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>
                <div className="px-4 sm:px-6 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap justify-end gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleToggleActive(alert)} className="gap-1 text-xs">
                    {alert.active ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Suspend
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Broadcast
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(alert)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(alert._id || (alert as any).id)} className="text-red-600 dark:text-red-400 hover:text-red-700 text-xs">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
          {alerts.length === 0 && (
            <div className="md:col-span-2 text-center py-16 bg-white dark:bg-gray-900 border rounded-xl">
              <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No active alerts broadcasted.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAlerts;
