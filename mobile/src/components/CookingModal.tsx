import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { MealTime } from '@/types';

const MEAL_OPTIONS: { value: MealTime; label: string; icon: string }[] = [
  { value: 'morning', label: '朝食', icon: '🌅' },
  { value: 'lunch', label: '昼食', icon: '☀️' },
  { value: 'dinner', label: '夕食', icon: '🌙' },
  { value: 'snack', label: '間食', icon: '🍪' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CookingModal({ visible, onClose }: Props) {
  const { toggleCookingRecord } = useAppStore();
  const [meal, setMeal] = useState<MealTime>('dinner');

  const handleSave = () => {
    toggleCookingRecord(meal);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>自炊を記録する</Text>
          <Text style={styles.subtitle}>今日の自炊：+30pt 獲得</Text>

          <Text style={styles.label}>食事の時間帯を選択</Text>
          <View style={styles.grid}>
            {MEAL_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.mealBtn, meal === opt.value && styles.mealBtnActive]}
                onPress={() => setMeal(opt.value)}
              >
                <Text style={styles.mealIcon}>{opt.icon}</Text>
                <Text style={[styles.mealText, meal === opt.value && styles.mealTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>🍳 記録する（+30pt）</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  mealBtn: {
    flexBasis: '47%',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    gap: 4,
  },
  mealBtnActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  mealIcon: {
    fontSize: 24,
  },
  mealText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  mealTextActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
