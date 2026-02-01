import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/map" />;
  }

  return <Redirect href="/login" />;
}
