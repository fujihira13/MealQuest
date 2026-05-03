# Fix Report 03 — バッジ判定の修正

## ブランチ
`fix/badge-logic`

## 対応した問題

`checkBadgeProgress` に2つのロジック不備があった。

### 1. `consecutive_days` 判定が常に true に近い状態だった

**Before:**
```ts
case "consecutive_days":
  shouldEarn = state.expenses.length > 0 || state.cookingRecords.length > 0;
```
記録が1件でもあれば「7日連続記録」バッジが取得できてしまっていた。

### 2. `monthly_goal_achieved` が設定値ではなくハードコードの固定値を見ていた

**Before:**
```ts
case "monthly_goal_achieved":
  shouldEarn =
    state.userData.monthlyExpense <= 25000 &&
    state.userData.cookingCount >= 20 &&
    state.userData.allowanceUsed <= 15000;
```
設定画面で予算を変更しても、バッジ判定が変わらなかった。

## 修正内容

### `mobile/src/store/useAppStore.ts`

**`consecutive_days` を連続日数計算に変更:**
1. expenses と cookingRecords の date を Set で重複排除
2. 日付を昇順ソートし、隣り合う日付の差が1日（86400000ms）か確認
3. 最大連続ストリークを計算し、`req.value` 以上で達成

**`monthly_goal_achieved` を goals 参照に変更:**
```ts
case "monthly_goal_achieved":
  shouldEarn =
    state.userData.monthlyExpense <= state.goals.monthlyExpenseGoal &&
    state.userData.cookingCount >= state.goals.cookingGoal &&
    state.userData.allowanceUsed <= state.goals.allowanceGoal;
```

## 実機で確認すべき点

| # | 確認操作 | 期待結果 |
|---|---------|---------|
| 1 | 今日だけ支出記録してバッジ画面を確認 | 「継続は力なり（7日連続記録）」バッジは獲得されない |
| 2 | 7日連続で支出または自炊を記録してバッジ確認 | 「継続は力なり」バッジが獲得される |
| 3 | 設定で月間食費予算を30000円に変更し、今月26000円使ってバッジ確認 | 予算内でも「目標達成者」バッジが条件を満たしていれば獲得される |
| 4 | 設定で月間食費予算をデフォルト（25000円）に戻して確認 | もとの基準で判定される |
| 5 | 途中で連続が途切れた場合（例: 3日、休み、4日） | 最大7日連続にならないため「継続は力なり」は取れない |

## 検証コマンド

```bash
cd mobile
npm run typecheck  # エラーなし
npm run lint       # エラーなし
```
