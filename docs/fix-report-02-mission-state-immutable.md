# Fix Report 02 — ミッション state 更新の immutable 化

## ブランチ
`fix/mission-state-immutable`

## 対応した問題

`updateMissionProgress` と `claimMissionReward` がshallow copy後に
mission オブジェクトのプロパティを直接変更していた。

```ts
// Before（直接変更）
mission.progress = Math.min(mission.progress + value, mission.target);
if (mission.progress >= mission.target) mission.completed = true;
newMissions.completedHistory.push({ ... });
```

これにより Zustand の永続化・購読・デバッグで不整合が起きる可能性があった。

## 修正内容

### `mobile/src/store/useAppStore.ts`

**`updateMissionProgress`**

- `applyProgress` ヘルパー関数を導入。daily/weekly 両方で同じロジックを使用
- mission オブジェクトは `{ ...m, progress, completed }` のスプレッドコピーで更新
- weekly の週集計ロジック（total_savings, cooking）も同様に純関数化
- 変更がなければ同一 state を返す（不要な再描画を防止）

**`claimMissionReward`**

- `newMissions.daily[missionId].claimed = true` → `{ ...mission, claimed: true }` のコピーに変更
- `completedHistory.push(...)` → `[...completedHistory, newEntry]` のスプレッドに変更
- `isDaily` を事前に計算し、ロジックを明確化

## 実機で確認すべき点

| # | 確認操作 | 期待結果 |
|---|---------|---------|
| 1 | 支出を記録してミッション画面を開く | 「記録の習慣」ミッションの進捗が1/1になる |
| 2 | 自炊を記録してミッション画面を開く | 「自炊チャレンジ」ミッションの進捗が1/1になる |
| 3 | ミッションが完了状態になったら「受け取る」をタップ | ポイントが加算され、完了済みバッジが表示される |
| 4 | 節約記録をしてウィークリーミッションを確認 | 「節約チャンピオン」の進捗が更新される |
| 5 | 週をまたいで記録後、ウィークリーミッション「週間自炊マスター」を確認 | 当週分の自炊回数が正しくカウントされている |

## 検証コマンド

```bash
cd mobile
npm run typecheck  # エラーなし
npm run lint       # エラーなし
```
