import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';

export function AppHeader() {
  const insets = useSafeAreaInsets();
  const { userData } = useAppStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.appName}>節約マスター</Text>
      <View style={styles.levelBadge}>
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.levelText}>Lv.{userData.level}</Text>
      </View>
      <View style={styles.points}>
        <Text style={styles.coinIcon}>🪙</Text>
        <Text style={styles.pointsText}>{userData.points.toLocaleString()} pt</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  crown: {
    fontSize: 14,
  },
  levelText: {
    color: '#FFF176',
    fontSize: 14,
    fontWeight: '700',
  },
  points: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinIcon: {
    fontSize: 14,
  },
  pointsText: {
    color: '#FFD54F',
    fontSize: 14,
    fontWeight: '700',
  },
});
