import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Route } from "../../types/Run";
import { Button } from "../Button";
import { Text } from "../Themed";

interface RouteDetailProps {
  route: Route;
  onStartRun: () => void;
  onClose: () => void;
}

export function RouteDetail({ route, onStartRun, onClose }: RouteDetailProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg p-6 pb-10 z-20">
      <TouchableOpacity
        onPress={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full"
      >
        <Ionicons name="close" size={20} color="#64748b" />
      </TouchableOpacity>

      <View className="mb-6">
        <Text className="text-2xl font-bold mb-2">
          {route.name || "Rota sem nome"}
        </Text>
        {route.description && (
          <Text className="text-gray-500 mb-4 leading-5">
            {route.description}
          </Text>
        )}

        <View className="flex-row gap-4 mt-2">
          <View className="bg-gray-50 p-3 rounded-lg flex-1 items-center">
            <Text className="text-xs text-gray-500 uppercase font-bold mb-1">
              Distância
            </Text>
            <Text className="text-lg font-bold">
              {route.total_distance
                ? (route.total_distance / 1000).toFixed(2)
                : "-"}{" "}
              <Text className="text-sm font-normal">km</Text>
            </Text>
          </View>

          <View className="bg-gray-50 p-3 rounded-lg flex-1 items-center">
            <Text className="text-xs text-gray-500 uppercase font-bold mb-1">
              Recorde
            </Text>
            {/* Note: We would need to fetch the best run time properly or pass it within the route object if available */}
            <Text className="text-lg font-bold">-</Text>
          </View>
        </View>
      </View>

      <Button onPress={onStartRun} className="mb-2">
        DOMINAR
      </Button>
    </View>
  );
}
