import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

export default function RootLayout() {
  const { initializeMissions, checkBadgeProgress } = useAppStore();

  useEffect(() => {
    const refresh = () => {
      initializeMissions();
      checkBadgeProgress();
    };

    refresh();

    // バックグラウンドから復帰したときにも日付・週をまたいだかを判定する
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') refresh();
      }
    );

    return () => subscription.remove();
  }, [initializeMissions, checkBadgeProgress]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
