# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> このドキュメントは **`mobile/` 配下の実装を唯一の正** として記述している。
> 記述と実装が食い違った場合は必ず実装を優先し、このファイルを更新すること。

## 修正対象について

**今後の修正はすべて `mobile/` ディレクトリ配下のモバイルアプリのみが対象。**
ルートの Web 版（`src/`、`new-household-*.{html,js,css}`、`dist/`、`vite.config.ts` など）は**開発終了・参照専用**であり、変更しない。
プラットフォームを指定せずに「アプリ」「ホーム画面」「設定」「統計」などと言われた場合は、すべて `mobile/` のことを指す。

## Project Overview

**MealQuest** は食費管理に特化したゲーミフィケーション付きの家計簿アプリ。
現行プロダクトは Expo / React Native 製の Android アプリで、Google Play へ提出済み（iOS は未対応）。

- 支出カテゴリ（7種）: スーパー / 自販機 / コンビニ / 外食 / 飲み会 / デート / その他
- 食事時間帯: morning / lunch / dinner / snack（間食）
- ゲーム要素: レベル（累計XP）・ポイント・ミッション・バッジ・ガチャコレクション・連続記録
- UI 文言はすべて日本語

## Repository Structure

```
/mobile              ★現行アプリ (Expo SDK 54 / React Native 0.81 / React 19)
  app/               Expo Router v6 のファイルベースルーティング
    _layout.tsx      ルート。起動時に initializeMissions() を実行
    (tabs)/          6タブ: index(ホーム) / stats / missions / badges / collection / settings
  src/
    store/useAppStore.ts   AppStore + UIStore
    components/            InputModal, CookingModal, DateSelector, AppHeader,
                           CircularProgress, PieChart
    types/index.ts         全型定義
    utils/                 dateHelpers, formatHelpers, calculationHelpers, levelHelpers
    constants/game.ts      COOKING_RECORD_POINTS のみ
  app.json / eas.json      Expo・EAS Build 設定
  assets/images/           アイコン・スプラッシュ

/src                 Web版(PWA)。開発終了・参照専用
/docs                要件定義書・修正レポート
/store-assets        ストア提出用画像（Play/App Store アイコン、フィーチャーグラフィック）
/plans               作業計画
```

モノレポ構成ではない。型定義・ユーティリティは Web 版と `mobile/` に**重複コピー**されており共有されていない
（Web 版は凍結済みのため、同期する必要はない）。

## Development Commands

```bash
cd mobile
npm run start        # Expo開発サーバー起動
npm run android      # Androidで起動
npm run ios          # iOSで起動（現状ビルド対象外）
npm run typecheck    # 型チェック
npm run lint         # Expo Lint
```

**コミット前:** `cd mobile && npm run typecheck`

## Architecture

### 状態管理（Zustand v5）

`mobile/src/store/useAppStore.ts` に **AppStore** と **UIStore** の2ストアが同居している（別ファイルではない）。

**AppStore** — ビジネスロジック全体（約1000行、アクション26種）
- State: `userData`, `goals`, `expenses[]`, `cookingRecords[]`, `savingsRecords[]`, `missions`, `badges`, `streaks`, `collection[]`, `gachaItems[]`, `badgeDefinitions[]`, `savingsEquivalents[]`, `allDayCookingBonusDates[]`
- Actions: 支出の記録/編集/削除、自炊の記録/メモ/削除、節約記録、ガチャ、レベル判定、ミッション生成/進捗/報酬受取/リセット、バッジ判定、連続記録、目標更新、月次集計、全データリセット

**UIStore** — **モバイル画面からは現在1箇所も使われていない**（Web 版から移植されたまま）。
各画面は `useAppStore` + `useState` のローカル state で完結している。新規実装でも UIStore は使わないこと。

**永続化:** AsyncStorage、キー `"food-expense-app-storage"`。
`version: 3` と `migrate` を設定済み。旧データ（`totalXp` を持たない形式）から累計XPを再計算し、あわせて累計節約額から `savingsLevel` を復元する（遡ってのボーナスポイント付与はしない）。
永続化スキーマを変える場合は `version` を上げて `migrate` を追記する。

### ゲーミフィケーションの仕組み

**ポイント付与（実装値）**

| 行動 | ポイント |
|---|---|
| 支出記録 | **0pt**（ミッション進捗のみ更新） |
| 自炊記録 | +20pt（`COOKING_RECORD_POINTS`。取り消し時は減算） |
| 節約記録 | 金額 ÷ 10 pt |
| デイリーミッション報酬 | 20〜30pt |
| ウィークリーミッション報酬 | 80〜120pt |
| 無駄遣いなし記録 | `streak × 5`（上限50pt） |
| 間食なし記録 | `streak × 3`（上限30pt） |
| ガチャ当たりボーナス | rare +20 / epic +50 / legendary +100 |

**レベル:** 累計XP方式（`mobile/src/utils/levelHelpers.ts`）。
`getTotalXpRequiredForLevel(L) = (L-1) × L × 100 ÷ 2` → Lv2=100 / Lv3=300 / Lv4=600 …。
ポイント増減は `applyXpChange()` を通し、その中で `totalXp` と `level` が同時に再計算される。
`points` を直接操作するとレベルが更新されないので注意（ガチャの100pt消費は意図的に `applyXpChange` を通していない）。

**節約レベル:** `calculateSavingsLevel()` = `totalSavings ÷ 1000 + 1`。`addSavingsRecord()` から `checkSavingsLevelUp()` が呼ばれ、上昇分 × 20pt のボーナスが入る。

**ガチャ:** 100pt消費。レアリティ確率 common 60% / rare 25% / epic 12% / legendary 3%。全15アイテム。

**ミッション:** daily 3種・weekly 3種の固定テンプレート。生成とリセット判定（日付・週初め）はすべて `initializeMissions()` が行い、以下3つの契機で呼ばれる。

1. アプリ起動時（`app/_layout.tsx`）
2. バックグラウンドからフォアグラウンドへ復帰した時（`AppState` の `change` を購読）
3. ミッション画面を開いたまま0時をまたいだ時（`app/(tabs)/missions.tsx` の1秒タイマーで日付変化を検知）

`generateDailyMissions()` / `resetDailyMissions()` 等の個別アクションは UI から使われていない。

**バッジ:** 24種類（`category` 別に cooking 5 / savings 9 / level 4 / special 6。savings には節約レベル系3種を含む）。`checkBadgeProgress()` が state から動的に判定する。

**連続記録:** `コンビニ`・`自販機` の支出で無駄遣いストリークがリセット、`meal === "snack"` で間食なしストリークがリセット（`resetStreakIfNeeded()`）。

### 予算の考え方（命名と意味がズレているので注意）

| フィールド | UI 上の意味 |
|---|---|
| `goals.monthlyExpenseGoal` | **スーパーの予算**（名前に反して食費全体ではない） |
| `goals.allowanceGoal` | お小遣い予算（スーパー以外の全カテゴリ） |
| 食費合計予算 | 上記2つの**合計**。設定画面では「自動」表示で直接編集できない |

`goals.cookingGoal` / `goals.monthlySavingsGoal` は state には存在するが、設定画面から編集する導線がない。

### Key Implementation Patterns

**支出記録フロー:**
1. `InputModal` でカテゴリ・金額・食事時間・日付を入力
2. `addExpenseRecord()` 内で `resetStreakIfNeeded()` → `updateMissionProgress("expense_record")` → `updateMissionProgress("record_habit")` → `checkBadgeProgress()` → `updateMonthlyData()` の順に自動実行（ミッション更新は当日記録のときのみ）
3. スーパーカテゴリのみ食事時間選択を無効化（`'lunch'` 固定）— `mobile/src/components/InputModal.tsx`

**自炊記録フロー:** `CookingModal` → `toggleCookingRecordWithDate()`。過去日付も記録可能で、デイリーミッションは当日記録のみ加算される。

**データ変更の原則:** コンポーネントから直接状態を変更しない。必ず `useAppStore` のアクションを経由する。

### モバイル版固有の注意点

- `react-native-reanimated` v4.x の Babel プラグインが `react-native-worklets` を必要とする（`mobile/package.json` に明示的に記載済み）
- New Architecture（`newArchEnabled: true`）有効
- グラフは外部ライブラリではなく `react-native-svg` ベースの自作コンポーネント（`PieChart` / `CircularProgress`）。統計画面の日別推移バーは `stats.tsx` 内で直接描画している
- スタイルは RN の `StyleSheet` のみ（NativeWind 等は未導入）
- CSV 書き出しは `expo-file-system`（`File` / `Paths` API）+ `expo-sharing`

## Testing

**モバイル版には自動テストがない**（Jest / React Native Testing Library は未導入）。
検証は `cd mobile && npm run typecheck` と、エミュレータ／実機での手動確認で行う。

ルートの Vitest 環境（`src/utils/__tests__/`）は Web 版専用で、モバイル版のコードは対象外。

## Path Aliases

`@/` → `src/`（`mobile/tsconfig.json`。Web 版も同じ形式で別途設定されている）。

## リリース運用（Android）

- `mobile/eas.json` は `appVersionSource: "local"`。**`mobile/app.json` の `android.versionCode` を手動でインクリメントする**（現在 4）。上げ忘れると Play Console でアップロード時に重複エラーになる
- ビルドプロファイル: `development`（dev client）/ `preview`（APK・内部配布）/ `production`（AAB）
- パッケージ名 `com.mealquest.app` / minSdkVersion 26 / EAS owner `sakana1113`
- ストア提出用画像は `store-assets/` 配下

## 既知の問題（触るときは意識すること）

- `checkLevelUp()` / `generateDailyMissions()` / `generateWeeklyMissions()` / `resetDailyMissions()` / `resetWeeklyMissions()` / `toggleCookingRecord()` / `addCookingRecord()` / `deleteCookingRecord()` は UI から未使用（機能は `initializeMissions()` や `applyXpChange()` 側に集約済み）
- `firebase ^12.0.0` はルートの依存関係に残っているが未使用（`mobile/` は参照していない）
