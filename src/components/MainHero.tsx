'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../config/index.json';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Head from 'next/head';
import restaurantsData from '../data/greekRestaurants.json';
import municipalitiesData from '../data/municipalities.json';

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

interface SearchMode {
  type: 'location' | 'municipality';
  selectedMunicipality?: Municipality;
}

const MainHero = () => {
  const { mainHero } = config;
  const { t } = useTranslation();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  
  // Restaurant finder state
  const [searchMode, setSearchMode] = useState<SearchMode>({ type: 'location' });
  const [_userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearestRestaurants, setNearestRestaurants] = useState<Array<{ restaurant: Restaurant; distance: number }> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRestaurantFinder, setShowRestaurantFinder] = useState(false);
  const [showMunicipalityList, setShowMunicipalityList] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex(
        (prevIndex) =>
          (prevIndex + 1) % Object.keys(mainHero.primaryAction.text).length
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [mainHero.primaryAction.text]);

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

  const findNearestRestaurants = (userLat: number, userLng: number, count: number = 10) => {
    const restaurantsWithDistance = restaurantsData.map((restaurant) => ({
      restaurant: restaurant as Restaurant,
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

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          const nearest = findNearestRestaurants(latitude, longitude, 10);
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

    const nearest = findNearestRestaurants(municipality.lat, municipality.lng, 10);
    setNearestRestaurants(nearest);
    setCurrentIndex(0);
    setLoading(false);
  };

  const showMunicipalitySelection = () => {
    setShowMunicipalityList(true);
    setShowRestaurantFinder(false);
    setError(null);
  };

  const resetSearch = () => {
    setUserLocation(null);
    setNearestRestaurants(null);
    setCurrentIndex(0);
    setError(null);
    setShowRestaurantFinder(false);
    setShowMunicipalityList(false);
    setSearchMode({ type: 'location' });
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

      <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a2342] via-[#0b3c49] to-[#014d4e] group">
        {/* Greece Edition Sticker */}
        <div className="absolute top-6 sm:top-10 right-3 sm:right-6 z-40">
          <span className="inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 bg-white/90 text-[#0878fe] font-bold rounded-full shadow-lg border-2 border-[#0878fe] text-sm sm:text-base lg:text-lg gap-1 sm:gap-2 select-none">
            <span role="img" aria-label="Greece flag">🇬🇷</span>
          </span>
        </div>
        
        {/* Ticker */}
        <div className="absolute top-0 left-0 w-full z-30">
          <MyTicker />
        </div>

        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/images/cover.webp"
            alt="Map and travel items on a table"
            fill
            priority
            quality={85}
            placeholder="empty"
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        </div>

        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 pointer-events-none z-[-1]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </div>

        {/* Hero Content */}
        <section
          className="relative z-20 px-3 sm:px-6 lg:px-20 py-12 sm:py-14 lg:py-28 max-w-screen-xl w-full text-center flex flex-col items-center"
          aria-label="Hero: Googlementor Travel Tools"
        >
          <header>
            <h1 className="text-white font-primary font-extrabold leading-tight tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-md mb-4 sm:mb-6">
              <span className="block text-[#0878fe] mb-1 sm:mb-2 text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-wider uppercase">
                {t('mainHero.subtitle')}
              </span>
              <span className="block">{t('mainHero.title')}</span>
            </h1>
          </header>

          {/* Restaurant Finder Integration */}
          <div className="mb-8 sm:mb-12 w-full max-w-2xl px-2 sm:px-0">
            {!showRestaurantFinder && !showMunicipalityList ? (
              /* Initial Call-to-Action */
              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-white/20 shadow-2xl">
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3 flex items-center justify-center gap-2 sm:gap-3">
                    🍽️ {t('restaurantFinder.title', 'Discover Authentic Greek Cuisine')}
                  </h2>
                  <p className="text-white/80 text-sm sm:text-lg leading-relaxed px-2">
                    {t('restaurantFinder.subtitle', 'Find traditional Greek tavernas and restaurants near you')}
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <button
                    onClick={getUserLocation}
                    className="w-full bg-gradient-to-r from-[#0878fe] to-[#0053b8] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:scale-105 hover:brightness-110 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 sm:gap-3"
                  >
                    <span className="text-lg sm:text-xl">📍</span>
                    <span className="text-center leading-tight">{t('restaurantFinder.searchNearLocation', 'Search Near My Location')}</span>
                  </button>

                  <div className="relative my-3 sm:my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/30"></span>
                    </div>
                    <div className="relative flex justify-center text-xs sm:text-sm">
                      <span className="bg-transparent px-2 text-white/70">{t('restaurantFinder.or', 'OR')}</span>
                    </div>
                  </div>

                  <button
                    onClick={showMunicipalitySelection}
                    className="w-full bg-white/20 backdrop-blur-sm text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 sm:gap-3 border border-white/30"
                  >
                    <span className="text-lg sm:text-xl">🏛️</span>
                    <span className="text-center leading-tight">{t('restaurantFinder.chooseRegion', 'Choose Athens Region')}</span>
                  </button>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm text-white/70">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span>🎯</span>
                    <span>{t('restaurantFinder.features.locationBased', 'Location-based')}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span>🏆</span>
                    <span>{t('restaurantFinder.features.handpicked', 'Handpicked venues')}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span>📱</span>
                    <span>{t('restaurantFinder.features.directMaps', 'Direct to Maps')}</span>
                  </div>
                </div>
              </div>
            ) : showMunicipalityList ? (
              /* Municipality Selection */
              <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-white/30 shadow-2xl max-h-[500px] sm:max-h-[600px] overflow-hidden">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">
                    🏛️ {t('restaurantFinder.chooseMunicipality', 'Choose Your Municipality')}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base px-2">
                    {t('restaurantFinder.selectArea', 'Select an area in Athens to find nearby restaurants')}
                  </p>
                </div>

                <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto space-y-2 sm:space-y-3 pr-1 sm:pr-2">
                  {Object.entries(
                    municipalitiesData.reduce((acc: Record<string, Municipality[]>, municipality) => {
                      const region = municipality.region;
                      if (!acc[region]) acc[region] = [];
                      acc[region].push(municipality as Municipality);
                      return acc;
                    }, {})
                  ).map(([region, municipalities]) => (
                    <div key={region} className="mb-3 sm:mb-4">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 px-2 sm:px-3 py-1 bg-gray-100 rounded-lg">
                        {t(`regions.${region}`, region)}
                      </h4>
                      <div className="space-y-1 sm:space-y-2">
                        {municipalities.map((municipality) => (
                          <button
                            key={municipality.name}
                            onClick={() => searchByMunicipality(municipality)}
                            className="w-full text-left p-2 sm:p-3 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800 group-hover:text-blue-600 text-sm sm:text-base leading-tight">
                                {t(`municipalities.${municipality.name}`, municipality.name)}
                              </span>
                              <span className="text-gray-400 text-xs sm:text-sm">
                                →
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 text-center">
                  <button
                    onClick={resetSearch}
                    className="text-gray-500 hover:text-gray-700 transition duration-200 font-medium text-sm sm:text-base"
                  >
                    ← {t('restaurantFinder.backToOptions', 'Back to Search Options')}
                  </button>
                </div>
              </div>
            ) : (
              /* Restaurant Finder Results */
              <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-white/30 shadow-2xl">
                {loading && (
                  <div className="text-center py-6 sm:py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#0878fe] mb-3 sm:mb-4"></div>
                    <p className="text-gray-700 text-base sm:text-lg px-4">{t('restaurantFinder.loadingMessage', 'Discovering Greek tavernas near you...')}</p>
                  </div>
                )}

                {error && (
                  <div className="text-center py-4 sm:py-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mb-3 sm:mb-4">
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
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 px-2">
                        🎯 {t('restaurantFinder.resultsTitle', 'Greek Restaurants')} {searchMode.type === 'municipality' ? `${t('restaurantFinder.inArea', 'in')} ${searchMode.selectedMunicipality?.name ? t(`municipalities.${searchMode.selectedMunicipality.name}`, searchMode.selectedMunicipality.name) : ''}` : t('restaurantFinder.nearYou', 'Near You')}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base px-2">
                        {searchMode.type === 'municipality' 
                          ? `${t('restaurantFinder.foundCount', 'Found')} ${nearestRestaurants.length} ${t('restaurantFinder.restaurantsNear', 'restaurants near')} ${searchMode.selectedMunicipality?.name ? t(`municipalities.${searchMode.selectedMunicipality.name}`, searchMode.selectedMunicipality.name) : ''}`
                          : `${t('restaurantFinder.showingClosest', 'Showing')} ${nearestRestaurants.length} ${t('restaurantFinder.closestTavernas', 'closest authentic Greek tavernas')}`
                        }
                      </p>
                      {searchMode.type === 'municipality' && (
                        <span className="inline-block mt-2 px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                          📍 {searchMode.selectedMunicipality?.region ? t(`regions.${searchMode.selectedMunicipality.region}`, searchMode.selectedMunicipality.region) : ''}
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
                                      #{index + 1} of {nearestRestaurants.length}
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
                              aria-label={`Go to restaurant ${index + 1}`}
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
                          {currentIndex + 1} of {nearestRestaurants.length}
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

          {/* Traditional CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 lg:gap-8 sm:justify-center w-full max-w-2xl px-2 sm:px-0">
            <a
              href={mainHero.primaryAction.href}
              className="inline-flex min-w-[200px] sm:min-w-[220px] lg:min-w-[260px] items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-[#0878fe] to-[#0053b8] rounded-xl sm:rounded-2xl shadow-lg hover:scale-105 hover:brightness-110 transition-all duration-300"
              aria-label={t(`mainHero.primaryAction.text.${currentTextIndex}`)}
            >
              <span
                key={currentTextIndex}
                className="transition-opacity duration-500 ease-in-out text-center leading-tight"
              >
                {t(`mainHero.primaryAction.text.${currentTextIndex}`)}
              </span>
            </a>

            <a
              href={mainHero.secondaryAction.href}
              className="inline-flex min-w-[160px] sm:min-w-[180px] lg:min-w-[220px] items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-[#0878fe] bg-white border-2 border-[#0878fe] rounded-xl sm:rounded-2xl shadow-lg hover:bg-blue-50 hover:text-[#0053b8] hover:border-[#0053b8] hover:scale-105 transition-all duration-300"
              aria-label={t('mainHero.secondaryAction.text')}
            >
              <span className="text-center leading-tight">{t('mainHero.secondaryAction.text')}</span>
            </a>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-4 sm:bottom-6 text-white/70 animate-bounce text-xl sm:text-2xl">
            ↓
          </div>
        </section>
      </main>
    </>
  );
};

export default MainHero;
