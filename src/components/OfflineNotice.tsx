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
  const { isOnline, isStandalone } = usePWA();
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

  return (
    <div className={`fixed ${positionClasses} left-0 right-0 z-50 ${className}`}>
      <div className="bg-orange-500 text-white px-4 py-3 text-center text-sm shadow-lg border-b border-orange-400">
        <div className="flex items-center justify-center space-x-2 max-w-md mx-auto">
          {/* Offline Icon with Animation */}
          <div className="relative">
            <div className="w-4 h-4 bg-orange-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1">
            <span className="font-medium">
              {isStandalone 
                ? t('pwa.offlineStandalone', 'You\'re offline, but cached content is available')
                : t('pwa.offline', 'You\'re offline. Some features may be limited.')
              }
            </span>
          </div>

          {/* Features Available Offline */}
          {isStandalone && (
            <div className="flex items-center space-x-1 text-orange-100 text-xs">
              <span>•</span>
              <span>{t('pwa.offlineFeatures', 'Maps & restaurants cached')}</span>
            </div>
          )}
        </div>

        {/* Additional Info for PWA Users */}
        {isStandalone && (
          <div className="mt-2 text-xs text-orange-100 max-w-sm mx-auto">
            {t('pwa.offlineDetails', 'You can still browse saved restaurants and view cached maps. New searches will be available when you reconnect.')}
          </div>
        )}

        {/* Retry Connection Button (for very long offline periods) */}
        <div className="mt-2">
          <button
            onClick={() => window.location.reload()}
            className="text-orange-100 hover:text-white text-xs underline transition-colors"
          >
            {t('pwa.retry', 'Retry connection')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineNotice;