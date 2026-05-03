import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { Badge } from '@/types';

type Filter = 'all' | 'earned' | 'notEarned';

function BadgeCard({
  badge, earned, currentValue,
}: { badge: Badge; earned: boolean; currentValue: number }) {
  const req = badge.requirement;
  const progressPct = req.type === 'monthly_goal_achieved'
    ? (earned ? 100 : 0)
    : Math.min((currentValue / req.value) * 100, 100);
  const remaining = req.type === 'monthly_goal_achieved'
    ? null
    : Math.max(req.value - currentValue, 0);

  return (
    <View style={[styles.card, earned ? styles.cardEarned : styles.cardLocked]}>
      <Text style={[styles.icon, !earned && styles.iconLocked]}>{badge.icon}</Text>
      <Text style={[styles.title, !earned && styles.textLocked]} numberOfLines={2}>
        {badge.title}
      </Text>
      <Text style={[styles.desc, !earned && styles.textLocked]} numberOfLines={2}>
        {badge.description}
      </Text>
      {earned ? (
        <View style={styles.earnedBtn}>
          <Text style={styles.earnedBtnText}>獲得済み</Text>
        </View>
      ) : (
        <>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>
          {remaining !== null && (
            <Text style={styles.remainingText}>あと {remaining.toLocaleString()}</Text>
          )}
        </>
      )}
      {earned && <Text style={styles.checkMark}>✓</Text>}
    </View>
  );
}

export default function BadgesTab() {
  const {
    badgeDefinitions, badges, cookingRecords, savingsRecords, userData,
    streaks, collection, missions, expenses,
  } = useAppStore();
  const [filter, setFilter] = useState<Filter>('all');

  const earned = badgeDefinitions.filter((b) => badges.earned.includes(b.id));
  const notEarned = badgeDefinitions.filter((b) => !badges.earned.includes(b.id));

  const sorted = [...earned, ...notEarned];
  const filtered =
    filter === 'earned' ? earned : filter === 'notEarned' ? notEarned : sorted;

  const getBadgeCurrentValue = (badge: Badge): number => {
    const req = badge.requirement;
    switch (req.type) {
      case 'cooking_count': return cookingRecords.length;
      case 'total_savings': return userData.totalSavings;
      case 'savings_count': return savingsRecords.length;
      case 'level': return userData.level;
      case 'savings_level': return userData.savingsLevel;
      case 'no_waste_streak': return streaks.noWasteStreak;
      case 'gacha_items': return collection.length;
      case 'missions_completed': return missions.completedHistory.length;
      case 'consecutive_days': {
        const dateDayMs = 24 * 60 * 60 * 1000;
        const recordedDates = new Set([
          ...expenses.map((e) => e.date),
          ...cookingRecords.map((r) => r.date),
        ]);
        const sortedDates = Array.from(recordedDates).sort();
        let maxStreak = sortedDates.length > 0 ? 1 : 0;
        let streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const diff = new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime();
          streak = diff === dateDayMs ? streak + 1 : 1;
          if (streak > maxStreak) maxStreak = streak;
        }
        return maxStreak;
      }
      case 'monthly_goal_achieved': return badges.earned.includes(badge.id) ? 1 : 0;
      default: return 0;
    }
  };

  const closestBadge = notEarned.reduce<{ badge: Badge | null; ratio: number }>(
    (best, badge) => {
      const cur = getBadgeCurrentValue(badge);
      const ratio = badge.requirement.type === 'monthly_goal_achieved'
        ? 0
        : cur / badge.requirement.value;
      return ratio > best.ratio ? { badge, ratio } : best;
    },
    { badge: null, ratio: -1 }
  );

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'すべて' },
    { key: 'earned', label: '獲得済み' },
    { key: 'notEarned', label: '未獲得' },
  ];

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerStats}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>獲得バッジ</Text>
            <Text style={styles.statValue}>
              {badges.earned.length}
              <Text style={styles.statTotal}>/{badgeDefinitions.length}</Text>
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>次に近いバッジ</Text>
            {closestBadge.badge ? (
              <Text style={styles.statValue} numberOfLines={1}>
                {closestBadge.badge.icon}{' '}
                <Text style={[styles.statTotal, { fontSize: 13 }]}>
                  {closestBadge.badge.title}
                </Text>
              </Text>
            ) : (
              <Text style={styles.statValue}>全取得！</Text>
            )}
          </View>
        </View>

        {/* フィルタータブ */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* バッジグリッド（2列） */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <BadgeCard
            badge={item}
            earned={badges.earned.includes(item.id)}
            currentValue={getBadgeCurrentValue(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>該当するバッジがありません</Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🏅 バッジを集めて、もっと節約上手になろう！
            </Text>
          </View>
        }
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  statBlock: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#212121',
  },
  statTotal: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9E9E9E',
  },
  statHighlight: {
    color: '#4CAF50',
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#E0E0E0',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterBtnActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  grid: {
    padding: 10,
    gap: 0,
  },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    gap: 4,
    minHeight: 140,
  },
  cardEarned: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#FFFDE7',
  },
  cardLocked: {
    backgroundColor: '#F9F9F9',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  icon: {
    fontSize: 30,
    marginBottom: 4,
  },
  iconLocked: {
    opacity: 0.35,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  desc: {
    fontSize: 10,
    color: '#757575',
    textAlign: 'center',
  },
  textLocked: {
    color: '#BDBDBD',
  },
  earnedBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  earnedBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  progressBarBg: {
    width: '100%',
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#81C784',
    borderRadius: 3,
  },
  remainingText: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 3,
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '800',
  },
  empty: {
    textAlign: 'center',
    color: '#9E9E9E',
    padding: 32,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 18,
  },
});
