import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import {
  useImportStravaActivity,
  useStravaActivities,
} from "../../hooks/useStravaActivities";
import { useAppStore } from "../../lib/store";
import { exchangeToken, getStravaAuthUrl } from "../../services/strava/auth";

WebBrowser.maybeCompleteAuthSession();

import { format } from "date-fns";
import { useTerritoryCapture } from "../../hooks/useTerritoryCapture";
import { useAuth } from "../../hooks/useAuth";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { isAuthenticated, setStravaToken } = useAppStore();
  const { data: activities, isLoading, refetch } = useStravaActivities();
  const { mutateAsync: importActivity, isPending: isImporting } =
    useImportStravaActivity();
  const { capturedTerritories } = useTerritoryCapture();

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleConnect = async () => {
    try {
      const authUrl = getStravaAuthUrl();
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        makeRedirectUri({ scheme: "nascent-coronal" })
      );

      if (result.type === "success" && result.url) {
        const params = new URLSearchParams(result.url.split("?")[1]);
        const code = params.get("code");
        if (code) {
          const data = await exchangeToken(code);
          setStravaToken(data.access_token);
          refetch(); // Fetch activities now
        }
      }
    } catch (e) {
      Alert.alert("Auth Error", String(e));
    }
  };

  const handleImport = async (id: number) => {
    try {
      await importActivity(id);
      Alert.alert("Success", "Territories captured from Strava activity!");
    } catch (e) {
      Alert.alert("Import Error", String(e));
    }
  };

  return (
    <View className="flex-1 bg-white p-4 pt-12">
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-3xl font-bold">Perfil</Text>
          {user && (
            <Text className="text-gray-600 mt-1">
              {user.email}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Sair</Text>
        </TouchableOpacity>
      </View>

      {!isAuthenticated ? (
        <TouchableOpacity
          onPress={handleConnect}
          className="bg-orange-600 p-4 rounded-lg items-center"
        >
          <Text className="text-white font-bold">Connect with Strava</Text>
        </TouchableOpacity>
      ) : (
        <View className="flex-1">
          <Text className="text-lg font-semibold mb-4 text-green-600">
            Strava Connected ✅
          </Text>

          <View className="mb-6">
            <Text className="text-xl font-bold mb-2">
              My Territories ({capturedTerritories.length})
            </Text>
            {capturedTerritories.length === 0 ? (
              <Text className="text-gray-500 italic">
                No territories captured yet. Go for a run!
              </Text>
            ) : (
              <FlatList
                data={capturedTerritories}
                horizontal
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View className="bg-purple-100 p-3 rounded-lg mr-3 w-32 items-center justify-center border border-purple-200">
                    <Text className="font-bold text-purple-800">Territory</Text>
                    <Text className="text-xs text-purple-600">
                      {format(item.createdAt, "MMM d, yyyy")}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {item.coordinates.length} points
                    </Text>
                  </View>
                )}
              />
            )}
          </View>

          <Text className="text-xl font-bold mb-2">Recent Activities</Text>
          {isLoading && <Text>Loading activities...</Text>}

          <FlatList
            data={activities}
            keyExtractor={(item: any) => String(item.id)}
            renderItem={({ item }) => (
              <View className="flex-row justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
                <View>
                  <Text className="font-bold">{item.name}</Text>
                  <Text className="text-gray-500">
                    {(item.distance / 1000).toFixed(2)} km
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleImport(item.id)}
                  className="bg-purple-600 px-3 py-2 rounded"
                  disabled={isImporting}
                >
                  <Text className="text-white text-sm">Import</Text>
                </TouchableOpacity>
              </View>
            )}
            className="flex-1"
          />
        </View>
      )}
    </View>
  );
}
