import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, getCategoryIcon } from '@/utils/formatHelpers';
import { getCurrentMonth, getCurrentDate } from '@/utils/dateHelpers';
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
  const { expenses, cookingRecords, savingsRecords, goals, deleteExpenseRecord } =
    useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [isMonthListOpen, setIsMonthListOpen] = useState(false);

  const currentMonth = getCurrentMonth();
  const today = getCurrentDate();

  const prevMonth = addMonths(selectedMonth, -1);

  // 月一覧（新しい順）: 記録（支出・自炊・節約）がある最も古い月〜当月まで。
  // 記録が1件もなければ当月のみを表示する。未来の月は currentMonth が上限のため出てこない。
  const availableMonths = useMemo(() => {
    const recordedMonths = [
      ...expenses.map((e) => e.date.slice(0, 7)),
      ...cookingRecords.map((r) => r.date.slice(0, 7)),
      ...savingsRecords.map((r) => r.date.slice(0, 7)),
    ];
    const earliestMonth = recordedMonths.reduce(
      (min, m) => (m < min ? m : min),
      currentMonth
    );
    const months: string[] = [];
    let cursor = earliestMonth;
    while (cursor <= currentMonth) {
      months.push(cursor);
      cursor = addMonths(cursor, 1);
    }
    return months.reverse();
  }, [expenses, cookingRecords, savingsRecords, currentMonth]);

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
  //
  // 各週には status を持たせる（'ended' | 'current' | 'upcoming'）。
  // 週の最終日が今日より前なら終了済み、開始日が今日より後ならまだ来ていない、
  // それ以外（今日を含む）は進行中。日付キー同士の文字列比較（YYYY-MM-DD）で判定できる。
  // 過去の月を見ているときは月内の全日が today より前になるため、自然に全週が 'ended' になる。
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
      const startKey = `${selectedMonth}-${String(r.start).padStart(2, '0')}`;
      const endKey = `${selectedMonth}-${String(r.end).padStart(2, '0')}`;
      const status: 'ended' | 'current' | 'upcoming' =
        endKey < today ? 'ended' : startKey > today ? 'upcoming' : 'current';
      return { label: `第${i + 1}週`, amount, status };
    });
  }, [monthExpenses, selectedMonth, today]);

  // 週予算 = 月の予算合計 ÷ その月の週数（4 or 5）
  const weeklyBudget = weeklyData.length > 0 ? totalBudgetGoal / weeklyData.length : 0;

  const monthSavings = useMemo(
    () => savingsRecords.filter((r) => r.date.startsWith(selectedMonth)).reduce((s, r) => s + r.amount, 0),
    [savingsRecords, selectedMonth]
  );

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
        <TouchableOpacity onPress={() => setIsMonthListOpen(true)} activeOpacity={0.7}>
          <Text style={styles.monthLabel}>{getMonthLabel(selectedMonth)}</Text>
        </TouchableOpacity>
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
              {/* 今月（進行中）は月末まで結果が確定しないためパーセントのみ表示。
                  過去の月（確定済み）だけ「予算内」「超過」を表示する。 */}
              {selectedMonth !== currentMonth && (
                <Text style={[styles.circleResult, isOverBudget ? styles.changeBad : styles.changeGood]}>
                  {isOverBudget ? '超過' : '予算内'}
                </Text>
              )}
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

      {/* 週別の食費 — 月内を日付で5区切り（1-7/8-14/15-21/22-28/29-末日）にした週別の表。
          以前はバー表示だったが「意味が分からない」という指摘があり、
          具体的な金額・残り/超過額・判定を横並びで見せる表形式に変更した。 */}
      <View style={styles.card}>
        <View style={styles.weeklyHeaderRow}>
          <Text style={styles.cardTitle}>週別の食費</Text>
          {weeklyBudget > 0 && (
            <Text style={styles.weeklyBudgetLabel}>
              週予算 {formatCurrency(weeklyBudget)}
            </Text>
          )}
        </View>
        {monthExpenses.length === 0 ? (
          <Text style={styles.empty}>まだ記録がありません</Text>
        ) : (
          <View>
            {weeklyData.map((w, i) => {
              const isOver = weeklyBudget > 0 && w.amount > weeklyBudget;
              const remaining = weeklyBudget - w.amount;
              return (
                <View key={i} style={styles.weekRow}>
                  <Text style={styles.weekRowLabel}>{w.label}</Text>
                  <Text style={styles.weekRowAmount}>
                    {w.status === 'upcoming' ? '—' : formatCurrency(w.amount)}
                  </Text>
                  <Text
                    style={[
                      styles.weekRowStatus,
                      w.status === 'ended' && (isOver ? styles.changeBad : styles.changeGood),
                    ]}
                  >
                    {w.status === 'ended' && weeklyBudget > 0
                      ? isOver
                        ? `超過 ${formatCurrency(Math.abs(remaining))}`
                        : `残り ${formatCurrency(remaining)}`
                      : w.status === 'current'
                        ? '今週'
                        : ''}
                  </Text>
                  <Text style={isOver ? styles.weekRowMarkBad : styles.weekRowMarkGood}>
                    {w.status === 'ended' && weeklyBudget > 0 ? (isOver ? '✗' : '✓') : ''}
                  </Text>
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

    {/* 月一覧モーダル — 見た目は DateSelector.tsx のカレンダーモーダルに揃える
        （オーバーレイの濃さ・角丸・ボタンの形など） */}
    <Modal
      visible={isMonthListOpen}
      animationType="fade"
      transparent
      onRequestClose={() => setIsMonthListOpen(false)}
    >
      <View style={styles.monthModalOverlay}>
        <View style={styles.monthModalCard}>
          <Text style={styles.monthModalTitle}>月を選択</Text>
          <ScrollView style={styles.monthListScroll}>
            {availableMonths.map((m) => {
              const active = m === selectedMonth;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.monthListItem, active && styles.monthListItemActive]}
                  onPress={() => {
                    setSelectedMonth(m);
                    setIsMonthListOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.monthListItemText,
                      active && styles.monthListItemTextActive,
                    ]}
                  >
                    {getMonthLabel(m)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={styles.monthModalCloseBtn}
            onPress={() => setIsMonthListOpen(false)}
          >
            <Text style={styles.monthModalCloseBtnText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  weeklyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weeklyBudgetLabel: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 8,
  },
  weekRowLabel: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '600',
    width: 40,
  },
  weekRowAmount: {
    fontSize: 13,
    color: '#212121',
    fontWeight: '700',
    width: 76,
    textAlign: 'right',
  },
  weekRowStatus: {
    fontSize: 11,
    color: '#9E9E9E',
    flex: 1,
    textAlign: 'right',
  },
  weekRowMarkGood: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4CAF50',
    width: 16,
    textAlign: 'center',
  },
  weekRowMarkBad: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F44336',
    width: 16,
    textAlign: 'center',
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
  // 月一覧モーダル — DateSelector.tsx のカレンダーモーダルと同じ見た目
  // （オーバーレイの濃さ・角丸・ボタンの形）に揃えている。
  monthModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  monthModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    maxHeight: '70%',
  },
  monthModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  monthListScroll: {
    flexGrow: 0,
  },
  monthListItem: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  monthListItemActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  monthListItemText: {
    fontSize: 15,
    color: '#424242',
    fontWeight: '600',
  },
  monthListItemTextActive: {
    color: '#2E7D32',
    fontWeight: '800',
  },
  monthModalCloseBtn: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthModalCloseBtnText: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '700',
  },
});
