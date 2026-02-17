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
  isMobile: boolean;
  isIOS: boolean;
  installApp: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
  canShare: boolean;
  shareContent: (data: ShareData) => Promise<boolean>;
  dataPreloadStatus: 'idle' | 'loading' | 'completed' | 'error';
}

export const usePWA = (): PWAHook => {
  const logDevWarning = (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  };

  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dataPreloadStatus, setDataPreloadStatus] = useState<'idle' | 'loading' | 'completed' | 'error'>('idle');

  useEffect(() => {
    // Mobile device detection
    const detectMobileDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|avantgo|blackberry|bb|meego|mobile|iphone|ipad|ipod|opera mini|palm|phone|pocket|psp|symbian|mobile|windows ce|windows phone/i.test(userAgent);
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
      
      setIsMobile(isMobileDevice);
      setIsIOS(isIOSDevice);
    };

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
      // Check if already completed to prevent duplicate runs
      const alreadyPreloaded = sessionStorage.getItem('pwa_data_preloaded');
      if (alreadyPreloaded || dataPreloadStatus !== 'idle') {
        return;
      }
      
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
        sessionStorage.setItem('pwa_data_preloaded', 'true');
        if (process.env.NODE_ENV === 'development') {
          console.log('🎉 PWA data preloading completed');
        }
      } catch (error) {
        logDevWarning('PWA data preloading failed:', error);
        setDataPreloadStatus('error');
      }
    };

    // Initial checks
    detectMobileDevice();
    const standaloneAtLoad = checkStandalone();
    setIsOnline(navigator.onLine);

    // Start data preloading only for installed/standalone sessions to reduce
    // first-load cost for regular web visitors.
    if (standaloneAtLoad) {
      setTimeout(() => {
        initializeDataPreloading();
      }, 1200);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      if (process.env.NODE_ENV === 'development') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return;
      }

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
      setIsStandalone(true);
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

      // Prime offline data after installation completes.
      setTimeout(() => {
        initializeDataPreloading();
      }, 1000);
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
    // Handle iOS devices that don't support the standard install prompt
    if (isIOS && !deferredPrompt) {
      // For iOS, we can't programmatically install but we can guide users
      console.log('PWA: iOS device detected - guiding user to install manually');
      
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'pwa_ios_install_guide', {
          event_category: 'PWA',
          event_label: 'iOS user shown install guide'
        });
      }
      
      // Return false but iOS-specific install instructions should be shown in UI
      return false;
    }

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
      logDevWarning('PWA: Install failed:', error);
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
        const shareError = error as DOMException;
        if (shareError?.name !== 'AbortError') {
          logDevWarning('PWA: Share failed:', error);
        }
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
    isMobile,
    isIOS,
    installApp,
    dismissInstallPrompt,
    canShare: typeof window !== 'undefined' && !!navigator.share,
    shareContent,
    dataPreloadStatus
  };
};