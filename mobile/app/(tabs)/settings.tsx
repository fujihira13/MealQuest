import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/utils/formatHelpers';

export default function SettingsTab() {
  const { goals, updateGoals, resetAllData } = useAppStore();

  const handleReset = () => {
    Alert.alert(
      'データをリセット',
      '全てのデータが削除されます。本当によろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            Alert.alert('完了', 'データをリセットしました');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>月間目標設定</Text>
        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>食費目標</Text>
          <Text style={styles.goalValue}>{formatCurrency(goals.monthlyExpenseGoal)}</Text>
        </View>
        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>おこづかい目標</Text>
          <Text style={styles.goalValue}>{formatCurrency(goals.allowanceGoal)}</Text>
        </View>
        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>自炊目標</Text>
          <Text style={styles.goalValue}>{goals.cookingGoal}回</Text>
        </View>
        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>節約目標</Text>
          <Text style={styles.goalValue}>{formatCurrency(goals.monthlySavingsGoal)}</Text>
        </View>
        <Text style={styles.hint}>※ 目標変更機能は近日実装予定</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>アプリ情報</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>バージョン</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ストレージ</Text>
          <Text style={styles.infoValue}>端末ローカル</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>⚠️ 全データをリセット</Text>
      </TouchableOpacity>
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
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  goalLabel: {
    fontSize: 14,
    color: '#424242',
  },
  goalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  hint: {
    fontSize: 12,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#424242',
  },
  infoValue: {
    fontSize: 14,
    color: '#757575',
  },
  resetButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  resetButtonText: {
    color: '#F44336',
    fontSize: 15,
    fontWeight: '600',
  },
});
