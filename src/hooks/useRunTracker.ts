import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import { Coordinate } from '../types/Run';

export function useRunTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [path, setPath] = useState<Coordinate[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    setIsTracking(true);
    setPath([]);
    
    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      (location) => {
        const coord: Coordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
        };
        setCurrentLocation(coord);
        setPath((prev) => [...prev, coord]);
      }
    );
  };



  const stopTracking = () => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.remove();
      } catch (e) {
        console.warn('Failed to remove location subscription:', e);
      }
      subscriptionRef.current = null;
    }
    setIsTracking(false);
  };

  return {
    isTracking,
    path,
    currentLocation,
    startTracking,
    stopTracking
  };
}
