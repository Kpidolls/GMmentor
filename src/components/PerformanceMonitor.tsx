import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';
import { useTranslation } from 'react-i18next';

interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  dataUsage: {
    restaurant_data: number;
    municipalities_data: number;
    location_cache: number;
    preloaded_images: number;
  };
  lastUpdated: Date;
}

interface PerformanceMonitorProps {
  showDebugInfo?: boolean;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  showDebugInfo = false, 
  className = ''
}) => {
  const { t } = useTranslation();
  const { isStandalone, isOnline, dataPreloadStatus } = usePWA();
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [showStats, setShowStats] = useState(showDebugInfo);

  // Calculate cache statistics
  const calculateCacheStats = (): CacheStats => {
    let cacheHits = 0;
    let cacheMisses = 0;

    const dataUsage = {
      restaurant_data: 0,
      municipalities_data: 0,
      location_cache: 0,
      preloaded_images: 0
    };

    // Check restaurant data categories
    const categories = [
      'greek-restaurants', 'desserts', 'coffee-brunch', 'italian', 'cheap-eats',
      'asian', 'fish-tavernas', 'burgers', 'luxury-dining', 'rooftop-lounges',
      'vegetarian', 'gyros-souvlaki', 'mexican', 'bougatsa'
    ];

    categories.forEach(category => {
      const data = localStorage.getItem(`restaurant_data_${category}`);
      if (data) {
        const size = new Blob([data]).size;
        dataUsage.restaurant_data += size;
        cacheHits++;
      } else {
        cacheMisses++;
      }
    });

    // Check municipalities data
    const municipalitiesData = localStorage.getItem('municipalities_data');
    if (municipalitiesData) {
      dataUsage.municipalities_data = new Blob([municipalitiesData]).size;
      cacheHits++;
    } else {
      cacheMisses++;
    }

    // Check location cache
    const locationData = localStorage.getItem('lastKnownLocation');
    if (locationData) {
      dataUsage.location_cache = new Blob([locationData]).size;
      cacheHits++;
    } else {
      cacheMisses++;
    }

    // Check preloaded images cache status
    const imagesCacheStatus = localStorage.getItem('preloaded_images_status');
    if (imagesCacheStatus) {
      const status = JSON.parse(imagesCacheStatus);
      dataUsage.preloaded_images = Object.keys(status).length * 1024; // Estimate
      cacheHits += Object.keys(status).length;
    }

    const totalRequests = cacheHits + cacheMisses;
    const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    return {
      totalRequests,
      cacheHits,
      cacheMisses,
      hitRate,
      dataUsage,
      lastUpdated: new Date()
    };
  };

  // Update cache stats periodically
  useEffect(() => {
    const updateStats = () => {
      setCacheStats(calculateCacheStats());
    };

    updateStats();
    
    // Update stats every 30 seconds when component is visible
    const interval = setInterval(updateStats, 30000);
    
    return () => clearInterval(interval);
  }, [dataPreloadStatus]);

  // Format bytes to human readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get cache efficiency color
  const getEfficiencyColor = (hitRate: number): string => {
    if (hitRate >= 80) return 'text-green-600 dark:text-green-400';
    if (hitRate >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Only show in PWA mode and when debug is enabled
  if (!isStandalone && !showDebugInfo) return null;

  return (
    <div className={`performance-monitor ${className}`}>
      {/* Toggle button for stats visibility */}
      {isStandalone && (
        <button
          onClick={() => setShowStats(!showStats)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
          title={t('performanceMonitor.toggleTitle', 'Toggle Performance Stats')}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 001.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Performance stats overlay */}
      {showStats && cacheStats && (
        <div className="fixed bottom-16 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 max-w-sm z-40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('performanceMonitor.title', 'PWA Performance')}
            </h3>
            <button
              onClick={() => setShowStats(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title={t('performanceMonitor.closeTitle', 'Close performance stats')}
              aria-label={t('performanceMonitor.closeAria', 'Close performance stats')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Status indicators */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('performanceMonitor.labels.status', 'Status:')}</span>
              <span className={`font-medium ${!isOnline ? 'text-red-600' : 'text-green-600'}`}>
                {!isOnline ? t('performanceMonitor.values.offline', 'Offline') : t('performanceMonitor.values.online', 'Online')}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('performanceMonitor.labels.dataPreload', 'Data Preload:')}</span>
              <span className={`font-medium ${getEfficiencyColor(dataPreloadStatus === 'completed' ? 100 : 0)}`}>
                {dataPreloadStatus === 'completed' ? t('performanceMonitor.values.ready', 'Ready') : 
                 dataPreloadStatus === 'loading' ? t('performanceMonitor.values.loading', 'Loading...') : t('performanceMonitor.values.pending', 'Pending')}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('performanceMonitor.labels.cacheHitRate', 'Cache Hit Rate:')}</span>
              <span className={`font-medium ${getEfficiencyColor(cacheStats.hitRate)}`}>
                {cacheStats.hitRate.toFixed(1)}%
              </span>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Data usage breakdown */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('performanceMonitor.labels.restaurantData', 'Restaurant Data:')}</span>
                <span className="text-gray-900 dark:text-white font-mono">
                  {formatBytes(cacheStats.dataUsage.restaurant_data)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('performanceMonitor.labels.locationData', 'Location Data:')}</span>
                <span className="text-gray-900 dark:text-white font-mono">
                  {formatBytes(cacheStats.dataUsage.location_cache)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('performanceMonitor.labels.imagesCache', 'Images Cache:')}</span>
                <span className="text-gray-900 dark:text-white font-mono">
                  {formatBytes(cacheStats.dataUsage.preloaded_images)}
                </span>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-500">
                {t('performanceMonitor.labels.updated', 'Updated:')} {cacheStats.lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;