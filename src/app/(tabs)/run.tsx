import { Button } from "@/src/components/Button";
import { Map } from "@/src/components/features/Map";
import { Text } from "@/src/components/Themed";
import { useCurrentLocation } from "@/src/hooks/useCurrentLocation";
import { useRunTracker } from "@/src/hooks/useRunTracker";
import clsx from "clsx";
import React, { useCallback, useRef } from "react";
import { View } from "react-native";
import MapView, { Camera, Polyline } from "react-native-maps";

const ANIMATION_DURATION = 1000;

export default function RunScreen() {
  const mapRef = useRef<MapView>(null);
  const [following, setFollowing] = React.useState(true);
  const [isMapReady, setIsMapReady] = React.useState(false);

  // Track current region in a ref to avoid re-renders and stale closures
  const cameraRef = useRef<Camera>({
    center: {
      latitude: -29.107952,
      longitude: -49.6372042,
    },
    heading: 0,
    pitch: 0,
    zoom: 15,
  });

  const { location, loading: loadingInitialLocation } = useCurrentLocation();
  const { isTracking, path, startTracking, stopTracking, currentLocation } =
    useRunTracker();

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
            if (cameraRef.current) {
              cameraRef.current.center.latitude = region.latitude;
              cameraRef.current.center.longitude = region.longitude;
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

        {/* Recenter Button */}
        {!following && (currentLocation || location) && (
          <View className="absolute bottom-4 right-4">
            <Button onPress={handleRecenter}>Recentralizar</Button>
          </View>
        )}
      </View>
      <View className="p-4 bg-white">
        <Button
          onPress={isTracking ? stopTracking : startTracking}
          className={clsx({ "bg-red-500 hover:bg-red-600": isTracking })}
          disabled={loadingInitialLocation}
        >
          {isTracking ? "Terminar corrida" : "Iniciar corrida"}
        </Button>
      </View>
    </View>
  );
}
