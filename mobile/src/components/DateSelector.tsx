import { useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  addDaysToDateKey,
  formatDateKey,
  getDaysAgo,
  getCurrentDate,
  isValidDateKey,
} from '@/utils/dateHelpers';

interface Props {
  value: string;
  onChange: (value: string) => void;
  disableFuture?: boolean;
}

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'];

function parseDateKey(value: string): Date {
  if (!isValidDateKey(value)) return new Date();

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function getMonthLabel(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function formatDateForInputDisplay(dateKey: string): string {
  if (!isValidDateKey(dateKey)) return '日付を選択';

  const [year, month, day] = dateKey.split('-').map(Number);
  return `${year}/${month}/${day}`;
}

function getCalendarDates(monthDate: Date): (Date | null)[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDate = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates: (Date | null)[] = [];

  for (let i = 0; i < firstDate.getDay(); i += 1) {
    dates.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    dates.push(new Date(year, month, day));
  }

  while (dates.length % 7 !== 0) {
    dates.push(null);
  }

  return dates;
}

export function DateSelector({ value, onChange, disableFuture = false }: Props) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => parseDateKey(value));
  const isValid = isValidDateKey(value);
  const today = getCurrentDate();
  const quickDates = [
    { label: '今日', value: today },
    { label: '昨日', value: getDaysAgo(1) },
    { label: '一昨日', value: getDaysAgo(2) },
  ];
  const calendarDates = useMemo(() => getCalendarDates(visibleMonth), [visibleMonth]);

  const handleShift = (days: number) => {
    if (!isValid) return;
    onChange(addDaysToDateKey(value, days));
  };

  const handleOpenCalendar = () => {
    setVisibleMonth(parseDateKey(value));
    setIsCalendarOpen(true);
  };

  const handleSelectDate = (dateKey: string) => {
    onChange(dateKey);
    setIsCalendarOpen(false);
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
        <TouchableOpacity
          style={[styles.inputWrap, !isValid && styles.inputWrapError]}
          onPress={handleOpenCalendar}
          activeOpacity={0.75}
        >
          <Text style={styles.dateInput}>{formatDateForInputDisplay(value)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.shiftBtn,
            (!isValid || (disableFuture && value >= today)) && styles.shiftBtnDisabled,
          ]}
          onPress={() => handleShift(1)}
          disabled={!isValid || (disableFuture && value >= today)}
        >
          <Text style={styles.shiftText}>翌日</Text>
        </TouchableOpacity>
      </View>

      {!isValid && (
        <Text style={styles.errorText}>日付は YYYY-MM-DD 形式で入力してください</Text>
      )}

      <Modal
        visible={isCalendarOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsCalendarOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.monthBtn}
                onPress={() => setVisibleMonth((current) => addMonths(current, -1))}
              >
                <Text style={styles.monthBtnText}>＜</Text>
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{getMonthLabel(visibleMonth)}</Text>
              <TouchableOpacity
                style={styles.monthBtn}
                onPress={() => setVisibleMonth((current) => addMonths(current, 1))}
              >
                <Text style={styles.monthBtnText}>＞</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarQuickRow}>
              {quickDates.map((date) => {
                const active = value === date.value;
                return (
                  <TouchableOpacity
                    key={`calendar-${date.label}`}
                    style={[styles.calendarQuickBtn, active && styles.quickBtnActive]}
                    onPress={() => handleSelectDate(date.value)}
                  >
                    <Text style={[styles.quickText, active && styles.quickTextActive]}>
                      {date.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.weekRow}>
              {WEEK_DAYS.map((day) => (
                <Text key={day} style={styles.weekText}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDates.map((date, index) => {
                const dateKey = date ? formatDateKey(date) : `empty-${index}`;
                const selected = date !== null && dateKey === value;
                const isToday = date !== null && dateKey === today;
                const isFuture = disableFuture && date !== null && dateKey > today;

                return (
                  <TouchableOpacity
                    key={dateKey}
                    style={[
                      styles.dayCell,
                      selected && styles.dayCellSelected,
                      isToday && !selected && styles.dayCellToday,
                      isFuture && styles.dayCellDisabled,
                    ]}
                    onPress={() => date && !isFuture && handleSelectDate(dateKey)}
                    disabled={!date || isFuture}
                    activeOpacity={date && !isFuture ? 0.75 : 1}
                  >
                    {date && (
                      <Text style={[
                        styles.dayText,
                        selected && styles.dayTextSelected,
                        isToday && !selected && styles.dayTextToday,
                        isFuture && styles.dayTextDisabled,
                      ]}>
                        {date.getDate()}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsCalendarOpen(false)}
            >
              <Text style={styles.closeBtnText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  errorText: {
    fontSize: 11,
    color: '#F44336',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
  },
  monthBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  monthBtnText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '800',
  },
  calendarQuickRow: {
    flexDirection: 'row',
    gap: 8,
  },
  calendarQuickBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#757575',
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  dayCellToday: {
    backgroundColor: '#F1F8E9',
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayTextDisabled: {
    color: '#BDBDBD',
  },
  dayCellSelected: {
    backgroundColor: '#4CAF50',
  },
  dayText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '600',
  },
  dayTextToday: {
    color: '#2E7D32',
    fontWeight: '800',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  closeBtn: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '700',
  },
});
