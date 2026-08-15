import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '@/store/useAppStore';
import type { NotificationType } from '@/types';

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  success: '#4CAF50',
  info: '#2196F3',
  warning: '#FF9800',
  error: '#F44336',
};

export function Toast() {
  const insets = useSafeAreaInsets();
  const { notifications, removeNotification, appHeaderHeight } = useUIStore();

  if (notifications.length === 0) return null;

  // AppHeader が onLayout で実測した高さの直下に表示する（ヘッダーと重ならないように）。
  // 初回レイアウト計測が完了する前（appHeaderHeight === 0）は
  // セーフエリアの直下を暫定位置として使う。
  const topOffset = (appHeaderHeight > 0 ? appHeaderHeight : insets.top) + 8;

  return (
    <View
      style={[styles.container, { top: topOffset }]}
      pointerEvents="box-none"
    >
      {notifications.map((notification) => (
        <TouchableOpacity
          key={notification.id}
          style={[styles.toast, { backgroundColor: NOTIFICATION_COLORS[notification.type] }]}
          onPress={() => removeNotification(notification.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.message}>{notification.message}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    gap: 8,
    zIndex: 999,
  },
  toast: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
