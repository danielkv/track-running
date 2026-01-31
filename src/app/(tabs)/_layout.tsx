import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: "#3b82f6", headerShown: false }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: color,
                borderRadius: 12,
              }}
            />
          ), // Placeholder icon
        }}
      />
      <Tabs.Screen
        name="run"
        options={{
          title: "Run",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: color,
                borderRadius: 12,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: color,
                borderRadius: 12,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "Ranking",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: color,
                borderRadius: 12,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
