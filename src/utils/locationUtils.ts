// Location and distance utilities for restaurant finder

export interface Position {
  lat: number;
  lng: number;
}

export interface Restaurant {
  name: string;
  url: string;
  address: string;
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Get user's current location using browser Geolocation API
 * @returns Promise<Position>
 */
export const getCurrentLocation = (): Promise<Position> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

/**
 * Find the nearest restaurant from a list of restaurants
 * @param userPos User's position
 * @param restaurants Array of restaurants
 * @returns Nearest restaurant with distance
 */
export const findNearestRestaurant = (userPos: Position, restaurants: Restaurant[]): { restaurant: Restaurant; distance: number } => {
  if (restaurants.length === 0) {
    throw new Error('No restaurants provided');
  }

  let minDistance = Infinity;
  let nearest: Restaurant = restaurants[0]!;

  restaurants.forEach((restaurant) => {
    const distance = calculateDistance(
      userPos.lat, 
      userPos.lng, 
      restaurant.lat, 
      restaurant.lng
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = restaurant;
    }
  });

  return { restaurant: nearest, distance: minDistance };
};

/**
 * Find the nearest restaurants from a list of restaurants
 * @param userPos User's position
 * @param restaurants Array of restaurants
 * @param count Number of nearest restaurants to return (default: 5)
 * @returns Array of nearest restaurants with distances, sorted by distance
 */
export const findNearestRestaurants = (userPos: Position, restaurants: Restaurant[], count: number = 5): Array<{ restaurant: Restaurant; distance: number }> => {
  if (restaurants.length === 0) {
    throw new Error('No restaurants provided');
  }

  const restaurantsWithDistance = restaurants.map((restaurant, index) => {
    const distance = calculateDistance(
      userPos.lat, 
      userPos.lng, 
      restaurant.lat, 
      restaurant.lng
    );
    return { restaurant, distance, originalIndex: index };
  });

  // Sort by distance, then by original index for stable sorting
  const sorted = restaurantsWithDistance
    .sort((a, b) => {
      const distDiff = a.distance - b.distance;
      if (Math.abs(distDiff) < 0.001) { // If distances are very close (within 1 meter)
        return a.originalIndex - b.originalIndex; // Use original order as tiebreaker
      }
      return distDiff;
    })
    .slice(0, Math.min(count, restaurants.length));

  // Remove the originalIndex property before returning
  return sorted.map(({ restaurant, distance }) => ({ restaurant, distance }));
};

/**
 * Format distance to human-readable string
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};