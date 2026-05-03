# Fix Report 04 — 自炊記録モーダルの日付初期化と支出金額バリデーション

## ブランチ
`fix/cooking-modal-date-validation`

## 対応した問題

### 1. 自炊記録モーダルが前回の日付を引き継ぐ問題

`CookingModal` の `date` は `useState(getCurrentDate())` で初期化されるが、
モーダルを閉じてもコンポーネントは再マウントされないため、
過去日を選んで閉じた後、次回も同じ日付が残る。

### 2. 支出金額に `100abc` のような文字列が通る問題

`parseInt(amount, 10)` は `"100abc"` を `100` と解釈するため、
数字以外の文字を含む入力が保存される可能性があった。

## 修正内容

### `mobile/src/components/CookingModal.tsx`

`visible` が `true` になったタイミングで `date` と `meal` をリセットする useEffect を追加：

```tsx
useEffect(() => {
  if (visible) {
    setDate(getCurrentDate());
    setMeal(defaultMeal(todayMeals));
  }
}, [visible]);
```

### `mobile/src/components/InputModal.tsx`

バリデーションを `/^\d+$/` 正規表現 + `Number.isSafeInteger` に変更：

```ts
// Before
const parsed = parseInt(amount, 10);
if (!amount || isNaN(parsed) || parsed <= 0) { ... }

// After
if (!amount || !/^\d+$/.test(amount)) { ... }
const parsed = Number(amount);
if (parsed <= 0 || !Number.isSafeInteger(parsed)) { ... }
```

これにより `"100abc"` は正規表現で弾かれ、
`9007199254740992` などの巨大な数値も `isSafeInteger` で弾かれる。

## 実機で確認すべき点

| # | 確認操作 | 期待結果 |
|---|---------|---------|
| 1 | 自炊記録で昨日を選択して「キャンセル」後、再度モーダルを開く | 日付が今日に戻っている |
| 2 | 自炊記録で昨日を選択して「記録する」後、再度モーダルを開く | 日付が今日に戻っている |
| 3 | 支出入力で「100abc」と入力して保存 | エラーアラートが出て保存されない |
| 4 | 支出入力で「0」と入力して保存 | エラーアラートが出て保存されない |
| 5 | 支出入力で「1000」と入力して保存 | 正常に保存される |
| 6 | 支出入力で空欄のまま保存 | エラーアラートが出て保存されない |

## 検証コマンド

```bash
cd mobile
npm run typecheck  # エラーなし
npm run lint       # エラーなし
```
