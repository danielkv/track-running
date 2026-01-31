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
      showsScale={false}
      zoomEnabled
      toolbarEnabled={false}
      rotateEnabled
      scrollEnabled
      zoomControlEnabled={false}
      showsTraffic={false}
      pitchEnabled={false}
      options={{
        streetViewControl: false,
        fullscreenControl: false,
        cameraControl: false,
        mapTypeControl: false,
      }}
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
