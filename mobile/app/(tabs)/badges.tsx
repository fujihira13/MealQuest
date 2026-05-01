import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { Badge } from '@/types';

function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <View style={[styles.card, !earned && styles.cardLocked]}>
      <Text style={[styles.icon, !earned && styles.iconLocked]}>{badge.icon}</Text>
      <Text style={[styles.title, !earned && styles.textLocked]}>{badge.title}</Text>
      <Text style={[styles.desc, !earned && styles.textLocked]}>{badge.description}</Text>
      {earned && <Text style={styles.earnedMark}>✓</Text>}
    </View>
  );
}

export default function BadgesTab() {
  const { badgeDefinitions, badges } = useAppStore();

  const earned = badgeDefinitions.filter((b) => badges.earned.includes(b.id));
  const notEarned = badgeDefinitions.filter((b) => !badges.earned.includes(b.id));
  const sorted = [...earned, ...notEarned];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {badges.earned.length} / {badgeDefinitions.length} 獲得
        </Text>
        {badges.currentTitle !== 'beginner' && (
          <Text style={styles.currentTitle}>称号: {badges.currentTitle}</Text>
        )}
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <BadgeCard badge={item} earned={badges.earned.includes(item.id)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  currentTitle: {
    fontSize: 13,
    color: '#4CAF50',
    marginTop: 4,
  },
  grid: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  cardLocked: {
    backgroundColor: '#F5F5F5',
    shadowOpacity: 0,
    elevation: 0,
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  iconLocked: {
    opacity: 0.3,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  desc: {
    fontSize: 10,
    color: '#757575',
    textAlign: 'center',
    marginTop: 2,
  },
  textLocked: {
    color: '#BDBDBD',
  },
  earnedMark: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '700',
  },
});
