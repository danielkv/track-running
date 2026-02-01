import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';

export default function AuthCallback() {
  useEffect(() => {
    // O WebBrowser já lidou com a sessão, apenas redireciona
    const timer = setTimeout(() => {
      router.replace('/(tabs)/map');
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
