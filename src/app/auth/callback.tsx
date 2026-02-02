import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AuthCallback() {
  useEffect(() => {
    // O WebBrowser já lidou com a sessão, apenas redireciona
    const timer = setTimeout(() => {
      router.replace("/(tabs)/run");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#4285F4" />
      <Text className="mt-4 text-gray-600">Entrando...</Text>
    </View>
  );
}
