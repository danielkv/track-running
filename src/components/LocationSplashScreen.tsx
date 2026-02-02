import { LocationProvider } from "@/src/common/provider/location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

interface LocationSplashScreenProps {
  onReady: () => void;
}

export function LocationSplashScreen({ onReady }: LocationSplashScreenProps) {
  const [status, setStatus] = useState<
    "idle" | "requesting" | "denied" | "fetching" | "error" | "ready"
  >("idle");
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      checkPermissionsAndLocation();
    }
  }, [loading, isAuthenticated]);

  const checkPermissionsAndLocation = async () => {
    try {
      setStatus("requesting");
      const { status: permStatus } =
        await LocationProvider.requestForegroundPermissionsAsync();

      if (permStatus !== "granted") {
        setStatus("denied");
        return;
      }

      setStatus("fetching");
      const location = await LocationProvider.getCurrentPositionAsync({});

      if (location) {
        setStatus("ready");
        onReady();
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setStatus("error");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // If not authenticated, we don't block. The parent layout or index.tsx handles redirect.
  // But since this component wraps the authenticated area, we might just return null or allow rendering?
  // Actually, if we wrap (tabs), we expect to be authenticated.
  // Let's assume this is used inside the authenticated layout.

  if (status === "idle" || status === "requesting" || status === "fetching") {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <ActivityIndicator size="large" color="#3b82f6" className="mb-4" />
        <Text className="text-lg font-bold text-center text-gray-800">
          {status === "fetching"
            ? "Obtendo sua localização..."
            : "Verificando permissões..."}
        </Text>
        <Text className="text-sm text-gray-500 text-center mt-2">
          Precisamos saber onde você está para mostrar as rotas.
        </Text>
      </View>
    );
  }

  if (status === "denied") {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <Text className="text-xl font-bold text-center text-gray-900 mb-2">
          Permissão Necessária
        </Text>
        <Text className="text-base text-gray-600 text-center mb-6">
          Para usar o app, precisamos ter acesso à sua localização. Por favor,
          habilite nas configurações.
        </Text>
        <TouchableOpacity
          onPress={checkPermissionsAndLocation}
          className="bg-blue-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <Text className="text-xl font-bold text-center text-gray-900 mb-2">
          Erro de Localização
        </Text>
        <Text className="text-base text-gray-600 text-center mb-6">
          Não conseguimos obter sua localização atual. Verifique se o GPS está
          ativo.
        </Text>
        <TouchableOpacity
          onPress={checkPermissionsAndLocation}
          className="bg-blue-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null; // Should not reach here if verified
}
