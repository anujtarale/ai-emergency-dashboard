import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Loader2 } from 'lucide-react';
import { useAppStore } from '../store';

const MaintenancePage = () => {
  const { fetchMaintenanceMode, maintenanceMode } = useAppStore();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (countdown <= 0) {
      fetchMaintenanceMode();
      setCountdown(15);
    }
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, fetchMaintenanceMode]);

  if (!maintenanceMode) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md px-6"
      >
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30">
          <Wrench className="h-10 w-10 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Under Maintenance
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          The system is currently undergoing scheduled maintenance. Please check back shortly.
          We apologize for any inconvenience.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Auto-checking in {countdown}s
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
