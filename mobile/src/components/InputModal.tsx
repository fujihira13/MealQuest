import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { DateSelector } from '@/components/DateSelector';
import { getCurrentDate, isValidDateKey, isToday, formatDateForDisplay } from '@/utils/dateHelpers';
import { CATEGORY_LIST, CATEGORY_ICONS } from '@/constants/categories';
import type { ExpenseCategory, ExpenseRecord, MealTime } from '@/types';

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
  editingRecord?: ExpenseRecord | null;
}

export function InputModal({ visible, initialCategory, onClose, editingRecord = null }: Props) {
  const { addExpenseRecord, updateExpenseRecord } = useAppStore();
  const isEditing = editingRecord !== null;

  const [category, setCategory] = useState<ExpenseCategory>(
    editingRecord?.category ?? initialCategory ?? 'その他'
  );
  const [amount, setAmount] = useState(editingRecord?.amount?.toString() ?? '');
  const [meal, setMeal] = useState<MealTime>(editingRecord?.meal ?? 'lunch');
  const [date, setDate] = useState(editingRecord?.date ?? getCurrentDate());
  const [isDateExpanded, setIsDateExpanded] = useState(false);

  const handleCategoryChange = (cat: ExpenseCategory) => {
    setCategory(cat);
    if (cat === 'スーパー') setMeal('lunch');
  };

  const handleSave = () => {
    if (!amount || !/^\d+$/.test(amount)) {
      Alert.alert('入力エラー', '金額を正しく入力してください');
      return;
    }
    const parsed = Number(amount);
    if (parsed <= 0 || !Number.isSafeInteger(parsed)) {
      Alert.alert('入力エラー', '金額を正しく入力してください');
      return;
    }
    if (!isValidDateKey(date)) {
      Alert.alert('入力エラー', '日付を YYYY-MM-DD 形式で入力してください');
      return;
    }
    const finalMeal: MealTime = category === 'スーパー' ? 'lunch' : meal;
    if (isEditing) {
      updateExpenseRecord(editingRecord.id, category, parsed, finalMeal, date);
    } else {
      addExpenseRecord(category, parsed, finalMeal, date);
    }
    onClose();
  };

  const dateSummaryLabel = isValidDateKey(date)
    ? isToday(date)
      ? '今日'
      : formatDateForDisplay(date)
    : '日付を選択';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {isEditing && (
            <View style={styles.editingBadge}>
              <Text style={styles.editingBadgeText}>編集中</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.closeIconBtn}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>

          {/* 固定領域: カテゴリー見出し・金額入力（ScrollView の外） */}
          <View style={styles.fixedTop}>
            {/* カテゴリー見出し（新規入力時のみ。編集時はグリッドが ScrollView 側に表示される） */}
            {!isEditing && (
              <View style={styles.categoryHeaderRow}>
                <Text style={styles.categoryHeaderIcon}>{CATEGORY_ICONS[category]}</Text>
                <Text style={styles.categoryHeaderText}>{category}</Text>
                {category === 'スーパー' && (
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>食材費</Text>
                  </View>
                )}
              </View>
            )}

            {/* 金額入力 */}
            <View style={styles.amountSection}>
              <View style={styles.amountRow}>
                <Text style={styles.yen}>¥</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#BDBDBD"
                  autoFocus
                />
              </View>
              <View style={styles.amountUnderline} />
            </View>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* カテゴリー選択グリッド（編集時のみ） */}
            {isEditing && (
              <View style={styles.categoryGrid}>
                {CATEGORY_LIST.map((cat) => (
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
            )}

            {/* 食事時間 */}
            {category !== 'スーパー' && (
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
            )}

            {/* 日付（折りたたみ） */}
            <View style={styles.dateSection}>
              <TouchableOpacity
                style={styles.dateSummaryRow}
                onPress={() => setIsDateExpanded((prev) => !prev)}
                activeOpacity={0.75}
              >
                <Text style={styles.dateSummaryText}>{'\u{1F4C5}'} {dateSummaryLabel}</Text>
                <Text style={styles.dateSummaryChevron}>{isDateExpanded ? '▲' : '▾'}</Text>
              </TouchableOpacity>
              {isDateExpanded && (
                <View style={styles.dateExpandedWrap}>
                  <DateSelector value={date} onChange={setDate} disableFuture />
                </View>
              )}
            </View>
          </ScrollView>

          {/* フッター（スクロール領域の外に固定） */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>{isEditing ? '更新する' : '記録する'}</Text>
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
    maxHeight: '92%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  closeIconBtn: {
    position: 'absolute',
    top: 10,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '700',
  },
  scrollArea: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  fixedTop: {
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  editingBadge: {
    position: 'absolute',
    top: 10,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },
  editingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  categoryHeaderIcon: {
    fontSize: 22,
  },
  categoryHeaderText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
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
  amountSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  yen: {
    fontSize: 22,
    color: '#757575',
    marginRight: 4,
  },
  amountInput: {
    minWidth: 120,
    fontSize: 40,
    fontWeight: '800',
    color: '#212121',
    paddingVertical: 4,
    textAlign: 'center',
  },
  amountUnderline: {
    width: 160,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#4CAF50',
    marginTop: 4,
  },
  mealRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
  dateSection: {
    marginBottom: 4,
  },
  dateSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  dateSummaryText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '600',
  },
  dateSummaryChevron: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  dateExpandedWrap: {
    marginTop: 10,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  saveBtn: {
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
