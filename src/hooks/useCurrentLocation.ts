import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Coordinate } from '../types/Run';

/**
 * Hook to get the user's current location.
 * Provides a function to manually trigger a location fetch.
 */
export function useCurrentLocation() {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(async (options: Location.LocationOptions = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure we have permission before trying to get location
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== Location.PermissionStatus.GRANTED) {
        const { status: requestStatus } = await Location.requestForegroundPermissionsAsync();
        if (requestStatus !== Location.PermissionStatus.GRANTED) {
          setError('Location permission denied');
          return null;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        ...options,
      });

      const coord: Coordinate = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: currentLocation.timestamp,
      };

      setLocation(coord);
      return coord;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error getting location';
      setError(errorMessage);
      console.error('Error in useCurrentLocation:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, []);

  return {
    location,
    error,
    loading,
    getLocation,
  };
}
