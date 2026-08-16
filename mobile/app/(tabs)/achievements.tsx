import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BadgeList } from '@/components/BadgeList';
import { CollectionList } from '@/components/CollectionList';

type Segment = 'badges' | 'items';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'badges', label: 'バッジ' },
  { key: 'items', label: 'アイテム' },
];

export default function AchievementsTab() {
  // この画面はタブ切替でアンマウントされないため、`useState` の初期化関数は
  // 最初にこのタブを開いたとき一度しか評価されない。そのため「ホームからガチャ導線で
  // 来たときだけアイテムを開く」判定はマウント時の初期値ではなく、
  // パラメータの変化を検知する effect で行う（マウント済みでも反応させるため）。
  const router = useRouter();
  const { segment: segmentParam } = useLocalSearchParams<{ segment?: string }>();
  const [segment, setSegment] = useState<Segment>('badges');

  useEffect(() => {
    if (segmentParam !== 'items') return;
    setSegment('items');
    // パラメータを消費したらクリアする。クリアしないと「アイテム」を手動でバッジに
    // 戻した後にもう一度同じボタンから segment=items で遷移してきたとき、
    // 値が前回と変わらず（'items' → 'items'）この effect の依存配列が変化しないため
    // 再実行されない＝2回目以降アイテムが開かなくなってしまう。
    router.setParams({ segment: undefined });
  }, [segmentParam, router]);

  return (
    <View style={styles.container}>
      <View style={styles.segmentWrap}>
        <View style={styles.segmentRow}>
          {SEGMENTS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.segmentBtn, segment === s.key && styles.segmentBtnActive]}
              onPress={() => setSegment(s.key)}
            >
              <Text style={[styles.segmentText, segment === s.key && styles.segmentTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {segment === 'badges' ? <BadgeList /> : <CollectionList />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  segmentWrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  segmentBtnActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  segmentText: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
});
