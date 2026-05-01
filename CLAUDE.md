# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MealQuest** は食費管理に特化したゲーミフィケーション付きの家計簿アプリ。Web版（PWA）とモバイル版（Expo/React Native）の2プラットフォーム構成。

- 支出カテゴリ: スーパー / 自販機 / コンビニ / 外食 / 飲み会 / デート / その他
- 食事時間帯: morning / lunch / dinner / snack（間食）
- ゲーム要素: レベル・ポイント・ミッション・バッジ・ガチャコレクション・連続記録

## Repository Structure

```
/               Web版 (Vite + React 18 + PWA)
/mobile         モバイル版 (Expo SDK 54 + React Native 0.81 + React 19)
```

Web版とモバイル版でロジックは共通だが、型定義・ユーティリティは現在それぞれに重複して存在する（`src/types/` と `mobile/src/types/` は同一内容）。

## Development Commands

### Web版（ルートディレクトリ）

```bash
npm run dev          # 開発サーバー起動 (localhost:3000)
npm run build        # 本番ビルド (tsc + vite build)
npm run typecheck    # 型チェック
npm run lint         # ESLint (max-warnings 0)
npm run test         # テスト監視モード (Vitest)
npm run test:run     # テスト1回実行
npx vitest run src/utils/__tests__/simple-test.test.ts  # 単一ファイル実行
```

### モバイル版（mobile/ ディレクトリ）

```bash
cd mobile
npm run start        # Expo開発サーバー起動
npm run android      # Androidで起動
npm run ios          # iOSで起動
npm run typecheck    # 型チェック
npm run lint         # Expo Lint
```

**コミット前:** Web版は `npm run typecheck && npm run lint`、モバイル版は `cd mobile && npm run typecheck`

## Architecture

### 状態管理（Zustand）

`src/store/useAppStore.ts` に **AppStore** と **UIStore** の2ストアが同居している（別ファイルではない）。

**AppStore** — ビジネスロジック全体（1496行）
- State: `userData`, `goals`, `expenses[]`, `cookingRecords[]`, `savingsRecords[]`, `missions`, `badges`, `streaks`, `collection[]`, `gachaItems[]`, `badgeDefinitions[]`
- Actions（28種）: 支出・自炊・節約の記録、ガチャ、レベルアップ判定、ミッション生成/リセット/達成、バッジ判定、連続記録管理

**UIStore** — UI状態のみ
- State: `currentTab`, `isInputModalOpen`, `currentInputCategory`, `currentAmount`, `selectedMeal`, `editingRecord`, `notifications[]`
- Actions（9種）: タブ切替、モーダル開閉、通知表示（3秒で自動削除）、確認ダイアログ

**永続化:**
- Web版: LocalStorage（キー: `"food-expense-app-storage"`）/ Zustand v4
- モバイル版: AsyncStorage / Zustand v5

### ゲーミフィケーションの仕組み

- **ポイント:** 支出記録 +1pt、自炊 +20pt、節約額÷10pt
- **レベル:** level × 100pt 必要、節約レベルは 1000¥ ごとに上昇
- **ガチャ:** 100pt消費、レアリティ確率 common 60% / rare 25% / epic 12% / legendary 3%
- **ミッション:** daily 3種・weekly 3種、アプリ起動時に自動生成・リセット判定
- **バッジ:** 24種類、`checkBadgeProgress()` で自動獲得判定
- **連続記録:** 無駄遣いなし日数・スナック菓子なし日数をストリーク管理

### Key Implementation Patterns

**支出記録フロー:**
1. `InputModal` でカテゴリ・金額・食事時間を入力
2. `addExpenseRecord()` → `updateMissionProgress()` → `checkLevelUp()` → `checkBadgeProgress()` の順で自動実行
3. スーパーカテゴリのみ食事時間選択を無効化（'lunch' 固定）

**データ変更の原則:** コンポーネントから直接状態を変更しない。必ず `useAppStore` のアクションを経由する。

### モバイル版固有の注意点

- `react-native-reanimated` v4.x のBabelプラグインが `react-native-worklets` を必要とする（`mobile/package.json` に明示的に記載済み）
- Expo Router によるファイルベースルーティング（`mobile/app/` 配下）
- `new architecture (newArchEnabled: true)` 有効

## Testing

Vitest + jsdom + `@testing-library/react`。テストファイルは `src/utils/__tests__/` に置く。`src/test-setup.ts` がテスト間で localStorage をクリアする。

## Path Aliases

Web版・モバイル版ともに `@/` → `src/` のエイリアスを設定済み（各 `tsconfig.json` 参照）。

## 修正対象について

**今後の修正はすべて `mobile/` ディレクトリ配下のモバイルアプリのみが対象。**
Web版（ルートの `src/` 配下）は修正しない。

## Data Persistence Note

`firebase ^12.0.0` は依存関係に含まれているが現時点では未使用（将来のバックエンド連携用）。
