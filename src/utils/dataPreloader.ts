interface DataPreloader {
  preloadCriticalData: () => Promise<void>;
  preloadImages: (imageUrls: string[]) => Promise<void>;
  getCachedData: <T>(key: string) => T | null;
  setCachedData: <T>(key: string, data: T) => void;
  clearExpiredCache: () => void;
}

class DataPreloaderService implements DataPreloader {
  private cachePrefix = 'googlementor_cache_';
  private cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  // Critical data files that should be preloaded
  private criticalDataFiles = [
    '/data/greekRestaurants.json',
    '/data/municipalities.json',
    '/data/restaurantCategories.json',
    '/data/islands.json',
    '/data/mapOptions.json',
    '/data/products.json',
    '/data/dessertsRestaurants.json',
    '/data/coffeeBrunchRestaurants.json',
    '/data/italianRestaurants.json',
    '/data/cheapEatsRestaurants.json',
    '/data/asianRestaurants.json',
    '/data/fishTavernasRestaurants.json',
    '/data/burgersRestaurants.json',
    '/data/luxuryDiningRestaurants.json',
    '/data/rooftopLoungesRestaurants.json',
    '/data/vegetarianRestaurants.json',
    '/data/gyrosSouvlakiRestaurants.json',
    '/data/mexicanRestaurants.json'
  ];

  async preloadCriticalData(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Preloading critical data for offline use...');
    }
    
    const promises = this.criticalDataFiles.map(async (url) => {
      try {
        const cacheKey = this.getCacheKey(url);
        const cached = this.getCachedData<any>(cacheKey);
        
        if (cached && !this.isExpired(cached.timestamp)) {
          return cached.data;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          this.setCachedData(cacheKey, {
            data,
            timestamp: Date.now(),
            url
          });
          return data;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to preload ${url}:`, error);
        // Try to return cached data even if expired
        const cacheKey = this.getCacheKey(url);
        const cached = this.getCachedData<any>(cacheKey);
        return cached?.data || null;
      }
    });

    await Promise.allSettled(promises);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Critical data preloading complete');
    }
  }

  async preloadImages(imageUrls: string[]): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ Preloading images for offline use...');
    }
    
    const promises = imageUrls.map(async (url) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        return new Promise<void>((resolve) => {
          img.onload = () => {
            resolve();
          };
          img.onerror = () => {
            console.warn(`⚠️ Failed to preload image: ${url}`);
            resolve(); // Don't reject to avoid stopping other preloads
          };
          img.src = url;
        });
      } catch (error) {
        console.warn(`⚠️ Error preloading image ${url}:`, error);
      }
    });

    await Promise.allSettled(promises);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Image preloading complete');
    }
  }

  getCachedData<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(this.cachePrefix + key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }

  setCachedData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(this.cachePrefix + key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache data:', error);
      // If localStorage is full, clear expired cache and try again
      this.clearExpiredCache();
      try {
        localStorage.setItem(this.cachePrefix + key, JSON.stringify(data));
      } catch (retryError) {
        console.error('Failed to cache data after cleanup:', retryError);
      }
    }
  }

  clearExpiredCache(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.cachePrefix)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '');
          if (this.isExpired(cached.timestamp)) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // Invalid JSON, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    if (keysToRemove.length > 0) {
      console.log(`🧹 Cleared ${keysToRemove.length} expired cache entries`);
    }
  }

  private getCacheKey(url: string): string {
    return url.replace(/[^a-zA-Z0-9]/g, '_');
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.cacheExpiry;
  }
}

// Singleton instance
export const dataPreloader = new DataPreloaderService();

// Utility function to get critical images for preloading
export const getCriticalImages = (): string[] => [
  '/assets/images/cover.webp',
  '/assets/images/newlogo1.webp',
  '/assets/images/aegina.webp',
  '/assets/images/amorgos.webp',
  '/assets/images/astypalea.webp',
  '/assets/images/athens.webp',
  '/assets/images/chios.webp',
  '/assets/images/corfu.webp',
  '/assets/images/crete.webp',
  '/assets/images/mykonos.webp',
  '/assets/images/naxos.webp',
  '/assets/images/paros.webp',
  '/assets/images/santorini.webp',
  '/assets/images/zakynthos.webp',
  // Additional existing images
  '/assets/images/hydra.webp',
  '/assets/images/kos.webp',
  '/assets/images/leukada.webp',
  '/assets/images/rodos.webp', // This is rhodes in Greek
  '/assets/images/sifnos.webp',
  '/assets/images/skiathos.webp',
  '/assets/images/skyros.webp',
  '/assets/images/syros.webp',
  '/assets/images/tinos.webp'
];

// Enhanced data fetcher with offline fallback
export const fetchDataWithFallback = async <T>(url: string): Promise<T | null> => {
  const cacheKey = url.replace(/[^a-zA-Z0-9]/g, '_');
  
  try {
    // Try network first
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      dataPreloader.setCachedData(cacheKey, {
        data,
        timestamp: Date.now(),
        url
      });
      return data;
    }
  } catch (error) {
    console.warn(`Network fetch failed for ${url}, trying cache...`);
  }

  // Fallback to cache
  const cached = dataPreloader.getCachedData<any>(cacheKey);
  return cached?.data || null;
};