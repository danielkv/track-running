import { Button } from "@/src/components/Button";
import { Map } from "@/src/components/features/Map";
import { Text } from "@/src/components/Themed";
import { useCurrentLocation } from "@/src/hooks/useCurrentLocation";
import { useRunTracker } from "@/src/hooks/useRunTracker";
import { completeRun, createRun, updateRun } from "@/src/services/routes";
import { calculateDistance } from "@/src/utils/geo";
import clsx from "clsx";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import MapView, { Camera, Polyline } from "react-native-maps";

const ANIMATION_DURATION = 1000;

export default function RunScreen() {
  const mapRef = useRef<MapView>(null);
  const [following, setFollowing] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentRouteId, setCurrentRouteId] = useState<string | null>(null);

  // Track current region in a ref to avoid re-renders and stale closures
  const cameraRef = useRef<Camera>({
    center: {
      latitude: -29.107952,
      longitude: -49.6372042,
    },
    heading: 0,
    pitch: 0,
    zoom: 8,
  });

  const { location, loading: loadingInitialLocation } = useCurrentLocation();
  const {
    isTracking,
    path,
    startTracking,
    stopTracking,
    currentLocation,
    startTime,
  } = useRunTracker();

  const distance = useMemo(() => calculateDistance(path), [path]);

  // Update run in background
  useEffect(() => {
    if (!isTracking || !currentRouteId || path.length === 0) return;

    // Update every 10 points to avoid too many requests
    if (path.length % 10 === 0) {
      updateRun(currentRouteId, {
        path: path,
      }).catch((err) => {
        console.error("Failed to update run:", err);
      });
    }
  }, [path, isTracking, currentRouteId]);

  const handleStartRun = async () => {
    const initialLocation = await startTracking();

    if (initialLocation) {
      try {
        const run = await createRun({
          startedAt: new Date(
            initialLocation.timestamp || Date.now(),
          ).toISOString(),
          path: [initialLocation],
        });
        setCurrentRouteId(run.id);
      } catch (err) {
        console.error("Failed to create run in Supabase:", err);
        // If we failed to create the run, we should probably stop tracking
        stopTracking();
      }
    }
  };

  const handleStopRun = async () => {
    await stopTracking();

    if (currentRouteId && startTime) {
      try {
        const endTime = Date.now();
        const duration = Math.floor((endTime - startTime) / 1000); // in seconds

        await completeRun(currentRouteId, {
          endedAt: new Date(endTime).toISOString(),
          duration,
          distance,
        });

        // Ensure final path is saved
        await updateRun(currentRouteId, {
          path: path,
        });
      } catch (err) {
        console.error("Failed to complete run:", err);
      }

      setCurrentRouteId(null);
    }
  };

  const handleRecenter = useCallback(() => {
    const target = currentLocation || location;
    if (target) {
      mapRef.current?.animateCamera(
        {
          center: {
            latitude: target.latitude,
            longitude: target.longitude,
          },
        },
        {
          duration: ANIMATION_DURATION,
        },
      );

      setTimeout(() => {
        setFollowing(true);
      }, ANIMATION_DURATION);
    }
  }, [mapRef, location, currentLocation]);

  if (!location) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 relative">
      <View className="flex-1">
        <Map
          ref={mapRef}
          showsUserLocation
          followsUserLocation={following}
          showsMyLocationButton
          onMapReady={() => setIsMapReady(true)}
          onPanDrag={() => {
            if (following) setFollowing(false);
          }}
          onRegionChangeComplete={(region) => {
            // Only update ref, don't trigger re-render
            if (cameraRef.current) {
              cameraRef.current = {
                ...cameraRef.current,
                center: {
                  latitude: region.latitude,
                  longitude: region.longitude,
                },
              };
            }
          }}
          initialCamera={cameraRef.current}
        >
          {path.length > 2 && (
            <Polyline
              coordinates={path}
              strokeColor="#3b82f6"
              strokeWidth={3}
            />
          )}
        </Map>

        {/* Info Overlay */}
        {isTracking && (
          <View className="absolute top-4 left-4 right-4 bg-white/90 p-4 rounded-xl shadow-sm flex-row justify-between">
            <View>
              <Text className="text-gray-500 text-xs uppercase font-bold">
                Distância
              </Text>
              <Text className="text-xl font-bold">
                {(distance / 1000).toFixed(2)}{" "}
                <Text className="text-sm font-normal">km</Text>
              </Text>
            </View>
            <View>
              <Text className="text-gray-500 text-xs uppercase font-bold">
                Tempo
              </Text>
              {/* Simple timer display could be added here later */}
              <Text className="text-xl font-bold">Running...</Text>
            </View>
          </View>
        )}

        {/* Recenter Button */}
        {!following && (currentLocation || location) && (
          <View className="absolute bottom-4 right-4">
            <Button onPress={handleRecenter}>Recentralizar</Button>
          </View>
        )}
      </View>
      <View className="p-4 bg-white safe-area-bottom">
        <Button
          onPress={isTracking ? handleStopRun : handleStartRun}
          className={clsx({ "bg-red-500 hover:bg-red-600": isTracking })}
          disabled={loadingInitialLocation}
        >
          {isTracking ? "Terminar corrida" : "Iniciar corrida"}
        </Button>
      </View>
    </View>
  );
}
