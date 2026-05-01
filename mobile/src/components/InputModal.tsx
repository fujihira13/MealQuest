import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import type { ExpenseCategory, MealTime } from '@/types';

const CATEGORIES: ExpenseCategory[] = [
  'スーパー', '自販機', 'コンビニ', '外食', '飲み会', 'デート', 'その他',
];

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  'スーパー': '🛒', '自販機': '🥤', 'コンビニ': '🏪',
  '外食': '🍽️', '飲み会': '🍻', 'デート': '💕', 'その他': '📝',
};

const MEAL_OPTIONS: { value: MealTime; label: string }[] = [
  { value: 'morning', label: '朝食' },
  { value: 'lunch', label: '昼食' },
  { value: 'dinner', label: '夕食' },
  { value: 'snack', label: '間食' },
];

interface Props {
  visible: boolean;
  initialCategory: ExpenseCategory | null;
  onClose: () => void;
}

export function InputModal({ visible, initialCategory, onClose }: Props) {
  const { addExpenseRecord } = useAppStore();
  const [category, setCategory] = useState<ExpenseCategory>(initialCategory ?? 'その他');
  const [amount, setAmount] = useState('');
  const [meal, setMeal] = useState<MealTime>('lunch');

  const handleCategoryChange = (cat: ExpenseCategory) => {
    setCategory(cat);
    if (cat === 'スーパー') setMeal('lunch');
  };

  const handleSave = () => {
    const parsed = parseInt(amount, 10);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      Alert.alert('入力エラー', '金額を正しく入力してください');
      return;
    }
    const finalMeal: MealTime = category === 'スーパー' ? 'lunch' : meal;
    addExpenseRecord(category, parsed, finalMeal);
    setAmount('');
    setMeal('lunch');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>食費を記録する</Text>

          {/* カテゴリー選択 */}
          <Text style={styles.label}>カテゴリー</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                onPress={() => handleCategoryChange(cat)}
              >
                <Text style={styles.categoryIcon}>{CATEGORY_ICONS[cat]}</Text>
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 金額入力 */}
          <Text style={styles.label}>金額（円）</Text>
          <View style={styles.amountRow}>
            <Text style={styles.yen}>¥</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#BDBDBD"
            />
          </View>

          {/* 食事時間 */}
          {category !== 'スーパー' && (
            <>
              <Text style={styles.label}>食事の時間帯</Text>
              <View style={styles.mealRow}>
                {MEAL_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.mealBtn, meal === opt.value && styles.mealBtnActive]}
                    onPress={() => setMeal(opt.value)}
                  >
                    <Text style={[styles.mealText, meal === opt.value && styles.mealTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* ボタン行 */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>記録する</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 8,
    marginTop: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  categoryBtnActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 13,
    color: '#424242',
  },
  categoryTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  yen: {
    fontSize: 20,
    color: '#424242',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    paddingVertical: 10,
  },
  mealRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mealBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  mealBtnActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  mealText: {
    fontSize: 13,
    color: '#424242',
  },
  mealTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
    fontSize: 15,
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
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
