import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getRarityDisplay } from '@/utils/formatHelpers';
import { RARITY_COLORS, RARITY_STARS, RARITY_BG } from '@/constants/rarity';
import type { CollectionItem } from '@/types';

interface Props {
  visible: boolean;
  result: { item: CollectionItem; bonusPoints: number } | null;
  onClose: () => void;
}

export function GachaResultModal({ visible, result, onClose }: Props) {
  if (!result) return null;
  const { item, bonusPoints } = result;
  const rarityColor = RARITY_COLORS[item.rarity] ?? '#9E9E9E';
  const rarityBg = RARITY_BG[item.rarity] ?? '#FAFAFA';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>🎰 ガチャ結果！</Text>

          <View style={[styles.iconWrap, { backgroundColor: rarityBg, borderColor: rarityColor }]}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>

          <Text style={[styles.rarityStars, { color: rarityColor }]}>
            {RARITY_STARS[item.rarity] ?? ''} {getRarityDisplay(item.rarity)}
          </Text>

          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {bonusPoints > 0 && (
            <View style={styles.bonusBadge}>
              <Text style={styles.bonusText}>🎁 レアリティボーナス +{bonusPoints}pt</Text>
            </View>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>とじる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 20,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 52,
  },
  rarityStars: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  bonusBadge: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
  },
  bonusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E65100',
  },
  closeBtn: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
