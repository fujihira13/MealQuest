import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatPoints } from '@/utils/formatHelpers';

export default function HomeTab() {
  const { userData, goals } = useAppStore();

  const expensePercent = Math.min(
    (userData.monthlyExpense / goals.monthlyExpenseGoal) * 100,
    100
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>今月の食費</Text>
        <Text style={styles.amount}>{formatCurrency(userData.monthlyExpense)}</Text>
        <Text style={styles.subtitle}>目標: {formatCurrency(goals.monthlyExpenseGoal)}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${expensePercent}%` }]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>レベル・ポイント</Text>
        <Text style={styles.level}>Lv.{userData.level}</Text>
        <Text style={styles.points}>{formatPoints(userData.points)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>今月の自炊回数</Text>
        <Text style={styles.amount}>{userData.cookingCount}回</Text>
        <Text style={styles.subtitle}>目標: {goals.cookingGoal}回</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>累計節約額</Text>
        <Text style={styles.amount}>{formatCurrency(userData.totalSavings)}</Text>
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
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
  },
  level: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  points: {
    fontSize: 18,
    color: '#FF9800',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
});
