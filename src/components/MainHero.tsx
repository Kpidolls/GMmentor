'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../config/index.json';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Head from 'next/head';
import restaurantsData from '../data/greekRestaurants.json';
import municipalitiesData from '../data/municipalities.json';
import categoriesData from '../data/restaurantCategories.json';

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
import bougatsaData from '../data/bougatsaRestaurants.json';

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
}

const MainHero = () => {
  const { mainHero } = config;
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  
  // Helper function to get restaurant data by category
  const getRestaurantDataByCategory = (category?: RestaurantCategory): Restaurant[] => {
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
      case 'bougatsa': return normalizeRestaurantData(bougatsaData);
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

  // Get default category (Greek Restaurants) - provide fallback
  const defaultCategory: RestaurantCategory = categoriesData.find(cat => cat.id === 'greek-restaurants') || {
    id: 'greek-restaurants',
    name: t('categories.greekRestaurants', 'Greek Restaurants'),
    description: t('categories.greekDescription', 'Authentic traditional Greek cuisine'),
    icon: '🇬🇷',
    color: 'from-blue-500 to-indigo-600',
    keywords: ['greek', 'traditional', 'authentic', 'taverna', 'mediterranean', 'hellenic']
  };
  
  // Restaurant finder state
  const [searchMode, setSearchMode] = useState<SearchMode>({ type: 'location' });
  const [selectedDisplayCategory, setSelectedDisplayCategory] = useState<RestaurantCategory>(defaultCategory);
  const [_userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearestRestaurants, setNearestRestaurants] = useState<Array<{ restaurant: Restaurant; distance: number }> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRestaurantFinder, setShowRestaurantFinder] = useState(false);
  const [showMunicipalityList, setShowMunicipalityList] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);

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

  const findNearestRestaurants = (userLat: number, userLng: number, count: number = 10, category?: RestaurantCategory) => {
    const sourceData = getRestaurantDataByCategory(category);

    const restaurantsWithDistance = sourceData.map((restaurant) => ({
      restaurant: restaurant,
      distance: calculateDistance(userLat, userLng, restaurant.lat, restaurant.lng)
    }));

    return restaurantsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  };

  const getUserLocation = () => {
    setLoading(true);
    setError(null);
    setShowRestaurantFinder(true);
    setSearchMode({ type: 'location' });
    // Keep the currently selected display category instead of resetting to default

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Use the currently selected display category for location search
          const nearest = findNearestRestaurants(latitude, longitude, 10, selectedDisplayCategory);
          setNearestRestaurants(nearest);
          setCurrentIndex(0);
          setLoading(false);
        },
        () => {
          setError(t('restaurantFinder.locationError', 'Unable to get your location. Please enable location services.'));
          setLoading(false);
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
    }
  };

  const searchByMunicipality = (municipality: Municipality) => {
    setLoading(true);
    setError(null);
    setShowRestaurantFinder(true);
    setShowMunicipalityList(false);
    setSearchMode({ type: 'municipality', selectedMunicipality: municipality });
    // Keep the currently selected display category instead of resetting to default

    const nearest = findNearestRestaurants(municipality.lat, municipality.lng, 10, selectedDisplayCategory);
    setNearestRestaurants(nearest);
    setCurrentIndex(0);
    setLoading(false);
  };

  const selectCategory = (category: RestaurantCategory) => {
    // Set the selected category and return to main interface
    setSelectedDisplayCategory(category);
    setShowCategoryList(false);
    setShowRestaurantFinder(false);
    setShowMunicipalityList(false);
    setError(null);
    // Don't perform search immediately - let user choose search method
  };

  const showMunicipalitySelection = () => {
    setShowMunicipalityList(true);
    setShowRestaurantFinder(false);
    setShowCategoryList(false);
    setError(null);
  };

  const showCategorySelection = () => {
    setShowCategoryList(true);
    setShowRestaurantFinder(false);
    setShowMunicipalityList(false);
    setError(null);
  };

  const resetSearch = () => {
    setUserLocation(null);
    setNearestRestaurants(null);
    setCurrentIndex(0);
    setError(null);
    setShowRestaurantFinder(false);
    setShowMunicipalityList(false);
    setShowCategoryList(false);
    setSearchMode({ type: 'location' });
    setSelectedDisplayCategory(defaultCategory); // Reset to default Greek Restaurants
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

  return (
    <>
      <Head>
        <title>Googlementor – Travel Better</title>
        <meta
          name="description"
          content="Explore curated Google Maps lists that help you travel like a pro with Googlementor."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Googlementor – Travel Better" />
        <meta
          property="og:description"
          content="Curated lists and location tips for smarter travel."
        />
        <meta property="og:image" content="/assets/images/cover.webp" />
        <meta property="og:url" content="https://www.googlementor.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <link
          rel="preload"
          as="image"
          href="/assets/images/cover.webp"
          type="image/webp"
        />
      </Head>

      <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Professional Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <Image
            src="/assets/images/cover.webp"
            alt="Greek travel destination"
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
          
          {/* Elegant overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-indigo-900/20" />
        </div>

        {/* Location Badge - Hidden on mobile, visible on tablets and up */}
        <div className="hidden md:block absolute top-6 lg:top-8 right-6 lg:right-8 z-40">
          <span className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/70 font-medium rounded-full text-sm gap-1.5 hover:bg-white/15 hover:text-white/90 transition-all duration-300">
            <span className="text-sm">🇬🇷</span>
            {t('mainHero.athens', 'Athens')}
          </span>
        </div>
        
        {/* Ticker */}
        <div className="absolute top-0 left-0 w-full z-30">
          <MyTicker />
        </div>

        {/* Professional Hero Content */}
        <section className="relative z-20 px-3 xs:px-4 sm:px-6 lg:px-8 py-12 xs:py-16 sm:py-20 lg:py-32 max-w-7xl w-full mx-auto">
          <div className="text-center space-y-6 xs:space-y-8 sm:space-y-10 lg:space-y-12">
            {/* Enhanced Title - Clickable to reset */}
            <header className="space-y-3 xs:space-y-4 sm:space-y-6">
              <button 
                onClick={resetSearch}
                className="font-bold tracking-tight text-white hover:scale-105 transition-transform duration-300 cursor-pointer group"
                title={t('mainHero.clickToReturnToMain', 'Click to return to main page')}
              >
                <span className="block text-sm xs:text-base sm:text-lg lg:text-xl xl:text-2xl text-blue-300 font-medium mb-2 xs:mb-3 sm:mb-4 tracking-wide uppercase group-hover:text-blue-200 transition-colors duration-300">
                  {t('mainHero.subtitle')}
                </span>
                <span className="block text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent leading-tight px-1 group-hover:from-blue-100 group-hover:via-white group-hover:to-blue-100 transition-all duration-300">
                  {t('mainHero.title')}
                </span>
              </button>
              {/* <p className="max-w-2xl mx-auto text-lg sm:text-xl lg:text-2xl text-slate-300 font-light leading-relaxed px-4">
                Discover authentic Greek cuisine through our curated recommendations
              </p> */}
            </header>

            {/* Professional Restaurant Discovery Interface */}
            <div className="max-w-5xl mx-auto px-1 xs:px-2 sm:px-0">
              {!showRestaurantFinder && !showMunicipalityList && !showCategoryList ? (
                /* Main Discovery Interface */
                <div className="bg-white/10 backdrop-blur-xl rounded-xl xs:rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl">
                  <div className="text-center mb-6 xs:mb-8 lg:mb-10">
                    <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 xs:mb-3 sm:mb-4">
                      {t('restaurantFinder.discoverGreekCuisine', 'Discover Greek Cuisine')}
                    </h2>
                    <p className="text-slate-300 text-sm xs:text-base sm:text-lg max-w-2xl mx-auto px-2">
                       {t('restaurantFinder.findPerfectDining', 'Find the perfect dining experience tailored to your preferences')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 mb-4 xs:mb-6 sm:mb-8">
                    {/* Location-based Search */}
                    <button
                      onClick={getUserLocation}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 xs:p-6 sm:p-8 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Category Change Button - Only show when not Greek restaurants */}
                      {selectedDisplayCategory.id !== 'greek' && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            showCategorySelection();
                          }}
                          className="absolute top-2 xs:top-3 right-2 xs:right-3 z-10 w-6 h-6 xs:w-7 xs:h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xs xs:text-sm transition-colors duration-200 cursor-pointer"
                          title={t('mainHero.chooseDifferentCuisine', 'Choose Different Cuisine')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              showCategorySelection();
                            }
                          }}
                        >
                          ✕
                        </div>
                      )}
                      
                      <div className="relative text-center space-y-2 xs:space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-center gap-1 xs:gap-2">
                          <span className="text-xl xs:text-2xl sm:text-3xl">📍</span>
                          <span className="text-lg xs:text-xl sm:text-2xl">{selectedDisplayCategory.icon}</span>
                        </div>
                        <h3 className="text-base xs:text-lg sm:text-xl font-bold">
                          {t('restaurantFinder.nearYou', 'Near You')}
                          {selectedDisplayCategory.id !== 'greek' && (
                            <span className="block text-sm xs:text-base font-medium text-blue-200 mt-1">
                              {t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name)}
                            </span>
                          )}
                        </h3>
                        <p className="text-blue-100 text-xs xs:text-sm">{t('restaurantFinder.findCategoryNearLocation', 'Find {{category}} close to your location', { category: t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name) })}</p>
                      </div>
                    </button>

                    {/* Category Search */}
                    <button
                      onClick={showCategorySelection}
                      className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 xs:p-6 sm:p-8 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative text-center space-y-2 xs:space-y-3 sm:space-y-4">
                        <div className="text-2xl xs:text-3xl sm:text-4xl">🍽️</div>
                        <h3 className="text-base xs:text-lg sm:text-xl font-bold">{t('restaurantFinder.byCuisine', 'By Cuisine')}</h3>
                        <p className="text-emerald-100 text-xs xs:text-sm">{t('restaurantFinder.exploreFoodCategories', 'Explore different food categories')}</p>
                      </div>
                    </button>

                    {/* Region Search */}
                    <button
                      onClick={showMunicipalitySelection}
                      className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4 xs:p-6 sm:p-8 rounded-lg xs:rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl sm:col-span-2 lg:col-span-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative text-center space-y-2 xs:space-y-3 sm:space-y-4">
                        <div className="text-2xl xs:text-3xl sm:text-4xl">🏛️</div>
                        <h3 className="text-base xs:text-lg sm:text-xl font-bold">{t('restaurantFinder.byRegion', 'By Region')}</h3>
                        <p className="text-purple-100 text-xs xs:text-sm">{t('restaurantFinder.chooseAthensAreas', 'Choose specific Athens areas')}</p>
                      </div>
                    </button>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 pt-4 xs:pt-6 sm:pt-8 border-t border-white/20">
                    <div className="text-center space-y-1 xs:space-y-2">
                      <div className="text-lg xs:text-xl sm:text-2xl">🎯</div>
                      <div className="text-white font-semibold text-xs sm:text-sm">{t('mainHero.features.curatedSelection', 'Curated Selection')}</div>
                    </div>
                    <div className="text-center space-y-1 xs:space-y-2">
                      <div className="text-lg xs:text-xl sm:text-2xl">🏆</div>
                      <div className="text-white font-semibold text-xs sm:text-sm">{t('mainHero.features.qualityAssured', 'Quality Assured')}</div>
                    </div>
                    <div className="text-center space-y-1 xs:space-y-2">
                      <div className="text-lg xs:text-xl sm:text-2xl">📱</div>
                      <div className="text-white font-semibold text-xs sm:text-sm">{t('mainHero.features.directNavigation', 'Direct Navigation')}</div>
                    </div>
                    <div className="text-center space-y-1 xs:space-y-2">
                      <div className="text-lg xs:text-xl sm:text-2xl">🌟</div>
                      <div className="text-white font-semibold text-xs sm:text-sm">{t('mainHero.features.localFavorites', 'Local Favorites')}</div>
                    </div>
                  </div>
                </div>
              ) : showCategoryList ? (
                /* Category Selection Interface */
                <div className="bg-white/10 backdrop-blur-xl rounded-xl xs:rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl">
                  <div className="text-center mb-6 xs:mb-8 lg:mb-10">
                    <h3 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 xs:mb-3 sm:mb-4">
                      {t('categorySelection.chooseYourCuisine', 'Choose Your Cuisine')}
                    </h3>
                    <p className="text-slate-300 text-sm xs:text-base sm:text-lg px-2">
                      {t('categorySelection.selectFromCurated', 'Select from our curated categories to find your perfect dining experience')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-6 sm:mb-8">
                    {categoriesData.slice(0, 4).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => selectCategory(category as RestaurantCategory)}
                        className="group relative overflow-hidden bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        <div className="relative text-center space-y-1 xs:space-y-2 sm:space-y-3">
                          <div className="text-xl xs:text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">
                            {category.icon}
                          </div>
                          <h4 className="text-white font-bold text-xs sm:text-sm lg:text-base leading-tight">
                            {t(`categories.${category.id}`, category.name)}
                          </h4>
                          <p className="text-slate-300 text-xs leading-tight hidden sm:block">
                            {t(`categories.descriptions.${category.id}`, category.description)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="text-center pt-3 xs:pt-4 sm:pt-6 border-t border-white/20">
                    <button
                      onClick={() => {
                        resetSearch();
                        setTimeout(() => {
                          window.scrollTo({ top: 200, behavior: 'smooth' });
                        }, 100);
                      }}
                      className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm sm:text-base"
                    >
                      ← {t('categorySelection.backToSearchOptions', 'Back to Search Options')}
                    </button>
                  </div>
                </div>
              ) : showMunicipalityList ? (
              /* Location Selection */
              <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/30 shadow-2xl max-h-[80vh] overflow-hidden">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                    📍 Explore by Location
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg px-2 max-w-2xl mx-auto leading-relaxed">
                    {t('mainHero.choosePreferredArea', 'Choose your preferred area to discover amazing {{category}} nearby', { category: t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name).toLowerCase() })}
                  </p>
                  <div className="mt-3 sm:mt-4">
                    <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                      🇬🇷 {t('mainHero.athensAndSurroundings', 'Athens & Surroundings')}
                    </span>
                  </div>
                </div>

                <div className="max-h-[45vh] sm:max-h-[50vh] overflow-y-auto space-y-3 sm:space-y-4 pr-2 custom-scrollbar">
                  {Object.entries(
                    municipalitiesData.reduce((acc: Record<string, Municipality[]>, municipality) => {
                      const region = municipality.region;
                      if (!acc[region]) acc[region] = [];
                      acc[region].push(municipality as Municipality);
                      return acc;
                    }, {})
                  ).map(([region, municipalities]) => (
                    <div key={region} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {t(`regions.${region}`, region)}
                        <span className="text-xs text-gray-500 font-normal">({municipalities.length} {t('mainHero.areas', 'areas')})</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {municipalities.map((municipality) => (
                          <button
                            key={municipality.name}
                            onClick={() => searchByMunicipality(municipality)}
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
                </div>

                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 text-center">
                  <button
                    onClick={() => {
                      resetSearch();
                      setTimeout(() => {
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                      }, 100);
                    }}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 font-medium text-sm sm:text-base px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    ← {t('mainHero.backToSearchOptions', 'Back to Search Options')}
                  </button>
                </div>
              </div>
            ) : (
              /* Restaurant Finder Results */
              <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-8 border border-white/30 shadow-2xl">
                {loading && (
                  <div className="text-center py-4 xs:py-6 sm:py-8">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 border-b-2 border-[#0878fe] mb-2 xs:mb-3 sm:mb-4"></div>
                    <p className="text-gray-700 text-sm xs:text-base sm:text-lg px-4">
                      {t('restaurantFinder.loadingMessage', 'Discovering {{category}} near you...', { 
                        category: t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name).toLowerCase() 
                      })}
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
                        {searchMode.type === 'category' && searchMode.selectedCategory ? (
                          <>
                            <span className="text-2xl mr-2">{searchMode.selectedCategory.icon}</span>
                            {t(`categories.${searchMode.selectedCategory.id}`, searchMode.selectedCategory.name)} {t('restaurantFinder.restaurants', 'Restaurants')}
                          </>
                        ) : searchMode.type === 'municipality' ? (
                          <>
                            🎯 {t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name)} {`${t('restaurantFinder.inArea', 'in')} ${searchMode.selectedMunicipality?.name ? t(`municipalities.${searchMode.selectedMunicipality.name}`, searchMode.selectedMunicipality.name) : ''}`}
                          </>
                        ) : (
                          <>
                            🎯 {t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name)} {t('restaurantFinder.nearYou', 'Near You')}
                          </>
                        )}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base px-2">
                        {searchMode.type === 'category' && searchMode.selectedCategory
                          ? `${t('restaurantFinder.found', 'Found')} ${nearestRestaurants.length} ${t(`categories.${searchMode.selectedCategory.id}`, searchMode.selectedCategory.name)} ${t('restaurantFinder.places', 'places')}`
                          : searchMode.type === 'municipality' 
                          ? `${t('restaurantFinder.foundCount', 'Found')} ${nearestRestaurants.length} ${t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name)} ${t('restaurantFinder.placesNear', 'places near')} ${searchMode.selectedMunicipality?.name ? t(`municipalities.${searchMode.selectedMunicipality.name}`, searchMode.selectedMunicipality.name) : ''}`
                          : `${t('restaurantFinder.showingClosest', 'Showing')} ${nearestRestaurants.length} ${t('restaurantFinder.closest', 'closest')} ${t(`categories.${selectedDisplayCategory.id}`, selectedDisplayCategory.name)} ${t('restaurantFinder.places', 'places')}`
                        }
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
                          {nearestRestaurants.map((restaurantData, index) => (
                            <div
                              key={index}
                              className={`min-w-[280px] bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200 transition-all duration-200 ${
                                index === currentIndex ? 'ring-2 ring-[#0878fe] shadow-lg' : 'opacity-80'
                              }`}
                            >
                              <div className="space-y-3 sm:space-y-4">
                                <div>
                                  <h4 className="font-bold text-gray-800 text-base sm:text-lg mb-2 flex items-start gap-2 line-clamp-2">
                                    🍽️ <span className="flex-1">{restaurantData.restaurant.name}</span>
                                  </h4>
                                  <p className="text-gray-600 text-sm sm:text-base mb-3 flex items-start gap-2 line-clamp-2">
                                    📍 <span className="flex-1">{restaurantData.restaurant.address}</span>
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <span className="bg-[#0878fe] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                                      📏 {formatDistance(restaurantData.distance)}
                                    </span>
                                    <span className="text-gray-500 text-xs sm:text-sm whitespace-nowrap">
                                      #{index + 1} {t('restaurantFinder.of', 'of')} {nearestRestaurants.length}
                                    </span>
                                  </div>
                                </div>
                                
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
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Dots Navigation */}
                    {nearestRestaurants.length > 1 && (
                      <div className="flex justify-center items-center gap-2 px-4">
                        <span className="text-xs text-gray-500 mr-2 hidden sm:inline">
                          {currentIndex + 1} / {nearestRestaurants.length}
                        </span>
                        <div className="flex gap-1 sm:gap-2 overflow-x-auto max-w-full">
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
                        className="text-gray-500 hover:text-gray-700 transition duration-200 font-medium text-sm sm:text-base"
                      >
                        🔄 {t('restaurantFinder.searchAgain', 'Search Again')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

            {/* Professional CTA Button */}
            <div className="flex justify-center max-w-sm mx-auto mt-12 sm:mt-16 px-4">
              <a
                href={mainHero.secondaryAction.href}
                className="group relative overflow-hidden bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 w-full"
              >
                <span className="relative block text-center">
                  {t('mainHero.secondaryAction.text')}
                </span>
              </a>
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
