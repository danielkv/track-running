import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import "../../global.css";
import { queryClient } from "../lib/query-client";

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </QueryClientProvider>
  );
}
