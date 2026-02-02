import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function LoginScreen() {
  const { signInWithGoogle, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/run");
    }
  }, [isAuthenticated]);

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();

    if (error) {
      Alert.alert(
        "Erro ao fazer login",
        "Não foi possível fazer login com o Google. Tente novamente.",
      );
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <View className="w-full max-w-md">
        {/* Logo ou título do app */}
        <Text className="text-4xl font-bold text-center mb-2 text-gray-900">
          Sprint Zone
        </Text>
        <Text className="text-base text-center mb-12 text-gray-600">
          Rastreie suas corridas e conquiste territórios
        </Text>

        {/* Botão de login com Google */}
        <Pressable
          onPress={handleGoogleLogin}
          disabled={loading}
          className={`w-full bg-white border-2 border-gray-300 rounded-xl py-4 px-6 flex-row items-center justify-center shadow-sm ${
            loading ? "opacity-50" : "active:bg-gray-50"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <>
              {/* Ícone do Google (SVG simplificado) */}
              <View className="mr-3">
                <Text className="text-2xl">🔷</Text>
              </View>
              <Text className="text-base font-semibold text-gray-800">
                Continuar com Google
              </Text>
            </>
          )}
        </Pressable>

        <Text className="text-xs text-center mt-8 text-gray-500">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de
          Privacidade
        </Text>
      </View>
    </View>
  );
}
