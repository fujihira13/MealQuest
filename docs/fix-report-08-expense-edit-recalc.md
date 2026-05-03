# Fix Report 08 — 支出編集・削除時のバッジ再計算

## ブランチ
`fix/expense-edit-recalc`

## 対応した問題

支出の編集・削除後は `updateMonthlyData()` のみが呼ばれており、
バッジ判定が再実行されなかった。

- カテゴリや日付を変更してもバッジ（consecutive_days など）が更新されなかった
- 支出を削除してもバッジ判定が旧データのまま残る場合があった

## 修正内容

### `mobile/src/store/useAppStore.ts`

`updateExpenseRecord` と `deleteExpenseRecord` の末尾に `checkBadgeProgress()` を追加：

```ts
get().updateMonthlyData();
get().checkBadgeProgress(); // ← 追加
```

**バッジ取り消しなしの方針（ユーザー確認済み）:**
- `checkBadgeProgress()` は未取得バッジを新たに付与するだけで、既取得バッジは削除しない
- 編集・削除でバッジが消えることはない
- 編集・削除後に新たにバッジ条件を満たす場合はその場で付与される

## 実機で確認すべき点

| # | 確認操作 | 期待結果 |
|---|---------|---------|
| 1 | 支出を編集してカテゴリを変更する | ホーム・統計の合計が即座に更新される |
| 2 | 支出を削除する | 月次合計・予算使用率が即座に更新される |
| 3 | 7日分の支出を記録後、1件削除してバッジ画面を確認 | 「継続は力なり」バッジはそのまま（取り消しなし） |
| 4 | 編集後にバッジ条件を新たに満たす場合 | バッジが即座に付与される |

## 検証コマンド

```bash
cd mobile
npm run typecheck  # エラーなし
npm run lint       # エラーなし
```
