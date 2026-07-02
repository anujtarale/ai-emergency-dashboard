import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ToggleLeft, ToggleRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { apiClient } from '../lib/api';
import { useAppStore } from '../store';
import toast from 'react-hot-toast';

interface FeatureItem {
  _id: string;
  name: string;
  displayName: string;
  isEnabled: boolean;
}

const AdminFeatures = () => {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const { fetchFeatures } = useAppStore();

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const response = await apiClient.adminGetFeatures();
      setFeatures(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch features');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const handleToggle = async (name: string, currentStatus: boolean) => {
    setToggling(name);
    try {
      await apiClient.adminToggleFeature(name, !currentStatus);
      setFeatures(prev =>
        prev.map(f => f.name === name ? { ...f, isEnabled: !currentStatus } : f)
      );
      // Refresh local store flags
      await fetchFeatures();
      toast.success(`Feature '${name}' has been ${!currentStatus ? 'enabled' : 'disabled'} successfully.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update feature');
    } finally {
      setToggling(null);
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Feature Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Enable or disable emergency platform modules dynamically without redeploying code.
          </p>
        </div>
        <Button onClick={loadFeatures} size="sm" className="gap-2 shrink-0">
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </Button>
      </motion.div>

      <div className="grid gap-6">
        <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-150 dark:border-gray-700">
            <CardTitle className="text-lg">Dynamic Controls</CardTitle>
            <CardDescription>
              Toggling a feature will instantly hide/reveal it on the user interface and protect/unprotect the backend routes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
            {features.map((feature, idx) => (
              <motion.div
                key={feature._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white text-base">
                      {feature.displayName}
                    </span>
                    <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-500 rounded px-1.5 py-0.5">
                      {feature.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Control availability of this feature across desktop, tablet, mobile layouts, and API requests.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    feature.isEnabled
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {feature.isEnabled ? 'ON' : 'OFF'}
                  </span>

                  <button
                    onClick={() => handleToggle(feature.name, feature.isEnabled)}
                    disabled={toggling === feature.name}
                    className={`focus:outline-none transition-all duration-200 ${
                      toggling === feature.name ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {feature.isEnabled ? (
                      <ToggleRight className="h-9 w-9 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-9 w-9 text-gray-400 dark:text-gray-600" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}

            {features.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
                <p>No feature flags found in database. Restart the server to auto-seed them.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminFeatures;
