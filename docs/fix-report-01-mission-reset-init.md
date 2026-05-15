# Fix Report 01 — ミッション初期化/リセットの修正

## ブランチ
`fix/mission-reset-init`

## 対応した問題

`mobile/app/_layout.tsx` の `useEffect` 内で、`resetDailyMissions()` / `resetWeeklyMissions()` を呼び出した後、
リセット前に取得した stale な `missions` を参照して生成判定していた。

結果として、日付や週が変わった後にアプリを起動すると
ミッションが空のまま「ミッションがありません」と表示されることがあった。

## 修正内容

### `mobile/src/store/useAppStore.ts`

`initializeMissions()` アクションを追加。以下を1つの原子的操作に統合：

1. デイリーリセット判定（`lastDailyReset !== today`）→ `daily: {}` にクリア
2. ウィークリーリセット判定（`lastWeeklyReset !== weekKey`）→ `weekly: {}` にクリア
3. `daily` が空なら新しいデイリーミッション3種を生成
4. `weekly` が空なら新しいウィークリーミッション3種を生成
5. 単一の `set()` でまとめて更新

`get()` で**呼び出し時点の最新 state** を読むため、stale closure の問題が発生しない。

### `mobile/app/_layout.tsx`

`useEffect` を単純化：

**Before:**
```tsx
const { resetDailyMissions, resetWeeklyMissions, generateDailyMissions, generateWeeklyMissions, missions } = useAppStore();
useEffect(() => {
  resetDailyMissions();
  resetWeeklyMissions();
  if (Object.keys(missions.daily).length === 0) { generateDailyMissions(); }
  if (Object.keys(missions.weekly).length === 0) { generateWeeklyMissions(); }
}, []);
```

**After:**
```tsx
const { initializeMissions } = useAppStore();
useEffect(() => {
  initializeMissions();
}, []);
```

## 実機で確認すべき点

| # | 確認操作 | 期待結果 |
|---|---------|---------|
| 1 | アプリを初回起動する | ミッション画面にデイリー3件・ウィークリー3件が表示される |
| 2 | 端末の日付を翌日に変更してアプリを再起動する | デイリーミッションが新しい3件にリセットされている |
| 3 | 端末の日付を翌週月曜日に変更してアプリを再起動する | ウィークリーミッションが新しい3件にリセットされている |
| 4 | 同じ日に何度もアプリを起動する | ミッションが重複生成されず同じ内容のまま |
| 5 | ミッションの進捗が残っている状態で日付変更して再起動する | 進捗はリセットされ、ミッションが新たに生成される |

## 検証コマンド

```bash
cd mobile
npm run typecheck  # エラーなし
npm run lint       # エラーなし（legacy config 警告のみ）
```
