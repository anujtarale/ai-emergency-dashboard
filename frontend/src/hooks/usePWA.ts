import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    (window as any).deferredPrompt || null
  );
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    (window as any).isAppInstalled ||
    false
  );

  useEffect(() => {
    // Check standalone mode again
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    const handlePrompt = (e: Event) => {
      console.log('usePWA: beforeinstallprompt received');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleCustomPrompt = (e: Event) => {
      console.log('usePWA: custom pwa-prompt-available received');
      const customEvent = e as CustomEvent;
      setDeferredPrompt(customEvent.detail);
    };

    const handleAppInstalled = () => {
      console.log('usePWA: appinstalled event fired');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('pwa-prompt-available', handleCustomPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-app-installed', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('pwa-prompt-available', handleCustomPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-app-installed', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
    if (!promptEvent) {
      console.log('PWA installation prompt not available');
      return false;
    }

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      console.log(`PWA user choice outcome: ${outcome}`);
      if (outcome === 'accepted') {
        toast.success('Thank you for installing AI Emergency Alert System!');
        setIsInstalled(true);
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
        return true;
      }
    } catch (err) {
      console.error('Error during PWA installation:', err);
    }
    return false;
  };

  const isInstallable = !isInstalled && (deferredPrompt !== null || (window as any).deferredPrompt !== undefined);

  return {
    isInstallable,
    isInstalled,
    installApp,
    deferredPrompt
  };
};
