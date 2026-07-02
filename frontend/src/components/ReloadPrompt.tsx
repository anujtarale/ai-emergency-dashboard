import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from './ui/button';

export const ReloadPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-24 right-4 md:right-8 md:bottom-8 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-blue-100 dark:border-gray-700 p-4 w-80">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mt-0.5">
              <RefreshCw className={`h-5 w-5 text-blue-600 dark:text-blue-400 ${needRefresh ? 'animate-spin-slow' : ''}`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                {offlineReady ? 'App ready for offline' : 'Update available'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {offlineReady 
                  ? 'App is now ready to work offline.' 
                  : 'A new version is available. Update now to get the latest features.'}
              </p>
            </div>
          </div>
          <button 
            onClick={close}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex gap-2 mt-4">
          {needRefresh && (
            <Button 
              size="sm" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              onClick={() => updateServiceWorker(true)}
            >
              Update Now
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={close}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
};
