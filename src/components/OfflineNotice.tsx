import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';
import { useTranslation } from 'react-i18next';

interface OfflineNoticeProps {
  position?: 'top' | 'bottom';
  showConnectionSpeed?: boolean;
  className?: string;
}

const OfflineNotice: React.FC<OfflineNoticeProps> = ({ 
  position = 'top',
  showConnectionSpeed = true,
  className = ''
}) => {
  const { t } = useTranslation();
  const { isOnline, isStandalone, dataPreloadStatus } = usePWA();
  const [showNotice, setShowNotice] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('');
  const [showReconnectedMessage, setShowReconnectedMessage] = useState(false);

  useEffect(() => {
    // Update connection info
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection?.effectiveType || '');
    }

    if (!isOnline) {
      setWasOffline(true);
      setShowNotice(true);
      setShowReconnectedMessage(false);
    } else if (wasOffline && isOnline) {
      // User came back online
      setShowNotice(false);
      setShowReconnectedMessage(true);
      
      // Hide reconnected message after 3 seconds
      const timer = setTimeout(() => {
        setShowReconnectedMessage(false);
        setWasOffline(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShowNotice(false);
    }
    
    // Return empty cleanup function for other code paths
    return () => {};
  }, [isOnline, wasOffline]);

  const positionClasses = position === 'top' 
    ? 'top-0' 
    : 'bottom-0';

  // Show data preloading status for standalone apps
  if (isStandalone && dataPreloadStatus === 'loading') {
    return (
      <div className={`fixed ${positionClasses} left-0 right-0 z-50 ${className}`}>
        <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>{t('pwa.preloadingData', 'Preparing app for offline use...')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (showReconnectedMessage) {
    return (
      <div className={`fixed ${positionClasses} left-0 right-0 z-50 ${className}`}>
        <div className="bg-green-500 text-white px-4 py-3 text-center text-sm shadow-lg">
          <div className="flex items-center justify-center space-x-2 max-w-md mx-auto">
            <div className="w-4 h-4 relative">
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
              <div className="relative w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-500 text-xs">✓</span>
              </div>
            </div>
            <span className="font-medium">{t('pwa.backOnline', 'Back online!')}</span>
            {showConnectionSpeed && connectionType && (
              <span className="text-green-100 text-xs">({connectionType})</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!showNotice || isOnline) {
    return null;
  }

  const hasOfflineData = dataPreloadStatus === 'completed';

  return (
    <div className={`fixed ${positionClasses} left-0 right-0 z-50 ${className}`}>
      <div className={`${hasOfflineData ? 'bg-orange-500' : 'bg-red-500'} text-white px-4 py-3 text-center text-sm shadow-lg border-b ${hasOfflineData ? 'border-orange-400' : 'border-red-400'}`}>
        <div className="flex items-center justify-center space-x-2 max-w-md mx-auto">
          {/* Offline Icon with Animation */}
          <div className="relative">
            <div className={`w-4 h-4 ${hasOfflineData ? 'bg-orange-200' : 'bg-red-200'} rounded-full animate-pulse`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className={`w-3 h-3 ${hasOfflineData ? 'text-orange-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1">
            <span className="font-medium">
              {hasOfflineData
                ? t('pwa.offlineWithData', 'You\'re offline, but restaurants & maps are cached')
                : isStandalone 
                  ? t('pwa.offlineStandalone', 'You\'re offline. Limited functionality available.')
                  : t('pwa.offline', 'You\'re offline. Some features may be limited.')
              }
            </span>
          </div>
        </div>

        {/* Features Available Offline */}
        {hasOfflineData && (
          <div className="flex items-center justify-center space-x-4 text-orange-100 text-xs mt-2">
            <div className="flex items-center space-x-1">
              <span>🍽️</span>
              <span>{t('pwa.offlineRestaurants', 'Restaurants')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🗺️</span>
              <span>{t('pwa.offlineMaps', 'Maps')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🏝️</span>
              <span>{t('pwa.offlineIslands', 'Islands')}</span>
            </div>
          </div>
        )}

        {/* Retry Connection Button */}
        <div className="mt-2">
          <button
            onClick={() => window.location.reload()}
            className={`${hasOfflineData ? 'text-orange-100 hover:text-white' : 'text-red-100 hover:text-white'} text-xs underline transition-colors`}
          >
            {t('pwa.retry', 'Retry connection')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineNotice;