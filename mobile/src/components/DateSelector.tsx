import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import {
  addDaysToDateKey,
  formatDateForDisplay,
  getDaysAgo,
  getCurrentDate,
  isValidDateKey,
} from '@/utils/dateHelpers';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function DateSelector({ value, onChange }: Props) {
  const isValid = isValidDateKey(value);
  const quickDates = [
    { label: '今日', value: getCurrentDate() },
    { label: '昨日', value: getDaysAgo(1) },
    { label: '一昨日', value: getDaysAgo(2) },
  ];

  const handleShift = (days: number) => {
    if (!isValid) return;
    onChange(addDaysToDateKey(value, days));
  };

  return (
    <View style={styles.container}>
      <View style={styles.quickRow}>
        {quickDates.map((date) => {
          const active = value === date.value;
          return (
            <TouchableOpacity
              key={date.label}
              style={[styles.quickBtn, active && styles.quickBtnActive]}
              onPress={() => onChange(date.value)}
            >
              <Text style={[styles.quickText, active && styles.quickTextActive]}>
                {date.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity
          style={[styles.shiftBtn, !isValid && styles.shiftBtnDisabled]}
          onPress={() => handleShift(-1)}
          disabled={!isValid}
        >
          <Text style={styles.shiftText}>前日</Text>
        </TouchableOpacity>
        <View style={[styles.inputWrap, !isValid && styles.inputWrapError]}>
          <TextInput
            style={styles.dateInput}
            value={value}
            onChangeText={onChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#BDBDBD"
            keyboardType="numbers-and-punctuation"
          />
          {isValid && <Text style={styles.displayDate}>{formatDateForDisplay(value)}</Text>}
        </View>
        <TouchableOpacity
          style={[styles.shiftBtn, !isValid && styles.shiftBtnDisabled]}
          onPress={() => handleShift(1)}
          disabled={!isValid}
        >
          <Text style={styles.shiftText}>翌日</Text>
        </TouchableOpacity>
      </View>

      {!isValid && (
        <Text style={styles.errorText}>日付は YYYY-MM-DD 形式で入力してください</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  quickText: {
    fontSize: 13,
    color: '#424242',
    fontWeight: '600',
  },
  quickTextActive: {
    color: '#2E7D32',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  shiftBtn: {
    minWidth: 52,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftBtnDisabled: {
    opacity: 0.45,
  },
  shiftText: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '700',
  },
  inputWrap: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  inputWrapError: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  dateInput: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '700',
    paddingVertical: 2,
  },
  displayDate: {
    fontSize: 11,
    color: '#757575',
    marginTop: -2,
  },
  errorText: {
    fontSize: 11,
    color: '#F44336',
  },
});
