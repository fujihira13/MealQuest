import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function RootLayout() {
  const { resetDailyMissions, resetWeeklyMissions, generateDailyMissions, generateWeeklyMissions, missions } =
    useAppStore();

  useEffect(() => {
    resetDailyMissions();
    resetWeeklyMissions();

    if (Object.keys(missions.daily).length === 0) {
      generateDailyMissions();
    }
    if (Object.keys(missions.weekly).length === 0) {
      generateWeeklyMissions();
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
