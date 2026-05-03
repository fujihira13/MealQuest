# Fix Report 10 — CSV・仕上げ・ブランド名・アクセシビリティ関連

## ブランチ
`fix/misc-polish`

## 対応した問題（監査番号 #10, #13, #27, #29, #30）

小規模な仕上げ修正を一括対応。

## 修正内容

### `mobile/app/(tabs)/settings.tsx`

**CSV 二重タップ防止（#13）:**
- `isExporting` state を追加
- 書き出し中はボタンを `disabled` + 「書き出し中...」テキスト表示
- `finally` で必ず `isExporting` を `false` に戻す
- 通知スイッチも「近日対応予定」バッジに統一（グループ5の内容をこのブランチにも適用）

### `mobile/src/components/CircularProgress.tsx`

**下限 clamp の追加（#30）:**
```ts
const clampedPercent = Math.max(0, Math.min(percent, 100));
```
負値が入っても描画崩れが起きなくなった。

### `mobile/src/utils/calculationHelpers.ts`

**`calculateBudgetPercent` を削除（#29）:**
- 「remaining / goal」を返す helper で、現在の使用率計算とは意味が逆
- どこからもインポートされていなかったため削除

### `mobile/src/components/AppHeader.tsx`

**ブランド名を MealQuest に統一（#27）:**
- `「節約マスター」` → `「MealQuest」`

### `mobile/src/store/useAppStore.ts`

**ストリークリセット条件の分離（#10）:**

Before: コンビニ or 自販機のカテゴリで **両方**（noWaste + snackFree）をリセット

After:
- `noWasteStreak` リセット: カテゴリが「コンビニ」または「自販機」の場合のみ
- `snackFreeStreak` リセット: `meal === 'snack'` の場合のみ（カテゴリ関係なし）

### `mobile/src/components/DateSelector.tsx`

**未来日禁止（#16）:**
- `disableFuture` prop を追加（デフォルト `false`）
- `true` の場合: カレンダーの未来日をグレーアウト・タップ不可
- `翌日` ボタンも今日以降は無効化

### `mobile/src/components/InputModal.tsx` / `CookingModal.tsx`

- `<DateSelector disableFuture />` を渡して未来日入力を防止

## 実機で確認すべき点

| # | 確認操作 | 期待結果 |
|---|---------|---------|
| 1 | CSV書き出しボタンを連打する | 「書き出し中...」になり2回目以降は反応しない |
| 2 | CSV書き出し完了後 | ボタンが「書き出す」に戻る |
| 3 | ヘッダーのアプリ名を確認 | 「MealQuest」と表示される |
| 4 | 支出入力のカレンダーで明日以降をタップ | タップできない（グレーアウト） |
| 5 | 支出入力で「翌日」ボタンを今日に確認 | 「翌日」がグレーアウト・無効 |
| 6 | 自炊記録のカレンダーで未来日確認 | 同様にタップできない |
| 7 | コンビニで snack 食費を記録 | noWasteStreak と snackFreeStreak 両方がリセットされる |
| 8 | コンビニで dinner 食費を記録 | noWasteStreak のみリセット、snackFreeStreak は変わらない |
| 9 | スーパーで snack 食費を記録 | snackFreeStreak のみリセット、noWasteStreak は変わらない |

## 検証コマンド

```bash
cd mobile
npm run typecheck  # エラーなし
npm run lint       # エラーなし
```
