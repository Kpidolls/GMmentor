import { useEffect, useState } from 'react';
import { dataPreloader, getCriticalImages } from '../utils/dataPreloader';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAHook {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  installApp: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
  canShare: boolean;
  shareContent: (data: ShareData) => Promise<boolean>;
  dataPreloadStatus: 'idle' | 'loading' | 'completed' | 'error';
}

export const usePWA = (): PWAHook => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dataPreloadStatus, setDataPreloadStatus] = useState<'idle' | 'loading' | 'completed' | 'error'>('idle');

  useEffect(() => {
    // Check if running as standalone PWA
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      
      const standalone = isStandaloneMode || (isIOS && isInWebAppiOS);
      setIsStandalone(standalone);
      setIsInstalled(standalone);
      
      return standalone;
    };

    // Initialize data preloading
    const initializeDataPreloading = async () => {
      if (dataPreloadStatus === 'idle') {
        setDataPreloadStatus('loading');
        
        try {
          // Clear expired cache first
          dataPreloader.clearExpiredCache();
          
          // Preload critical data
          await dataPreloader.preloadCriticalData();
          
          // Preload critical images
          const criticalImages = getCriticalImages();
          await dataPreloader.preloadImages(criticalImages);
          
          setDataPreloadStatus('completed');
          console.log('🎉 PWA data preloading completed successfully');
        } catch (error) {
          console.error('❌ PWA data preloading failed:', error);
          setDataPreloadStatus('error');
        }
      }
    };

    // Initial checks
    checkStandalone();
    setIsOnline(navigator.onLine);

    // Start data preloading after a short delay to not block initial render
    setTimeout(() => {
      initializeDataPreloading();
    }, 1000);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      // Don't show install prompt if already dismissed in this session
      const dismissed = sessionStorage.getItem('installBannerDismissed');
      if (dismissed) {
        setIsInstallable(false);
      }
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Clear any dismissed state
      sessionStorage.removeItem('installBannerDismissed');
      
      // Optional: Track installation analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'User installed PWA'
        });
      }
    };

    // Listen for online/offline changes
    const handleOnline = () => {
      console.log('PWA: Back online - syncing data...');
      setIsOnline(true);
      
      // Refresh data when back online
      if (dataPreloadStatus === 'completed') {
        initializeDataPreloading();
      }
    };
    
    const handleOffline = () => {
      console.log('PWA: Gone offline - using cached data');
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for display mode changes (when user switches between browser/standalone)
    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      setIsInstalled(e.matches);
    };
    displayModeQuery.addListener(handleDisplayModeChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      displayModeQuery.removeListener(handleDisplayModeChange);
    };
  }, [dataPreloadStatus]);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('PWA: No install prompt available');
      return false;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for user's choice
      const choiceResult = await deferredPrompt.userChoice;
      console.log('PWA: User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        
        // Track successful installation attempt
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'pwa_install_accepted', {
            event_category: 'PWA',
            event_label: 'User accepted PWA install'
          });
        }
        
        return true;
      } else {
        // User dismissed the prompt
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'pwa_install_dismissed', {
            event_category: 'PWA',
            event_label: 'User dismissed PWA install'
          });
        }
      }
      
      return false;
    } catch (error) {
      console.error('PWA: Install failed:', error);
      return false;
    }
  };

  const dismissInstallPrompt = () => {
    setIsInstallable(false);
    sessionStorage.setItem('installBannerDismissed', 'true');
    
    // Track dismissal
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'pwa_banner_dismissed', {
        event_category: 'PWA',
        event_label: 'User dismissed install banner'
      });
    }
  };

  const shareContent = async (data: ShareData): Promise<boolean> => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('PWA: Share failed:', error);
        return false;
      }
    }
    return false;
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    isStandalone,
    installApp,
    dismissInstallPrompt,
    canShare: typeof window !== 'undefined' && !!navigator.share,
    shareContent,
    dataPreloadStatus
  };
};