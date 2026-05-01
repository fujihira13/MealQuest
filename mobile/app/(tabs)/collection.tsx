import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { getRarityDisplay } from '@/utils/formatHelpers';
import type { CollectionItem } from '@/types';

const RARITY_COLORS: Record<string, string> = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

function CollectionCard({ item }: { item: CollectionItem }) {
  return (
    <View style={[styles.card, { borderTopColor: RARITY_COLORS[item.rarity] }]}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={[styles.rarity, { color: RARITY_COLORS[item.rarity] }]}>
        {getRarityDisplay(item.rarity)}
      </Text>
      {item.count > 1 && <Text style={styles.count}>×{item.count}</Text>}
    </View>
  );
}

export default function CollectionTab() {
  const { userData, collection, playGacha } = useAppStore();

  const handleGacha = () => {
    if (userData.points < 100) {
      Alert.alert('ポイント不足', 'ガチャには100ptが必要です');
      return;
    }
    const result = playGacha();
    if (result) {
      Alert.alert(
        'ガチャ結果！',
        `${getRarityDisplay(result.rarity)} ${result.icon} ${result.name}\n${result.description}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{collection.length}種類獲得</Text>
        <TouchableOpacity style={styles.gachaButton} onPress={handleGacha}>
          <Text style={styles.gachaButtonText}>🎰 ガチャ (100pt)</Text>
        </TouchableOpacity>
        <Text style={styles.points}>所持ポイント: {userData.points}pt</Text>
      </View>

      {collection.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎁</Text>
          <Text style={styles.emptyText}>まだアイテムがありません</Text>
          <Text style={styles.emptySubtext}>ガチャを引いてコレクションを集めよう！</Text>
        </View>
      ) : (
        <FlatList
          data={collection}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => <CollectionCard item={item} />}
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
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  gachaButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  gachaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  points: {
    fontSize: 13,
    color: '#757575',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  grid: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderTopWidth: 3,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    fontSize: 32,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  rarity: {
    fontSize: 10,
  },
  count: {
    fontSize: 11,
    color: '#757575',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
});
