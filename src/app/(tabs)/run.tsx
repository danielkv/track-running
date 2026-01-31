import { Map } from "@/src/components/features/Map";
import { useCurrentLocation } from "@/src/hooks/useCurrentLocation";
import { useRunTracker } from "@/src/hooks/useRunTracker";
import React, { useEffect, useRef } from "react";
import { Button, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

export default function RunScreen() {
  const mapRef = useRef<MapView>(null);
  const [following, setFollowing] = React.useState(true);
  const [isMapReady, setIsMapReady] = React.useState(false);
  const [region, setRegion] = React.useState({
    latitude: -29.107944258932047,
    longitude: -49.63445267268351,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const { location, loading: loadingInitialLocation } = useCurrentLocation();
  const { isTracking, path, startTracking, stopTracking, currentLocation } =
    useRunTracker();

  useEffect(() => {
    const target = currentLocation || location;
    if (target && isMapReady && following) {
      mapRef.current?.animateToRegion({
        latitude: target.latitude,
        longitude: target.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      });
    }
  }, [location, currentLocation, isMapReady, following]);

  return (
    <View className="flex-1">
      <View className="flex-1">
        <Map
          ref={mapRef}
          onMapReady={() => setIsMapReady(true)}
          onRegionChange={setRegion}
          region={region}
        >
          {isMapReady && (
            <>
              {(currentLocation || location) && (
                <Marker coordinate={(currentLocation || location)!} />
              )}
              {path.length > 2 && (
                <Polyline
                  coordinates={path}
                  strokeColor="#3b82f6"
                  strokeWidth={3}
                />
              )}
            </>
          )}
        </Map>
      </View>
      <View className="p-4 bg-white">
        <Button
          title={isTracking ? "Stop Run" : "Start Run"}
          onPress={isTracking ? stopTracking : startTracking}
          color={isTracking ? "#ef4444" : "#3b82f6"}
          disabled={loadingInitialLocation}
        />
      </View>
    </View>
  );
}
