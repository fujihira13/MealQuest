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

    // AsyncStorage からの復元は非同期のため、復元前に refresh() を呼ぶと
    // 復元後の state 置換でミッション生成が巻き戻ってしまう。
    // 復元済みならその場で、復元中なら完了を待ってから実行する。
    let unsubscribeFinishHydration: (() => void) | undefined;
    if (useAppStore.persist.hasHydrated()) {
      refresh();
    } else {
      unsubscribeFinishHydration = useAppStore.persist.onFinishHydration(() => {
        refresh();
      });
    }

    // バックグラウンドから復帰したときにも日付・週をまたいだかを判定する
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') refresh();
      }
    );

    return () => {
      unsubscribeFinishHydration?.();
      subscription.remove();
    };
  }, [initializeMissions, checkBadgeProgress]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
