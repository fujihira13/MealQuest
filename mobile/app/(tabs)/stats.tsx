import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/utils/formatHelpers';
import { getCategoryIcon } from '@/utils/formatHelpers';
import type { ExpenseCategory } from '@/types';

const CATEGORIES: ExpenseCategory[] = [
  'スーパー', '自販機', 'コンビニ', '外食', '飲み会', 'デート', 'その他',
];

export default function StatsTab() {
  const { expenses } = useAppStore();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));

  const byCategory = CATEGORIES.map((cat) => {
    const total = monthlyExpenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return { category: cat, total };
  }).filter((item) => item.total > 0);

  const grandTotal = byCategory.reduce((sum, item) => sum + item.total, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>今月のカテゴリ別支出</Text>
        {byCategory.length === 0 ? (
          <Text style={styles.empty}>まだ記録がありません</Text>
        ) : (
          byCategory.map((item) => (
            <View key={item.category} style={styles.row}>
              <Text style={styles.icon}>{getCategoryIcon(item.category)}</Text>
              <Text style={styles.categoryName}>{item.category}</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { width: `${(item.total / grandTotal) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.categoryAmount}>{formatCurrency(item.total)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>直近7日間の支出</Text>
        {expenses.slice(0, 10).map((expense) => (
          <View key={expense.id} style={styles.expenseRow}>
            <Text style={styles.expenseIcon}>{getCategoryIcon(expense.category)}</Text>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseCategory}>{expense.category}</Text>
              <Text style={styles.expenseDate}>{expense.date}</Text>
            </View>
            <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
          </View>
        ))}
        {expenses.length === 0 && (
          <Text style={styles.empty}>まだ記録がありません</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  empty: {
    color: '#9E9E9E',
    textAlign: 'center',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
    width: 28,
  },
  categoryName: {
    width: 64,
    fontSize: 13,
    color: '#424242',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  categoryAmount: {
    fontSize: 13,
    color: '#212121',
    fontWeight: '500',
    width: 72,
    textAlign: 'right',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  expenseIcon: {
    fontSize: 20,
    width: 32,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#212121',
  },
  expenseDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F44336',
  },
});
