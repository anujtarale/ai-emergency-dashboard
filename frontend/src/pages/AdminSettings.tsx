import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Loader2, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { apiClient } from '../lib/api';
import { useAppStore } from '../store';
import toast from 'react-hot-toast';

interface SystemSettingsData {
  maintenanceMode: boolean;
  enableNotifications: boolean;
  systemLogLevel: 'debug' | 'info' | 'warn' | 'error';
  backupInterval: 'daily' | 'weekly' | 'monthly' | 'none';
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<SystemSettingsData>({
    maintenanceMode: false,
    enableNotifications: true,
    systemLogLevel: 'info',
    backupInterval: 'weekly',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const storeMaintenanceMode = useAppStore(s => s.maintenanceMode);
  const setMaintenanceMode = useAppStore(s => s.setMaintenanceMode);

  // Sync store maintenanceMode to local settings state (for real-time socket updates from App.tsx)
  useEffect(() => {
    setSettings(prev => ({ ...prev, maintenanceMode: storeMaintenanceMode }));
  }, [storeMaintenanceMode]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.adminGetSettings();
        setSettings(res.data);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiClient.adminUpdateSettings(settings);
      // Ensure the store is updated with the actual value from the server
      if (response.data && response.data.maintenanceMode !== undefined) {
        setMaintenanceMode(response.data.maintenanceMode);
      }
      toast.success('System settings saved successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-orange-500" />
          System Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Configure global platform behaviour and operational parameters.</p>
      </motion.div>

      {settings.maintenanceMode && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">Maintenance mode is currently <strong>ACTIVE</strong>. Users may experience disruptions.</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Maintenance Mode */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Maintenance Mode</CardTitle>
            <CardDescription>When enabled, users will see a maintenance message and cannot log in.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800 dark:text-gray-200">Enable Maintenance Mode</span>
              <div 
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${settings.maintenanceMode ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Email Notifications</CardTitle>
            <CardDescription>Send system email notifications for emergency events and alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-gray-800 dark:text-gray-200">Enable Email Notifications</span>
              <div className="relative" onClick={() => setSettings(prev => ({ ...prev, enableNotifications: !prev.enableNotifications }))}>
                <div className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${settings.enableNotifications ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.enableNotifications ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Log Level */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">System Log Level</CardTitle>
            <CardDescription>Controls how verbose the application logs are in production.</CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={settings.systemLogLevel}
              onChange={e => setSettings(prev => ({ ...prev, systemLogLevel: e.target.value as any }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['debug', 'info', 'warn', 'error'].map(v => (
                <option key={v} value={v}>{v.toUpperCase()}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Backup Interval */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Backup Interval</CardTitle>
            <CardDescription>How frequently the system should perform automatic data backups.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['daily', 'weekly', 'monthly', 'none'].map(v => (
                <button key={v}
                  onClick={() => setSettings(prev => ({ ...prev, backupInterval: v as any }))}
                  className={`py-2.5 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${
                    settings.backupInterval === v
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2 py-3">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save System Settings'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
