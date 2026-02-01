import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { LocationProvider } from '../common/provider/location';

/**
 * Hook to manage location permissions.
 * It checks current permission status on mount and provides a function to request it.
 */
export function useLocationPermission() {
  const [status, setStatus] = useState<Location.PermissionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkPermission = useCallback(async () => {
    try {
      const { status: currentStatus } = await LocationProvider.getForegroundPermissionsAsync();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Error checking location permission:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const { status: newStatus } = await LocationProvider.requestForegroundPermissionsAsync();
      setStatus(newStatus);
      return newStatus === Location.PermissionStatus.GRANTED;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    status,
    isGranted: status === Location.PermissionStatus.GRANTED,
    isDenied: status === Location.PermissionStatus.DENIED,
    isUndetermined: status === Location.PermissionStatus.UNDETERMINED,
    loading,
    requestPermission,
    refreshPermission: checkPermission,
  };
}
