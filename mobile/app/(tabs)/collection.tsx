import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { getRarityDisplay } from '@/utils/formatHelpers';
import { calculateGachaProgress } from '@/utils/calculationHelpers';
import type { CollectionItem } from '@/types';

type Filter = 'all' | 'rare' | 'notOwned';

const RARITY_COLORS: Record<string, string> = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

const RARITY_BG: Record<string, string> = {
  common: '#FAFAFA',
  rare: '#E3F2FD',
  epic: '#F3E5F5',
  legendary: '#FFF3E0',
};

const RARITY_STARS: Record<string, string> = {
  common: '★',
  rare: '★★',
  epic: '★★★',
  legendary: '★★★★',
};

function CollectionCard({ item }: { item: CollectionItem }) {
  return (
    <View style={[styles.card, { backgroundColor: RARITY_BG[item.rarity] }]}>
      <View style={[styles.rarityBar, { backgroundColor: RARITY_COLORS[item.rarity] }]} />
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <Text style={[styles.stars, { color: RARITY_COLORS[item.rarity] }]}>
        {RARITY_STARS[item.rarity]}
      </Text>
      {item.count > 1 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>×{item.count}</Text>
        </View>
      )}
      <Text style={styles.ownedLabel}>入手済み</Text>
    </View>
  );
}

function NotOwnedCard({ item }: { item: { id: number; name: string; icon: string; rarity: string } }) {
  return (
    <View style={[styles.card, styles.cardLocked]}>
      <View style={[styles.rarityBar, { backgroundColor: '#E0E0E0' }]} />
      <Text style={[styles.icon, styles.iconLocked]}>{item.icon}</Text>
      <Text style={[styles.name, styles.textLocked]} numberOfLines={2}>{item.name}</Text>
      <Text style={[styles.stars, { color: '#E0E0E0' }]}>
        {RARITY_STARS[item.rarity] ?? '★'}
      </Text>
      <Text style={styles.lockedLabel}>未入手</Text>
    </View>
  );
}

export default function CollectionTab() {
  const { userData, collection, gachaItems, playGacha } = useAppStore();
  const [filter, setFilter] = useState<Filter>('all');

  const gachaProgress = calculateGachaProgress(userData.points);
  const totalItems = gachaItems.length;

  const ownedIds = new Set(collection.map((c) => c.id));
  const notOwned = gachaItems.filter((g) => !ownedIds.has(g.id));
  const rareOwned = collection.filter((c) => c.rarity === 'rare' || c.rarity === 'epic' || c.rarity === 'legendary');

  const handleGacha = () => {
    if (userData.points < 100) {
      Alert.alert('ポイント不足', `ガチャには100ptが必要です\n現在: ${userData.points}pt`);
      return;
    }
    const result = playGacha();
    if (result) {
      Alert.alert(
        '🎰 ガチャ結果！',
        `${RARITY_STARS[result.rarity] ?? ''} ${result.icon} ${result.name}\n${getRarityDisplay(result.rarity)}`
      );
    }
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'すべて' },
    { key: 'rare', label: 'レア' },
    { key: 'notOwned', label: '未所持' },
  ];

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>コレクション</Text>
            <Text style={styles.collectionCount}>
              収集率 {collection.length}/{totalItems}
            </Text>
          </View>
          <View style={styles.gachaNeeded}>
            <Text style={styles.gachaNeedLabel}>次のガチャまで</Text>
            <Text style={styles.gachaNeedPt}>
              {gachaProgress.canPlay ? 'まわせます' : `あと ${gachaProgress.pointsNeeded}pt`}
            </Text>
            <View style={styles.gachaBarBg}>
              <View style={[styles.gachaBarFill, { width: `${gachaProgress.progressPercent}%` }]} />
            </View>
          </View>
        </View>

        {/* ガチャセクション */}
        <View style={styles.gachaSection}>
          <View style={styles.gachaLeft}>
            <Text style={styles.gachaMachine}>🎰</Text>
          </View>
          <View style={styles.gachaCenter}>
            <Text style={styles.gachaTitle}>節約ガチャ</Text>
            <Text style={styles.gachaSub}>100ptで1回</Text>
          </View>
          <TouchableOpacity style={styles.gachaBtn} onPress={handleGacha}>
            <Text style={styles.gachaBtnText}>まわす</Text>
          </TouchableOpacity>
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

      {/* コレクショングリッド */}
      {filter === 'notOwned' ? (
        <FlatList
          data={notOwned}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => <NotOwnedCard item={item} />}
          ListEmptyComponent={
            <Text style={styles.empty}>全てのアイテムを入手済みです！</Text>
          }
          ListFooterComponent={<View style={styles.footerBanner}><Text style={styles.footerText}>レアアイテムを集めて 特別なごほうびが GET!</Text></View>}
        />
      ) : (
        <FlatList
          data={filter === 'rare' ? rareOwned : collection}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => <CollectionCard item={item} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {filter === 'rare' ? 'レアアイテムはまだありません' : 'まだアイテムがありません\nガチャを引いて集めよう！'}
            </Text>
          }
          ListFooterComponent={<View style={styles.footerBanner}><Text style={styles.footerText}>レアアイテムを集めて 特別なごほうびが GET!</Text></View>}
        />
      )}
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
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  collectionCount: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  gachaNeeded: {
    alignItems: 'flex-end',
    gap: 4,
  },
  gachaNeedLabel: {
    fontSize: 11,
    color: '#757575',
  },
  gachaNeedPt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9800',
  },
  gachaBarBg: {
    width: 80,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  gachaBarFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 3,
  },
  gachaSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  gachaLeft: {
    width: 48,
    alignItems: 'center',
  },
  gachaMachine: {
    fontSize: 36,
  },
  gachaCenter: {
    flex: 1,
  },
  gachaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E65100',
  },
  gachaSub: {
    fontSize: 12,
    color: '#FF9800',
  },
  gachaBtn: {
    backgroundColor: '#FF9800',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  gachaBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
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
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  grid: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
    minHeight: 110,
    overflow: 'hidden',
  },
  cardLocked: {
    backgroundColor: '#F5F5F5',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  rarityBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  icon: {
    fontSize: 28,
    marginTop: 6,
  },
  iconLocked: {
    opacity: 0.3,
  },
  name: {
    fontSize: 10,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  textLocked: {
    color: '#BDBDBD',
  },
  stars: {
    fontSize: 9,
    fontWeight: '700',
  },
  countBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  countText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ownedLabel: {
    fontSize: 9,
    color: '#4CAF50',
    fontWeight: '600',
  },
  lockedLabel: {
    fontSize: 9,
    color: '#BDBDBD',
  },
  empty: {
    textAlign: 'center',
    color: '#9E9E9E',
    padding: 32,
    fontSize: 14,
    lineHeight: 22,
  },
  footerBanner: {
    margin: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '600',
  },
});
