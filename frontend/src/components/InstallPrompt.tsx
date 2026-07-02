import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { usePWA } from '../hooks/usePWA';

export const InstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      const dismissed = sessionStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-blue-100 dark:border-gray-700 p-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
          <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white">Install App</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Install AI Emergency on your home screen for quick access and offline support.
          </p>
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleInstall}
            >
              Install Now
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={handleDismiss}
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
