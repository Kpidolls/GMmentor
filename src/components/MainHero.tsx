'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../config/index.json';
import featureFlags from '../config/featureFlags.json';
import dynamic from 'next/dynamic';
import municipalitiesData from '../data/municipalities.json';
import islandsData from '../data/islands.json';
import categoriesData from '../data/restaurantCategories.json';
import type { MunicipalityLocation, RestaurantLocation } from '../types/location';
import { toRestaurantList, toMunicipalityList } from '../utils/mappers';
import { buildAreaRegistry, buildCategoryRegistry, createIntentResolver } from '../lib/intent';

import { usePWA } from '../hooks/usePWA';

// Region matching utilities no longer needed - using coordinate-based distance

const MyTicker = dynamic(() => import('../components/Ticker'), { ssr: false });
const InstallBanner = dynamic(() => import('./InstallBanner'), { ssr: false });
const OfflineNotice = dynamic(() => import('./OfflineNotice'), { ssr: false });

// Helper function to align viewport for all steps before results
const alignViewport = () => {
  if (typeof window === 'undefined') return;
  window.requestAnimationFrame(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const scrollTarget = isMobile ? 150 : 300;
    if (Math.abs(window.scrollY - scrollTarget) > 8) {
      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  });
};

type Restaurant = RestaurantLocation;
type Municipality = MunicipalityLocation;

interface RestaurantCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  keywords: string[];
}

interface SearchMode {
  type: 'location' | 'municipality' | 'destination' | 'category';
  selectedMunicipality?: Municipality;
  selectedCategory?: RestaurantCategory;
  selectedExperienceType?: ExperienceType;
  selectedDestination?: DestinationEntry;
}

interface DestinationEntry {
  id: string;
  title: string;
  img: string;
  description: string;
  link: string;
  target?: string;
  rel?: string;
  keywords?: string[];
  slug?: string;
}

interface ExperienceType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  categories: RestaurantCategory[] | any[]; // Will hold different types of data
}

const MainHero = () => {
  const logDevWarning = (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  };

  // Snackbar state for share feedback (fix ReferenceError)
  const [shareSnackbar, setShareSnackbar] = useState({ open: false, message: '', type: 'info' });
  const { mainHero } = config;
  const { t } = useTranslation();
  
  // PWA Hook
  const { isOnline, isStandalone, dataPreloadStatus, isInstallable, isInstalled, installApp } = usePWA();

  const categoryDataCacheRef = useRef<Record<string, Restaurant[]>>({});
  const intentDeepLinkHandledRef = useRef(false);
  const getMunicipalitiesDataRef = useRef<() => Municipality[]>(() => toMunicipalityList(municipalitiesData as unknown[]));
  const searchByMunicipalityRef = useRef<(municipality: Municipality, category?: RestaurantCategory) => Promise<void>>(async () => undefined);
  const intentResolver = useMemo(
    () => createIntentResolver({ categories: buildCategoryRegistry(), areas: buildAreaRegistry() }),
    []
  );
  const categoryDataUrls: Record<string, string> = {
    'greek-restaurants': '/data/greekRestaurants.json',
    desserts: '/data/dessertsRestaurants.json',
    'coffee-brunch': '/data/coffeeBrunchRestaurants.json',
    italian: '/data/italianRestaurants.json',
    'cheap-eats': '/data/cheapEatsRestaurants.json',
    asian: '/data/asianRestaurants.json',
    'fish-tavernas': '/data/fishTavernasRestaurants.json',
    burgers: '/data/burgersRestaurants.json',
    'luxury-dining': '/data/luxuryDiningRestaurants.json',
    'rooftop-lounges': '/data/rooftopLoungesRestaurants.json',
    vegetarian: '/data/vegetarianRestaurants.json',
    'gyros-souvlaki': '/data/gyrosSouvlakiRestaurants.json',
    mexican: '/data/mexicanRestaurants.json',
    attractions: '/data/mustSeeAttractions.json',
    'family-friendly': '/data/familyFriendly.json',
    'wineries-vineyards': '/data/wineriesVineyards.json',
    'monasteries-churches': '/data/monasteriesChurches.json'
  };
  
  const loadRestaurantDataByCategory = async (category?: RestaurantCategory): Promise<Restaurant[]> => {
    const categoryId = category?.id || 'greek-restaurants';
    const cached = categoryDataCacheRef.current[categoryId];
    if (cached) return cached;

    const localStorageKey = `restaurant_data_${categoryId}`;

    if (typeof window !== 'undefined' && !navigator.onLine && isStandalone) {
      const cachedData = localStorage.getItem(localStorageKey);
      if (cachedData) {
        try {
          const parsed = toRestaurantList(JSON.parse(cachedData) as unknown[]);
          categoryDataCacheRef.current[categoryId] = parsed;
          return parsed;
        } catch (e) {
          logDevWarning('Failed to parse cached restaurant data:', e);
        }
      }
      return [];
    }

    const dataUrl = categoryDataUrls[categoryId] ?? '/data/greekRestaurants.json';
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${dataUrl}: ${response.status}`);
      }

      const data = await response.json();
      const normalized = toRestaurantList(data as unknown[]);
      categoryDataCacheRef.current[categoryId] = normalized;

      if (isStandalone && typeof window !== 'undefined') {
        localStorage.setItem(localStorageKey, JSON.stringify(data));
      }

      return normalized;
    } catch (error) {
      logDevWarning('Failed to load category data:', error);

      if (typeof window !== 'undefined') {
        const cachedData = localStorage.getItem(localStorageKey);
        if (cachedData) {
          try {
            const parsed = toRestaurantList(JSON.parse(cachedData) as unknown[]);
            categoryDataCacheRef.current[categoryId] = parsed;
            return parsed;
          } catch {
            return [];
          }
        }
      }

      return [];
    }
  };

  // Helper function to get data by experience type
  const getDataByExperienceType = async (experienceType: ExperienceType): Promise<Restaurant[]> => {
    // Prefer explicit categories defined on the experienceType
    if (Array.isArray(experienceType.categories) && experienceType.categories.length > 0) {
      const primary = experienceType.categories[0] as RestaurantCategory | undefined;
      if (primary) return loadRestaurantDataByCategory(primary);
    }

    // Support both short and long ids: 'wineries' | 'wineries-vineyards', 'monasteries' | 'monasteries-churches'
    const id = experienceType.id || '';
    if (id.includes('family')) return loadRestaurantDataByCategory({ id: 'family-friendly' } as RestaurantCategory);
    if (id.includes('wineries')) return loadRestaurantDataByCategory({ id: 'wineries-vineyards' } as RestaurantCategory);
    if (id.includes('monasteries')) return loadRestaurantDataByCategory({ id: 'monasteries-churches' } as RestaurantCategory);
    if (id.includes('attractions')) return loadRestaurantDataByCategory({ id: 'attractions' } as RestaurantCategory);

    // Fallback
    return loadRestaurantDataByCategory({ id: 'family-friendly' } as RestaurantCategory);
  };

  const loadCurrentSourceData = async (): Promise<Restaurant[]> => {
    if (selectedType === 'experience' && selectedExperienceType) {
      return getDataByExperienceType(selectedExperienceType);
    }

    if (selectedType === 'category' && selectedDisplayCategory) {
      return loadRestaurantDataByCategory(selectedDisplayCategory);
    }

    return loadRestaurantDataByCategory(undefined);
  };

  // Updated state management
  const [searchMode, setSearchMode] = useState<SearchMode>({ type: 'location' });
  const [selectedDisplayCategory, setSelectedDisplayCategory] = useState<RestaurantCategory | undefined>(undefined);
  const [selectedExperienceType, setSelectedExperienceType] = useState<ExperienceType | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<'category' | 'experience' | undefined>(undefined);
  const [_userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearestRestaurants, setNearestRestaurants] = useState<Array<{ restaurant: Restaurant; distance: number }> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRestaurantFinder, setShowRestaurantFinder] = useState(false);
  const [showMunicipalityList, setShowMunicipalityList] = useState(false);
  const [showDestinationList, setShowDestinationList] = useState(false);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [showLocationOptions, setShowLocationOptions] = useState(true);
  const [municipalitySearchQuery, setMunicipalitySearchQuery] = useState('');
  const [destinationSearchQuery, setDestinationSearchQuery] = useState('');
  const [destinationViewFilter, setDestinationViewFilter] = useState<'all' | 'islands' | 'mainland'>('all');
  const [selectedDestination, setSelectedDestination] = useState<DestinationEntry | null>(null);
  const [searchRadius, setSearchRadius] = useState(5);
  const [maxResults, setMaxResults] = useState(50);
  const [selectedRestaurants, setSelectedRestaurants] = useState<Set<number>>(new Set());
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const [showDeferredUi, setShowDeferredUi] = useState(false);
  const destinationsData: DestinationEntry[] = (islandsData as DestinationEntry[]).map((destination) => ({
    ...destination,
    id: String(destination.id || '').trim(),
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const enableDeferredUi = () => setShowDeferredUi(true);
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(enableDeferredUi, { timeout: 1200 });
      return () => {
        if (idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(enableDeferredUi, 600);
    return () => window.clearTimeout(timeoutId);
  }, []);


  // Restaurant finder functions
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Use selectedType to determine which data to use for search
  const findNearestPlaces = async (userLat: number, userLng: number, count: number = 10, category?: RestaurantCategory) => {
    const sourceData = category
      ? await loadRestaurantDataByCategory(category)
      : await loadCurrentSourceData();
    const placesWithDistance = sourceData.map((place) => ({
      restaurant: place,
      distance: calculateDistance(userLat, userLng, place.lat, place.lng)
    }));
    return placesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  };

  const getUserLocation = (category?: RestaurantCategory) => {
    const effectiveCategory = category || selectedDisplayCategory;
    if (category) {
      setSelectedDisplayCategory(category);
      setSelectedExperienceType(undefined);
      setSelectedType('category');
    }

    setLoading(true);
    setError(null);
    setShowCategorySelection(false);
    setShowMunicipalityList(false);
    setShowDestinationList(false);
    setShowLocationOptions(false);
    setShowRestaurantFinder(true);
    setSearchMode({ type: 'location', selectedCategory: effectiveCategory, selectedMunicipality: undefined });

    // PWA Enhancement: Check if offline and use cached data if available
    if (!isOnline) {
      const cachedLocation = localStorage.getItem('lastKnownLocation');
      if (cachedLocation && dataPreloadStatus === 'completed') {
        try {
          const { lat, lng } = JSON.parse(cachedLocation);
          setUserLocation({ lat, lng });
          findNearestPlaces(lat, lng, 50, effectiveCategory).then((nearest) => {
            setNearestRestaurants(nearest);
            setCurrentIndex(0);
            setLoading(false);
            setError(t('pwa.usingCachedLocation', 'Using your last known location. Results may not be current.'));
          });
          setCurrentIndex(0);
          return;
        } catch (e) {
          logDevWarning('Failed to parse cached location:', e);
        }
      }
      
      setError(t('pwa.offlineLocationError', 'Location services require an internet connection. Please connect and try again.'));
      setLoading(false);
      return;
    }

    // Gentle scroll for mobile, more pronounced for desktop
    setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      const scrollTarget = isMobile ? 150 : 300;
      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }, 100);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Use the currently selected experience type for location search
          const nearest = await findNearestPlaces(latitude, longitude, 50, effectiveCategory); // Fetch up to 50 results
          setNearestRestaurants(nearest); // Display all results within 5km
          setCurrentIndex(0);
          setLoading(false);
          
          // PWA Enhancement: Cache location for offline use
          if (isStandalone) {
            localStorage.setItem('lastKnownLocation', JSON.stringify({ lat: latitude, lng: longitude }));
          }
          
          // Only scroll again if results might be off-screen on larger screens
          setTimeout(() => {
            const isMobile = window.innerWidth < 768;
            if (!isMobile) {
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }
          }, 200);
        },
        async (geolocationError) => {
          // PWA Enhancement: Try to use cached location if available
          if (isStandalone) {
            const cachedLocation = localStorage.getItem('lastKnownLocation');
            if (cachedLocation) {
              try {
                const { lat, lng } = JSON.parse(cachedLocation);
                setUserLocation({ lat, lng });
                const nearest = await findNearestPlaces(lat, lng, 50, effectiveCategory);
                setNearestRestaurants(nearest);
                setCurrentIndex(0);
                setLoading(false);
                setError(t('pwa.usingCachedLocation', 'Using your last known location. Results may not be current.'));
                return;
              } catch (e) {
                logDevWarning('Failed to parse cached location:', e);
              }
            }
          }
          
          logDevWarning('Geolocation error:', geolocationError);
          setError(t('restaurantFinder.locationError', 'Unable to get your location. Please enable location services.'));
          setLoading(false);
          // Minimal scroll for error visibility
          setTimeout(() => {
            const isMobile = window.innerWidth < 768;
            const scrollTarget = isMobile ? 100 : 250;
            window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
          }, 200);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setError(t('restaurantFinder.geolocationNotSupported', 'Geolocation is not supported by this browser.'));
      setLoading(false);
      // Minimal scroll for error visibility
      setTimeout(() => {
        const isMobile = window.innerWidth < 768;
        const scrollTarget = isMobile ? 100 : 250;
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }, 200);
    }
  };

  const searchByMunicipality = async (municipality: Municipality, category?: RestaurantCategory) => {
    const effectiveCategory = category || selectedDisplayCategory;
    if (category) {
      setSelectedDisplayCategory(category);
      setSelectedExperienceType(undefined);
      setSelectedType('category');
    }

    setLoading(true);
    setError(null);
    setShowCategorySelection(false);
    setShowRestaurantFinder(true);
    setShowMunicipalityList(false);
    setShowDestinationList(false);
    setSearchMode({ type: 'municipality', selectedMunicipality: municipality, selectedCategory: effectiveCategory });

    // Responsive scroll based on screen size
    setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      const scrollTarget = isMobile ? 150 : 300;
      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }, 100);

    // Get all data for selected category (use explicit value to avoid state timing issues)
    const sourceData = effectiveCategory
      ? await loadRestaurantDataByCategory(effectiveCategory)
      : await loadCurrentSourceData();
    
    // Validate that we have data
    if (!sourceData || sourceData.length === 0) {
      console.warn('No data available for selected category/experience');
      setNearestRestaurants([]);
      setCurrentIndex(0);
      setLoading(false);
      setError(t('restaurantFinder.noDataAvailable', 'No data available for this selection'));
      return;
    }
    
    // Define default search radius based on region type
    const getDefaultSearchRadius = (region: string): number => {
      const regionLower = region.toLowerCase();
      
      // Major city centers - 15km radius
      if (regionLower.includes('κέντρο') || regionLower.includes('center')) {
        return 15;
      }
      
      // Suburbs and surrounding areas - 10km radius
      if (regionLower.includes('προάστια') || regionLower.includes('suburbs') || 
          regionLower.includes('ανατολικ') || regionLower.includes('east') ||
          regionLower.includes('δυτικ') || regionLower.includes('west') ||
          regionLower.includes('βόρει') || regionLower.includes('north') ||
          regionLower.includes('νότι') || regionLower.includes('south')) {
        return 10;
      }
      
      // Islands and Crete - 20km radius (larger areas, attractions more spread out)
      if (regionLower.includes('νησ') || regionLower.includes('island') ||
          regionLower.includes('κρήτη') || regionLower.includes('crete') ||
          regionLower.includes('cyclades') || regionLower.includes('κυκλάδ') ||
          regionLower.includes('dodecanese') || regionLower.includes('δωδεκάνησ')) {
        return 20;
      }
      
      // Default radius - 12km
      return 12;
    };
    
    // Use custom radius if set, otherwise use region-based default
    const effectiveRadius = searchRadius > 0 ? searchRadius : getDefaultSearchRadius(municipality.region);
    
    // Filter and validate data before distance calculation
    const validPlaces = sourceData.filter(place => {
      const hasValidLat = place.lat !== undefined && place.lat !== null && 
                         typeof place.lat === 'number' && !isNaN(place.lat);
      const hasValidLng = place.lng !== undefined && place.lng !== null && 
                         typeof place.lng === 'number' && !isNaN(place.lng);
      
      if (!hasValidLat || !hasValidLng) {
        console.warn('Invalid coordinates for place:', place.name);
        return false;
      }
      
      return true;
    });

    console.log(`Searching in ${municipality.name} (${municipality.region})`);
    console.log(`Radius: ${effectiveRadius}km, Max results: ${maxResults}`);
    console.log(`Valid places: ${validPlaces.length}/${sourceData.length}`);
    
    // Calculate distances for all places
    const allPlacesWithDistance = validPlaces
      .map((place) => ({
        restaurant: place,
        distance: calculateDistance(municipality.lat, municipality.lng, place.lat, place.lng)
      }))
      .sort((a, b) => a.distance - b.distance);

    // For initial search, use 5km radius. For subsequent searches, use selected radius
    const initialRadius = initialSearchDone ? effectiveRadius : 5;
    
    // Filter by radius
    const placesWithinRadius = allPlacesWithDistance.filter(item => {
      const withinRadius = item.distance <= initialRadius;
      if (withinRadius) {
        console.log(`✓ ${item.restaurant.name} - ${item.distance.toFixed(2)}km`);
      }
      return withinRadius;
    });

    const limitedPlaces = placesWithinRadius.slice(0, maxResults);

    console.log(`Found ${placesWithinRadius.length} places within ${initialRadius}km`);
    console.log(`Displaying ${limitedPlaces.length} places (maxResults: ${maxResults})`);
    
    // Store and display limited results within the search radius
    setNearestRestaurants(limitedPlaces);
    setCurrentIndex(0);
    setLoading(false);
    
    // Mark that initial search is complete
    if (!initialSearchDone) {
      setInitialSearchDone(true);
    }
    
    // Show appropriate message if no results found
    if (placesWithinRadius.length === 0) {
      const categoryName = selectedExperienceType?.name || selectedDisplayCategory?.name || 'places';
      setError(
        t('restaurantFinder.noResultsInArea', 
          'No {{type}} found within {{radius}}km of {{location}}. Try adjusting the search settings below.', {
            type: categoryName,
            radius: initialRadius,
            location: municipality.name
          }
        )
      );
    }
    
    // PWA Enhancement: Cache the search results for offline use
    if (isStandalone) {
      try {
        localStorage.setItem('lastMunicipalitySearch', JSON.stringify({
          municipality: municipality.name,
          results: limitedPlaces,
          timestamp: Date.now()
        }));
      } catch (e) {
        logDevWarning('Failed to cache municipality search:', e);
      }
    }
    
    // Scroll to results section
    setTimeout(() => {
      const resultsSection = document.getElementById('results-section');
      if (resultsSection) {
        const offset = window.innerWidth < 768 ? 20 : 80;
        const elementPosition = resultsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }, 300);
  };

  // Removed unused selectCategory

  // Removed unused showMunicipalitySelection

  // Removed unused showCategorySelection

  // Removed unused handleLocationOptions

  const selectSearchMode = (type: 'location' | 'municipality' | 'destination') => {
    setError(null);
    setNearestRestaurants(null);
    setCurrentIndex(0);
    setShowRestaurantFinder(false);
    setSelectedDestination(null);
    setDestinationSearchQuery('');
    setDestinationViewFilter('all');

    if (type === 'location') {
      setSearchMode({ type: 'location', selectedMunicipality: undefined, selectedCategory: undefined, selectedDestination: undefined });
      setShowMunicipalityList(false);
      setShowDestinationList(false);
      setShowLocationOptions(false);
      setShowCategorySelection(true);
      alignViewport();
      return;
    }

    if (type === 'destination') {
      setSearchMode({ type: 'destination', selectedMunicipality: undefined, selectedCategory: undefined, selectedDestination: undefined });
      setShowCategorySelection(false);
      setShowMunicipalityList(false);
      setShowLocationOptions(false);
      setShowDestinationList(true);
      alignViewport();
      return;
    }

    setSearchMode({ type: 'municipality', selectedMunicipality: undefined, selectedCategory: undefined, selectedDestination: undefined });
    setShowCategorySelection(false);
    setShowLocationOptions(false);
    setShowDestinationList(false);
    setShowMunicipalityList(true);
    alignViewport();
  };

  const selectMunicipalityForCategory = (municipality: Municipality) => {
    setError(null);
    setNearestRestaurants(null);
    setCurrentIndex(0);
    setShowRestaurantFinder(false);
    setSearchMode(prev => ({ ...prev, type: 'municipality', selectedMunicipality: municipality }));
    setShowMunicipalityList(false);
    setShowDestinationList(false);
    setShowCategorySelection(true);
    alignViewport();
  };

  const isIslandDestination = (destination: DestinationEntry): boolean => destination.id.startsWith('island-');

  const getDestinationTypeLabel = (destination: DestinationEntry): string => {
    return isIslandDestination(destination)
      ? t('destinationSearch.destinationTypeIsland', 'Island')
      : t('destinationSearch.destinationTypeMainland', 'Mainland');
  };

  const getDestinationLabel = (destination: DestinationEntry): string => {
    const translated = t(destination.title, destination.id);
    return translated.replace(/^📍\s*/, '').trim();
  };

  const getDestinationDescription = (destination: DestinationEntry): string => {
    return t(destination.description, 'Curated points of interest for this destination.');
  };

  const selectDestination = (destination: DestinationEntry) => {
    setError(null);
    setNearestRestaurants(null);
    setCurrentIndex(0);
    setShowRestaurantFinder(false);
    setSelectedDestination(destination);
    setSearchMode({ type: 'destination', selectedDestination: destination, selectedCategory: undefined, selectedMunicipality: undefined });
  };

  const shareDestinationMap = async (destination: DestinationEntry) => {
    const shareText = `${getDestinationLabel(destination)}\n${destination.link}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: getDestinationLabel(destination),
          text: t('destinationSearch.shareText', 'Check this curated destination map:'),
          url: destination.link,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setShareSnackbar({ open: true, message: t('destinationSearch.copiedDestinationLink', 'Destination map link copied to clipboard.'), type: 'success' });
      setTimeout(() => {
        setShareSnackbar((prev) => ({ ...prev, open: false }));
      }, 3000);
    } catch {
      setShareSnackbar({ open: true, message: t('destinationSearch.shareFailed', 'Unable to share this destination right now.'), type: 'error' });
      setTimeout(() => {
        setShareSnackbar((prev) => ({ ...prev, open: false }));
      }, 3000);
    }
  };

  const runSearchWithCategory = async (category: RestaurantCategory) => {
    setSelectedDisplayCategory(category);
    setSelectedExperienceType(undefined);
    setSelectedType('category');
    setSearchMode(prev => ({ ...prev, selectedCategory: category }));

    if (searchMode.type === 'municipality' && searchMode.selectedMunicipality) {
      await searchByMunicipality(searchMode.selectedMunicipality, category);
      return;
    }

    await getUserLocation(category);
  };

  const backToCategoryStep = () => {
    setLoading(false);
    setError(null);
    setNearestRestaurants(null);
    setCurrentIndex(0);
    setSelectedRestaurants(new Set());
    setShowRestaurantFinder(false);
    setShowLocationOptions(true);
    setShowMunicipalityList(false);
    setShowDestinationList(false);
    setShowCategorySelection(false);
    setSearchMode({ type: 'location' });
    alignViewport();
  };

  const resetSearch = () => {
    setUserLocation(null);
    setNearestRestaurants(null);
    setCurrentIndex(0);
    setError(null);
    setShowRestaurantFinder(false);
    setShowMunicipalityList(false);
    setShowDestinationList(false);
    setShowCategorySelection(false);
    setShowLocationOptions(true);
    setSearchMode({ type: 'location' });
    setSelectedDisplayCategory(undefined);
    setSelectedExperienceType(undefined);
    setSelectedType(undefined);
    setSelectedDestination(null);
    setDestinationSearchQuery('');
    setDestinationViewFilter('all');
    setMunicipalitySearchQuery(''); // Clear municipality search
    setSelectedRestaurants(new Set()); // Clear selection
    setSearchRadius(2); // Reset to initial 2km
    setInitialSearchDone(false); // Reset initial search flag
    
    // Optimal scroll to show all 4 main cards completely in viewport
    setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Minimal scroll for mobile
        window.scrollTo({ top: 30, behavior: 'smooth' });
      } else {
        // Desktop: scroll to position that shows the 4 main cards optimally
        window.scrollTo({ top: 280, behavior: 'smooth' });
      }
    }, 100);
  };

  const fullReset = () => {
    setUserLocation(null);
    setNearestRestaurants(null);
    setCurrentIndex(0);
    setError(null);
    setShowRestaurantFinder(false);
    setShowMunicipalityList(false);
    setShowDestinationList(false);
    setShowCategorySelection(false);
    setShowLocationOptions(true);
    setSearchMode({ type: 'location' });
    setSelectedDisplayCategory(undefined);
    setSelectedExperienceType(undefined);
    setSelectedType(undefined);
    setSelectedDestination(null);
    setDestinationSearchQuery('');
    setDestinationViewFilter('all');
    setMunicipalitySearchQuery(''); // Clear municipality search
    setSelectedRestaurants(new Set()); // Clear selection
    setSearchRadius(2); // Reset to initial 2km
    setInitialSearchDone(false); // Reset initial search flag
    
    // Optimal scroll to show all 4 main cards completely in viewport
    setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Minimal scroll for mobile
        window.scrollTo({ top: 30, behavior: 'smooth' });
      } else {
        // Desktop: scroll to position that shows the 4 main cards optimally
        window.scrollTo({ top: 280, behavior: 'smooth' });
      }
    }, 100);
  };

  // Selection helper functions
  const toggleRestaurantSelection = (index: number) => {
    setSelectedRestaurants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        if (newSet.size < 10) {
          newSet.add(index);
        }
      }
      return newSet;
    });
  };

  const selectAllVisible = () => {
    if (!nearestRestaurants) return;
    const newSet = new Set<number>();
    const limit = Math.min(10, nearestRestaurants.length);
    for (let i = 0; i < limit; i++) {
      newSet.add(i);
    }
    setSelectedRestaurants(newSet);
  };

  const clearSelection = () => {
    setSelectedRestaurants(new Set());
  };

  // Helper: determine whether a category represents dining/restaurant results
  const isDiningCategory = (category?: RestaurantCategory): boolean => {
    if (!category || !Array.isArray(category.keywords)) return false;
    const diningKeywords = new Set(['restaurant', 'restaurants', 'taverna', 'tavernas', 'food', 'fish', 'dessert', 'burger', 'pasta', 'pizza', 'grill', 'seafood', 'vegan', 'vegetarian']);
    return category.keywords.some(k => diningKeywords.has(k.toLowerCase()));
  };

  // Helper: detect if a translated/display label already contains dining words
  // Normalize Greek accents and case before testing to avoid false negatives
  const labelContainsDiningWord = (label: string | undefined): boolean => {
    if (!label) return false;

    // Basic normalization: lowercase and remove common Greek diacritics so
    // labels like "Εστιατόρια" or "Εστιατόριο" match reliably.
    let normalized = label.toLowerCase();
    normalized = normalized
      .replace(/ά/g, 'α')
      .replace(/έ/g, 'ε')
      .replace(/ή/g, 'η')
      .replace(/ί/g, 'ι')
      .replace(/ό/g, 'ο')
      .replace(/ύ/g, 'υ')
      .replace(/ώ/g, 'ω')
      .replace(/ΐ/g, 'ι')
      .replace(/ΰ/g, 'υ')
      .replace(/Ά/g, 'α')
      .replace(/Έ/g, 'ε')
      .replace(/Ή/g, 'η')
      .replace(/Ί/g, 'ι')
      .replace(/Ό/g, 'ο')
      .replace(/Ύ/g, 'υ')
      .replace(/Ώ/g, 'ω');

    // tokens in english + greek (accent-free)
    const tokens = [
      'restaurants', 'restaurant', 'tavernas', 'taverna',
      'εστιατορια', 'εστιατοριο', 'ταβερνες', 'ταβερνα'
    ];

    return tokens.some(token => normalized.includes(token));
  };

  // Helper: get a safe display label for a category — will append 'Restaurants' only when appropriate
  const getSafeCategoryHeading = (category: RestaurantCategory) => {
    const raw = t(`categories.${category.id}`, category.name);
    if (isDiningCategory(category) && !labelContainsDiningWord(raw)) {
      return `${raw} ${t('restaurantFinder.restaurants', 'Restaurants')}`;
    }
    return raw;
  };

  // Helper: get a safe label for count/places sentences — avoid 'Restaurants places' duplication
  const getSafeCategoryForCount = (category: RestaurantCategory) => {
    const raw = t(`categories.${category.id}`, category.name);
    if (labelContainsDiningWord(raw)) return raw;
    return `${raw} ${t('restaurantFinder.places', 'places')}`;
  };

  const currentRestaurant = nearestRestaurants?.[currentIndex];

  // Enhanced search normalization function
  const normalizeSearchText = (text: string): string => {
    if (!text) return '';
    
    let normalized = text.toLowerCase().trim();
    
    // Remove Greek tone marks (accents)
    normalized = normalized
      .replace(/ά/g, 'α')
      .replace(/έ/g, 'ε')
      .replace(/ή/g, 'η')
      .replace(/ί/g, 'ι')
      .replace(/ό/g, 'ο')
      .replace(/ύ/g, 'υ')
      .replace(/ώ/g, 'ω')
      .replace(/ΐ/g, 'ι')
      .replace(/ΰ/g, 'υ');
    
    return normalized;
  };

  // Enhanced transliteration mapping (Greek to Latin)
  const transliterateGreekToLatin = (text: string): string => {
    const greekToLatin: { [key: string]: string } = {
      'α': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'i', 'θ': 'th',
      'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
      'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'u', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
      // Common combinations
      'αυ': 'av', 'ευ': 'ev', 'ου': 'ou', 'αι': 'ai', 'ει': 'ei', 'οι': 'oi', 'υι': 'ui',
      'γγ': 'ng', 'γκ': 'gk', 'γχ': 'nch', 'γξ': 'nx', 'μπ': 'mp', 'ντ': 'nt', 'τσ': 'ts', 'τζ': 'tz'
    };
    
    let result = text.toLowerCase();
    
    // Replace multi-character combinations first
    for (const [greek, latin] of Object.entries(greekToLatin)) {
      if (greek.length > 1) {
        result = result.replace(new RegExp(greek, 'g'), latin);
      }
    }
    
    // Replace single characters
    for (const [greek, latin] of Object.entries(greekToLatin)) {
      if (greek.length === 1) {
        result = result.replace(new RegExp(greek, 'g'), latin);
      }
    }
    
    return result;
  };

  // Generate alternative spellings for common variations
  const generateAlternativeSpellings = (text: string): string[] => {
    const alternatives: string[] = [text];
    let working = text.toLowerCase();
    
    // Common English transliteration variations
    const variations: { [key: string]: string[] } = {
      'agia': ['agía', 'αγία', 'αγια'],
      'agios': ['agíos', 'άγιος', 'αγιος'], 
      'nea': ['néa', 'νέα', 'νεα'],
      'neos': ['néos', 'νέος', 'νεος'],
      'palaio': ['palaiό', 'παλαιό', 'παλαιο'],
      'kala': ['kalá', 'καλά', 'καλα'],
      'mega': ['megá', 'μεγά', 'μεγα'],
      'mikro': ['mikró', 'μικρό', 'μικρο'],
      'ano': ['ánο', 'άνω', 'ανω'],
      'kato': ['káto', 'κάτω', 'κατω']
    };
    
    // Add variations for common prefixes/suffixes
    for (const [english, greekVariations] of Object.entries(variations)) {
      if (working.includes(english)) {
        greekVariations.forEach(variation => {
          alternatives.push(working.replace(english, variation));
        });
      }
      
      greekVariations.forEach(variation => {
        if (working.includes(variation)) {
          alternatives.push(working.replace(variation, english));
        }
      });
    }
    
    return alternatives;
  };

  // Enhanced search matching function
  const searchMatches = (searchText: string, targetText: string): boolean => {
    if (!searchText || !targetText) return false;
    
    const normalizedSearch = normalizeSearchText(searchText);
    const normalizedTarget = normalizeSearchText(targetText);
    
    // Direct match (Greek or English)
    if (normalizedTarget.includes(normalizedSearch)) return true;
    
    // Transliterate Greek text to Latin and check
    const transliteratedTarget = transliterateGreekToLatin(normalizedTarget);
    const transliteratedSearch = transliterateGreekToLatin(normalizedSearch);
    
    // Check if Latin search matches transliterated Greek
    if (transliteratedTarget.includes(transliteratedSearch)) return true;
    
    // Check if Greek search matches transliterated target
    if (normalizedTarget.includes(transliteratedSearch)) return true;
    
    // Check if transliterated search matches original target
    if (targetText.toLowerCase().includes(transliteratedSearch)) return true;
    
    // Check alternative spellings
    const searchAlternatives = generateAlternativeSpellings(searchText);
    const targetAlternatives = generateAlternativeSpellings(targetText);
    
    for (const searchAlt of searchAlternatives) {
      const normalizedSearchAlt = normalizeSearchText(searchAlt);
      if (normalizedTarget.includes(normalizedSearchAlt)) return true;
      if (transliteratedTarget.includes(normalizedSearchAlt)) return true;
      
      for (const targetAlt of targetAlternatives) {
        const normalizedTargetAlt = normalizeSearchText(targetAlt);
        if (normalizedTargetAlt.includes(normalizedSearchAlt)) return true;
      }
    }
    
    return false;
  };

  const filteredDestinations = destinationsData
    .filter((destination) => {
      if (destinationViewFilter === 'islands') return isIslandDestination(destination);
      if (destinationViewFilter === 'mainland') return !isIslandDestination(destination);
      return true;
    })
    .filter((destination) => {
      if (!destinationSearchQuery.trim()) return true;

      const query = destinationSearchQuery.trim();
      const translatedTitle = getDestinationLabel(destination);
      const translatedDescription = getDestinationDescription(destination);

      if (searchMatches(query, translatedTitle)) return true;
      if (searchMatches(query, translatedDescription)) return true;

      if (Array.isArray(destination.keywords) && destination.keywords.some((keyword) => searchMatches(query, keyword))) {
        return true;
      }

      if (searchMatches(query, destination.id)) return true;

      return false;
    });

  // PWA Enhancement: Get municipalities with offline fallback
  const getMunicipalitiesData = (): Municipality[] => {
    if (typeof window !== 'undefined' && !navigator.onLine && isStandalone) {
      const cachedData = localStorage.getItem('municipalities_data');
      if (cachedData) {
        try {
          return toMunicipalityList(JSON.parse(cachedData) as unknown[]);
        } catch (e) {
          logDevWarning('Failed to parse cached municipalities data:', e);
        }
      }
    }
    return toMunicipalityList(municipalitiesData as unknown[]);
  };

  useEffect(() => {
    getMunicipalitiesDataRef.current = getMunicipalitiesData;
    searchByMunicipalityRef.current = searchByMunicipality;
  });

  useEffect(() => {
    if (intentDeepLinkHandledRef.current || typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const categorySlug = params.get('category') ?? undefined;
    const areaSlug = params.get('area') ?? undefined;

    if (!categorySlug && !areaSlug) {
      intentDeepLinkHandledRef.current = true;
      return;
    }

    const resolution = intentResolver.resolveIntent(categorySlug, areaSlug);
    if (resolution.status !== 'resolved' || !resolution.categoryId || !resolution.areaId) {
      intentDeepLinkHandledRef.current = true;
      return;
    }

    const category = categoriesData.find((item) => item.id === resolution.categoryId);
    const municipality = getMunicipalitiesDataRef.current().find((item) => item.id === resolution.areaId);

    if (!category || !municipality) {
      intentDeepLinkHandledRef.current = true;
      return;
    }

    intentDeepLinkHandledRef.current = true;
    void searchByMunicipalityRef.current(municipality, category as RestaurantCategory);
  }, [intentResolver]);

  // Filter municipalities based on enhanced search query
  const filteredMunicipalities = getMunicipalitiesData().filter((municipality: Municipality) => {
    if (!municipalitySearchQuery.trim()) return true;
    
    const query = municipalitySearchQuery.trim();
    
    // Check municipality name (Greek)
    if (searchMatches(query, municipality.name)) return true;
    
    // Check municipality name_en field
    if (municipality.name_en && searchMatches(query, municipality.name_en)) return true;
    
    // Check aliases if they exist
    if (municipality.aliases && Array.isArray(municipality.aliases)) {
      if (municipality.aliases.some(alias => searchMatches(query, alias))) return true;
    }
    
    // Check translated municipality name (English from i18n)
    const translatedName = t(`municipalities.${municipality.name}`, municipality.name_en || municipality.name);
    if (searchMatches(query, translatedName)) return true;
    
    // Check region name (Greek)
    if (searchMatches(query, municipality.region)) return true;
    
    // Check region_en field
    if (municipality.region_en && searchMatches(query, municipality.region_en)) return true;
    
    // Check translated region name (English from i18n)
    const translatedRegion = t(`regions.${municipality.region}`, municipality.region_en || municipality.region);
    if (searchMatches(query, translatedRegion)) return true;
    
    return false;
  });

  return (
    <>
      {/* Custom Animation Styles */}
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .group:hover .animate-shimmer {
          animation: shimmer 1s ease-in-out;
        }
        
        /* Ensure no horizontal overflow and clean design */
        * {
          box-sizing: border-box;
        }
        
        /* Hide all unnecessary scrollbars */
        body {
          overflow-x: hidden;
        }
      `}</style>

      {/* Non-critical PWA UI (deferred for faster LCP) */}
      {showDeferredUi && <OfflineNotice position="top" />}
      {showDeferredUi && <InstallBanner position="bottom" showAfterDelay={4000} />}
      


      <main className="relative min-h-screen w-full flex items-center justify-center">

        {/* Professional Background with Enhanced Visual Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-100">
          {/* Simplified background pattern for faster first paint */}
          <div className="absolute inset-0 opacity-45 hidden md:block">
            <div className="absolute top-16 left-16 w-72 h-72 rounded-full blur-3xl bg-teal-300/35" />
            <div className="absolute bottom-12 right-14 w-80 h-80 rounded-full blur-3xl bg-cyan-300/35" />
          </div>
          
          <picture className="absolute inset-0 block w-full h-full">
            <source
              srcSet="/assets/images/cover-480.webp 480w, /assets/images/cover-627.webp 627w"
              sizes="100vw"
              type="image/webp"
            />
            <img
              src="/assets/images/cover-627.webp"
              alt={t('mainHero.coverAlt', 'Panoramic view of Athens skyline with the Acropolis in the background — travel and dining guide hero image')}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
              fetchpriority="high"
              sizes="100vw"
              srcSet="/assets/images/cover-480.webp 480w, /assets/images/cover-627.webp 627w"
              style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.24 }}
            />
          </picture>
          
          {/* Enhanced gradient overlay with better depth (muted so image is visible) */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-emerald-50/70 via-white/50 to-cyan-200/15" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.03),rgba(255,255,255,0.62)_72%)]" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-cyan-100/10 via-teal-100/20 to-blue-200/45" />
        </div>



        {/* Enhanced Location Badge with Animation */}
        {!showLocationOptions && (
        <div className="absolute top-4 right-4 z-40 xs:top-6 xs:right-6 md:top-6 md:right-8 lg:top-8 lg:right-8">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-full blur opacity-35 group-hover:opacity-60 transition duration-300 bg-gradient-to-r from-slate-400 via-zinc-300 to-stone-300" />
            
            <span className="relative inline-flex items-center px-3 py-2 xs:px-4 xs:py-2 backdrop-blur-md text-slate-800 font-semibold rounded-full text-xs xs:text-sm gap-2 hover:scale-105 transition-all duration-300 shadow-lg bg-white/88 hover:bg-white border border-slate-300/80">
              <span className="text-sm xs:text-base animate-pulse">🇬🇷</span>
              <span className="hidden font-medium tracking-wide">{t('mainHero.athens', 'Athens')}</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </span>
          </div>
        </div>
        )}
        
        {/* Ticker */}
        {showDeferredUi && (
          <div className="absolute top-0 left-0 w-full z-30">
            <MyTicker />
          </div>
        )}



        {/* Professional Hero Content */}
        <section role="main" aria-label={t('aria.homepage', 'Homepage')} className={`relative z-20 px-3 xs:px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto hero-tight flex flex-col justify-center ${showLocationOptions ? 'pt-16 pb-4 sm:pt-20 sm:pb-6' : 'py-8 sm:py-12'}`}>
          {/* Lightweight content backdrop */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-slate-100/20 to-slate-200/35" />
          </div>
          <div className={`text-center w-full ${showLocationOptions ? 'space-y-4 xs:space-y-5 sm:space-y-6 lg:space-y-8' : 'space-y-6 xs:space-y-8 sm:space-y-10 lg:space-y-12'}`}>
            {/* Enhanced Title with Modern Typography */}
            <header className={`relative ${showLocationOptions ? 'space-y-2 xs:space-y-3 sm:space-y-4' : 'space-y-4 xs:space-y-5 sm:space-y-7'}`}>
              {/* Decorative elements */}
              {!showLocationOptions && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-1 rounded-full opacity-70 bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
              )}
              
              <div 
                onClick={fullReset}
                className="font-bold tracking-tight text-slate-900 hover:scale-[1.02] transition-all duration-500 cursor-pointer group relative"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fullReset(); }}
                title={t('mainHero.clickToReturnToMain', 'Click to return to main page')}
              >
                {/* Glow effect behind title */}
                <div className="absolute inset-0 blur-3xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-slate-500/10 via-zinc-300/20 to-stone-300/20" />
                
                <div className="relative">
                  <span className={`block font-semibold tracking-[0.2em] uppercase transition-all duration-500 relative drop-shadow-sm ${showLocationOptions ? 'text-xs xs:text-sm sm:text-base lg:text-lg mb-1 xs:mb-2 sm:mb-3' : 'text-sm xs:text-base sm:text-lg lg:text-xl xl:text-2xl mb-3 xs:mb-4 sm:mb-5'} text-slate-700 group-hover:text-slate-800`}>
                    <span className="relative z-10">{t('mainHero.subtitle')}</span>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                  </span>
                  
                  <h1 className={`block font-extrabold bg-clip-text text-transparent leading-tight px-1 transition-all duration-500 drop-shadow-lg ${showLocationOptions ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl' : 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl'} bg-gradient-to-r from-teal-900 via-cyan-700 to-blue-700 group-hover:from-teal-800 group-hover:via-cyan-700 group-hover:to-blue-600`}>
                    {t('mainHero.title')}
                  </h1>
                </div>
              </div>
              
              {/* Decorative dots */}
              {!showLocationOptions && (
              <div className="flex justify-center space-x-2 mt-6">
                <div className="w-2 h-2 rounded-full animate-pulse bg-slate-400" />
                <div className="w-2 h-2 rounded-full animate-pulse animation-delay-300 bg-zinc-400" />
                <div className="w-2 h-2 rounded-full animate-pulse animation-delay-600 bg-stone-400" />
              </div>
              )}
            </header>

            {/* Professional Discovery Interface */}
            <div className="max-w-5xl mx-auto px-1 xs:px-2 sm:px-4 w-full">
              {showCategorySelection && !showRestaurantFinder && !showMunicipalityList && !showDestinationList && (
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-slate-500/20 via-zinc-400/20 to-stone-400/20" />
                  <div className="relative backdrop-blur-2xl rounded-2xl xs:rounded-3xl sm:rounded-[2rem] p-4 xs:p-6 sm:p-8 lg:p-12 shadow-2xl bg-white/90 border border-slate-200/80">
                    <div className="text-center mb-8 xs:mb-10 lg:mb-12 relative">
                      <div className="w-20 h-0.5 mx-auto mb-6 opacity-70 bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
                      <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 xs:mb-5 sm:mb-6 relative">
                        <span className="relative z-10">{t('discovery.chooseCategoryAfterLocation', 'Choose a Category')}</span>
                        <div className="absolute inset-0 blur-lg scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-slate-500/15 to-zinc-400/15" />
                      </h2>
                      <p className="text-slate-700 text-sm xs:text-base sm:text-lg lg:text-xl max-w-3xl mx-auto px-4 leading-relaxed font-light mb-6">
                        {t('discovery.selectCategoryAfterLocation', 'Select a category to continue with your search.')}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-6 sm:mb-8">
                      {/* Show all categories in a single grid */}
                      {categoriesData.map((category) => (
                        <button
                          key={'category-' + category.id}
                          onClick={() => {
                            runSearchWithCategory(category);
                          }}
                          className={`group relative overflow-hidden bg-white/70 backdrop-blur-sm hover:bg-white border border-sky-100 rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl${selectedDisplayCategory?.id === category.id && selectedType === 'category' ? ' border-cyan-400 bg-cyan-50' : ''}`}
                        >
                          <div className="relative text-center space-y-2 xs:space-y-3 sm:space-y-4">
                            <div className="text-3xl xs:text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                              {category.icon}
                            </div>
                            <h3 className="text-slate-800 font-bold text-sm sm:text-base lg:text-lg leading-tight">
                              {t(`categories.${category.id}`, category.name)}
                            </h3>
                            <p className="text-slate-600 text-xs sm:text-sm leading-tight">
                              {t(`categories.descriptions.${category.id}`, category.description)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="text-center pt-4 border-t border-sky-100">
                      <button
                        onClick={() => {
                          setShowCategorySelection(false);
                          if (searchMode.type === 'municipality' && searchMode.selectedMunicipality) {
                            setShowMunicipalityList(true);
                          } else {
                            setShowLocationOptions(true);
                          }
                          alignViewport();
                        }}
                        className="group inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-200 font-semibold text-sm sm:text-base px-4 py-2.5 rounded-xl hover:bg-white/70 hover:scale-105"
                      >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('categorySelection.backToLocationStep', 'Back to Search Method')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {showMunicipalityList ? (
              /* Location Selection - User-Friendly Compact Design */
              <div className="backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto bg-white/92 border border-slate-200/90">
                
                {/* Compact Header */}
                <div className="text-center mb-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 flex items-center justify-center gap-2 text-slate-800">
                    📍 {t('restaurantFinder.chooseMunicipality', 'Choose Your Municipality')}
                  </h3>
                  <p className="text-gray-600 text-sm px-2">
                    {t('locationOptions.selectNeighborhoodFirst', 'Choose your neighborhood first, then pick a category.')}
                  </p>
                </div>

                {/* Search Box with Helper Text */}
                <div className="mb-6">
                  <div className="relative max-w-md mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={municipalitySearchQuery}
                      onChange={(e) => setMunicipalitySearchQuery(e.target.value)}
                      className="block w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm placeholder-gray-500 focus:outline-none transition-colors duration-200 border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
                      placeholder={t('municipalitySearch.placeholder', 'Search locations...')}
                    />
                    {municipalitySearchQuery && (
                      <button
                        onClick={() => setMunicipalitySearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title={t('municipalitySearch.clearSearch', 'Clear search')}
                        aria-label={t('municipalitySearch.clearSearch', 'Clear search')}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Helper Text */}
                  <div className="text-center mt-2">
                    {municipalitySearchQuery ? (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {t('municipalitySearch.resultsCount', 'Showing {{count}} of {{total}} locations', {
                          count: filteredMunicipalities.length,
                          total: getMunicipalitiesData().length
                        })}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        {t('municipalitySearch.typeOrBrowse', 'Type to search or browse below • {{count}} Athens areas', {
                          count: getMunicipalitiesData().length
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Municipalities List - Clean and Responsive */}
                <div className="space-y-4 mb-6">
                  {filteredMunicipalities.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">🔍</div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">
                        {t('municipalitySearch.noLocationsFoundTitle', 'No locations found')}
                      </h4>
                      <p className="text-gray-500 mb-4">
                        {t('municipalitySearch.noResults', 'No locations found matching your search.')}
                      </p>
                      <button
                        onClick={() => setMunicipalitySearchQuery('')}
                        className="px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 bg-slate-700 hover:bg-slate-800"
                      >
                        {t('municipalitySearch.clearSearchToSeeAll', 'Clear search to see all locations')}
                      </button>
                    </div>
                  ) : (
                    <>
                      {Object.entries(
                        filteredMunicipalities.reduce((acc: Record<string, Municipality[]>, municipality) => {
                          const region = municipality.region;
                          if (!acc[region]) acc[region] = [];
                          acc[region].push(municipality as Municipality);
                          return acc;
                        }, {})
                      ).map(([region, municipalities]) => (
                        <div key={region} className="rounded-lg p-4 shadow-sm border bg-slate-50/70 border-slate-200">
                          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                            {t(`regions.${region}`, region)}
                            <span className="text-xs text-gray-500 font-normal ml-auto">
                              {municipalities.length}{' '}
                              {municipalities.length === 1
                                ? t('municipalitySearch.areaSingular', 'area')
                                : t('municipalitySearch.areaPlural', 'areas')}
                            </span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {municipalities.map((municipality) => (
                              <button
                                key={municipality.name}
                                onClick={() => {
                                  selectMunicipalityForCategory(municipality);
                                  alignViewport();
                                }}
                                className="text-left p-3 rounded-lg border transition-all duration-200 group border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm leading-tight text-slate-800 group-hover:text-slate-900">
                                    {t(`municipalities.${municipality.name}`, municipality.name)}
                                  </span>
                                  <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-500">
                                    →
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="text-center pt-4 border-t border-slate-300/80">
                  <button
                    onClick={() => {
                      resetSearch();
                      alignViewport();
                    }}
                    className="inline-flex items-center gap-2 transition-colors duration-200 font-medium text-sm px-3 py-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  >
                    ← {t('mainHero.backToSearchOptions', 'Back to Search Options')}
                  </button>
                </div>
              </div>
            ) : showDestinationList ? (
              <div className="backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl max-w-5xl mx-auto bg-white/92 border border-slate-200/90">
                <div className="text-center mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                    🧭 {t('destinationSearch.title', 'Choose a Destination')}
                  </h3>
                  <p className="text-gray-600 text-sm px-2">
                    {t('destinationSearch.subtitle', 'Pick an island, city or region to open its curated Google Maps list.')}
                  </p>
                </div>

                <div className="mb-5 space-y-3">
                  <div className="relative max-w-md mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={destinationSearchQuery}
                      onChange={(e) => setDestinationSearchQuery(e.target.value)}
                      className="block w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm placeholder-gray-500 focus:outline-none transition-colors duration-200 border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
                      placeholder={t('destinationSearch.placeholder', 'Search destination...')}
                    />
                    {destinationSearchQuery && (
                      <button
                        onClick={() => setDestinationSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title={t('destinationSearch.clearSearch', 'Clear search')}
                        aria-label={t('destinationSearch.clearSearch', 'Clear search')}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {([
                      { id: 'all', label: t('destinationSearch.filterAll', 'All') },
                      { id: 'islands', label: t('destinationSearch.filterIslands', 'Islands') },
                      { id: 'mainland', label: t('destinationSearch.filterMainland', 'Mainland') },
                    ] as const).map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setDestinationViewFilter(option.id)}
                        className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-colors duration-200 ${destinationViewFilter === option.id ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-gray-500">
                      {t('destinationSearch.resultsCount', 'Showing {{count}} destinations', { count: filteredDestinations.length })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-stretch">
                  {filteredDestinations.map((destination) => {
                    const active = selectedDestination?.id === destination.id;
                    return (
                      <article
                        key={destination.id}
                        onClick={() => selectDestination(destination)}
                        className={`group text-left rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer h-[360px] sm:h-[382px] lg:h-[400px] flex flex-col ${active ? 'border-slate-500 bg-slate-100 shadow-md' : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 hover:shadow-md'}`}
                      >
                        <div className="relative h-40 sm:h-44 w-full overflow-hidden">
                          <img
                            src={destination.img}
                            alt={getDestinationLabel(destination)}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <span className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-white/90 border border-white text-gray-700 whitespace-nowrap">
                            {getDestinationTypeLabel(destination)}
                          </span>
                          <h4 className="absolute bottom-2 left-3 right-3 text-base sm:text-lg font-bold text-white leading-tight drop-shadow">
                            {getDestinationLabel(destination)}
                          </h4>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 min-h-[60px] sm:min-h-[64px]">
                            {getDestinationDescription(destination)}
                          </p>

                          <div className="mt-auto pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <a
                              href={destination.link}
                              target={destination.target || '_blank'}
                              rel={destination.rel || 'noopener noreferrer'}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white transition-colors duration-200 text-center whitespace-nowrap truncate bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black"
                            >
                              <span className="sm:hidden">🗺️ {t('destinationSearch.openCuratedMapShort', 'Map')}</span>
                              <span className="hidden sm:inline">🗺️ {t('destinationSearch.openCuratedMap', 'Open Curated Map')}</span>
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void shareDestinationMap(destination);
                              }}
                              className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-colors duration-200 whitespace-nowrap truncate bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
                            >
                              <span className="sm:hidden">🔗 {t('destinationSearch.shareMapShort', 'Share')}</span>
                              <span className="hidden sm:inline">🔗 {t('destinationSearch.shareMap', 'Share Map')}</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="text-center pt-4 border-t border-slate-300/80">
                  <button
                    onClick={() => {
                      resetSearch();
                      alignViewport();
                    }}
                    className="inline-flex items-center gap-2 transition-colors duration-200 font-medium text-sm px-3 py-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  >
                    ← {t('mainHero.backToSearchOptions', 'Back to Search Options')}
                  </button>
                </div>
              </div>
            ) : showLocationOptions ? (
              /* Location Options Selection - Enhanced UI */
              <div className="relative">
                {/* Background Glow Effect */}
                <div className="absolute -inset-4 rounded-3xl blur-3xl opacity-35 bg-gradient-to-r from-cyan-200/18 via-teal-200/16 to-blue-200/18" />
                
                <div className={`relative backdrop-blur-xl rounded-2xl xs:rounded-3xl sm:rounded-[2rem] bg-gradient-to-br from-white/97 via-cyan-50/28 to-white/94 border border-cyan-100/80 shadow-[0_12px_36px_rgba(8,145,178,0.06)] ${showLocationOptions ? 'p-4 xs:p-5 sm:p-6 lg:p-8' : 'p-6 xs:p-8 sm:p-10 lg:p-14'}`}>
                  {/* Header Section */}
                  <div className={`text-center relative ${showLocationOptions ? 'mb-2 xs:mb-3 lg:mb-4' : 'mb-8 xs:mb-10 lg:mb-14'}`}>
                    <div className="w-24 h-1 mx-auto mb-6 opacity-45 rounded-full bg-gradient-to-r from-transparent via-teal-400 to-transparent" />
                    <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-4 xs:mb-5 relative">
                      <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-teal-900 via-cyan-700 to-blue-700">
                        {t('locationOptions.chooseLocationMethod', 'Choose Location Method')}
                      </span>
                    </h2>
                    <p className="text-slate-700 text-sm xs:text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4 leading-relaxed font-light">
                      {t('locationOptions.selectLocationFirst', 'Start by choosing how to search, then select a category.')}
                    </p>
                  </div>

                  {/* Options Grid */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto ${showLocationOptions ? 'gap-5 xs:gap-6 sm:gap-7 lg:gap-8 mb-5 xs:mb-6' : 'gap-5 xs:gap-6 sm:gap-8 lg:gap-10 mb-6 xs:mb-8'}`}>
                    {/* Near You Option - Enhanced */}
                    <button
                      onClick={() => {
                        selectSearchMode('location');
                      }}
                      className="group relative overflow-hidden rounded-2xl xs:rounded-3xl transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] ring-1 ring-cyan-300/70 hover:ring-teal-500/70 shadow-sm shadow-cyan-100/40 hover:shadow-md hover:shadow-cyan-100/50"
                    >
                      {/* Animated gradient background */}
                      <div className="absolute inset-0 transition-all duration-500 bg-gradient-to-br from-cyan-50 via-white to-blue-50" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white via-cyan-50 to-blue-50" />

                      {/* Shine effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                      </div>
                      
                      {/* Content */}
                      <div className={`relative text-slate-900 ${showLocationOptions ? 'p-5 xs:p-6 sm:p-7 lg:p-8' : 'p-6 xs:p-8 sm:p-10 lg:p-12'}`}>
                        {/* Icon with badge */}
                        <div className="flex justify-center mb-4 xs:mb-5">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full blur-2xl scale-[1.25] group-hover:scale-[1.55] transition-transform duration-500 bg-gradient-to-r from-cyan-200/20 to-teal-200/16" />
                            <div className="relative rounded-full p-4 xs:p-5 sm:p-6 border-2 transition-all duration-300 group-hover:rotate-3 bg-white/92 border-cyan-150/90 shadow-sm">
                              <div className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl group-hover:scale-105 transition-transform duration-300 drop-shadow-none">
                                📍
                              </div>
                            </div>
                            {/* Pulse effect */}
                            <div className="absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-20 bg-cyan-200/20" />
                          </div>
                        </div>
                        
                        {/* Badge */}
                        <div className="flex justify-center mb-3">
                          <span className="px-3.5 py-1 backdrop-blur-sm rounded-full text-[11px] font-medium tracking-[0.16em] uppercase border bg-cyan-50/85 text-cyan-800 border-cyan-100/90 shadow-none">
                            {t('mainHero.fastestBadge', 'Quick')}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-[clamp(1rem,3vw,1.875rem)] font-black leading-tight whitespace-nowrap [word-break:normal] [overflow-wrap:normal] mb-2 xs:mb-3 tracking-[-0.04em]">
                          {t('locationOptions.nearYou', 'Near You')}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-slate-600 text-[clamp(0.875rem,1.45vw,1.125rem)] font-normal leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300 mb-4 xs:mb-5">
                          {t('locationOptions.nearYouDesc', 'Use your current location to find nearby places')}
                        </p>
                        
                        {/* Arrow indicator */}
                        <div className="flex justify-center">
                          <div className="flex items-center text-[clamp(0.8125rem,1.2vw,0.95rem)] font-medium group-hover:gap-4 transition-all duration-300 gap-2.5 px-3 py-2 rounded-full bg-white/65 border border-cyan-100/80 shadow-none text-cyan-900">
                            <span>{t('mainHero.useMyLocation', 'Use my location')}</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* By Region Option - Enhanced */}
                    <button
                      onClick={() => {
                        selectSearchMode('municipality');
                      }}
                      className="group relative overflow-hidden rounded-2xl xs:rounded-3xl transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] ring-1 ring-cyan-300/80 hover:ring-teal-500/80"
                    >
                      {/* Animated gradient background */}
                      <div className="absolute inset-0 transition-all duration-500 bg-gradient-to-br from-cyan-50 via-white to-blue-50" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white via-cyan-50 to-blue-50" />
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                      </div>
                      
                      {/* Content */}
                      <div className={`relative text-slate-900 ${showLocationOptions ? 'p-4 xs:p-5 sm:p-6 lg:p-7' : 'p-6 xs:p-8 sm:p-10 lg:p-12'}`}>
                        {/* Icon with badge */}
                        <div className="flex justify-center mb-4 xs:mb-5">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full blur-2xl scale-[1.25] group-hover:scale-[1.55] transition-transform duration-500 bg-gradient-to-r from-cyan-200/20 to-teal-200/16" />
                            <div className="relative rounded-full p-4 xs:p-5 sm:p-6 border-2 transition-all duration-300 group-hover:rotate-3 bg-white/92 border-cyan-150/90 shadow-sm">
                              <div className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl group-hover:scale-105 transition-transform duration-300 drop-shadow-none">
                                🗺️
                              </div>
                            </div>
                            {/* Pulse effect */}
                            <div className="absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-20 bg-cyan-200/20" />
                          </div>
                        </div>
                        
                        {/* Badge */}
                        <div className="flex justify-center mb-3">
                          <span className="px-3.5 py-1 backdrop-blur-sm rounded-full text-[11px] font-medium tracking-[0.16em] uppercase border bg-cyan-50/85 text-cyan-800 border-cyan-100/90 shadow-none">
                            {t('mainHero.mostAccurateBadge', 'Most Accurate')}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-[clamp(1rem,3vw,1.875rem)] font-black leading-tight whitespace-nowrap [word-break:normal] [overflow-wrap:normal] mb-2 xs:mb-3 tracking-[-0.04em]">
                          {t('locationOptions.byNeighborhood', 'Neighborhood')}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-slate-600 text-[clamp(0.875rem,1.45vw,1.125rem)] font-normal leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300 mb-4 xs:mb-5">
                          {t('locationOptions.byNeighborhoodDesc', 'Choose a specific neighborhood or municipality')}
                        </p>
                        
                        {/* Arrow indicator */}
                        <div className="flex justify-center">
                          <div className="flex items-center text-[clamp(0.8125rem,1.2vw,0.95rem)] font-medium group-hover:gap-4 transition-all duration-300 gap-2.5 px-3 py-2 rounded-full bg-white/65 border border-cyan-100/80 shadow-none text-cyan-900">
                            <span>{t('mainHero.browseAreas', 'Browse areas')}</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Destinations Option */}
                    <button
                      onClick={() => {
                        selectSearchMode('destination');
                      }}
                      className="group relative overflow-hidden rounded-2xl xs:rounded-3xl transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] ring-1 ring-cyan-300/80 hover:ring-teal-500/80"
                    >
                      <div className="absolute inset-0 transition-all duration-500 bg-gradient-to-br from-cyan-50 via-white to-blue-50" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white via-cyan-50 to-blue-50" />

                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                      </div>

                      <div className={`relative text-slate-900 ${showLocationOptions ? 'p-4 xs:p-5 sm:p-6 lg:p-7' : 'p-6 xs:p-8 sm:p-10 lg:p-12'}`}>
                        <div className="flex justify-center mb-5">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full blur-2xl scale-[1.25] group-hover:scale-[1.55] transition-transform duration-500 bg-gradient-to-r from-cyan-200/20 to-teal-200/16" />
                            <div className="relative rounded-full p-4 xs:p-5 sm:p-6 border-2 transition-all duration-300 group-hover:rotate-3 bg-white/92 border-cyan-150/90 shadow-sm">
                              <div className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl group-hover:scale-105 transition-transform duration-300 drop-shadow-none">
                                🧭
                              </div>
                            </div>
                            <div className="absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-20 bg-cyan-200/20" />
                          </div>
                        </div>

                        <div className="flex justify-center mb-3">
                          <span className="px-3.5 py-1 backdrop-blur-sm rounded-full text-[11px] font-medium tracking-[0.16em] uppercase border bg-cyan-50/85 text-cyan-800 border-cyan-100/90 shadow-none">
                            {t('mainHero.curatedBadge', 'Curated')}
                          </span>
                        </div>

                        <h3 className="text-[clamp(1rem,3vw,1.875rem)] font-black leading-tight whitespace-nowrap [word-break:normal] [overflow-wrap:normal] mb-2 xs:mb-3 tracking-[-0.04em]">
                          {t('locationOptions.destinations', 'Destinations')}
                        </h3>

                        <p className="text-slate-600 text-[clamp(0.875rem,1.45vw,1.125rem)] font-normal leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300 mb-4 xs:mb-5">
                          {t('locationOptions.destinationsDesc', 'Open curated maps for islands and major Greek destinations')}
                        </p>

                        <div className="flex justify-center">
                          <div className="flex items-center text-[clamp(0.8125rem,1.2vw,0.95rem)] font-medium group-hover:gap-4 transition-all duration-300 gap-2.5 px-3 py-2 rounded-full bg-white/65 border border-cyan-100/80 shadow-none text-cyan-900">
                            <span>{t('mainHero.exploreDestinations', 'Explore destinations')}</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                  <p className="text-slate-700 text-sm sm:text-base md:text-lg max-w-2xl mx-auto text-center font-medium">
                    {t('mainHero.tagline', 'Curated maps, local guides and vetted lists to help you explore Greece with confidence.')}
                  </p>

                </div>
              </div>
            ) : null}
            {showRestaurantFinder && (
              /* Restaurant Finder Results */
              <div id="results-section" className="bg-white/85 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/60 shadow-2xl max-w-6xl mx-auto">
                {loading && (
                  <div className="text-center py-4 xs:py-6 sm:py-8">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 border-b-2 border-sky-600 mb-2 xs:mb-3 sm:mb-4"></div>
                    <p className="text-gray-700 text-sm xs:text-base sm:text-lg px-4">
                      {selectedType === 'experience' && selectedExperienceType
                        ? t('restaurantFinder.loadingMessage', 'Discovering {{category}} near you...', {
                            category: selectedExperienceType.name.toLowerCase()
                          })
                        : selectedDisplayCategory
                        ? t('restaurantFinder.loadingMessage', 'Discovering {{category}} near you...', {
                            category: t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name).toLowerCase()
                          })
                        : t('restaurantFinder.loadingMessage', 'Discovering places near you...')}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="text-center py-6">
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6 sm:p-8">
                      <div className="text-5xl mb-4">🔍</div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                        {t('restaurantFinder.noResultsTitle', 'No Results Found')}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
                      
                      {searchMode.type === 'municipality' && searchMode.selectedMunicipality && (
                        <div className="bg-white rounded-xl p-4 mb-4 border border-orange-200">
                          <p className="text-sm text-gray-700 mb-3 font-medium">
                            💡 {t('restaurantFinder.tryThese', 'Try these options:')}
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">📏</span>
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                  {t('restaurantFinder.expandRadius', 'Expand Search Radius')}: <span className="text-blue-600">{searchRadius}km</span>
                                </label>
                                <input
                                  type="range"
                                  min="2"
                                  max="50"
                                  step="1"
                                  value={searchRadius}
                                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                                  className="w-full h-2 bg-gradient-to-r from-blue-200 to-blue-400 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                  aria-label={t('restaurantFinder.searchRadius', 'Search Radius')}
                                  title={`${t('restaurantFinder.searchRadius', 'Search Radius')}: ${searchRadius}km`}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>2km</span>
                                  <span className="font-semibold text-blue-600">{searchRadius}km</span>
                                  <span>50km</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🔢</span>
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                  {t('restaurantFinder.showMore', 'Show More Results')}: <span className="text-blue-600">{maxResults}</span>
                                </label>
                                <input
                                  type="range"
                                  min="5"
                                  max="30"
                                  step="5"
                                  value={maxResults}
                                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                                  className="w-full h-2 bg-gradient-to-r from-green-200 to-green-400 rounded-lg appearance-none cursor-pointer accent-green-600"
                                  aria-label={t('restaurantFinder.maxResults', 'Max Results')}
                                  title={`${t('restaurantFinder.maxResults', 'Max Results')}: ${maxResults}`}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>5</span>
                                  <span className="font-semibold text-green-600">{maxResults}</span>
                                  <span>30</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => searchByMunicipality(searchMode.selectedMunicipality!, searchMode.selectedCategory || selectedDisplayCategory)}
                            className="mt-4 w-full px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <span>🔄</span>
                            {t('restaurantFinder.searchAgain', 'Search Again')}
                          </button>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={backToCategoryStep}
                          className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          {t('restaurantFinder.chooseAnotherArea', 'Choose Another Area')}
                        </button>
                        {searchMode.type !== 'location' && (
                          <button
                            onClick={() => getUserLocation()}
                            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-colors duration-200"
                          >
                            📍 {t('restaurantFinder.useMyLocation', 'Use My Location')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentRestaurant && nearestRestaurants && nearestRestaurants.length > 0 && (
                  <div className="space-y-3 xs:space-y-4 sm:space-y-6">
                    
                    <div className="text-center mb-6 max-w-3xl mx-auto">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3">
                        {selectedType === 'experience' && selectedExperienceType ? (
                          <>
                            <span className="text-2xl mr-2">{selectedExperienceType.icon}</span>
                            {selectedExperienceType.name} {t('restaurantFinder.experiences', 'Experiences')}
                          </>
                        ) : selectedType === 'category' && selectedDisplayCategory ? (
                          <>
                            <span className="text-2xl mr-2">{selectedDisplayCategory.icon}</span>
                            {getSafeCategoryHeading(selectedDisplayCategory)}
                          </>
                        ) : searchMode.type === 'municipality' && selectedDisplayCategory ? (
                          <>
                            🎯 {selectedDisplayCategory ? t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name) : ''} {`${t('restaurantFinder.inArea', 'in')} ${searchMode.selectedMunicipality?.name ? t(`municipalities.${searchMode.selectedMunicipality.name}`, searchMode.selectedMunicipality.name) : ''}`}
                          </>
                        ) : selectedDisplayCategory ? (
                          <>
                            🎯 {selectedDisplayCategory ? t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name) : ''} {t('restaurantFinder.nearYou', 'Near You')}
                          </>
                        ) : (
                          <>{t('restaurantFinder.nearYou', 'Near You')}</>
                        )}
                      </h3>
                      <p className="text-gray-600 text-base sm:text-lg font-medium">
                        {selectedType === 'experience' && selectedExperienceType
                          ? `${t('restaurantFinder.found', 'Found')} ${nearestRestaurants.length} ${selectedExperienceType.name} ${t('restaurantFinder.places', 'places')}`
                          : selectedType === 'category' && selectedDisplayCategory
                          ? `${t('restaurantFinder.found', 'Found')} ${nearestRestaurants.length} ${getSafeCategoryForCount(selectedDisplayCategory)}`
                          : searchMode.type === 'municipality' && selectedDisplayCategory
                          ? `${t('restaurantFinder.foundCount', 'Found')} ${nearestRestaurants.length} ${selectedDisplayCategory ? t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name) : ''} ${t('restaurantFinder.placesNear', 'places near')} ${searchMode.selectedMunicipality?.name ? t(`municipalities.${searchMode.selectedMunicipality.name}`, searchMode.selectedMunicipality.name) : ''}`
                          : selectedDisplayCategory
                          ? `${t('restaurantFinder.showingClosest', 'Showing')} ${nearestRestaurants.length} ${t('restaurantFinder.closest', 'closest')} ${selectedDisplayCategory ? t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name) : ''} ${t('restaurantFinder.places', 'places')}`
                          : `${t('restaurantFinder.showingClosest', 'Showing')} ${nearestRestaurants.length} ${t('restaurantFinder.closest', 'closest')} ${t('restaurantFinder.places', 'places')}`
                        }
                      </p>
                      <p className="text-gray-500 text-sm sm:text-base mt-2">
                        {t('restaurantFinder.sortedByDistance', 'Results are sorted by distance from location selected')}
                      </p>
                      {searchMode.type === 'municipality' && (
                        <span className="inline-block mt-2 px-2 sm:px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs sm:text-sm font-medium">
                          📍 {searchMode.selectedMunicipality?.name ? t(`municipalities.${searchMode.selectedMunicipality.name}`, searchMode.selectedMunicipality.name) : ''}{searchMode.selectedMunicipality?.region ? `, ${t(`regions.${searchMode.selectedMunicipality.region}`, searchMode.selectedMunicipality.region)}` : ''}
                        </span>
                      )}
                      {searchMode.type === 'category' && searchMode.selectedCategory && (
                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-white to-sky-50 text-slate-700 border border-sky-100">
                          {t(`categories.descriptions.${searchMode.selectedCategory.id}`, searchMode.selectedCategory.description)}
                        </span>
                      )}
                    </div>

                    {/* Selection and Share Controls */}
                    {(nearestRestaurants && nearestRestaurants.length > 0) && (
                      <>
                        <div className="flex flex-col items-center gap-4 mb-6 p-4 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl border border-sky-200">
                          {/* Selection Info */}
                          <div className="text-center w-full">
                            <p className="text-sm sm:text-base font-semibold text-gray-700 mb-3">
                              {selectedRestaurants.size > 0 
                                ? `✓ ${selectedRestaurants.size} ${t('restaurantFinder.selected', 'selected')} ${selectedRestaurants.size < 10 ? `(${t('restaurantFinder.selectUpTo', 'select up to')} ${10 - selectedRestaurants.size} ${t('restaurantFinder.more', 'more')})` : ''}`
                                : `📍 ${t('restaurantFinder.selectUpTo10', 'Select up to 10 locations to share')}`}
                            </p>
                          </div>

                          {/* Selection Actions */}
                          <div className="flex items-center justify-center gap-3 flex-wrap">
                            <button
                              onClick={selectAllVisible}
                              disabled={selectedRestaurants.size >= 10}
                              className="px-4 py-2 text-sm sm:text-base font-semibold text-sky-700 bg-white hover:bg-sky-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-sky-200 hover:border-sky-300 shadow-sm"
                              title={t('restaurantFinder.selectFirst10', 'Select first 10')}
                            >
                              {nearestRestaurants.length >= 10 
                                ? t('restaurantFinder.selectUpTo10', 'Select up to 10')
                                : t('restaurantFinder.selectUpTo', `Select up to ${nearestRestaurants.length}`)}
                            </button>
                            
                            {selectedRestaurants.size > 0 && (
                              <>
                                <button
                                  onClick={clearSelection}
                                  className="px-4 py-2 text-sm sm:text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 shadow-sm"
                                >
                                  {t('restaurantFinder.clearSelection', 'Clear')}
                                </button>
                                
                                <button
                                  onClick={async () => {
                                    const selectedItems = Array.from(selectedRestaurants)
                                      .sort((a, b) => a - b)
                                      .map(index => nearestRestaurants[index])
                                      .filter((item): item is { restaurant: Restaurant; distance: number } => item !== undefined);
                                    
                                    const shareText = selectedItems
                                      .map((r, i) => `${i + 1}. ${r.restaurant.name}\n${r.restaurant.url}`)
                                      .join('\n\n');
                                    const fullText = `${t('restaurantFinder.shareTitle', 'Check out these places:')}\n\n${shareText}`;
                                    
                                    let copied = false;
                                    let shared = false;
                                    let message = '';
                                    let type = 'info';
                                    
                                    try {
                                      await navigator.clipboard.writeText(fullText);
                                      copied = true;
                                    } catch (e) {
                                      copied = false;
                                    }
                                    
                                    try {
                                      if (navigator.share) {
                                        await navigator.share({
                                          title: t('restaurantFinder.shareTitle', 'Check out these places!'),
                                          text: fullText
                                        });
                                        shared = true;
                                      }
                                    } catch (e) {
                                      shared = false;
                                    }
                                    
                                    if (copied && shared) {
                                      message = t('restaurantFinder.copiedAndShared', 'Selected locations copied and ready to share!');
                                      type = 'success';
                                    } else if (shared && !copied) {
                                      message = t('restaurantFinder.sharedButNotCopied', 'Shared successfully, but could not copy to clipboard.');
                                      type = 'warning';
                                    } else if (copied && !shared) {
                                      message = t('restaurantFinder.copiedToClipboard', 'Selected locations copied to clipboard!');
                                      type = 'success';
                                    } else {
                                      message = t('restaurantFinder.shareFailed', 'Unable to share or copy results. Please try again.');
                                      type = 'error';
                                    }
                                    
                                    setShareSnackbar({ open: true, message, type });
                                    setTimeout(() => {
                                      setShareSnackbar((prev) => ({ ...prev, open: false }));
                                    }, 5000);
                                  }}
                                  className="relative overflow-hidden group inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm sm:text-base bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white shadow-lg border border-sky-300/40 transition-all duration-300 hover:scale-105 active:scale-95"
                                  title={t('restaurantFinder.shareSelected', 'Share selected locations')}
                                >
                                  <span className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <span className="relative flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    {t('restaurantFinder.shareSelected', `Share (${selectedRestaurants.size})`)}
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Snackbar/Toast for share feedback */}
                        {shareSnackbar.open && (
                          <div
                            className={`fixed z-50 top-6 right-6 min-w-[220px] max-w-xs px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white transition-all duration-300
                              ${shareSnackbar.type === 'success' ? 'bg-green-600' : shareSnackbar.type === 'warning' ? 'bg-yellow-500' : shareSnackbar.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
                            role="status"
                            aria-live="polite"
                          >
                            {shareSnackbar.type === 'success' && <span className="text-xl">✅</span>}
                            {shareSnackbar.type === 'warning' && <span className="text-xl">⚠️</span>}
                            {shareSnackbar.type === 'error' && <span className="text-xl">❌</span>}
                            {shareSnackbar.type === 'info' && <span className="text-xl">ℹ️</span>}
                            <span className="flex-1 text-sm font-medium">{shareSnackbar.message}</span>
                            <button
                              onClick={() => setShareSnackbar({ ...shareSnackbar, open: false })}
                              className="ml-2 text-white/80 hover:text-white text-lg font-bold focus:outline-none"
                              aria-label={t('aria.closeNotification', 'Close notification')}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {/* Vertical Scrollable Restaurant Cards */}
                    <div className="relative max-w-4xl mx-auto">
                      <div className="rounded-2xl border border-sky-100/80 bg-white/80 backdrop-blur-sm shadow-lg">
                        <div className="max-h-[240vh] md:max-h-[1200px] overflow-y-auto px-3 sm:px-4 py-3 space-y-3 sm:space-y-4 custom-scrollbar">
                        {nearestRestaurants.map((restaurantData, index) => {
                          const vegetarianData = categoryDataCacheRef.current['vegetarian'] || [];
                          const luxuryDiningData = categoryDataCacheRef.current['luxury-dining'] || [];
                          const isVegan = vegetarianData.some((v) => v.name === restaurantData.restaurant.name && v.address === restaurantData.restaurant.address);
                          const isLuxury = luxuryDiningData.some((l) => l.name === restaurantData.restaurant.name && l.address === restaurantData.restaurant.address);
                          const isSelected = selectedRestaurants.has(index);
                          return (
                            <div
                              key={index}
                              className={`relative w-full bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/50 rounded-2xl p-4 sm:p-5 border transition-all duration-300 flex flex-col shadow-md hover:shadow-xl ${
                                isSelected
                                  ? 'border-emerald-500 ring-2 ring-emerald-200'
                                  : 'border-slate-200 hover:border-sky-300'
                              }`}
                            >
                              <div className="absolute inset-y-3 left-0 w-1.5 rounded-r-full bg-gradient-to-b from-sky-400 via-cyan-500 to-teal-500 opacity-70" />
                              <div className="flex items-start gap-4 pl-3">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-start gap-2">
                                    <h4 className="font-semibold text-slate-900 text-lg sm:text-xl flex items-start gap-2 line-clamp-2 leading-tight">
                                      🍽️ <span className="flex-1">{restaurantData.restaurant.name}</span>
                                    </h4>
                                  </div>
                                  <div>
                                    <p className="text-slate-600 text-sm sm:text-[15px] flex items-start gap-2 line-clamp-2 leading-snug">
                                      📍 <span className="flex-1">{restaurantData.restaurant.address}</span>
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <span className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm">
                                      📏 {formatDistance(restaurantData.distance)}
                                    </span>
                                    {isVegan && (
                                      <span title={t('restaurantFinder.badges.veganTitle', 'Vegan Friendly')} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold border border-emerald-200">🌿 {t('restaurantFinder.badges.veganLabel', 'Vegan')}</span>
                                    )}
                                    {isLuxury && (
                                      <span title={t('restaurantFinder.badges.luxuryTitle', 'Luxury/Pricey')} className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold border border-amber-200">✨ {t('restaurantFinder.badges.luxuryLabel', 'Luxury')}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleRestaurantSelection(index)}
                                      disabled={!isSelected && selectedRestaurants.size >= 10}
                                      className="w-5 h-5 rounded-md border-2 border-slate-400 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    />
                                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                                      {isSelected ? t('restaurantFinder.selected', 'Selected') : t('restaurantFinder.select', 'Select')}
                                    </span>
                                  </label>
                                </div>
                              </div>

                              <div className="mt-4">
                                <a
                                  href={restaurantData.restaurant.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-center text-base transform hover:scale-[1.01] active:scale-95"
                                >
                                  {t('restaurantFinder.viewOnMaps', 'View on Google Maps')}
                                </a>
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    </div>

                    <div className="text-center pt-6 mt-6 border-t-2 border-sky-100">
                      <button
                        onClick={backToCategoryStep}
                        className="inline-flex items-center gap-2 px-6 py-3 text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-all duration-200 font-semibold text-base border-2 border-slate-300 hover:border-sky-300 shadow-sm hover:shadow-md"
                      >
                        🔄 {t('restaurantFinder.searchAgain', 'Search Again')}
                      </button>
                    </div>

                    {/* Search Settings Panel */}
                    <div className="mt-6 p-4 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl border-2 border-sky-200 shadow-sm max-w-2xl mx-auto">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📏</span>
                          <h4 className="text-sm font-bold text-slate-800">
                            {t('restaurantFinder.adjustSearchSettings', 'Adjust Search Settings')}
                          </h4>
                        </div>
                        {nearestRestaurants.length > 0 && (
                          <span className="text-xs font-medium text-sky-700 bg-sky-100 px-2 py-1 rounded-full">
                            {nearestRestaurants.length} {t('restaurantFinder.found', 'found')}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-600 mb-3">
                        {t('restaurantFinder.currentSearchRadius', `Current search radius`)}: <span className="font-semibold text-sky-700">{searchRadius}km</span>
                      </p>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-semibold text-slate-700">
                              {t('restaurantFinder.searchRadius', 'Search Radius')}
                            </label>
                            <span className="text-sm font-bold text-sky-700">{searchRadius}km</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="50"
                            step="1"
                            value={searchRadius}
                            onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                            className="w-full h-2 bg-gradient-to-r from-sky-200 to-cyan-400 rounded-lg appearance-none cursor-pointer accent-sky-600"
                            aria-label={t('restaurantFinder.searchRadius', 'Search Radius')}
                            title={`${t('restaurantFinder.searchRadius', 'Search Radius')}: ${searchRadius}km`}
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>2km</span>
                            <span className="font-semibold text-sky-700">{searchRadius}km</span>
                            <span>50km</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => searchByMunicipality(searchMode.selectedMunicipality!, searchMode.selectedCategory || selectedDisplayCategory)}
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          {t('restaurantFinder.updateResults', 'Update Results')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

            {/* Enhanced Install App CTA with Modern Design */}
            {(isInstallable || process.env.NODE_ENV === 'development') && !isInstalled && (
              <div className="flex justify-center max-w-sm xs:max-w-md sm:max-w-lg mx-auto mt-6 xs:mt-8 sm:mt-10 lg:mt-14 px-4 xs:px-5">
                <div className="relative group w-full">
                  {/* Glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl sm:rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                  
                  <button
                    onClick={async () => {
                      try {
                        const installed = await installApp();
                        if (!installed && process.env.NODE_ENV === 'development') {
                          alert(t('pwa.devInstallPromptLong', 'PWA Install Button Test: In production, this would trigger the install prompt. The PWA must be served over HTTPS with a valid manifest for the install prompt to appear.'));
                        }
                      } catch (error) {
                        logDevWarning('Failed to install app:', error);
                      }
                    }}
                    className="relative w-full overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border-2 border-emerald-400/40 px-4 py-3 xs:px-5 xs:py-4 sm:px-7 sm:py-5 lg:px-9 lg:py-6 rounded-xl sm:rounded-2xl lg:rounded-3xl font-bold text-sm xs:text-base sm:text-lg lg:text-xl transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-2xl"
                  >
                    {/* Animated background overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    {/* Button content */}
                    <div className="relative flex items-center justify-center gap-2 xs:gap-3 sm:gap-4">
                      {/* Install icon with animation */}
                      <div className="group-hover:scale-110 transition-transform duration-300">
                        <svg 
                          className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 drop-shadow-lg" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      
                      {/* Main text */}
                      <span className="font-black tracking-wide drop-shadow-lg">
                        {t('pwa.install', 'Install App')}
                      </span>
                      
                      {/* Benefits badge */}
                      <div className="hidden sm:flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                        <span className="text-xs lg:text-sm font-bold">
                          {t('pwa.benefit1', 'Works offline')}
                        </span>
                      </div>
                      
                      {/* Mobile benefits icon */}
                      <div className="sm:hidden flex items-center justify-center w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                        <span className="text-xs">📱</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {featureFlags.storeEnabled && (
              <div className="flex justify-center max-w-md mx-auto mt-10 sm:mt-16 px-4">
                <div className="relative group w-full">
                  {/* Subtle glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-sky-300/25 via-cyan-300/25 to-blue-300/25 rounded-2xl sm:rounded-3xl blur opacity-30 group-hover:opacity-70 transition duration-500" />

                  <a
                    href={mainHero.secondaryAction.href}
                    className="relative group overflow-hidden bg-white/80 backdrop-blur-md text-slate-800 border-2 border-white/70 px-7 sm:px-9 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl hover:bg-white hover:border-sky-200 transition-all duration-500 hover:scale-[1.02] w-full block text-center shadow-xl"
                  >
                    {/* Animated background overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-100/50 via-cyan-100/50 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <span className="relative font-black tracking-wide text-sky-800">
                      {t('mainHero.secondaryAction.text')}
                    </span>
                  </a>
                </div>
              </div>
            )}

            {/* Elegant scroll indicator */}
            {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
              <div className="flex flex-col items-center space-y-1">
                <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
                </div>
                <span className="text-xs uppercase tracking-wide">{t('mainHero.scrollHint', 'Scroll')}</span>
              </div>
            </div> */}
          </div>
        </section>
      </main>
    </>
  );
};

export default MainHero;
