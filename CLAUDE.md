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
    (tabs)/          5タブ: index(ホーム) / stats(ふりかえり) / missions / achievements(実績) / settings
  src/
    store/useAppStore.ts   AppStore + UIStore
    components/            InputModal, CookingModal, DateSelector, AppHeader,
                           CircularProgress, PieChart, BadgeList, CollectionList,
                           GachaResultModal, Toast
    types/index.ts         全型定義
    utils/                 dateHelpers, formatHelpers, calculationHelpers, levelHelpers
    constants/             categories.ts（CATEGORY_LIST/COLORS/ICONS, WASTE_CATEGORIES）、
                           game.ts（COOKING_RECORD_POINTS, ALL_DAY_COOKING_BONUS_POINTS）、
                           rarity.ts（RARITY_COLORS/BG/STARS）
  app.json / eas.json      Expo・EAS Build 設定
  assets/images/           アイコン・スプラッシュ

/src                 Web版(PWA)。開発終了・参照専用
/docs                要件定義書・修正レポート
/store-assets        ストア提出用画像（Play/App Store アイコン、フィーチャーグラフィック）
/plans               作業計画
```

「実績」タブ（`app/(tabs)/achievements.tsx`）はセグメントコントロールで「バッジ」（`BadgeList.tsx`）と「アイテム」（`CollectionList.tsx`、旧・コレクション画面）を切り替える単一画面。旧 `badges.tsx` / `collection.tsx` は廃止された。タブバーは横スクロールなしで5項目を均等表示する。

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

**AppStore** — ビジネスロジック全体（約820行、アクション17種）
- State: `userData`, `goals`, `expenses[]`, `cookingRecords[]`, `savingsRecords[]`, `missions`, `badges`, `streaks`, `collection[]`, `gachaItems[]`, `badgeDefinitions[]`, `allDayCookingBonusDates[]`
- Actions（17種）: `addExpenseRecord` / `updateExpenseRecord` / `deleteExpenseRecord`、`toggleCookingRecordWithDate`、`addSavingsRecord`、`playGacha`、`checkSavingsLevelUp`、`initializeMissions` / `updateMissionProgress` / `claimMissionReward`、`checkBadgeProgress`、`recordNoWasteDay` / `recordSnackFreeDay` / `resetStreakIfNeeded`、`updateGoals`、`updateMonthlyData`、`resetAllData`
- 2026-08-16 のリファクタで UI から一度も呼ばれていなかった9アクション（`checkLevelUp` / `toggleCookingRecord` / `addCookingRecord` / `updateCookingRecordMemo` / `deleteCookingRecord` / `generateDailyMissions` / `generateWeeklyMissions` / `resetDailyMissions` / `resetWeeklyMissions`）を削除済み。生成・リセットの機能は `initializeMissions()` に、レベル再計算は `applyXpChange()` に統合されている

**UIStore** — `notifications[]`（Toast 表示用）と `appHeaderHeight`（`AppHeader` が実測したヘッダー高さ）のみを持つ。`Toast.tsx` が `notifications` を購読して画面上部にバナー表示し、`showNotification()` は自炊記録時などに呼ばれる（3秒で自動削除）。`AppHeader.tsx` が `onLayout` で高さを測って `setAppHeaderHeight()` に渡し、`Toast` がその直下に重ならないよう配置する。
Web版から移植されたまま未使用だった `currentTab` / モーダル状態 / 確認ダイアログ / ヘルプ関連の状態と、参照先のなくなった `TabType` 型は削除済み。各画面の一時的なUI状態（モーダル開閉など）は引き続き `useAppStore` + ローカル `useState` で管理する。

**永続化:** AsyncStorage、キー `"food-expense-app-storage"`。
`version: 3` と `migrate` を設定済み。旧データ（`totalXp` を持たない形式）から累計XPを再計算し、あわせて累計節約額から `savingsLevel` を復元する（遡ってのボーナスポイント付与はしない）。
永続化スキーマを変える場合は `version` を上げて `migrate` を追記する。

### ゲーミフィケーションの仕組み

**ポイント付与（実装値）**

| 行動 | ポイント |
|---|---|
| 支出記録 | **0pt**（ミッション進捗のみ更新） |
| 自炊記録 | +20pt（`COOKING_RECORD_POINTS`。取り消し時は減算） |
| 1日3食（朝・昼・夜）すべて自炊 | +50pt（`ALL_DAY_COOKING_BONUS_POINTS`）。`allDayCookingBonusDates` で日付ごとに1回だけ付与するよう二重付与を防止 |
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

起動時（1.）の実行は AsyncStorage からの復元完了を待ってから行う。復元は非同期のため、復元前に `initializeMissions()` を呼ぶと、復元完了時の state 置換でミッション生成が巻き戻ってしまう不具合が以前から存在していた。`app/_layout.tsx` で `useAppStore.persist.hasHydrated()` により復元済みかを判定し、未復元なら `onFinishHydration()` で復元完了後に実行するよう修正済み（`AppState` 復帰時の実行は従来どおり）。

ウィークリーの `cooking` / `total_savings` / `expense_control` は、進捗を `m.progress + value` で積み上げるのではなく、当週（`lastWeeklyReset` 〜 その7日後）の記録から**毎回再計算**する（`updateMissionProgress()` 内の `weeklyProgress()`）。`expense_control`（`weekly_expense_goal`）は「週の最終日（`weekStart` から数えて7日目）に入っていて、かつ当週の支出合計が週予算以下」なら進捗1（達成）、それ以外は0。最終日より前は、途中経過が予算内であっても進捗0のまま（「1週間抑えきったか」は週が終わるまで判定できないため。この判定がないと最初の安い買い物1回で達成が確定してしまう）。週予算は「1日あたりの予算 × 7日」（ミッションの週は常に7日固定）で、1日あたりの予算は `(goals.monthlyExpenseGoal + goals.allowanceGoal) ÷ weekStart が属する月の日数`（`getDaysInMonthFromDateKey()`。`stats.tsx` の週別表と同じ「日割り」の考え方）。週が月をまたぐ場合（例: 8/30〜9/5）も厳密な日割りはせず `weekStart` の月の日数だけを基準にする簡略化。週予算が0円以下（目標未設定）のときは常に未達成扱い。`addExpenseRecord` / `updateExpenseRecord` / `deleteExpenseRecord` から日付を問わず呼ばれる。他のミッション同様、一度 `completed` になると `updateMissionProgress()` は以降そのミッションを更新しない（`applyProgress()` の `!m.completed` 条件）が、`expense_control` は最終日にしか達成しないためこの凍結が問題になる場面はほぼない。

（旧実装では月の日数ではなく「月の週数（4 or 5）」で単純に割っており、最終週が1〜3日しかなくても7日分と同じ予算が付く誤りがあったため、日割り方式に修正済み。旧ヘルパー `getWeeksInMonthFromDateKey` は `getDaysInMonthFromDateKey`（月の日数を返す）に置き換わった。）

**バッジ:** 24種類（`category` 別に cooking 5 / savings 9 / level 4 / special 6。savings には節約レベル系3種を含む）。`checkBadgeProgress()` が state から動的に判定する。

**連続記録:** `コンビニ`・`自販機` の支出で無駄遣いストリークがリセット、`meal === "snack"` で間食なしストリークがリセット（`resetStreakIfNeeded()`）。

### 予算の考え方（命名と意味がズレているので注意）

| フィールド | UI 上の意味 |
|---|---|
| `goals.monthlyExpenseGoal` | **スーパーの予算**（名前に反して食費全体ではない） |
| `goals.allowanceGoal` | お小遣い予算（スーパー以外の全カテゴリ） |
| 食費合計予算 | 上記2つの**合計**。設定画面では「自動」表示で直接編集できない |

`goals.cookingGoal` / `goals.monthlySavingsGoal` は state には存在するが、設定画面から編集する導線がない。

**ホーム画面の予算ゲージ:** 「使った分が増える」ではなく「**残額が減る**」表示（`getBudgetPercent()` は残り割合を返す）。お小遣いを主役として大きい数字・太いバーで、スーパーは食材費として細いバーで控えめに表示し、食費合計は1行テキストのみ。目標額が0円のときはバーをグレー表示にして「使い切り」と区別する（`getBudgetColor()`）。

### Key Implementation Patterns

**支出記録フロー:**
1. `InputModal` でカテゴリ → 金額 → 食事時間 → 日付（折りたたみ式）の順に入力。金額欄は `autoFocus` + `keyboardType="number-pad"`、記録ボタンは `ScrollView` の外の `footer` に固定表示。Android では `KeyboardAvoidingView` の `behavior` を `undefined` にしている（RN の Modal がウィンドウに `SOFT_INPUT_ADJUST_RESIZE` を強制するため、`padding`/`height` を指定すると二重補正になる）。iOS は `padding`
2. `addExpenseRecord()` は**当日記録のときのみ** `resetStreakIfNeeded()` → `updateMissionProgress("expense_record")` → `updateMissionProgress("record_habit")` を実行する（過去日付で記録すると、ミッション更新だけでなくストリークのリセットも行われない）。続けて日付を問わず常に `updateMissionProgress("expense_control")`（後述、週内の支出合計を再計算） → `checkBadgeProgress()` → `updateMonthlyData()` が実行される
3. スーパーカテゴリのみ食事時間選択を無効化（`'lunch'` 固定）— `mobile/src/components/InputModal.tsx`

**自炊記録フロー:** `CookingModal` → `toggleCookingRecordWithDate()`。過去日付も記録可能で、デイリーミッションは当日記録のみ加算される。1食記録すると Toast で `🍳 +20pt` を表示し、その日の朝・昼・夜が揃うと `ALL_DAY_COOKING_BONUS_POINTS`（+50pt）が別途 Toast で通知される。

**行動フィードバック:** `useUIStore().showNotification()` → `Toast.tsx` が3秒間表示するバナー通知。ガチャの結果は `GachaResultModal.tsx`（`CollectionList.tsx` から表示）で演出付きに表示する（確率・排出内容・消費ポイントは変更なし）。

**データ変更の原則:** コンポーネントから直接状態を変更しない。必ず `useAppStore` のアクションを経由する。

### モバイル版固有の注意点

- `react-native-reanimated` v4.x の Babel プラグインが `react-native-worklets` を必要とする（`mobile/package.json` に明示的に記載済み）
- New Architecture（`newArchEnabled: true`）有効
- グラフは外部ライブラリではなく `react-native-svg` ベースの自作コンポーネント（`PieChart` / `CircularProgress`）。統計画面の週別集計はグラフではなく表形式で `stats.tsx` 内に直接実装している（月内を 1-7 / 8-14 / 15-21 / 22-28 / 29-末日 の5区切りに集計し、各行に日付範囲（例:「1〜7日」）を併記。各週を「終了 / 進行中 / これから」の3状態で判定し、終了週のみ「残り ¥○○」「超過 ¥○○」を表示、進行中の週は金額のみ「今週」表示、これから来る週は金額を「—」表示にする。見出し横には「1日あたり ¥○○（月予算 ÷ ◯日）」を表示。以前は終了週に✓✗マークも出していたが、「残り」「超過」の文字と意味が重複するため削除し、緑・赤の文字色のみで判別する）
- スタイルは RN の `StyleSheet` のみ（NativeWind 等は未導入）
- CSV 書き出しは `expo-file-system`（`File` / `Paths` API）+ `expo-sharing`

## Testing

**モバイル版には自動テストがない**（Jest / React Native Testing Library は未導入）。
検証は `cd mobile && npm run typecheck` と、エミュレータ／実機での手動確認で行う。

ルートの Vitest 環境（`src/utils/__tests__/`）は Web 版専用で、モバイル版のコードは対象外。

## Path Aliases

`@/` → `src/`（`mobile/tsconfig.json`。Web 版も同じ形式で別途設定されている）。

## リリース運用（Android）

- `mobile/eas.json` は `appVersionSource: "remote"` + `production.autoIncrement: true`。**`android.versionCode` は EAS のサーバー側カウンターで自動採番される**ため、`mobile/app.json` に `versionCode` は書かない（書いても無視されるうえ、実際の採番値と食い違って混乱の元になるため削除済み）
- 現在のカウンター値は `cd mobile && npx eas build:version:get --platform android` で確認できる。**2026-08-16 時点で 10**（次の production ビルドで 11 が採番される）
- ⚠️ **`appVersionSource` を `local` から `remote` へ切り替えた直後は、EAS 側のカウンターが 0 から始まる。** Play で使用済みの番号と衝突するため、切り替え時は必ず `npx eas build:version:set --platform android` で現在の値より大きい番号を設定すること（このコマンドは対話式で、実行には端末が必要）。実際に一度この手順を飛ばして versionCode 2 でビルドしてしまい、アップロードできずビルドを1回無駄にした
- `mobile/app.json` の `version`（アプリバージョン表示用）は `2.0.0`
- ビルドプロファイル: `development`（dev client）/ `preview`（APK・内部配布）/ `production`（AAB）
- パッケージ名 `com.mealquest.app` / minSdkVersion 26 / EAS owner `sakana1113`
- ストア提出用画像は `store-assets/` 配下

## 既知の問題（触るときは意識すること）

- `firebase ^12.0.0` はルートの依存関係に残っているが未使用（`mobile/` は参照していない）
