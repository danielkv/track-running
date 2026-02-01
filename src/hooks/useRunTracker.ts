
import { LocationSubscription } from 'expo-location';
import { useRef, useState } from 'react';
import { LocationProvider } from '../common/provider/location';
import { Coordinate } from '../types/Run';

export function useRunTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [path, setPath] = useState<Coordinate[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const subscriptionRef = useRef<LocationSubscription | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pathRef = useRef<Coordinate[]>([]);

  const startTracking = async (): Promise<Coordinate | null> => {
    try {
      const { status } = await LocationProvider.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permissão de localização negada');
        return null;
      }

      setIsTracking(true);
      setPath([]);
      setError(null);
      pathRef.current = [];
      startTimeRef.current = Date.now();
      
      // Get initial position immediately
      const initialLocation = await LocationProvider.getCurrentPositionAsync({
        accuracy: LocationProvider.Accuracy.High,
      });
      
      const initialCoord: Coordinate = {
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        timestamp: initialLocation.timestamp,
      };
      
      setCurrentLocation(initialCoord);
      setPath([initialCoord]);
      pathRef.current = [initialCoord];

      subscriptionRef.current = await LocationProvider.watchPositionAsync(
        {
          accuracy: LocationProvider.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (location) => {
          const coord: Coordinate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          };

          const newPath = [...pathRef.current, coord];

          setCurrentLocation(coord);
          setPath(newPath);
          pathRef.current = newPath;
        }
      );

      return initialCoord;
    } catch (err) {
      console.error('Failed to start tracking:', err);
      setError('Falha ao iniciar rastreamento');
      setIsTracking(false);
      return null;
    }
  };

  const stopTracking = async () => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.remove();
      } catch (e) {
        console.warn('Failed to remove location subscription:', e);
      }
      subscriptionRef.current = null;
    }

    setIsTracking(false);
    // Note: We deliberately do NOT clear path or startTimeRef here
    // to allow the caller to access final stats after stopping.
  };

  const resetTracking = () => {
    setIsTracking(false);
    setPath([]);
    setCurrentLocation(null);
    setError(null);
    pathRef.current = [];
    startTimeRef.current = null;
  }

  return {
    isTracking,
    path,
    currentLocation,
    error,
    startTracking,
    stopTracking,
    resetTracking,
    startTime: startTimeRef.current,
  };
}
