import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';
import { useTranslation } from 'react-i18next';

interface InstallBannerProps {
  position?: 'bottom' | 'top';
  showAfterDelay?: number; // ms
  className?: string;
}

const InstallBanner: React.FC<InstallBannerProps> = ({ 
  position = 'bottom', 
  showAfterDelay = 3000,
  className = ''
}) => {
  const { t } = useTranslation();
  const { isInstallable, installApp, isInstalled, dismissInstallPrompt } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Don't show if not installable, already installed, or previously dismissed
    if (!isInstallable || isInstalled) {
      setIsVisible(false);
      return;
    }

    // Check if user has dismissed banner in this session
    const dismissed = sessionStorage.getItem('installBannerDismissed');
    if (dismissed) {
      setIsVisible(false);
      return;
    }

    // Show banner after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Trigger entrance animation
      setTimeout(() => setShowAnimation(true), 100);
    }, showAfterDelay);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, showAfterDelay]);

  if (!isVisible || !isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowAnimation(false);
    setTimeout(() => {
      setIsVisible(false);
      dismissInstallPrompt();
    }, 300); // Match animation duration
  };

  const positionClasses = position === 'top' 
    ? 'top-4' 
    : 'bottom-4';

  const animationClasses = showAnimation
    ? 'translate-y-0 opacity-100'
    : position === 'top'
    ? '-translate-y-full opacity-0'
    : 'translate-y-full opacity-0';

  return (
    <div className={`fixed ${positionClasses} left-4 right-4 z-50 mx-auto max-w-md ${className}`}>
      <div className={`
        transform transition-all duration-300 ease-out
        ${animationClasses}
        bg-gradient-to-r from-blue-600 to-indigo-600 
        text-white rounded-xl shadow-lg border border-blue-500/20
        backdrop-blur-sm p-4
      `}>
        {/* Main Content */}
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">📱</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold leading-tight">
              {t('pwa.installTitle', 'Install Googlementor')}
            </h3>
            <p className="text-xs text-blue-100 mt-1 leading-tight">
              {t('pwa.installDescription', 'Get quick access to authentic Greek restaurants and travel guides, even offline!')}
            </p>
            
            {/* Benefits */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center space-x-1 text-xs text-blue-100">
                <span className="w-1 h-1 bg-blue-200 rounded-full"></span>
                <span>{t('pwa.benefit1', 'Works offline')}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-blue-100">
                <span className="w-1 h-1 bg-blue-200 rounded-full"></span>
                <span>{t('pwa.benefit2', 'Faster loading')}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-blue-100">
                <span className="w-1 h-1 bg-blue-200 rounded-full"></span>
                <span>{t('pwa.benefit3', 'Native app feel')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="
                  bg-white text-blue-600 px-3 py-1.5 rounded-md text-sm font-medium 
                  hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200 flex items-center space-x-1
                "
              >
                {isInstalling ? (
                  <>
                    <div className="w-3 h-3 border border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                    <span>{t('pwa.installing', 'Installing...')}</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>{t('pwa.install', 'Install')}</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleDismiss}
                className="
                  text-blue-100 hover:text-white px-3 py-1.5 text-sm 
                  transition-colors duration-200 flex items-center space-x-1
                "
              >
                <span>{t('pwa.notNow', 'Not now')}</span>
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="
              flex-shrink-0 text-blue-200 hover:text-white transition-colors
              w-6 h-6 flex items-center justify-center rounded
            "
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress indicator (optional visual enhancement) */}
        <div className="mt-3 w-full bg-blue-500/30 rounded-full h-1">
          <div 
            className="bg-white h-1 rounded-full transition-all duration-300"
            style={{ width: showAnimation ? '100%' : '0%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;