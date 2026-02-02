import React from "react";
import { View } from "react-native";
import { Button } from "../Button";
import { Text } from "../Themed";

interface RunControlsProps {
  distance: number; // in meters
  time?: number; // in seconds (optional for now as we didn't implement timer fully yet)
  currentSpeed?: number; // in m/s
  elevation?: number; // in meters
  onStopRun: () => void;
}

export function RunControls({
  distance,
  onStopRun,
  currentSpeed,
  elevation,
}: RunControlsProps) {
  const speedKmh = currentSpeed ? (currentSpeed * 3.6).toFixed(1) : "0.0";
  return (
    <>
      <View className="absolute top-4 left-4 right-4 bg-white/90 p-4 rounded-xl shadow-sm flex-row justify-between z-10">
        <View className="flex-row justify-between w-full">
          <View>
            <Text className="text-gray-500 text-xs uppercase font-bold">
              Distância
            </Text>
            <Text className="text-xl font-bold">
              {(distance / 1000).toFixed(2)}{" "}
              <Text className="text-sm font-normal">km</Text>
            </Text>
          </View>

          <View className="items-center">
            <Text className="text-gray-500 text-xs uppercase font-bold">
              Velocidade
            </Text>
            <Text className="text-xl font-bold">
              {speedKmh} <Text className="text-sm font-normal">km/h</Text>
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-gray-500 text-xs uppercase font-bold">
              Elevação
            </Text>
            <Text className="text-xl font-bold">
              {elevation?.toFixed(0) || "0"}{" "}
              <Text className="text-sm font-normal">m</Text>
            </Text>
          </View>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white safe-area-bottom shadow-t-sm z-10">
        <Button onPress={onStopRun} className="bg-red-500 hover:bg-red-600">
          Terminar corrida
        </Button>
      </View>
    </>
  );
}
