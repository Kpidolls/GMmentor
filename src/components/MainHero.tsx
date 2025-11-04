'use client';


// Helper function to align viewport for all steps before results
const alignViewport = () => {
  setTimeout(() => {
    const isMobile = window.innerWidth < 768;
    const scrollTarget = isMobile ? 150 : 300;
    window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
  }, 100);
};

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../config/index.json';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import restaurantsData from '../data/greekRestaurants.json';
import municipalitiesData from '../data/municipalities.json';
import categoriesData from '../data/restaurantCategories.json';

// PWA Components
import InstallBanner from './InstallBanner';
import OfflineNotice from './OfflineNotice';
import { usePWA } from '../hooks/usePWA';

// Import all category-specific restaurant data
import dessertsData from '../data/dessertsRestaurants.json';
import coffeeBrunchData from '../data/coffeeBrunchRestaurants.json';
import italianData from '../data/italianRestaurants.json';
import cheapEatsData from '../data/cheapEatsRestaurants.json';
import asianData from '../data/asianRestaurants.json';
import fishTavernasData from '../data/fishTavernasRestaurants.json';
import burgersData from '../data/burgersRestaurants.json';
import luxuryDiningData from '../data/luxuryDiningRestaurants.json';
import rooftopLoungesData from '../data/rooftopLoungesRestaurants.json';
import vegetarianData from '../data/vegetarianRestaurants.json';
import gyrosSouvlakiData from '../data/gyrosSouvlakiRestaurants.json';
import mexicanData from '../data/mexicanRestaurants.json';
import familyFriendlyData from '../data/familyFriendly.json';
import wineriesVineyardsData from '../data/wineriesVineyards.json';
import monasteriesChurchesData from '../data/monasteriesChurches.json';
import mustSeeAttractionsData from '../data/mustSeeAttractions.json';

const MyTicker = dynamic(() => import('../components/Ticker'), { ssr: false });

interface Restaurant {
  name: string;
  url: string;
  address: string;
  lat: number;
  lng: number;
}

interface Municipality {
  name: string;
  lat: number;
  lng: number;
  region: string;
}

interface RestaurantCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  keywords: string[];
}

interface SearchMode {
  type: 'location' | 'municipality' | 'category';
  selectedMunicipality?: Municipality;
  selectedCategory?: RestaurantCategory;
  selectedExperienceType?: ExperienceType;
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
  // Snackbar state for share feedback (fix ReferenceError)
  const [shareSnackbar, setShareSnackbar] = useState({ open: false, message: '', type: 'info' });
  const { mainHero } = config;
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  
  // PWA Hook
  const { isOnline, isStandalone, dataPreloadStatus, isInstallable, isInstalled, installApp } = usePWA();
  
  // Helper function to get restaurant data by category
  const getRestaurantDataByCategory = (category?: RestaurantCategory): Restaurant[] => {
    // PWA Enhancement: Try to get data from cache first when offline
    if (typeof window !== 'undefined' && !navigator.onLine && isStandalone) {
      const categoryId = category?.id || 'greek-restaurants';
      const cachedData = localStorage.getItem(`restaurant_data_${categoryId}`);
      if (cachedData) {
        try {
          return normalizeRestaurantData(JSON.parse(cachedData));
        } catch (e) {
          console.error('Failed to parse cached restaurant data:', e);
        }
      }
    }
    
    if (!category) return normalizeRestaurantData(restaurantsData);
    
    switch (category.id) {
      case 'greek-restaurants': return normalizeRestaurantData(restaurantsData);
      case 'desserts': return normalizeRestaurantData(dessertsData);
      case 'coffee-brunch': return normalizeRestaurantData(coffeeBrunchData);
      case 'italian': return normalizeRestaurantData(italianData);
      case 'cheap-eats': return normalizeRestaurantData(cheapEatsData);
      case 'asian': return normalizeRestaurantData(asianData);
      case 'fish-tavernas': return normalizeRestaurantData(fishTavernasData);
      case 'burgers': return normalizeRestaurantData(burgersData);
      case 'luxury-dining': return normalizeRestaurantData(luxuryDiningData);
      case 'rooftop-lounges': return normalizeRestaurantData(rooftopLoungesData);
      case 'vegetarian': return normalizeRestaurantData(vegetarianData);
      case 'gyros-souvlaki': return normalizeRestaurantData(gyrosSouvlakiData);
      case 'mexican': return normalizeRestaurantData(mexicanData);
      case 'attractions': return normalizeRestaurantData(mustSeeAttractionsData);
      case 'family-friendly': return normalizeRestaurantData(familyFriendlyData);
      case 'wineries-vineyards': return normalizeRestaurantData(wineriesVineyardsData);
      case 'monasteries-churches': return normalizeRestaurantData(monasteriesChurchesData);
      default: return normalizeRestaurantData(restaurantsData);
    }
  };

  // Helper function to normalize restaurant data and ensure lat/lng are numbers
  const normalizeRestaurantData = (data: any[]): Restaurant[] => {
    return data.map((restaurant: any) => ({
      ...restaurant,
      lat: typeof restaurant.lat === 'string' ? parseFloat(restaurant.lat) : restaurant.lat,
      lng: typeof restaurant.lng === 'string' ? parseFloat(restaurant.lng) : restaurant.lng,
    }));
  };

  // Helper function to get data by experience type
  const getDataByExperienceType = (experienceType: ExperienceType): Restaurant[] => {
    // Prefer explicit categories defined on the experienceType
    if (Array.isArray(experienceType.categories) && experienceType.categories.length > 0) {
      const primary = experienceType.categories[0] as RestaurantCategory | undefined;
      if (primary) return getRestaurantDataByCategory(primary);
    }

    // Support both short and long ids: 'wineries' | 'wineries-vineyards', 'monasteries' | 'monasteries-churches'
    const id = experienceType.id || '';
    if (id.includes('family')) return normalizeRestaurantData(familyFriendlyData);
    if (id.includes('wineries')) return normalizeRestaurantData(wineriesVineyardsData);
    if (id.includes('monasteries')) return normalizeRestaurantData(monasteriesChurchesData);
    if (id.includes('attractions')) return normalizeRestaurantData(mustSeeAttractionsData);

    // Fallback
    return normalizeRestaurantData(familyFriendlyData);
  };

  // Define experience types for different categories of attractions
  const experienceTypes: ExperienceType[] = [
    {
      id: 'family-friendly',
      name: t('experiences.family-friendly.name', 'Family Friendly Locations'),
      description: t('experiences.family-friendly.description', 'Places welcoming families with kids - play areas, family menus, and stroller access'),
      icon: '👨‍👩‍👧‍👦',
      color: 'from-emerald-400 to-teal-500',
      categories: [categoriesData.find((c: RestaurantCategory) => c.id === 'family-friendly') || { id: 'family-friendly', name: 'Family Friendly Locations', description: 'Family-friendly places', icon: '👨‍👩‍👧‍👦', color: 'from-emerald-400 to-teal-500', keywords: ['family', 'kids', 'child-friendly'] }]
    },
    {
      id: 'attractions',
      name: t('experiences.attractions.name', 'Must-See Attractions'),
      description: t('experiences.attractions.description', 'Explore iconic landmarks and cultural sites'),
      icon: '🏛️',
      color: 'from-blue-500 to-indigo-600',
      categories: [categoriesData.find((c: RestaurantCategory) => c.id === 'attractions') || { id: 'attractions', name: 'Must-See Attractions', description: 'Explore iconic landmarks and cultural sites', icon: '🏛️', color: 'from-blue-500 to-indigo-600', keywords: [] }]
    },
    {
      id: 'monasteries-churches',
      name: t('experiences.monasteries-churches.name', 'Monasteries & Spiritual Sites'),
      description: t('experiences.monasteries-churches.description', 'Visit sacred places and spiritual retreats'),
      icon: '⛪',
      color: 'from-emerald-500 to-teal-600',
      categories: [categoriesData.find((c: RestaurantCategory) => c.id === 'monasteries-churches') || { id: 'monasteries-churches', name: 'Monasteries & Churches', description: 'Sacred and spiritual places', icon: '⛪', color: 'from-emerald-500 to-teal-600', keywords: ['monastery', 'church', 'spiritual'] }]
    },
    {
      id: 'wineries-vineyards',
      name: t('experiences.wineries-vineyards.name', 'Wineries & Vineyards'),
      description: t('experiences.wineries-vineyards.description', 'Taste exceptional Greek wines and visit vineyards'),
      icon: '🍷',
      color: 'from-purple-500 to-pink-600',
      categories: [categoriesData.find((c: RestaurantCategory) => c.id === 'wineries-vineyards') || { id: 'wineries-vineyards', name: 'Wineries & Vineyards', description: 'Wine tasting and vineyard tours', icon: '🍷', color: 'from-purple-500 to-pink-600', keywords: ['wine', 'vineyard', 'tasting'] }]
    }
  ];

  // Get default category (Greek) - provide fallback (avoid redundant "Restaurants" suffix)
  const defaultCategory: RestaurantCategory = categoriesData.find(cat => cat.id === 'greek-restaurants') || {
    id: 'greek-restaurants',
    // keep the translation key but change the English fallback to a concise label
    name: t('categories.greekRestaurants', 'Greek'),
    description: t('categories.greekDescription', 'Authentic traditional Greek cuisine'),
    icon: '🇬🇷',
    color: 'from-blue-500 to-indigo-600',
    keywords: ['greek', 'traditional', 'authentic', 'taverna', 'mediterranean', 'hellenic']
  };

  // Default experience type (Family Friendly) - with fallback
  const defaultExperienceType = experienceTypes[0] || {
    id: 'family-friendly',
    name: 'Family Friendly Locations',
    description: 'Places welcoming families with kids - play areas, family menus, and stroller access',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-emerald-400 to-teal-500',
    categories: [{ id: 'family-friendly', name: 'Family Friendly Locations', description: 'Family-friendly places', icon: '👨‍👩‍👧‍👦', color: 'from-emerald-400 to-teal-500', keywords: ['family', 'kids', 'child-friendly'] }]
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
  // Removed unused showCategoryList and showExperienceTypeList
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [municipalitySearchQuery, setMunicipalitySearchQuery] = useState('');

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
  const findNearestPlaces = (userLat: number, userLng: number, count: number = 10) => {
    let sourceData: Restaurant[] = [];
    if (selectedType === 'experience' && selectedExperienceType) {
      sourceData = getDataByExperienceType(selectedExperienceType);
    } else if (selectedType === 'category' && selectedDisplayCategory) {
      sourceData = getRestaurantDataByCategory(selectedDisplayCategory);
    }
    const placesWithDistance = sourceData.map((place) => ({
      restaurant: place,
      distance: calculateDistance(userLat, userLng, place.lat, place.lng)
    }));
    return placesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  };

  const getUserLocation = () => {
    setLoading(true);
    setError(null);
    setShowRestaurantFinder(true);
    setSearchMode({ type: 'location' });
    // Keep the currently selected display category instead of resetting to default

    // PWA Enhancement: Check if offline and use cached data if available
    if (!isOnline) {
      const cachedLocation = localStorage.getItem('lastKnownLocation');
      if (cachedLocation && dataPreloadStatus === 'completed') {
        try {
          const { lat, lng } = JSON.parse(cachedLocation);
          setUserLocation({ lat, lng });
        const nearest = findNearestPlaces(lat, lng, 10);
          setNearestRestaurants(nearest);
          setCurrentIndex(0);
          setLoading(false);
          setError(t('pwa.usingCachedLocation', 'Using your last known location. Results may not be current.'));
          return;
        } catch (e) {
          console.error('Failed to parse cached location:', e);
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
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Use the currently selected experience type for location search
        const nearest = findNearestPlaces(latitude, longitude, 10);
          setNearestRestaurants(nearest);
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
        (geolocationError) => {
          // PWA Enhancement: Try to use cached location if available
          if (isStandalone) {
            const cachedLocation = localStorage.getItem('lastKnownLocation');
            if (cachedLocation) {
              try {
                const { lat, lng } = JSON.parse(cachedLocation);
                setUserLocation({ lat, lng });
                const nearest = findNearestPlaces(lat, lng, 10);
                setNearestRestaurants(nearest);
                setCurrentIndex(0);
                setLoading(false);
                setError(t('pwa.usingCachedLocation', 'Using your last known location. Results may not be current.'));
                return;
              } catch (e) {
                console.error('Failed to parse cached location:', e);
              }
            }
          }
          
          console.error('Geolocation error:', geolocationError);
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

  const searchByMunicipality = (municipality: Municipality) => {
    setLoading(true);
    setError(null);
    setShowRestaurantFinder(true);
    setShowMunicipalityList(false);
    setSearchMode({ type: 'municipality', selectedMunicipality: municipality });
    // Keep the currently selected display category instead of resetting to default

    // Responsive scroll based on screen size
    setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      const scrollTarget = isMobile ? 150 : 300;
      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }, 100);

  const nearest = findNearestPlaces(municipality.lat, municipality.lng, 10);
    setNearestRestaurants(nearest);
    setCurrentIndex(0);
    setLoading(false);
    
    // Skip additional scroll on mobile to avoid over-scrolling
    setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    }, 200);
  };

  // Removed unused selectCategory

  // Removed unused showMunicipalitySelection

  // Removed unused showCategorySelection

  // Removed unused handleLocationOptions

  const resetSearch = () => {
    setUserLocation(null);
    setNearestRestaurants(null);
    setCurrentIndex(0);
    setError(null);
    setShowRestaurantFinder(false);
    setShowMunicipalityList(false);
    setShowLocationOptions(false);
    setSearchMode({ type: 'location' });
    // Keep the currently selected category and experience type instead of resetting to default
    setMunicipalitySearchQuery(''); // Clear municipality search
    
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
    setSearchMode({ type: 'location' });
  setSelectedDisplayCategory(defaultCategory); // Reset to default Greek
    setSelectedExperienceType(defaultExperienceType); // Reset to default Dining experience
    setMunicipalitySearchQuery(''); // Clear municipality search
    
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

  const nextRestaurant = () => {
    if (nearestRestaurants && currentIndex < nearestRestaurants.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousRestaurant = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
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

  // PWA Enhancement: Get municipalities with offline fallback
  const getMunicipalitiesData = (): Municipality[] => {
    if (typeof window !== 'undefined' && !navigator.onLine && isStandalone) {
      const cachedData = localStorage.getItem('municipalities_data');
      if (cachedData) {
        try {
          return JSON.parse(cachedData);
        } catch (e) {
          console.error('Failed to parse cached municipalities data:', e);
        }
      }
    }
    return municipalitiesData;
  };

  // Filter municipalities based on enhanced search query
  const filteredMunicipalities = getMunicipalitiesData().filter((municipality: Municipality) => {
    if (!municipalitySearchQuery.trim()) return true;
    
    const query = municipalitySearchQuery.trim();
    
    // Check municipality name (Greek)
    if (searchMatches(query, municipality.name)) return true;
    
    // Check translated municipality name (English)
    const translatedName = t(`municipalities.${municipality.name}`, municipality.name);
    if (searchMatches(query, translatedName)) return true;
    
    // Check region name (Greek)
    if (searchMatches(query, municipality.region)) return true;
    
    // Check translated region name (English)
    const translatedRegion = t(`regions.${municipality.region}`, municipality.region);
    if (searchMatches(query, translatedRegion)) return true;
    
    return false;
  });

  // PWA Share function (ready for implementation)
  /*
  const handleShare = async (restaurant?: Restaurant) => {
    if (!canShare) return;

    const shareData = restaurant ? {
      title: `${restaurant.name} - Googlementor`,
      text: `Check out ${restaurant.name} in Athens! Found on Googlementor.`,
      url: `${window.location.origin}/?restaurant=${encodeURIComponent(restaurant.name)}`
    } : {
      title: 'Googlementor - Discover Authentic Greece',
      text: 'Explore Greece like a local with curated travel maps and authentic restaurant guides.',
      url: window.location.href
    };

    const success = await shareContent(shareData);
    if (!success) {
      // Fallback to clipboard if share fails
      try {
        await navigator.clipboard.writeText(shareData.url || window.location.href);
        // You could show a toast notification here
      } catch (e) {
        console.error('Share failed:', e);
      }
    }
  };
  */

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

      {/* PWA Components */}
      <OfflineNotice position="top" />
      <InstallBanner position="bottom" showAfterDelay={4000} />
      


      <main className="relative min-h-screen w-full flex items-center justify-center">
        {/* Professional Background with Enhanced Visual Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000" />
            <div className="absolute bottom-10 left-40 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000" />
          </div>
          
          <Image
            src="/assets/images/cover.webp"
            alt={t('mainHero.coverAlt', 'Panoramic view of Athens skyline with the Acropolis in the background — travel and dining guide hero image')}
            fill
            priority
            quality={90}
            placeholder="empty"
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              transform: `translateY(${scrollY * 0.2}px)`,
              opacity: 0.15,
            }}
          />
          
          {/* Enhanced gradient overlay with better depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-indigo-900/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50" />
        </div>



        {/* Enhanced Location Badge with Animation */}
        <div className="absolute top-4 right-4 z-40 xs:top-6 xs:right-6 md:top-6 md:right-8 lg:top-8 lg:right-8">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300" />
            
            <span className="relative inline-flex items-center px-3 py-2 xs:px-4 xs:py-2 bg-white/15 backdrop-blur-md text-white font-semibold rounded-full text-xs xs:text-sm gap-2 hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/30 shadow-lg">
              <span className="text-sm xs:text-base animate-pulse">🇬🇷</span>
              <span className="hidden xs:inline font-medium tracking-wide">{t('mainHero.athens', 'Athens')}</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </span>
          </div>
        </div>
        
        {/* Ticker */}
        <div className="absolute top-0 left-0 w-full z-30">
          <MyTicker />
        </div>



        {/* Professional Hero Content */}
        <section className="relative z-20 px-3 xs:px-4 sm:px-6 lg:px-8 py-12 xs:py-16 sm:py-20 lg:py-32 max-w-7xl w-full mx-auto min-h-screen flex flex-col justify-center">
          <div className="text-center space-y-6 xs:space-y-8 sm:space-y-10 lg:space-y-12 w-full">
            {/* Enhanced Title with Modern Typography */}
            <header className="space-y-4 xs:space-y-5 sm:space-y-7 relative">
              {/* Decorative elements */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full opacity-60" />
              
              <button 
                onClick={fullReset}
                className="font-bold tracking-tight text-white hover:scale-[1.02] transition-all duration-500 cursor-pointer group relative"
                title={t('mainHero.clickToReturnToMain', 'Click to return to main page')}
              >
                {/* Glow effect behind title */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <span className="block text-sm xs:text-base sm:text-lg lg:text-xl xl:text-2xl text-blue-300 font-semibold mb-3 xs:mb-4 sm:mb-5 tracking-[0.2em] uppercase group-hover:text-blue-200 transition-all duration-500 relative">
                    <span className="relative z-10">{t('mainHero.subtitle')}</span>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </span>
                  
                  <span className="block text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent leading-[0.9] px-1 group-hover:from-blue-100 group-hover:via-white group-hover:to-blue-100 transition-all duration-500 drop-shadow-2xl">
                    {t('mainHero.title')}
                  </span>
                </div>
              </button>
              
              {/* Decorative dots */}
              <div className="flex justify-center space-x-2 mt-6">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-300" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse animation-delay-600" />
              </div>
            </header>

            {/* Professional Discovery Interface */}
            <div className="max-w-5xl mx-auto px-1 xs:px-2 sm:px-4 w-full">
              {!showLocationOptions && !showRestaurantFinder && !showMunicipalityList && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative bg-white/12 backdrop-blur-2xl rounded-2xl xs:rounded-3xl sm:rounded-[2rem] p-4 xs:p-6 sm:p-8 lg:p-12 border border-white/25 shadow-2xl">
                    <div className="text-center mb-8 xs:mb-10 lg:mb-12 relative">
                      <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mb-6 opacity-60" />
                      <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 xs:mb-5 sm:mb-6 relative">
                        <span className="relative z-10">{t('discovery.chooseCategory', 'Choose a Category or Experience')}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-lg scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </h2>
                      <p className="text-slate-200 text-sm xs:text-base sm:text-lg lg:text-xl max-w-3xl mx-auto px-4 leading-relaxed font-light mb-6">
                        {t('discovery.selectCategoryFirst')}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-6 sm:mb-8">
                      {/* Show all cuisines and activities in a single grid */}
                      {categoriesData.map((category) => (
                        <button
                          key={'category-' + category.id}
                          onClick={() => {
                            setSelectedDisplayCategory(category);
                            setSelectedExperienceType(undefined);
                            setSelectedType('category');
                            setShowLocationOptions(true);
                            alignViewport();
                          }}
                          className={`group relative overflow-hidden bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl${selectedDisplayCategory?.id === category.id && selectedType === 'category' ? ' border-blue-500 bg-blue-100/10' : ''}`}
                        >
                          <div className="relative text-center space-y-2 xs:space-y-3 sm:space-y-4">
                            <div className="text-3xl xs:text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                              {category.icon}
                            </div>
                            <h4 className="text-white font-bold text-sm sm:text-base lg:text-lg leading-tight">
                              {t(`categories.${category.id}`, category.name)}
                            </h4>
                            <p className="text-slate-300 text-xs sm:text-sm leading-tight">
                              {t(`categories.descriptions.${category.id}`, category.description)}
                            </p>
                          </div>
                        </button>
                      ))}
                      {experienceTypes
                        .filter((et) => !categoriesData.some((c: RestaurantCategory) => c.id === et.id))
                        .map((experienceType) => (
                        <button
                          key={'experience-' + experienceType.id}
                          onClick={() => {
                            setSelectedExperienceType(experienceType);
                            setSelectedDisplayCategory(undefined);
                            setSelectedType('experience');
                            setShowLocationOptions(true);
                            alignViewport();
                          }}
                          className={`group relative overflow-hidden bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl${selectedExperienceType?.id === experienceType.id && selectedType === 'experience' ? ' border-blue-500 bg-blue-100/10' : ''}`}
                        >
                          <div className="relative text-center space-y-2 xs:space-y-3 sm:space-y-4">
                            <div className="text-3xl xs:text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                              {experienceType.icon}
                            </div>
                            <h4 className="text-white font-bold text-sm sm:text-base lg:text-lg leading-tight">
                              {experienceType.name}
                            </h4>
                            <p className="text-slate-300 text-xs sm:text-sm leading-tight">
                              {experienceType.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {showMunicipalityList ? (
              /* Location Selection - User-Friendly Compact Design */
              <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-2xl max-w-4xl mx-auto">
                
                {/* Compact Header */}
                <div className="text-center mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                    📍 Choose Your Area
                  </h3>
                  <p className="text-gray-600 text-sm px-2">
                    {selectedDisplayCategory
                      ? t('mainHero.choosePreferredArea', 'Choose your preferred area to discover amazing {{category}} nearby', { category: t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name).toLowerCase() })
                      : t('mainHero.choosePreferredArea', 'Choose your preferred area to discover amazing category nearby', { category: '' })}
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
                      className="block w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
                        Type to search or browse below • {getMunicipalitiesData().length} Athens areas
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
                        No locations found
                      </h4>
                      <p className="text-gray-500 mb-4">
                        {t('municipalitySearch.noResults', 'No locations found matching your search.')}
                      </p>
                      <button
                        onClick={() => setMunicipalitySearchQuery('')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
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
                        <div key={region} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {t(`regions.${region}`, region)}
                            <span className="text-xs text-gray-500 font-normal ml-auto">
                              {municipalities.length} {municipalities.length === 1 ? 'area' : 'areas'}
                            </span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {municipalities.map((municipality) => (
                              <button
                                key={municipality.name}
                                onClick={() => {
                                  searchByMunicipality(municipality);
                                  alignViewport();
                                }}
                                className="text-left p-3 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-all duration-200 group"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-800 group-hover:text-blue-600 text-sm leading-tight">
                                    {t(`municipalities.${municipality.name}`, municipality.name)}
                                  </span>
                                  <span className="text-blue-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                <div className="text-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      resetSearch();
                      alignViewport();
                    }}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    ← {t('mainHero.backToSearchOptions', 'Back to Search Options')}
                  </button>
                </div>
              </div>
            ) : showLocationOptions ? (
              /* Location Options Selection */
              <div className="bg-white/10 backdrop-blur-xl rounded-xl xs:rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl">
                <div className="text-center mb-6 xs:mb-8 lg:mb-10">
                  <h3 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 xs:mb-3 sm:mb-4">
                    {t('locationOptions.chooseLocationMethod', 'Choose Location Method')}
                  </h3>
                  <p className="text-slate-300 text-sm xs:text-base sm:text-lg px-2">
                    {selectedExperienceType
                      ? t('locationOptions.selectLocationOption', 'Select how you would like to search for {{experience}}', { experience: selectedExperienceType.name?.toLowerCase?.() || '' })
                      : t('locationOptions.selectLocationOption', 'Select how you would like to search for an experience', { experience: '' })}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 mb-4 xs:mb-6 sm:mb-8">
                  {/* Near You Option */}
                  <button
                    onClick={() => {
                      setShowLocationOptions(false);
                      setShowRestaurantFinder(true);
                      setSearchMode({
                        type: 'location',
                        selectedCategory: selectedDisplayCategory,
                        selectedExperienceType: selectedExperienceType
                      });
                      getUserLocation();
                      alignViewport();
                    }}
                    className="group relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white p-5 xs:p-6 sm:p-8 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl transform-gpu"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative text-center space-y-3 xs:space-y-4">
                      <div className="text-3xl xs:text-4xl sm:text-5xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">📍</div>
                      <h4 className="text-lg xs:text-xl sm:text-2xl font-bold leading-tight">
                        {t('locationOptions.nearYou', 'Near You')}
                      </h4>
                      <p className="text-blue-100 text-xs xs:text-sm sm:text-base font-medium leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                        {t('locationOptions.nearYouDesc', 'Use your current location to find nearby places')}
                      </p>
                    </div>
                  </button>

                  {/* By Region Option */}
                  <button
                    onClick={() => {
                      setShowLocationOptions(false);
                      setShowMunicipalityList(true);
                      setSearchMode({
                        type: 'municipality',
                        selectedCategory: selectedDisplayCategory,
                        selectedExperienceType: selectedExperienceType
                      });
                      alignViewport();
                    }}
                    className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white p-5 xs:p-6 sm:p-8 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl transform-gpu"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative text-center space-y-3 xs:space-y-4">
                      <div className="text-3xl xs:text-4xl sm:text-5xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">🗺️</div>
                      <h4 className="text-lg xs:text-xl sm:text-2xl font-bold leading-tight">
                        {t('locationOptions.byRegion', 'By Region')}
                      </h4>
                      <p className="text-emerald-100 text-xs xs:text-sm sm:text-base font-medium leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                        {t('locationOptions.byRegionDesc', 'Choose a specific region or municipality')}
                      </p>
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className="text-center pt-4 border-t border-white/20">
                  <button
                    onClick={() => {
                      resetSearch();
                      alignViewport();
                    }}
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    ← {t('mainHero.backToSearchOptions', 'Back to Search Options')}
                  </button>
                </div>
              </div>
            ) : null}
            {showRestaurantFinder && (
              /* Restaurant Finder Results */
              <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-white/30 shadow-2xl max-w-4xl mx-auto">
                {loading && (
                  <div className="text-center py-4 xs:py-6 sm:py-8">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 border-b-2 border-[#0878fe] mb-2 xs:mb-3 sm:mb-4"></div>
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
                  <div className="text-center py-3 xs:py-4 sm:py-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 xs:p-4 sm:p-6 mb-2 xs:mb-3 sm:mb-4">
                      <p className="text-red-600 mb-2 sm:mb-3 text-sm sm:text-base">{error}</p>
                      <button
                        onClick={getUserLocation}
                        className="text-[#0878fe] font-medium hover:underline text-sm sm:text-base"
                      >
                        {t('restaurantFinder.tryAgain', 'Try again')}
                      </button>
                    </div>
                  </div>
                )}

                {currentRestaurant && nearestRestaurants && (
                  <div className="space-y-3 xs:space-y-4 sm:space-y-6">
                    <div className="text-center mb-3 xs:mb-4 sm:mb-6">
                      <h3 className="text-base xs:text-lg sm:text-2xl font-bold text-gray-800 mb-2 px-2">
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
                      <p className="text-gray-600 text-sm sm:text-base px-2">
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
                      <p className="text-gray-500 text-xs sm:text-sm px-2 mt-1">
                        {t('restaurantFinder.sortedByDistance', 'Results are sorted by distance from location selected')}
                      </p>
                      {searchMode.type === 'municipality' && (
                        <span className="inline-block mt-2 px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                          📍 {searchMode.selectedMunicipality?.region ? t(`regions.${searchMode.selectedMunicipality.region}`, searchMode.selectedMunicipality.region) : ''}
                        </span>
                      )}
                      {searchMode.type === 'category' && searchMode.selectedCategory && (
                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-white to-gray-50 text-gray-700 border">
                          {t(`categories.descriptions.${searchMode.selectedCategory.id}`, searchMode.selectedCategory.description)}
                        </span>
                      )}
                    </div>

                    {/* Share Results Button */}
                    {(nearestRestaurants && nearestRestaurants.length > 0) && (
                      <>
                        <div className="flex justify-end mb-2">
                          <button
                            onClick={async () => {
                              const top10 = nearestRestaurants.slice(0, 10);
                              const shareText = top10
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
                                message = t('restaurantFinder.copiedAndShared', 'Top 10 results copied and ready to share!');
                                type = 'success';
                              } else if (shared && !copied) {
                                message = t('restaurantFinder.sharedButNotCopied', 'Shared successfully, but could not copy to clipboard.');
                                type = 'warning';
                              } else if (copied && !shared) {
                                message = t('restaurantFinder.copiedToClipboard', 'Top 10 results copied to clipboard!');
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
                            className="relative overflow-hidden group inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg border-2 border-blue-400/30 transition-all duration-300 hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            title={t('restaurantFinder.shareResults', 'Share these results')}
                          >
                            {/* Animated background overlay */}
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            {/* Shimmer effect */}
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span className="relative flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 8a3 3 0 11-6 0 3 3 0 016 0zm6 8a3 3 0 11-6 0 3 3 0 016 0zm-6 4v-4m0 0V8m0 8l-4-4m4 4l4-4" /></svg>
                              {t('restaurantFinder.shareResults', 'Share Results')}
                            </span>
                          </button>
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
                              aria-label="Close notification"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {/* Horizontal Scrollable Restaurant Cards */}
                    <div className="relative">
                      {/* Navigation Arrows for Mobile */}
                      {nearestRestaurants.length > 1 && (
                        <>
                          <button
                            onClick={previousRestaurant}
                            disabled={currentIndex === 0}
                            aria-label={t('restaurantFinder.previous', 'Previous restaurant')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-lg rounded-full p-2 sm:p-3 text-gray-600 disabled:text-gray-400 hover:text-[#0878fe] transition-all duration-200 disabled:opacity-50"
                            style={{ marginLeft: '-16px' }}
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={nextRestaurant}
                            disabled={currentIndex === nearestRestaurants.length - 1}
                            aria-label={t('restaurantFinder.next', 'Next restaurant')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-lg rounded-full p-2 sm:p-3 text-gray-600 disabled:text-gray-400 hover:text-[#0878fe] transition-all duration-200 disabled:opacity-50"
                            style={{ marginRight: '-16px' }}
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {/* Scrollable Container */}
                      <div className="overflow-x-auto scrollbar-hide px-4">
                        <div 
                          className="flex gap-4 transition-transform duration-300 ease-in-out"
                          style={{ 
                            transform: `translateX(-${currentIndex * (280 + 16)}px)`,
                            width: `${nearestRestaurants.length * (280 + 16)}px`
                          }}
                        >
                          {nearestRestaurants.map((restaurantData, index) => {
                            // Check for vegan/vegetarian and luxury flags
                            const isVegan = vegetarianData.some(v => v.name === restaurantData.restaurant.name && v.address === restaurantData.restaurant.address);
                            const isLuxury = luxuryDiningData.some(l => l.name === restaurantData.restaurant.name && l.address === restaurantData.restaurant.address);
                            return (
                              <div
                                key={index}
                                className={`min-w-[280px] h-[240px] sm:h-[260px] bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200 transition-all duration-200 flex flex-col ${
                                  index === currentIndex ? 'ring-2 ring-[#0878fe] shadow-lg' : 'opacity-80'
                                }`}
                              >
                                {/* Content Container - Flex grow to push button to bottom */}
                                <div className="flex-1 flex flex-col">
                                  {/* Restaurant Info - Fixed height sections */}
                                  <div className="flex-1 space-y-2 sm:space-y-3">
                                    {/* Restaurant Name - Fixed height with line clamping */}
                                    <div className="h-[40px] sm:h-[48px] flex items-center gap-2">
                                      <h4 className="font-bold text-gray-800 text-base sm:text-lg flex items-start gap-2 line-clamp-2 leading-tight">
                                        🍽️ <span className="flex-1">{restaurantData.restaurant.name}</span>
                                      </h4>
                                      {isVegan && (
                                        <span title="Vegan Friendly" className="ml-1 px-2 py-0.5 rounded-full bg-green-200 text-green-800 text-xs font-semibold border border-green-300">Vegan</span>
                                      )}
                                      {isLuxury && (
                                        <span title="Luxury/Pricey" className="ml-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold border border-yellow-300">Luxury</span>
                                      )}
                                    </div>
                                    {/* Address - Fixed height with line clamping */}
                                    <div className="h-[32px] sm:h-[40px]">
                                      <p className="text-gray-600 text-sm sm:text-base flex items-start gap-2 line-clamp-2 leading-tight">
                                        📍 <span className="flex-1">{restaurantData.restaurant.address}</span>
                                      </p>
                                    </div>
                                    {/* Distance and Index Info */}
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                                      <span className="bg-[#0878fe] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                                        📏 {formatDistance(restaurantData.distance)}
                                      </span>
                                      <span className="text-gray-500 text-xs sm:text-sm whitespace-nowrap">
                                        #{index + 1} {t('restaurantFinder.of', 'of')} {nearestRestaurants.length}
                                      </span>
                                    </div>
                                  </div>
                                  {/* Button - Always at bottom */}
                                  <div className="mt-3 sm:mt-4">
                                    <a
                                      href={restaurantData.restaurant.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block w-full bg-green-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-green-700 transition duration-200 text-center text-sm sm:text-base"
                                    >
                                      {t('restaurantFinder.viewOnMaps', 'View on Google Maps')}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Dots Navigation */}
                    {nearestRestaurants.length > 1 && (
                      <div className="flex justify-center items-center gap-2 px-4">
                        <span className="text-xs text-gray-500 mr-2 hidden sm:inline">
                          {currentIndex + 1} / {nearestRestaurants.length}
                        </span>
                        <div className="flex gap-1 sm:gap-2 max-w-full justify-center">
                          {nearestRestaurants.slice(0, Math.min(15, nearestRestaurants.length)).map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentIndex(index)}
                              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition duration-200 flex-shrink-0 ${
                                index === currentIndex ? 'bg-[#0878fe]' : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                              aria-label={`${t('restaurantFinder.goToRestaurant', 'Go to restaurant')} ${index + 1}`}
                            />
                          ))}
                          {nearestRestaurants.length > 15 && (
                            <span className="text-gray-400 text-xs self-center ml-1">...</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Desktop Navigation (Hidden on Mobile) */}
                    {nearestRestaurants.length > 1 && (
                      <div className="hidden sm:flex justify-center items-center gap-4">
                        <button
                          onClick={previousRestaurant}
                          disabled={currentIndex === 0}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 disabled:text-gray-400 hover:text-[#0878fe] transition duration-200 font-medium"
                        >
                          ← {t('restaurantFinder.previous', 'Previous')}
                        </button>
                        
                        <span className="text-gray-500 text-sm">
                          {currentIndex + 1} {t('restaurantFinder.of', 'of')} {nearestRestaurants.length}
                        </span>
                        
                        <button
                          onClick={nextRestaurant}
                          disabled={currentIndex === nearestRestaurants.length - 1}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 disabled:text-gray-400 hover:text-[#0878fe] transition duration-200 font-medium"
                        >
                          {t('restaurantFinder.next', 'Next')} →
                        </button>
                      </div>
                    )}

                    <div className="text-center pt-4 border-t border-gray-200">
                      <button
                        onClick={resetSearch}
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base cursor-pointer"
                      >
                        🔄 {t('restaurantFinder.searchAgain', 'Search Again')}
                      </button>
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
                          alert('PWA Install Button Test: In production, this would trigger the install prompt. The PWA must be served over HTTPS with a valid manifest for the install prompt to appear.');
                        }
                      } catch (error) {
                        console.error('Failed to install app:', error);
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

            {/* Enhanced Professional CTA Button */}
            <div className="flex justify-center max-w-md mx-auto mt-10 sm:mt-16 px-4">
              <div className="relative group w-full">
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-blue-300/20 to-white/20 rounded-2xl sm:rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                
                <a
                  href={mainHero.secondaryAction.href}
                  className="relative group overflow-hidden bg-white/12 backdrop-blur-md text-white border-2 border-white/30 px-7 sm:px-9 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl hover:bg-white/20 hover:border-white/50 transition-all duration-500 hover:scale-[1.02] w-full block text-center shadow-xl"
                >
                  {/* Animated background overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-blue-100/10 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <span className="relative font-black tracking-wide drop-shadow-lg">
                    {t('mainHero.secondaryAction.text')}
                  </span>
                </a>
              </div>
            </div>

            {/* Elegant scroll indicator */}
            {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
              <div className="flex flex-col items-center space-y-1">
                <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
                </div>
                <span className="text-xs uppercase tracking-wide">Scroll</span>
              </div>
            </div> */}
          </div>
        </section>
      </main>
    </>
  );
};

export default MainHero;
