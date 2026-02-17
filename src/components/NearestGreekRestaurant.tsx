'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import restaurantsData from '../data/greekRestaurants.json';

interface Restaurant {
  name: string;
  url: string;
  address: string;
  lat: number;
  lng: number;
}

const NearestGreekRestaurant: React.FC = () => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearestRestaurants, setNearestRestaurants] = useState<Array<{ restaurant: Restaurant; distance: number }> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      distance: calculateDistance(userLat, userLng, parseFloat(restaurant.lat.toString()), parseFloat(restaurant.lng.toString()))
    }));

    return restaurantsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  };

  const getUserLocation = () => {
    setLoading(true);
    setError(null);

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
          setError(t('nearestGreekRestaurant.errors.locationUnavailable', 'Unable to get your location. Please enable location services.'));
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setError(t('nearestGreekRestaurant.errors.geolocationUnsupported', 'Geolocation is not supported by this browser.'));
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setUserLocation(null);
    setNearestRestaurants(null);
    setCurrentIndex(0);
    setError(null);
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
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {t('nearestGreekRestaurant.title', '🎯 Find Your Nearest Greek Taverna')}
        </h3>
        <p className="text-gray-600 text-sm">
          {t('nearestGreekRestaurant.subtitle', 'Discover authentic Greek cuisine near your location')}
        </p>
      </div>

      {!userLocation && !loading && (
        <button
          onClick={getUserLocation}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2"
        >
          <span>📍</span>
          {t('nearestGreekRestaurant.findButton', 'Find Nearest Restaurants')}
        </button>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">{t('nearestGreekRestaurant.loading', 'Getting your location...')}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={getUserLocation}
            className="mt-2 text-blue-600 text-sm hover:underline"
          >
            {t('nearestGreekRestaurant.tryAgain', 'Try again')}
          </button>
        </div>
      )}

      {currentRestaurant && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">
                  🍽️ {currentRestaurant.restaurant.name}
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  📍 {currentRestaurant.restaurant.address}
                </p>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    📏 {formatDistance(currentRestaurant.distance)}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {t('nearestGreekRestaurant.position', {
                      current: currentIndex + 1,
                      total: nearestRestaurants?.length ?? 0,
                      defaultValue: '#{{current}} of {{total}}'
                    })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <a
                href={currentRestaurant.restaurant.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition duration-200 text-center"
              >
                {t('nearestGreekRestaurant.viewOnMaps', 'View on Maps')}
              </a>
            </div>
          </div>

          {nearestRestaurants && nearestRestaurants.length > 1 && (
            <div className="flex justify-between items-center">
              <button
                onClick={previousRestaurant}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 disabled:text-gray-400 hover:text-blue-600 transition duration-200"
              >
                {t('nearestGreekRestaurant.previous', '← Previous')}
              </button>
              
              <div className="flex gap-1">
                {nearestRestaurants.slice(0, Math.min(10, nearestRestaurants.length)).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition duration-200 ${
                      index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={t('nearestGreekRestaurant.goToRestaurant', {
                      index: index + 1,
                      defaultValue: 'Go to restaurant {{index}}'
                    })}
                  />
                ))}
              </div>
              
              <button
                onClick={nextRestaurant}
                disabled={currentIndex === nearestRestaurants.length - 1}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 disabled:text-gray-400 hover:text-blue-600 transition duration-200"
              >
                {t('nearestGreekRestaurant.next', 'Next →')}
              </button>
            </div>
          )}

          <button
            onClick={resetSearch}
            className="w-full text-gray-500 text-sm hover:text-gray-700 transition duration-200"
          >
            {t('nearestGreekRestaurant.searchAgain', '🔄 Search Again')}
          </button>
        </div>
      )}
    </div>
  );
};

export default NearestGreekRestaurant;