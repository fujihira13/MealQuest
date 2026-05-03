import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { DateSelector } from '@/components/DateSelector';
import { getCurrentDate, isValidDateKey } from '@/utils/dateHelpers';
import type { MealTime } from '@/types';
import { COOKING_RECORD_POINTS } from '@/constants/game';

const MEAL_OPTIONS: { value: MealTime; label: string; icon: string }[] = [
  { value: 'morning', label: '朝食', icon: '🌅' },
  { value: 'lunch', label: '昼食', icon: '☀️' },
  { value: 'dinner', label: '夕食', icon: '🌙' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  todayMeals: MealTime[];
}

export function CookingModal({ visible, onClose, todayMeals }: Props) {
  const { cookingRecords, toggleCookingRecordWithDate } = useAppStore();
  const [date, setDate] = useState(getCurrentDate());

  const selectedDateMeals = useMemo(
    () => cookingRecords
      .filter((record) => record.date === date)
      .map((record) => record.meal) as MealTime[],
    [cookingRecords, date]
  );

  const defaultMeal = (recordedMeals: MealTime[]): MealTime => {
    if (!recordedMeals.includes('dinner')) return 'dinner';
    const unrecorded = MEAL_OPTIONS.find((opt) => !recordedMeals.includes(opt.value));
    return unrecorded?.value ?? 'dinner';
  };

  const [meal, setMeal] = useState<MealTime>(defaultMeal(todayMeals));

  useEffect(() => {
    if (selectedDateMeals.includes(meal)) {
      setMeal(defaultMeal(selectedDateMeals));
    }
  }, [meal, selectedDateMeals]);

  const handleSave = () => {
    if (!isValidDateKey(date)) {
      Alert.alert('入力エラー', '日付を YYYY-MM-DD 形式で入力してください');
      return;
    }
    if (selectedDateMeals.includes(meal)) return;
    toggleCookingRecordWithDate(meal, date);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.handle} />
            <Text style={styles.title}>自炊を記録する</Text>
            <Text style={styles.subtitle}>自炊1食：+{COOKING_RECORD_POINTS}pt 獲得</Text>

            <Text style={styles.label}>日付</Text>
            <DateSelector value={date} onChange={setDate} disableFuture />

            <Text style={styles.label}>食事の時間帯を選択</Text>
            <View style={styles.grid}>
              {MEAL_OPTIONS.map((opt) => {
                const done = selectedDateMeals.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.mealBtn,
                      meal === opt.value && !done && styles.mealBtnActive,
                      done && styles.mealBtnDone,
                    ]}
                    onPress={() => !done && setMeal(opt.value)}
                    activeOpacity={done ? 1 : 0.7}
                  >
                    <Text style={styles.mealIcon}>{opt.icon}</Text>
                    <Text style={[
                      styles.mealText,
                      meal === opt.value && !done && styles.mealTextActive,
                      done && styles.mealTextDone,
                    ]}>
                      {opt.label}
                    </Text>
                    {done && <Text style={styles.doneLabel}>済み</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, selectedDateMeals.includes(meal) && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={selectedDateMeals.includes(meal)}
              >
                <Text style={styles.saveText}>🍳 記録する（+{COOKING_RECORD_POINTS}pt）</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: '92%',
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
    marginTop: 12,
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
  mealBtnDone: {
    borderColor: '#BDBDBD',
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
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
  mealTextDone: {
    color: '#9E9E9E',
  },
  doneLabel: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: -2,
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
  saveBtnDisabled: {
    backgroundColor: '#BDBDBD',
  },
  saveText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
