import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { Route } from "../../types/Run";
import { Text } from "../Themed";

interface RouteListProps {
  routes: Route[];
  onSelectRoute: (route: Route) => void;
}

export function RouteList({ routes, onSelectRoute }: RouteListProps) {
  if (routes.length === 0) {
    return (
      <View className="p-4 bg-white rounded-t-xl absolute bottom-0 left-0 right-0 h-48 justify-center items-center shadow-lg">
        <Text className="text-gray-500">Nenhuma rota próxima encontrada.</Text>
      </View>
    );
  }

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg h-1/3 z-10">
      <View className="p-4 border-b border-gray-100">
        <Text className="text-lg font-bold">Rotas Próximas</Text>
      </View>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mb-3 p-4 bg-gray-50 rounded-lg border border-gray-100 active:bg-gray-100"
            onPress={() => onSelectRoute(item)}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-semibold text-base">
                  {item.name || "Rota sem nome"}
                </Text>
                {item.total_distance && (
                  <Text className="text-gray-500 text-sm mt-1">
                    {(item.total_distance / 1000).toFixed(2)} km
                  </Text>
                )}
              </View>
              <View className="bg-blue-50 px-3 py-1 rounded-full">
                <Text className="text-blue-600 text-xs font-bold">Ver</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
