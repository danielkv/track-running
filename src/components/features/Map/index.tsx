import React, { forwardRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { MapViewProps } from "react-native-maps";

export interface MapProps extends Omit<MapViewProps, "provider"> {}

export const Map = forwardRef<MapView, MapProps>((props, ref) => {
  return (
    <MapView
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
      }}
      provider="google"
      googleMapsApiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}
      initialRegion={{
        latitude: -29.107944258932047,
        longitude: -49.63445267268351,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      }}
      showsUserLocation
      showsCompass
      showsScale
      showsTraffic={false}
      showsIndoors
      zoomEnabled
      zoomControlEnabled
      rotateEnabled
      scrollEnabled
      pitchEnabled
      loadingFallback={
        <View>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Carregando mapa...</Text>
        </View>
      }
      {...props}
    />
  );
});
