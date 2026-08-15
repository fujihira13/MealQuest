import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, getCategoryIcon } from '@/utils/formatHelpers';
import { getCurrentMonth } from '@/utils/dateHelpers';
import { CircularProgress } from '@/components/CircularProgress';
import { PieChart } from '@/components/PieChart';
import { InputModal } from '@/components/InputModal';
import { CATEGORY_LIST, CATEGORY_COLORS } from '@/constants/categories';
import type { ExpenseRecord } from '@/types';

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
  const { expenses, cookingRecords, savingsRecords, savingsEquivalents, goals, deleteExpenseRecord } =
    useAppStore();
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
  const rawBudgetPercent = totalBudgetGoal > 0 ? (total / totalBudgetGoal) * 100 : 0;
  const budgetPercent = Math.min(rawBudgetPercent, 100);
  const isOverBudget = rawBudgetPercent > 100;
  const remaining = totalBudgetGoal - total;
  const budgetStatusText = remaining >= 0
    ? `残り ${formatCurrency(remaining)}`
    : `超過 ${formatCurrency(Math.abs(remaining))}`;

  const byCategory = CATEGORY_LIST.map((cat) => ({
    label: cat,
    value: monthExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
    color: CATEGORY_COLORS[cat],
  })).filter((d) => d.value > 0);

  // 月内の日付を5区切り（1-7, 8-14, 15-21, 22-28, 29-末日）にした週別集計。
  // カレンダー週（日曜始まり）ではなく月内の日付レンジで区切ることで、
  // 月をまたがず「第1週」〜「第5週」のラベルが自然になる。
  // 29日以降が存在しない月（2月など）は第5週を作らない。
  const weeklyData = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const ranges = [
      { start: 1, end: 7 },
      { start: 8, end: 14 },
      { start: 15, end: 21 },
      { start: 22, end: 28 },
    ];
    if (daysInMonth >= 29) {
      ranges.push({ start: 29, end: daysInMonth });
    }
    return ranges.map((r, i) => {
      const amount = monthExpenses
        .filter((e) => {
          const day = parseInt(e.date.split('-')[2], 10);
          return day >= r.start && day <= r.end;
        })
        .reduce((s, e) => s + e.amount, 0);
      return { label: `第${i + 1}週`, amount };
    });
  }, [monthExpenses, selectedMonth]);

  // 週予算 = 月の予算合計 ÷ その月の週数（4 or 5）
  const weeklyBudget = weeklyData.length > 0 ? totalBudgetGoal / weeklyData.length : 0;
  const maxWeekly = Math.max(...weeklyData.map((w) => w.amount), weeklyBudget, 1);

  const monthSavings = useMemo(
    () => savingsRecords.filter((r) => r.date.startsWith(selectedMonth)).reduce((s, r) => s + r.amount, 0),
    [savingsRecords, selectedMonth]
  );

  // 節約額「以下」で最大の項目を、身近な物への言い換えとして採用する
  const savingsEquivalentMatch = useMemo(() => {
    const candidates = savingsEquivalents.filter((eq) => eq.amount <= monthSavings);
    if (candidates.length === 0) return null;
    return candidates.reduce((max, eq) => (eq.amount > max.amount ? eq : max));
  }, [monthSavings, savingsEquivalents]);

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
      result.push({ icon: '🍳', text: '自炊ペースが良好です', sub: `${cookingCount}回達成` });
    }
    const conbini = byCategory.find((d) => d.label === 'コンビニ');
    const prevConbini = prevExpenses
      .filter((e) => e.category === 'コンビニ')
      .reduce((s, e) => s + e.amount, 0);
    if (conbini && prevConbini > 0 && conbini.value < prevConbini) {
      result.push({ icon: '🏪', text: 'コンビニ支出が減少', sub: `前月比 -${formatCurrency(prevConbini - conbini.value)}` });
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
            size={64}
            strokeWidth={6}
            color={isOverBudget ? '#F44336' : '#4CAF50'}
          >
            <View style={styles.alignCenter}>
              <Text style={styles.circleSmall}>{Math.round(budgetPercent)}%</Text>
              <Text style={[styles.circleResult, isOverBudget ? styles.changeBad : styles.changeGood]}>
                {isOverBudget ? '超過' : '達成 🎉'}
              </Text>
            </View>
          </CircularProgress>
          <Text style={[styles.summaryChange, remaining < 0 && styles.changeBad]}>
            {budgetStatusText}
          </Text>
        </View>
      </View>

      {/* 節約カード — savingsRecords はこれまでどの画面にも表示されていなかったため新設。
          月合計を大きく見せたいので、支出合計・自炊/予算使用率と同じ「サマリー群」の並びに置く。
          記録が1件もない月はカードごと非表示にする（他のセクションと同じ「空なら隠す」方針に合わせた）。 */}
      {monthSavings > 0 && (
        <View style={[styles.card, styles.alignCenter]}>
          <Text style={styles.summaryLabel}>今月の節約</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(monthSavings)}</Text>
          {savingsEquivalentMatch && (
            <Text style={styles.savingsEquivalentText}>
              = {savingsEquivalentMatch.item} {savingsEquivalentMatch.icon}
            </Text>
          )}
        </View>
      )}

      {/* カテゴリー別内訳 */}
      <View style={styles.card}>
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

      {/* 週別推移 — 月内を日付で5区切り（1-7/8-14/15-21/22-28/29-末日）にした週別バー。
          全日分（最大31本）の横スクロールバーは1本10px程度で傾向が読めなかったため、
          5本のバーが1画面に収まる形に変更。週予算ラインとの比較で「勝敗」を一目で示す。 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>週別推移</Text>
        {monthExpenses.length === 0 ? (
          <Text style={styles.empty}>まだ記録がありません</Text>
        ) : (
          <View style={styles.weeklyChartRow}>
            {weeklyData.map((w, i) => {
              const heightPct = maxWeekly > 0 ? w.amount / maxWeekly : 0;
              const barH = Math.max(Math.round(heightPct * 70), w.amount > 0 ? 4 : 0);
              const isOver = weeklyBudget > 0 && w.amount > weeklyBudget;
              const budgetLineBottom =
                weeklyBudget > 0 ? Math.min(Math.round((weeklyBudget / maxWeekly) * 70), 70) : null;
              return (
                <View key={i} style={styles.weekCol}>
                  <Text style={styles.weekAmount} numberOfLines={1}>
                    {formatCurrency(w.amount)}
                  </Text>
                  <View style={styles.weekTrack}>
                    {budgetLineBottom !== null && (
                      <View style={[styles.weekBudgetLine, { bottom: budgetLineBottom }]} />
                    )}
                    <View
                      style={[
                        styles.weekBarFill,
                        { height: barH, backgroundColor: isOver ? '#F44336' : '#4CAF50' },
                      ]}
                    />
                  </View>
                  <Text style={styles.weekLabel}>{w.label}</Text>
                  {weeklyBudget > 0 && (
                    <Text style={isOver ? styles.weekMarkBad : styles.weekMarkGood}>
                      {isOver ? '✗' : '✓'}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* 今月の気づき */}
      {insights.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 {getMonthLabel(selectedMonth)}の気づき</Text>
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
  circleResult: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  savingsEquivalentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
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
  weeklyChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  weekCol: {
    alignItems: 'center',
    flex: 1,
  },
  weekAmount: {
    fontSize: 9,
    color: '#424242',
    fontWeight: '600',
    marginBottom: 2,
  },
  weekTrack: {
    height: 70,
    width: '70%',
    justifyContent: 'flex-end',
  },
  weekBudgetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#9E9E9E',
    borderStyle: 'dashed',
  },
  weekBarFill: {
    width: '100%',
    borderRadius: 3,
  },
  weekLabel: {
    fontSize: 9,
    color: '#9E9E9E',
    marginTop: 3,
  },
  weekMarkGood: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 1,
  },
  weekMarkBad: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F44336',
    marginTop: 1,
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
