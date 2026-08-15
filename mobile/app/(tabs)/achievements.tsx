import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BadgeList } from '@/components/BadgeList';
import { CollectionList } from '@/components/CollectionList';

type Segment = 'badges' | 'items';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'badges', label: 'バッジ' },
  { key: 'items', label: 'アイテム' },
];

export default function AchievementsTab() {
  const [segment, setSegment] = useState<Segment>('badges');

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
