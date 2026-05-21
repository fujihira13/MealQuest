import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, getCategoryIcon } from '@/utils/formatHelpers';
import { getCurrentMonth } from '@/utils/dateHelpers';
import { CircularProgress } from '@/components/CircularProgress';
import { PieChart } from '@/components/PieChart';
import { InputModal } from '@/components/InputModal';
import type { ExpenseCategory, ExpenseRecord } from '@/types';

const CATEGORIES: ExpenseCategory[] = [
  'スーパー', '自販機', 'コンビニ', '外食', '飲み会', 'デート', 'その他',
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'スーパー': '#4CAF50', '自販機': '#2196F3', 'コンビニ': '#FF9800',
  '外食': '#9C27B0', '飲み会': '#F44336', 'デート': '#E91E63', 'その他': '#9E9E9E',
};

function getMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-');
  return `${y}年${parseInt(m)}月`;
}

function addMonths(yearMonth: string, delta: number): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const date = new Date(y, m - 1 + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}


export default function StatsTab() {
  const { expenses, cookingRecords, goals, deleteExpenseRecord } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  const currentMonth = getCurrentMonth();

  const prevMonth = addMonths(selectedMonth, -1);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(selectedMonth)),
    [expenses, selectedMonth]
  );
  const prevExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(prevMonth)),
    [expenses, prevMonth]
  );

  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);
  const momChange = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;

  const monthCooking = cookingRecords.filter((r) => r.date.startsWith(selectedMonth));
  const cookingCount = monthCooking.length;
  const savingsEstimate = cookingCount * 700;

  const totalBudgetGoal = goals.monthlyExpenseGoal + goals.allowanceGoal;
  const budgetPercent = totalBudgetGoal > 0 ? Math.min((total / totalBudgetGoal) * 100, 100) : 0;
  const remaining = totalBudgetGoal - total;
  const budgetStatusText = remaining >= 0
    ? `残り ${formatCurrency(remaining)}`
    : `超過 ${formatCurrency(Math.abs(remaining))}`;

  const byCategory = CATEGORIES.map((cat) => ({
    label: cat,
    value: monthExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
    color: CATEGORY_COLORS[cat],
  })).filter((d) => d.value > 0);

  const dailyData = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, '0');
      const date = `${selectedMonth}-${day}`;
      const amount = monthExpenses
        .filter((e) => e.date === date)
        .reduce((s, e) => s + e.amount, 0);
      return { label: `${i + 1}`, value: amount };
    });
  }, [monthExpenses, selectedMonth]);

  const insights = useMemo(() => {
    const result: { icon: string; text: string; sub: string }[] = [];
    if (momChange !== null) {
      if (momChange < 0) {
        result.push({ icon: '📉', text: '食費が節約できています', sub: `前月比 ${momChange}%` });
      } else if (momChange > 10) {
        result.push({ icon: '📈', text: '食費が増えています', sub: `前月比 +${momChange}%` });
      }
    }
    if (cookingCount > 10) {
      result.push({ icon: '🍳', text: '自炊ペースが良好です', sub: `今月 ${cookingCount}回達成` });
    }
    const conbini = byCategory.find((d) => d.label === 'コンビニ');
    const prevConbini = prevExpenses
      .filter((e) => e.category === 'コンビニ')
      .reduce((s, e) => s + e.amount, 0);
    if (conbini && prevConbini > 0 && conbini.value < prevConbini) {
      result.push({ icon: '🏪', text: 'コンビニ支出が減少', sub: `先月比 -${formatCurrency(prevConbini - conbini.value)}` });
    }
    return result.slice(0, 3);
  }, [momChange, cookingCount, byCategory, prevExpenses]);

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* 月ナビゲーション */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => setSelectedMonth(addMonths(selectedMonth, -1))}>
          <Text style={styles.navArrow}>{'＜'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{getMonthLabel(selectedMonth)}</Text>
        <TouchableOpacity
          onPress={() => {
            if (selectedMonth < currentMonth) setSelectedMonth(addMonths(selectedMonth, 1));
          }}
          disabled={selectedMonth >= currentMonth}
        >
          <Text style={[styles.navArrow, selectedMonth >= currentMonth && styles.navArrowDisabled]}>
            {'＞'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* サマリー — 1段目: 食費合計 大きく */}
      <View style={[styles.card, styles.alignCenter]}>
        <Text style={styles.summaryLabel}>食費合計</Text>
        <Text style={styles.summaryAmountLarge}>{formatCurrency(total)}</Text>
        {momChange !== null && (
          <Text style={[styles.summaryChange, momChange < 0 ? styles.changeGood : styles.changeBad]}>
            前月比 {momChange > 0 ? '+' : ''}{momChange}%{momChange < 0 ? '↓' : '↑'}
          </Text>
        )}
      </View>

      {/* サマリー — 2段目: 自炊回数 + 予算使用率 */}
      <View style={styles.row}>
        <View style={[styles.card, styles.flex1, styles.alignCenter]}>
          <Text style={styles.summaryLabel}>自炊回数</Text>
          <Text style={styles.summaryAmount}>{cookingCount}回</Text>
          <Text style={styles.summaryChange}>節約 {formatCurrency(savingsEstimate)}</Text>
        </View>
        <View style={[styles.card, styles.flex1, styles.alignCenter]}>
          <Text style={styles.summaryLabel}>予算使用率</Text>
          <CircularProgress
            percent={100 - budgetPercent}
            size={56}
            strokeWidth={6}
            color={budgetPercent >= 90 ? '#F44336' : '#4CAF50'}
          >
            <Text style={styles.circleSmall}>{Math.round(budgetPercent)}%</Text>
          </CircularProgress>
          <Text style={[styles.summaryChange, remaining < 0 && styles.changeBad]}>
            {budgetStatusText}
          </Text>
        </View>
      </View>

      {/* グラフ行 */}
      <View style={styles.row}>
        <View style={[styles.card, styles.flex1]}>
          <Text style={styles.cardTitle}>カテゴリー別</Text>
          <PieChart data={byCategory} size={110} />
          <View style={styles.legend}>
            {byCategory.map((d) => (
              <View key={d.label} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                <Text style={styles.legendLabel}>{d.label}</Text>
                <Text style={styles.legendVal}>{formatCurrency(d.value)}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={[styles.card, styles.flex1]}>
          <Text style={styles.cardTitle}>日別推移</Text>
          {monthExpenses.length === 0 ? (
            <Text style={styles.empty}>まだ記録がありません</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.barChartScroll}
            >
              <View style={styles.barChartContainer}>
                {(() => {
                  const maxVal = Math.max(...dailyData.map((d) => d.value), 1);
                  return dailyData.map((d) => {
                    const heightPct = d.value / maxVal;
                    const barH = Math.max(Math.round(heightPct * 80), d.value > 0 ? 4 : 0);
                    return (
                      <View key={d.label} style={styles.barCol}>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                height: barH,
                                backgroundColor: heightPct > 0.8 ? '#F44336' : '#4CAF50',
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.barLabel}>{d.label}</Text>
                      </View>
                    );
                  });
                })()}
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      {/* 今月の気づき */}
      {insights.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 今月の気づき</Text>
          {insights.map((ins, i) => (
            <View key={i} style={styles.insightRow}>
              <Text style={styles.insightIcon}>{ins.icon}</Text>
              <View style={styles.flex1}>
                <Text style={styles.insightText}>{ins.text}</Text>
                <Text style={styles.insightSub}>{ins.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 支出リスト */}
      {monthExpenses.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>支出記録</Text>
          {(showAllExpenses ? monthExpenses : monthExpenses.slice(0, 8)).map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.expRow}
              onPress={() => setEditingExpense(e)}
              activeOpacity={0.7}
            >
              <Text style={styles.expIcon}>{getCategoryIcon(e.category)}</Text>
              <View style={styles.flex1}>
                <Text style={styles.expCat}>{e.category}</Text>
                <Text style={styles.expDate}>{e.date}</Text>
              </View>
              <Text style={styles.expAmt}>{formatCurrency(e.amount)}</Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() =>
                  Alert.alert('削除確認', `${e.category} ${formatCurrency(e.amount)} を削除しますか？`, [
                    { text: 'キャンセル', style: 'cancel' },
                    { text: '削除', style: 'destructive', onPress: () => deleteExpenseRecord(e.id) },
                  ])
                }
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          {monthExpenses.length > 8 && (
            <TouchableOpacity
              style={styles.showMoreBtn}
              onPress={() => setShowAllExpenses((v) => !v)}
            >
              <Text style={styles.showMoreText}>
                {showAllExpenses
                  ? '折りたたむ'
                  : `もっと見る（残り ${monthExpenses.length - 8} 件）`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

    </ScrollView>

    <InputModal
      key={editingExpense?.id ?? 'edit'}
      visible={editingExpense !== null}
      initialCategory={editingExpense?.category ?? null}
      editingRecord={editingExpense}
      onClose={() => setEditingExpense(null)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 12,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  alignCenter: {
    alignItems: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 4,
  },
  navArrow: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#424242',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#757575',
  },
  summaryAmountLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: '#212121',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#212121',
  },
  navArrowDisabled: {
    color: '#E0E0E0',
  },
  showMoreBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    marginTop: 4,
  },
  showMoreText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  summaryChange: {
    fontSize: 11,
    color: '#757575',
  },
  changeGood: {
    color: '#4CAF50',
  },
  changeBad: {
    color: '#F44336',
  },
  circleSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: '#212121',
  },
  legend: {
    gap: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: '#424242',
    flex: 1,
  },
  legendVal: {
    fontSize: 10,
    color: '#212121',
    fontWeight: '600',
  },
  empty: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    paddingVertical: 8,
  },
  barChartScroll: {
    marginTop: 4,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 2,
    gap: 3,
  },
  barCol: {
    alignItems: 'center',
    width: 14,
  },
  barTrack: {
    height: 80,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: 10,
    borderRadius: 3,
  },
  barLabel: {
    fontSize: 8,
    color: '#9E9E9E',
    marginTop: 3,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  insightIcon: {
    fontSize: 20,
  },
  insightText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
  insightSub: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 8,
  },
  expIcon: {
    fontSize: 18,
    width: 28,
  },
  expCat: {
    fontSize: 13,
    color: '#212121',
  },
  expDate: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  expAmt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F44336',
  },
  deleteBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  deleteBtnText: {
    fontSize: 16,
  },
});
