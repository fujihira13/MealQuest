# MealQuest モバイルアプリ 仕様書（as-built）

**バージョン**: 2.0.1
**改訂日**: 2026-08-15
**対象プラットフォーム**: Android（Google Play 提出済み）
**位置づけ**: 本書は「これから作る計画」ではなく、**現在の `mobile/` 実装がどう動いているか**を記録した仕様書である。実装と本書が食い違った場合は実装が正であり、本書を更新すること。

---

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|---|---|---|
| 1.0.0 | 2026-04-29 | 初版作成（Web → モバイル移行計画書として） |
| 1.1.0 | 2026-04-29 | UIキャプチャレビューに基づく修正 |
| 2.0.1 | 2026-08-15 | 既知の問題3件（節約レベルが上がらない / `LineChart` デッドコード / ミッションのリセット契機）の修正を反映 |
| 2.0.0 | 2026-08-15 | 実装完了後の現状仕様（as-built）へ全面刷新。計画段階で想定していたモノレポ構成・Victory Native XL・NativeWind・Jest・Expo Notifications はいずれも**不採用または未実装**のため本文から削除し、未実装分は「9. 将来対応」へ集約した |

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [プロジェクト構成](#3-プロジェクト構成)
4. [画面構成・ナビゲーション](#4-画面構成ナビゲーション)
5. [機能仕様](#5-機能仕様)
6. [ゲーミフィケーション仕様](#6-ゲーミフィケーション仕様)
7. [データ設計](#7-データ設計)
8. [ビルド・リリース](#8-ビルドリリース)
9. [将来対応（未実装）](#9-将来対応未実装)
10. [既知の問題](#10-既知の問題)

---

## 1. プロジェクト概要

### 1.1 アプリ概要

| 項目 | 内容 |
|---|---|
| アプリ名 | MealQuest |
| 目的 | 食費の無駄遣いを減らし、自炊を促進するゲーミフィケーション家計簿 |
| ターゲットユーザー | 食費を節約したい個人ユーザー |
| 対応言語 | 日本語のみ |
| データ | 完全に端末内で完結（サーバー・アカウントなし） |

### 1.2 Web 版との関係

ルートディレクトリには前段階として作った React PWA 版（`src/`）と、さらにその前身の素の HTML/JS 実装（`new-household-*`）が残っている。
いずれも**開発終了・参照専用**であり、現行プロダクトは `mobile/` の Expo アプリのみ。

計画段階では npm workspaces による Web・モバイル間のコード共有（`packages/shared`）を想定していたが**実装されなかった**。
型定義・ユーティリティは Web 版と `mobile/` に重複コピーされている。Web 版が凍結済みのため同期は不要。

### 1.3 対象プラットフォーム

| プラットフォーム | 状況 |
|---|---|
| Android | Google Play へ提出済み（minSdkVersion 26 / Android 8.0 以上） |
| iOS | 未対応。`bundleIdentifier` の設定のみ存在し、ビルド・提出は未実施 |

---

## 2. 技術スタック

`mobile/package.json` に実際に含まれているもののみを記載する。

| カテゴリ | 採用技術 |
|---|---|
| フレームワーク | Expo SDK 54 / React Native 0.81.5 / React 19.1.0（New Architecture 有効） |
| ナビゲーション | Expo Router 6.x（ファイルベースルーティング、`typedRoutes` 有効） |
| 状態管理 | Zustand 5.x + `persist` ミドルウェア |
| ストレージ | AsyncStorage（`@react-native-async-storage/async-storage` 2.2.0） |
| グラフ | `react-native-svg` を用いた**自作コンポーネント**（`PieChart` / `CircularProgress`）。日別推移バーは `stats.tsx` 内で直接描画 |
| スタイル | React Native `StyleSheet` のみ |
| アニメーション | `react-native-reanimated` 4.x（+ 必須依存の `react-native-worklets`） |
| ジェスチャー | `react-native-gesture-handler` |
| アイコン | `@expo/vector-icons`（Ionicons）+ 絵文字 |
| ファイル出力・共有 | `expo-file-system` / `expo-sharing` |
| 型 | TypeScript 5.9（strict） |
| ビルド | EAS Build |
| 自動テスト | **なし** |

---

## 3. プロジェクト構成

```
MealQuest/
├── mobile/                      ← 現行アプリ
│   ├── app.json                 Expo 設定（バージョン・アイコン・スプラッシュ）
│   ├── eas.json                 EAS Build 設定
│   ├── app/                     Expo Router
│   │   ├── _layout.tsx          ルート Stack。起動時に initializeMissions() を実行
│   │   └── (tabs)/
│   │       ├── _layout.tsx      ボトムタブ + AppHeader
│   │       ├── index.tsx        ホーム
│   │       ├── stats.tsx        統計
│   │       ├── missions.tsx     ミッション
│   │       ├── badges.tsx       バッジ
│   │       ├── collection.tsx   コレクション
│   │       └── settings.tsx     設定
│   ├── src/
│   │   ├── store/useAppStore.ts AppStore + UIStore（単一ファイル）
│   │   ├── components/          InputModal / CookingModal / DateSelector /
│   │   │                        AppHeader / CircularProgress / PieChart
│   │   ├── types/index.ts       全型定義
│   │   ├── utils/               dateHelpers / formatHelpers / calculationHelpers / levelHelpers
│   │   └── constants/game.ts    COOKING_RECORD_POINTS
│   └── assets/images/           icon / adaptive-icon / splash-icon
├── src/                         Web版(PWA)。開発終了・参照専用
├── docs/                        本書・修正レポート
├── store-assets/                ストア提出用画像
└── plans/                       作業計画
```

パスエイリアス `@/` → `src/`（`mobile/tsconfig.json`）。

---

## 4. 画面構成・ナビゲーション

### 4.1 レイアウト構造

```
┌─────────────────────────────┐
│  AppHeader                  │  アプリ名・レベル・ポイント
├─────────────────────────────┤
│  コンテンツエリア             │
├─────────────────────────────┤
│  ボトムタブ（6タブ）           │  唯一のナビゲーション
└─────────────────────────────┘
```

### 4.2 ボトムタブ

| # | ルート | 表示名 | アイコン（Ionicons） |
|---|---|---|---|
| 1 | `index` | ホーム | `home-outline` |
| 2 | `stats` | 統計 | `bar-chart-outline` |
| 3 | `missions` | ミッション | `flag-outline` |
| 4 | `badges` | バッジ | `ribbon-outline` |
| 5 | `collection` | コレクション | `star-outline` |
| 6 | `settings` | 設定 | `settings-outline` |

---

## 5. 機能仕様

### 5.1 ホーム画面（`app/(tabs)/index.tsx`）

| セクション | 内容 |
|---|---|
| 今日の食費 | 当日の支出合計 |
| レベル進捗 | `Lv.X` と次レベルまでの XP 進捗バー |
| 今月の使用状況 | スーパーの予算 / お小遣い / 食費合計 の3本のゲージ（使用額・目標・消費率） |
| カテゴリー入力 | 7カテゴリのボタン。タップで入力モーダル |
| 今日のアクション | 自炊を記録 / 今日のミッション / 節約を記録 / 無駄遣いなし / 間食なし |
| ガチャ導線 | 次のガチャまでの必要ポイントを表示し、コレクション画面へ遷移（ホームでは回さない） |

**支出カテゴリ（7種・固定）**

| # | カテゴリ | 備考 |
|---|---|---|
| 1 | スーパー | 食事時間選択なし（`lunch` 固定）。お小遣い消費に含めない |
| 2 | 自販機 | 記録すると無駄遣いストリークがリセット |
| 3 | コンビニ | 記録すると無駄遣いストリークがリセット |
| 4 | 外食 | |
| 5 | 飲み会 | |
| 6 | デート | |
| 7 | その他 | |

**予算の考え方（フィールド名と意味が一致していないので注意）**

| フィールド | UI 上の意味 |
|---|---|
| `goals.monthlyExpenseGoal` | **スーパーの予算** |
| `goals.allowanceGoal` | お小遣い予算（スーパー以外の全カテゴリ） |
| 食費合計予算 | 上記2つの合計（自動算出・直接編集不可） |

**消費率** = `使用額 ÷ 目標 × 100`（0除算時は 0）。ゲージ色は消費率に応じて安全 / 注意 / 超過で切り替わる。

**節約記録** は自由入力のモーダル（1以上の整数のみ受付）。プリセット金額ボタンは実装していない。

**「無駄遣いなし」「間食なし」** は1日1回のみ記録可能で、記録済みの日はボタンが無効化される。

### 5.2 統計画面（`app/(tabs)/stats.tsx`）

| 機能 | 説明 |
|---|---|
| 月切り替え | `＜` `＞` で対象月を前後に移動 |
| サマリー | 食費合計 / 自炊回数（+ 自炊による節約概算）/ 予算使用率（円形ゲージ） |
| カテゴリー別 | 円グラフ（`PieChart`）+ 凡例に金額表示。支出のあるカテゴリのみ表示 |
| 日別推移 | 当月各日の支出をバーで表示 |
| 今月の気づき | 最大3件を自動生成（前月比の増減、自炊ペース、コンビニ支出の減少） |
| 支出記録 | 当月の記録一覧。タップで編集（`InputModal`）、🗑 で削除（確認あり） |

予算使用率は `当月支出合計 ÷（スーパー予算 + お小遣い予算）× 100`（上限100%表示）。

### 5.3 ミッション画面（`app/(tabs)/missions.tsx`）

| 機能 | 説明 |
|---|---|
| 今日の達成 | `完了数 / 全体数`、獲得済みポイント、リセットまでのカウントダウン（「0時に自動で更新」と表示） |
| 連続記録 | 無駄遣いなしストリークの日数 |
| デイリーミッション | 3種。進捗バー・報酬受け取りボタン |
| ウィークリーミッション | 3種。進捗バー・報酬受け取りボタン |

**デイリーミッション（固定3種）**

| ID | タイトル | 条件 | 報酬 | type |
|---|---|---|---|---|
| `daily_cooking_1` | 自炊チャレンジ | 今日1回自炊する | 30pt | `cooking` |
| `daily_expenses_record` | 記録の習慣 | 支出または自炊を1回記録する | 20pt | `record_habit` |
| `daily_savings` | 節約成功 | 節約を1回記録する | 25pt | `savings` |

**ウィークリーミッション（固定3種）**

| ID | タイトル | 条件 | 報酬 | type |
|---|---|---|---|---|
| `weekly_cooking_goal` | 週間自炊マスター | 1週間で10回自炊 | 100pt | `cooking` |
| `weekly_expense_goal` | 支出管理上手 | 1週間で食費を目標以下に抑える | 80pt | `expense_control` |
| `weekly_savings_goal` | 節約チャンピオン | 1週間で1000円節約 | 120pt | `total_savings` |

- 生成とリセット判定はすべて `initializeMissions()` が行い、次の3つの契機で実行される
  1. アプリ起動時（`app/_layout.tsx`）
  2. バックグラウンドからフォアグラウンドへ復帰した時（`AppState` の `change` を購読）
  3. ミッション画面を開いたまま0時をまたいだ時（1秒タイマーで日付の変化を検知）
- 週の開始は**日曜日**（`now.getDate() - now.getDay()`）
- ウィークリーの `cooking` / `total_savings` は当週の記録から進捗を再計算するため、過去日付の記録でも加算される
- 報酬は自動付与ではなく「受け取る」ボタンで確定する（`claimMissionReward()`）
- 型定義上は `expense_record` type も存在するが、現在テンプレートでは使用していない

### 5.4 バッジ画面（`app/(tabs)/badges.tsx`）

| 機能 | 説明 |
|---|---|
| 獲得バッジ数 | `獲得数 / 24` |
| 次に近いバッジ | 達成率が最も高い未獲得バッジ |
| フィルター | すべて / 獲得済み / 未獲得 |
| バッジカード | アイコン・条件・「あと N」の残量表示。獲得済みはチェックマーク |

**バッジ全24種の内訳（`category` フィールド基準）**

| カテゴリ | 種数 | 内容 |
|---|---|---|
| `cooking` | 5 | 自炊 1 / 5 / 20 / 50 / 100 回 |
| `savings` | 9 | 初回節約、累計 1,000 / 5,000 / 10,000 / 30,000 / 50,000 円、節約レベル 5 / 10 / 20 |
| `level` | 4 | レベル 5 / 10 / 20 / 50 |
| `special` | 6 | 7日・30日連続無駄遣いなし、7日連続記録、月間目標達成、ガチャ10種、ミッション20個達成 |

称号（`badges.currentTitle`）は獲得バッジのうち `special > level > cooking > savings` の優先度で最上位のものが自動設定される。

### 5.5 コレクション画面（`app/(tabs)/collection.tsx`）

| 機能 | 説明 |
|---|---|
| ガチャ | 100pt で1回。ポイント不足時はアラート表示 |
| 次のガチャまで | 100pt に対する不足分を表示 |
| フィルター | すべて / レア（rare 以上）/ 未所持 |
| アイテムカード | 所持品はアイコン・名前・所持数、未所持はグレー表示 |

**ガチャアイテム 全15種**

| レアリティ | 種数 | 排出確率 | ボーナスポイント |
|---|---|---|---|
| common | 5 | 60% | 0pt |
| rare | 4 | 25% | +20pt |
| epic | 3 | 12% | +50pt |
| legendary | 3 | 3% | +100pt |

### 5.6 設定画面（`app/(tabs)/settings.tsx`）

| セクション | 内容 |
|---|---|
| アカウント | 「節約マスター」と現在のレベルを表示（編集不可） |
| 予算設定 | 月のスーパーの予算 / 月のお小遣い予算 を変更。食費合計予算は自動算出（「自動」バッジ表示） |
| 通知 | デイリー通知・ミッション通知の項目のみ。いずれも「近日対応予定」で機能は未実装 |
| データ管理 | CSV 書き出し |
| アプリ情報 | バージョン等 |
| データリセット | 全データ初期化（確認ダイアログあり） |

**CSV 書き出し仕様**

- 列: 日付 / カテゴリ / 食事時間帯 / 金額 / 記録日時
- 日付 → 記録日時 の昇順にソート
- UTF-8 BOM 付き・CRLF 改行（Excel での文字化け対策）
- `"` `,` 改行を含む値はダブルクォートでエスケープ
- `expo-file-system` で書き出し、`expo-sharing` で共有シートに渡す

### 5.7 入力モーダル（`components/InputModal.tsx`）

| 機能 | 説明 |
|---|---|
| 金額入力 | 数値入力。1以上の整数のみ受付 |
| 日付選択 | `DateSelector` で記録日を変更可能（過去日付の記録に対応） |
| 食事時間選択 | 朝 / 昼 / 夜 / 間食。**スーパー選択時は非表示で `lunch` 固定** |
| 編集モード | 既存レコードを渡すと初期値をセットして更新処理に切り替わる |

### 5.8 自炊モーダル（`components/CookingModal.tsx`）

- 日付を選び、朝 / 昼 / 夜 の自炊をトグルで記録（`toggleCookingRecordWithDate()`）
- 同じ日付・同じ食事のトグルを外すと記録が削除され、20pt が減算される
- デイリーミッションへの加算は当日記録のときのみ

---

## 6. ゲーミフィケーション仕様

### 6.1 レベル（経験値）

累計 XP 方式（`src/utils/levelHelpers.ts`）。

```
レベル L に到達するのに必要な累計XP = (L - 1) × L × 100 ÷ 2
  → Lv2: 100 / Lv3: 300 / Lv4: 600 / Lv5: 1,000 ...
```

- ポイント増減は `applyXpChange()` を経由し、その中で `totalXp` と `level` が同時に再計算される
- `points`（所持ポイント）と `totalXp`（累計獲得ポイント）は別物。ガチャで `points` を消費してもレベルは下がらない
- `checkLevelUp()` は整合性確認用に残っているが、現在 UI からは呼ばれていない

### 6.2 節約レベル

```
節約レベル = floor(累計節約額 ÷ 1000) + 1   （calculateSavingsLevel()）
```

- 節約記録の登録時（`addSavingsRecord()`）に `checkSavingsLevelUp()` が呼ばれ、レベルが上がった分 × 20pt のボーナスが入る
- 既存インストールで節約レベルが取り残されていた場合は、永続化スキーマ v3 のマイグレーションで累計節約額から復元される（ボーナスポイントは遡って付与しない）

### 6.3 ポイント付与一覧

| アクション | ポイント |
|---|---|
| 支出記録 | 0pt（ミッション進捗のみ更新） |
| 自炊記録 | +20pt（取り消し時は −20pt） |
| 節約記録 | 金額 ÷ 10（切り捨て） |
| デイリーミッション達成報酬 | 20〜30pt |
| ウィークリーミッション達成報酬 | 80〜120pt |
| 無駄遣いなし記録 | `連続日数 × 5`（上限 50pt） |
| 間食なし記録 | `連続日数 × 3`（上限 30pt） |
| ガチャ当たりボーナス | rare +20 / epic +50 / legendary +100 |
| ガチャ実行 | −100pt |

### 6.4 連続記録（ストリーク）

| 種別 | 加算条件 | リセット条件 |
|---|---|---|
| 無駄遣いなし | 「無駄遣いなし」ボタンを1日1回押す | `コンビニ` または `自販機` の支出を当日記録した時 |
| 間食なし | 「間食なし」ボタンを1日1回押す | `meal === "snack"` の支出を当日記録した時 |

前日に記録があれば連続日数を +1、途切れていれば 1 に戻る。最長記録（`bestNoWasteStreak` / `bestSnackFreeStreak`）も保持する。

### 6.5 バッジ判定

`checkBadgeProgress()` が支出・自炊・節約・ミッション受取などのタイミングで呼ばれ、現在の state から24種すべてを再評価する。
判定条件の型は `cooking_count` / `total_savings` / `savings_count` / `level` / `savings_level` / `no_waste_streak` / `consecutive_days` / `monthly_goal_achieved` / `gacha_items` / `missions_completed`。

---

## 7. データ設計

### 7.1 永続化

| 項目 | 内容 |
|---|---|
| ストレージ | AsyncStorage |
| キー | `food-expense-app-storage` |
| スキーマバージョン | `3` |
| マイグレーション | ① `totalXp` を持たない旧データから、現在レベルに必要な累計XPを逆算して補完する ② 累計節約額から `savingsLevel` を復元する（ボーナスポイントの遡及付与はしない） |

スキーマを変更する場合は `version` を上げ、`migrate` に変換処理を追加すること。

### 7.2 主要な型（`mobile/src/types/index.ts`）

| 型 | 主なフィールド |
|---|---|
| `UserData` | `level` `points` `totalXp` `totalSavings` `monthlySavings` `monthlyExpense` `cookingCount` `allowanceUsed` `savingsLevel` `lastUpdated` |
| `ExpenseRecord` | `id` `date` `category` `amount` `meal` `timestamp` |
| `CookingRecord` | `id` `date` `meal` `timestamp` `memo?` |
| `SavingsRecord` | `id` `date` `amount` `timestamp` |
| `Goals` | `monthlyExpenseGoal` `allowanceGoal` `cookingGoal` `monthlySavingsGoal` |
| `MissionState` | `daily` `weekly` `lastDailyReset` `lastWeeklyReset` `completedHistory[]` |
| `BadgeState` | `earned[]` `currentTitle` |
| `Streaks` | 無駄遣い・間食それぞれの現在／最長／最終記録日 |
| `CollectionItem` | `GachaItem` + `count` `obtained` |

- `id` は `Date.now()` で採番
- 日付は `YYYY-MM-DD` 形式の文字列で保持し、月次集計は前方一致（`startsWith("YYYY-MM")`）で行う

### 7.3 初期値

| 項目 | 初期値 |
|---|---|
| スーパーの予算（`monthlyExpenseGoal`） | 25,000円 |
| お小遣い予算（`allowanceGoal`） | 15,000円 |
| 自炊回数目標（`cookingGoal`） | 20回 |
| 月間節約目標（`monthlySavingsGoal`） | 5,000円 |
| レベル / ポイント / 節約レベル | 1 / 0 / 1 |

※ `cookingGoal` と `monthlySavingsGoal` は state に存在するが、設定画面から編集する導線がない（バッジ判定などで内部的に使用）。

### 7.4 ストア構造

`mobile/src/store/useAppStore.ts` に **AppStore**（26アクション）と **UIStore** が同居している。
UIStore は Web 版から移植されたまま**モバイル画面からは一度も使われていない**。各画面は `useAppStore` + ローカル `useState` で完結している。

---

## 8. ビルド・リリース

### 8.1 Expo 設定（`mobile/app.json`）

| 項目 | 値 |
|---|---|
| name / slug | MealQuest / mealquest |
| version | 2.0.0 |
| Android package | `com.mealquest.app` |
| Android versionCode | 4 |
| minSdkVersion | 26 |
| iOS bundleIdentifier | `com.sakana1113.mealquest`（未提出） |
| orientation | portrait |
| newArchEnabled | true |
| EAS projectId / owner | `9db64b7c-…` / `sakana1113` |

### 8.2 EAS ビルドプロファイル（`mobile/eas.json`）

| プロファイル | 用途 |
|---|---|
| `development` | dev client、内部配布 |
| `preview` | APK、内部配布（テスト用） |
| `production` | AAB（Play Store 提出用） |

**`appVersionSource` は `"local"`。** そのため production ビルドの前に `app.json` の `android.versionCode` を**手動でインクリメントする**必要がある。上げ忘れると Play Console で重複エラーになる（過去に発生済み）。

### 8.3 ストア用アセット（`store-assets/`）

| ファイル | 用途 |
|---|---|
| `common/app-icon-master-1024.png` | マスターアイコン |
| `android/play-store-icon-512.png` | Play Store アイコン |
| `android/feature-graphic-1024x500.png` | Play Store フィーチャーグラフィック |
| `ios/app-store-icon-1024.png` | App Store アイコン（将来用） |

### 8.4 検証

自動テストは存在しない。コミット前およびビルド前に以下を実施する。

```bash
cd mobile && npm run typecheck
```

加えてエミュレータ／実機での手動確認を行う。

---

## 9. 将来対応（未実装）

以下は計画段階で挙がっていたが**現在は実装されていない**。実装する場合は本書を更新すること。

| 項目 | 現状 |
|---|---|
| iOS 対応 | `bundleIdentifier` の設定のみ。ビルド・提出は未実施 |
| プッシュ通知 | `expo-notifications` 未導入。設定画面に「近日対応予定」の項目のみ |
| クラウド同期 / Firebase | 未着手。`firebase` はルート（Web版）の依存関係に残るのみで `mobile/` は未参照 |
| 自動テスト | Jest / React Native Testing Library とも未導入 |
| JSON バックアップの書き出し・読み込み | 未実装（CSV の書き出しのみ実装済み） |
| ヘルプモーダル / 通知トースト / アバター | Web 版にはあるがモバイル版には未移植（`UIState` に名残の定義のみ） |
| 目標設定 UI の拡張 | 自炊回数目標・月間節約目標を設定画面から編集する導線がない |

---

## 10. 既知の問題

| # | 内容 | 影響 |
|---|---|---|
| 1 | `checkLevelUp()` / `generateDailyMissions()` / `generateWeeklyMissions()` / `resetDailyMissions()` / `resetWeeklyMissions()` / `toggleCookingRecord()` / `addCookingRecord()` / `deleteCookingRecord()` が UI から未使用 | 機能は `initializeMissions()` や `applyXpChange()` に集約済みで実害はないが、実質デッドコード |
| 2 | `UIStore` がモバイルで未使用 | 新規実装で誤って使わないこと |

### 解消済み（2026-08-15）

| 内容 | 対応 |
|---|---|
| `checkSavingsLevelUp()` が呼ばれず節約レベルが上がらなかった | `addSavingsRecord()` から呼ぶよう修正。既存データはスキーマ v3 のマイグレーションで復元 |
| `LineChart.tsx` が未使用のデッドコードだった | 削除 |
| ミッションのリセットがアプリ起動時のみだった | フォアグラウンド復帰時・0時をまたいだ時にも `initializeMissions()` を実行するよう追加 |
