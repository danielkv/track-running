import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

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
    return <Redirect href="/(tabs)/run" />;
  }

  return <Redirect href="/login" />;
}
