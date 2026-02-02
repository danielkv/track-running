import { Button } from "@/src/components/Button";
import { Map } from "@/src/components/features/Map";
import { RouteDetail } from "@/src/components/run/RouteDetail";
import { RouteList } from "@/src/components/run/RouteList";
import { RunControls } from "@/src/components/run/RunControls";
import { Text } from "@/src/components/Themed";
import { useCurrentLocation } from "@/src/hooks/useCurrentLocation";
import { useRunTracker } from "@/src/hooks/useRunTracker";
import {
  completeRun,
  createRun,
  getRoutesInRegion,
  updateRun,
} from "@/src/services/routes";
import { checkProximityToStart, isOnRoute } from "@/src/services/verification";
import { Route } from "@/src/types/Run";
import { calculateDistance } from "@/src/utils/geo";
import { useQuery } from "@tanstack/react-query";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const ANIMATION_DURATION = 1000;

export default function RunScreen() {
  const mapRef = useRef<MapView>(null);
  const [following, setFollowing] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentRouteId, setCurrentRouteId] = useState<string | null>(null);

  // Routes management
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [offRouteWarning, setOffRouteWarning] = useState(false);

  const [currentRegion, setCurrentRegion] = useState({
    latitude: -29.107952,
    longitude: -49.6372042,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
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

  // Derived View Mode
  const viewMode = isTracking
    ? "RUNNING"
    : selectedRoute
      ? "SELECTED"
      : "EXPLORING";

  // Use React Query for fetching routes.
  const { data: nearbyRoutes = [] } = useQuery({
    queryKey: ["routes", currentRegion],
    queryFn: async () => {
      // Fetch routes with enhanced error handling and timeout if needed
      return getRoutesInRegion(currentRegion);
    },
    // Only fetch when map is ready and we are exploring
    // This prevents refetching while running or viewing details
    enabled: isMapReady && viewMode === "EXPLORING",
  });

  // Follow user location when following is enabled
  useEffect(() => {
    if (!following || !isMapReady) return;

    const target = currentLocation || location;
    if (target) {
      mapRef.current?.animateToRegion(
        {
          latitude: target.latitude,
          longitude: target.longitude,
          latitudeDelta: currentRegion.latitudeDelta,
          longitudeDelta: currentRegion.longitudeDelta,
        },
        300,
      );
    }
  }, [currentLocation, location, following, isMapReady]);

  // Update run in background
  useEffect(() => {
    if (!isTracking || !currentRouteId || path.length === 0) return;

    // Check if on route
    if (selectedRoute && selectedRoute.path && currentLocation) {
      const isSafe = isOnRoute(currentLocation, selectedRoute.path);
      setOffRouteWarning(!isSafe);
    }

    // Update every 10 points to avoid too many requests
    if (path.length % 10 === 0) {
      updateRun(currentRouteId, {
        path: path,
      }).catch((err) => {
        console.error("Failed to update run:", err);
      });
    }
  }, [path, isTracking, currentRouteId, currentLocation, selectedRoute]);

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    setFollowing(false);

    // Zoom to route
    if (route.path && route.path.length > 0) {
      // fitToCoordinates creates a nice zoomed view of the route
      mapRef.current?.fitToCoordinates(route.path, {
        edgePadding: { top: 50, right: 50, bottom: 300, left: 50 }, // Bottom padding for detail sheet
        animated: true,
      });
    }
  };

  const handleCloseDetail = () => {
    setSelectedRoute(null);
    // When closing, we could recenter on user or just leave map as is
    // Let's leave it as is, user can recenter if they want
  };

  const handleStartRun = async () => {
    const initialLocation = await startTracking();

    if (initialLocation) {
      if (selectedRoute && selectedRoute.path) {
        const isClose = checkProximityToStart(
          initialLocation,
          selectedRoute.path,
        );
        if (!isClose) {
          alert("Você está muito longe do início da rota!");
          stopTracking();
          return;
        }
      }

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
          routeId: selectedRoute?.id,
          territoryIds: [], // Placeholder
        });

        // Ensure final path is saved
        await updateRun(currentRouteId, {
          path: path,
        });
      } catch (err) {
        console.error("Failed to complete run:", err);
      }

      setCurrentRouteId(null);
      setSelectedRoute(null);
      // setViewMode will naturally go back to EXPLORING
    }
  };

  const handleRecenter = useCallback(() => {
    const target = currentLocation || location;
    if (target) {
      mapRef.current?.animateToRegion(
        {
          latitude: target.latitude,
          longitude: target.longitude,
          latitudeDelta: currentRegion.latitudeDelta,
          longitudeDelta: currentRegion.longitudeDelta,
        },
        ANIMATION_DURATION,
      );

      setTimeout(() => {
        setFollowing(true);
      }, ANIMATION_DURATION);
    }
  }, [
    mapRef,
    location,
    currentLocation,
    currentRegion.latitudeDelta,
    currentRegion.longitudeDelta,
  ]);

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
          showsMyLocationButton={false} // Custom button used
          onMapReady={() => setIsMapReady(true)}
          onPanDrag={() => {
            if (following) setFollowing(false);
          }}
          onRegionChangeComplete={(region) => {
            setCurrentRegion({
              latitude: region.latitude,
              longitude: region.longitude,
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            });
          }}
          initialRegion={currentRegion}
        >
          {/* Nearby Routes (Exploring Mode) */}
          {viewMode === "EXPLORING" &&
            nearbyRoutes.map((route) => (
              <Polyline
                key={route.id}
                coordinates={route.path || []}
                strokeColor="#94a3b8" // gray-400
                strokeWidth={4}
                tappable
                onPress={() => handleSelectRoute(route)}
              />
            ))}

          {/* Selected Route (Selected/Running Mode) */}
          {(viewMode === "SELECTED" || viewMode === "RUNNING") &&
            selectedRoute && (
              <Polyline
                coordinates={selectedRoute.path || []}
                strokeColor="#3b82f6" // blue-500
                strokeWidth={4}
              />
            )}

          {/* User location marker */}
          {(currentLocation || location) && (
            <Marker
              coordinate={currentLocation || location}
              anchor={{ x: 0.5, y: 0.5 }}
              flat
            >
              <View className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
            </Marker>
          )}

          {/* Run Path */}
          {path.length > 2 && (
            <Polyline
              coordinates={path}
              strokeColor="#3b82f6"
              strokeWidth={3}
            />
          )}
        </Map>

        {/* UI Overlays based on state */}
        {viewMode === "EXPLORING" && (
          <RouteList routes={nearbyRoutes} onSelectRoute={handleSelectRoute} />
        )}

        {viewMode === "SELECTED" && selectedRoute && (
          <RouteDetail
            route={selectedRoute}
            onStartRun={handleStartRun}
            onClose={handleCloseDetail}
          />
        )}

        {viewMode === "RUNNING" && (
          <RunControls
            distance={distance}
            onStopRun={handleStopRun}
            currentSpeed={currentLocation?.speed}
            elevation={currentLocation?.elevation}
          />
        )}

        {/* Recenter Button (only show if not following and map is interactable) */}
        {!following && (currentLocation || location) && (
          <View className="absolute top-16 right-4 z-50">
            <Button onPress={handleRecenter} size="sm" variant="secondary">
              Recentralizar
            </Button>
          </View>
        )}
      </View>

      {/* Off Route Warning */}
      {offRouteWarning && (
        <View className="absolute bottom-32 left-4 right-4 bg-red-500 p-3 rounded-lg shadow-lg items-center z-50">
          <Text className="text-white font-bold text-center uppercase">
            ⚠️ Fora da rota!
          </Text>
        </View>
      )}
    </View>
  );
}
