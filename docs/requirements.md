# MealQuest モバイルアプリ 要件定義書

**バージョン**: 1.1.0
**作成日**: 2026-04-29
**改訂日**: 2026-04-29（UIレビュー反映）
**対象プラットフォーム**: Android / iOS

---

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|---|---|---|
| 1.0.0 | 2026-04-29 | 初版作成 |
| 1.1.0 | 2026-04-29 | UIキャプチャレビューに基づく修正（ナビゲーション構造・数値仕様・新機能追加） |

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [プロジェクト構成](#3-プロジェクト構成)
4. [画面構成・ナビゲーション](#4-画面構成ナビゲーション)
5. [機能要件](#5-機能要件)
6. [ゲーミフィケーション仕様](#6-ゲーミフィケーション仕様)
7. [データ設計](#7-データ設計)
8. [UI/UX 方針](#8-uiux-方針)
9. [非機能要件](#9-非機能要件)
10. [ビルド・デプロイ戦略](#10-ビルドデプロイ戦略)
11. [開発フェーズ](#11-開発フェーズ)
12. [付録: UIレビュー指摘と対応](#12-付録-uiレビュー指摘と対応)

---

## 1. プロジェクト概要

### 1.1 アプリ概要

| 項目 | 内容 |
|---|---|
| アプリ名 | MealQuest（食費管理アプリ - 節約マスター） |
| 目的 | 食費の無駄遣いを減らし、自炊を促進するゲーミフィケーション家計簿 |
| ターゲットユーザー | 食費を節約したい個人ユーザー（20〜40代） |
| 対応言語 | 日本語のみ |

### 1.2 既存 Web アプリとの関係

現在 React PWA（`C:/dev/MealQuest/`）として動作しているアプリを、React Native + Expo によるモバイルネイティブアプリへ**完全移行**する。

- 既存 Web アプリの**全機能**をモバイルアプリに移植する
- 型定義・ユーティリティ関数はモノレポ構成で**Web・モバイル間で共有**する
- 移行後は Web アプリの代替としてモバイルアプリを主要プロダクトとする

### 1.3 対象プラットフォーム

| プラットフォーム | 優先度 | リリース時期 |
|---|---|---|
| Android | 高（最初のリリース対象） | Phase 6 完了時 |
| iOS | 中（将来対応） | 別途計画 |

---

## 2. 技術スタック

全て**最新安定版**を採用する。

| カテゴリ | 採用技術 | 移行元 | 選定理由 |
|---|---|---|---|
| フレームワーク | React Native（最新版）+ Expo SDK（最新版） | React 18 + Vite | New Architecture 対応・Expo エコシステム |
| ナビゲーション | Expo Router v4（file-based routing） | タブ切り替え（useUIStore） | Expo 公式・型安全なルーティング |
| 状態管理 | Zustand（最新版）+ persist | Zustand 4.x + localStorage | 既存と同一ライブラリ・移行コスト最小 |
| ストレージ | AsyncStorage（@react-native-async-storage/async-storage） | LocalStorage | RN 公式推奨の非同期ストレージ |
| グラフ | Victory Native XL（Skia ベース） | Chart.js 4.x | Chart.js は RN 非対応・Skia で高パフォーマンス |
| スタイル | React Native StyleSheet（+ NativeWind v4 を検討） | index.css | ネイティブスタイルシステムへの移行 |
| アニメーション | React Native Reanimated 3 | CSS animations / transitions | RN 推奨・60fps ジェスチャー対応 |
| プッシュ通知 | Expo Notifications | なし（モバイル新機能） | Android / iOS 共通の通知 API |
| ビルド | EAS Build（Expo Application Services） | Vite build | Expo 公式 CI/CD・Play Store 申請対応 |
| テスト | Jest + React Native Testing Library | Vitest + Testing Library | RN 標準テスト環境 |
| 型定義 | TypeScript 5.x（strict モード） | TypeScript 5.x（strict） | 既存と同一 |
| Firebase | 将来対応（依存関係のみ維持） | firebase ^12.0.0（未使用） | クラウド同期機能の将来実装に備える |

### 2.1 最小ランタイム要件

| 環境 | 要件 |
|---|---|
| Android | API Level 26（Android 8.0）以上 |
| iOS | iOS 16.0 以上 |
| Node.js | LTS 最新版 |

---

## 3. プロジェクト構成

モノレポ構成（npm workspaces）で Web アプリとモバイルアプリの型定義・ロジックを共有する。

```
MealQuest/                          ← リポジトリルート
├── package.json                    ← ワークスペースルート（npm workspaces）
├── packages/
│   └── shared/                     ← 共通パッケージ（新規）
│       ├── package.json
│       ├── types/
│       │   └── index.ts            ← 移行元: src/types/index.ts
│       └── utils/
│           ├── dateHelpers.ts      ← 移行元: src/utils/dateHelpers.ts
│           ├── formatHelpers.ts    ← 移行元: src/utils/formatHelpers.ts
│           └── calculationHelpers.ts ← 移行元: src/utils/calculationHelpers.ts
├── apps/
│   ├── web/                        ← 既存 React PWA（src/ を移動）
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── src/
│   └── mobile/                     ← 新規 Expo アプリ
│       ├── package.json
│       ├── app.json                ← Expo 設定
│       ├── eas.json                ← EAS Build 設定
│       ├── app/                    ← Expo Router ファイルベースルーティング
│       │   ├── _layout.tsx         ← ルートレイアウト（BottomTabs 定義）
│       │   ├── (tabs)/
│       │   │   ├── index.tsx       ← ホーム画面
│       │   │   ├── stats.tsx       ← 統計画面
│       │   │   ├── missions.tsx    ← ミッション画面
│       │   │   ├── badges.tsx      ← バッジ・称号画面
│       │   │   ├── collection.tsx  ← コレクション画面
│       │   │   └── settings.tsx    ← 設定画面
│       ├── components/             ← RN コンポーネント
│       └── store/                  ← Zustand ストア（shared を参照）
└── docs/                           ← ドキュメント
```

### 3.1 shared パッケージの役割

`packages/shared` は Web・モバイル両方から参照されるパッケージ。

| ファイル | 内容 | 移行元 |
|---|---|---|
| `types/index.ts` | 全型定義（UserData, ExpenseRecord 等） | `src/types/index.ts` |
| `utils/dateHelpers.ts` | 日付フォーマット・範囲計算 | `src/utils/dateHelpers.ts` |
| `utils/formatHelpers.ts` | 通貨・絵文字・レアリティ表示 | `src/utils/formatHelpers.ts` |
| `utils/calculationHelpers.ts` | 予算・レベル進捗計算 | `src/utils/calculationHelpers.ts` |

---

## 4. 画面構成・ナビゲーション

### 4.1 レイアウト構造

UIレビューの指摘を受け、ナビゲーションを**ボトムタブ（フッター）に一本化**する。ヘッダーにはタブナビを置かない。

```
┌─────────────────────────────┐
│  ヘッダー                    │  アプリ名 + ユーザー情報 + ヘルプボタン
├─────────────────────────────┤
│                             │
│  コンテンツエリア             │  各画面のメインコンテンツ
│                             │
├─────────────────────────────┤
│  ボトムタブナビゲーション      │  6タブ（唯一のナビゲーション）
└─────────────────────────────┘
```

**ヘッダー要素:**
- 左: アプリ名「節約マスター」
- 右: レベル表示（Lv.XX）・ポイント表示（X,XXX pt）・ヘルプボタン

**廃止:**
- Web版のフッター（ホーム・記録する・履歴・分析・マイページ）は**採用しない**
- ヘッダー内のタブナビゲーションは**採用しない**

### 4.2 ボトムタブナビゲーション（正式仕様）

| タブ番号 | キー | 表示名 | アイコン |
|---|---|---|---|
| 1 | `home` | ホーム | 🏠 |
| 2 | `stats` | 統計 | 📊 |
| 3 | `missions` | ミッション | 🎯 |
| 4 | `badges` | バッジ | 🏆 |
| 5 | `collection` | コレクション | 🎁 |
| 6 | `settings` | 設定 | ⚙️ |

> **注意**: Web版の表示ラベル（クエスト・称号・リスト）は旧名称。モバイル版では上記の正式名称に統一する。

---

## 5. 機能要件

### 5.1 ホーム画面

移行元: `apps/web/src/components/Tabs/HomeTab.tsx`

| 機能 | 説明 |
|---|---|
| 支出カテゴリグリッド | 以下の**7カテゴリ**すべてを表示。タップで入力モーダルを開く |
| 月間予算ゲージ | 消費率（当月支出額 ÷ 月間食費目標 × 100）をゲージ表示。色分けは後述 |
| 月間支出サマリー | カテゴリ別の月間支出集計・合計表示 |
| ユーザーステータス | レベル・ポイント・節約額のコンパクト表示 |
| 自炊記録トグル | 朝・昼・夜の3食について自炊済みをトグル記録 |
| デイリーチャレンジ | 本日のデイリーミッション（3種のうち直近未完了1件）をホームに表示 |
| クイック節約記録 | プリセット金額ボタンで節約記録を素早く入力 |
| ガチャボタン | 100pt を消費してガチャを1回実行 |

**支出カテゴリ（7種・固定）:**

| # | カテゴリ名 | 備考 |
|---|---|---|
| 1 | スーパー | 食事時間選択なし（デフォルト: 昼） |
| 2 | 自販機 | |
| 3 | コンビニ | 購入時に無駄遣いストリークをリセット |
| 4 | 外食 | |
| 5 | 飲み会 | |
| 6 | デート | |
| 7 | その他 | |

**予算ゲージ 色分け基準:**

| 消費率 | 表示色 |
|---|---|
| 0〜60% | 緑（安全） |
| 61〜90% | 黄（注意） |
| 91%〜 | 赤（超過危険） |

**予算ゲージ 計算式:**
```
消費率(%) = floor(当月支出額合計 ÷ 月間食費目標 × 100)
残り金額   = 月間食費目標 − 当月支出額合計
```

### 5.2 統計画面

移行元: `apps/web/src/components/Tabs/StatsTab.tsx`

| 機能 | 説明 |
|---|---|
| 詳細ステータス | レベル・ポイント・ストリーク・バッジ獲得数の詳細表示 |
| 月間統計概要 | 支出額・自炊回数・節約額・予算達成率のサマリー |
| 支出円グラフ | カテゴリ別支出割合（Victory Native XL で実装） |
| 推移折れ線グラフ | 自炊回数・節約額の月次推移（Victory Native XL で実装） |
| 記録編集・削除 | 支出・自炊・節約記録のリスト表示、スワイプ削除または編集ボタン |

**予算達成率 計算式:**
```
予算達成率(%) = floor(当月支出額合計 ÷ 月間食費目標 × 100)
```
> ホーム画面の消費率と同一の値を使用する。表示名のみ画面によって異なる。

### 5.3 ミッション画面

移行元: `apps/web/src/components/Tabs/MissionsTab.tsx`

| 機能 | 説明 |
|---|---|
| デイリークエスト | **3種類**のデイリーミッションを表示（リセットまでのカウントダウン付き） |
| ウィークリークエスト | **3種類**のウィークリーミッションを表示（リセットまでの日数・時間表示） |
| 進捗バー | 各ミッションの達成進捗を視覚化（現在値 / 目標値） |
| 報酬受け取り | ミッション達成時に報酬受け取りボタンを表示。タップでポイント付与 |
| 達成履歴 | 今週の完了済みミッション最新10件を表示 |

> **仕様確定**: デイリー・ウィークリーともに**各3種**。UIモックの「2/4完了」表記は誤り。

**ミッション種別**（移行元: `src/types/index.ts` の `MissionType`）:

| type | 内容 |
|---|---|
| `cooking` | 自炊チャレンジ |
| `expense_record` | 支出記録習慣 |
| `record_habit` | 記録継続 |
| `savings` | 節約成功 |
| `total_savings` | 累計節約 |
| `expense_control` | 支出コントロール |

### 5.4 バッジ・称号画面

移行元: `apps/web/src/components/Tabs/BadgesTab.tsx`

| 機能 | 説明 |
|---|---|
| 現在の称号 | ユーザーが保持している称号を大きく表示 |
| 達成率 | 獲得バッジ数 / 全バッジ数（**23種**）を表示 |
| カテゴリフィルター | すべて・自炊・節約・レベル・特別 の5種類でフィルタリング |
| バッジカード | 各バッジの獲得状態・進捗バー・達成条件を表示。未獲得は 🔒 でロック |

**バッジカテゴリ別内訳（合計 23 種）:**

| カテゴリ | 種数 |
|---|---|
| 自炊（cooking） | 5種 |
| 節約（savings） | 6種 |
| 節約レベル（savings level） | 3種 |
| 連続記録（streak） | 2種 |
| レベル（level） | 4種 |
| 特別（special） | 3種 |
| **合計** | **23種** |

> **仕様確定**: バッジ総数は **23種**。UIモックの「12/36」は誤り。

### 5.5 コレクション画面

移行元: `apps/web/src/components/Tabs/CollectionTab.tsx`

| 機能 | 説明 |
|---|---|
| レアリティフィルター | すべて・コモン・レア・エピック・レジェンド でフィルタリング |
| アイテムカード | 獲得済みはアイコン・名前・説明・所有数を表示。未獲得は ❓ と「???」表示 |
| コンプリート率 | 獲得種数 / 全アイテム種数（**15種**）を表示 |
| ガチャボタン | 100pt で1回実行。ポイント不足時はボタン無効化 |

**ガチャアイテム内訳（合計 15 種）:**

| レアリティ | 種数 | 排出確率 |
|---|---|---|
| common | 3種 | 60% |
| rare | 4種 | 25% |
| epic | 3種 | 12% |
| legendary | 2種 | 3% |
| その他 | 3種 | — |
| **合計** | **15種** | — |

> **仕様確定**: アイテム総数は **15種**。UIモックの「24/60」は誤り。

### 5.6 設定画面

移行元: `apps/web/src/components/Tabs/SettingsTab.tsx`
モバイル版では以下の機能を**追加**する。

#### 月間目標設定（既存機能）

| 項目 | 説明 |
|---|---|
| 食費目標 | 月間の食費上限（円） |
| 消費許容額 | 月間の消費許容上限（円） |
| 自炊回数目標 | 月間の自炊目標回数 |
| 月間節約目標 | 月間の節約目標額（円） |

- バリデーション: 各値は1以上の整数
- 保存ボタン押下時に反映

#### 通知設定（モバイル新機能）

Expo Notifications を使用したプッシュ通知機能。

| 通知種別 | 内容 | デフォルト |
|---|---|---|
| デイリー通知 | 毎日指定時間に支出記録を促すリマインダー | ON |
| ミッション通知 | デイリーミッションリセット時のお知らせ | ON |

- 通知の ON/OFF は設定画面のトグルで制御
- 通知時刻は初期値 20:00（変更機能は将来対応）

#### データバックアップ（モバイル新機能）

端末内データの書き出し・読み込み機能。

| 機能 | 説明 |
|---|---|
| データを書き出す | アプリデータを JSON ファイルとしてエクスポート（端末のダウンロードフォルダへ保存） |
| データを読み込む | JSON ファイルをインポートしてデータを復元 |

- ファイル形式: JSON（`mealquest_backup_YYYYMMDD.json`）
- 読み込み時は確認ダイアログを表示（現在データが上書きされる旨を警告）

#### データリセット（既存機能）

- 全データを初期化
- 確認ダイアログを経由（誤操作防止）

### 5.7 入力モーダル

移行元: `apps/web/src/components/Modals/InputModal.tsx`

| 機能 | 説明 |
|---|---|
| テンキー UI | カスタムテンキー（0〜9・削除・確定）で金額入力 |
| 食事時間選択 | 朝・昼・夜・間食 の4択。スーパーカテゴリ時は非表示（デフォルト: 昼） |
| 編集モード | 既存レコードを編集する場合は初期値をセットして表示 |
| キャンセル | モーダルを閉じて入力をクリア |

### 5.8 共通 UI コンポーネント

| コンポーネント | 機能 | 移行元 |
|---|---|---|
| ヘッダー | アプリ名・レベル・ポイント表示、ヘルプボタン（タブナビなし） | `Header.tsx` |
| ボトムタブナビゲーション | 6タブ（§4.2 参照）。唯一のナビゲーション手段 | `TabNavigation.tsx` |
| 通知トースト | 4種類（success / error / info / warning）、3秒自動消去 | `Notification.tsx` |
| 確認ダイアログ | データ削除・バックアップ読み込み等の重要操作前に確認 | `ConfirmDialog.tsx` |
| ヘルプモーダル | アプリの使い方を説明 | `HelpModal.tsx` |
| アバター | ユーザーアバター表示 | `Avatar.tsx` |

---

## 6. ゲーミフィケーション仕様

移行元: `src/store/useAppStore.ts`。既存 Web アプリと同一仕様。

### 6.1 レベルシステム

| 項目 | 仕様 |
|---|---|
| 経験値レベル | level × 100pt で次のレベルへ |
| 節約レベル | 累計節約額 1,000円 ごとにレベルアップ |
| チェック関数 | `checkLevelUp()` / `checkSavingsLevelUp()` |

### 6.2 ポイント付与

| アクション | 付与ポイント |
|---|---|
| ミッション達成 | ミッション設定の `reward` ポイント |
| 1日3食全て自炊 | ボーナス 50pt（`checkAllDayCookingBonus()`） |

### 6.3 ガチャシステム

- コスト: 100pt / 1回（`playGacha()`）
- アイテム総数: **15種**（§5.5 参照）
- レアリティ確率: common 60% / rare 25% / epic 12% / legendary 3%

### 6.4 ミッションシステム

- **デイリーミッション**: **3種**、毎日 00:00 にリセット（`resetDailyMissions()`）
- **ウィークリーミッション**: **3種**、毎週月曜 00:00 にリセット（`resetWeeklyMissions()`）
- 進捗更新: `updateMissionProgress(actionType, value?)`
- 報酬受け取り: `claimMissionReward(missionId, type)`

### 6.5 バッジシステム

- 総数: **23種**（§5.4 参照）
- 判定: `checkBadgeProgress()`
- 称号更新: バッジ獲得時に自動で `currentTitle` を更新

### 6.6 ストリークシステム

| ストリーク | 説明 |
|---|---|
| 無駄遣いなしストリーク | コンビニ・自販機・外食購入なしで連続日数をカウント |
| スナックフリーストリーク | 間食（snack）記録なしで連続日数をカウント |
| リセット条件 | コンビニ購入時（`resetStreakIfNeeded()`） |

---

## 7. データ設計

### 7.1 ストレージ方針

- **エンジン**: `@react-native-async-storage/async-storage`
- **管理**: Zustand の `persist` ミドルウェア + AsyncStorage アダプター
- **ストレージキー**: `"food-expense-app-storage"`（Web と同一キーを維持）
- **クラウド同期**: 今回は実装しない（Firebase は将来対応のため依存関係のみ維持）
- **バックアップ**: JSON エクスポート / インポート（§5.6 参照）

### 7.2 型定義（共通パッケージより参照）

`packages/shared/types/index.ts` で定義。移行元: `src/types/index.ts`

| 型名 | 役割 |
|---|---|
| `UserData` | レベル・ポイント・節約額・自炊回数等のユーザーデータ |
| `Goals` | 月間目標（食費・消費許容額・自炊回数・節約額） |
| `ExpenseRecord` | 支出記録（ID・日付・カテゴリ・金額・食事時間・タイムスタンプ） |
| `CookingRecord` | 自炊記録（ID・日付・食事時間・メモ） |
| `SavingsRecord` | 節約記録（ID・日付・金額・タイムスタンプ） |
| `GachaItem` | ガチャアイテム定義（ID・名前・アイコン・レアリティ・説明） |
| `CollectionItem` | 所持アイテム（GachaItem + 所有数・獲得日時） |
| `Mission` | ミッション（ID・タイトル・目標値・報酬・進捗・完了フラグ） |
| `MissionState` | デイリー・ウィークリーミッション管理 |
| `Badge` | バッジ定義（ID・カテゴリ・要件・獲得フラグ） |
| `BadgeState` | 獲得バッジ・現在の称号 |
| `Streaks` | ストリーク記録（連続日数・最高記録） |
| `AppState` | アプリ全体の状態 |

### 7.3 モバイル版追加型定義

```typescript
// 通知設定
export interface NotificationSettings {
  dailyReminder: boolean;
  missionAlert: boolean;
}
```

### 7.4 状態管理

| ストア | 移行元 | 内容 |
|---|---|---|
| `useAppStore` | `src/store/useAppStore.ts` | ビジネスロジック・データ |
| `useUIStore` | `src/store/useAppStore.ts`（同一ファイル） | モーダル・タブ・通知等の UI 状態 |

---

## 8. UI/UX 方針

### 8.1 デザインシステム

既存 Web アプリのカラーパレット・ブランドカラーをそのまま継承する。

| カラー | 用途 | HEX |
|---|---|---|
| プライマリ | メインブランドカラー（紫） | `#667eea` |
| セカンダリ | グラデーション終端 | `#764ba2` |
| 成功 | 節約・達成 | `#00b894` |
| 節約 | クイック節約 | `#ff9500` |
| 警告/削除 | エラー・削除操作 | `#e17055` |
| ゴールド | バッジ・レアアイテム | `#f39c12` |

### 8.2 ナビゲーション

- **構造**: ボトムタブナビゲーション（Expo Router の `Tabs`）**のみ**
- **タブ数**: 6タブ（§4.2 の正式仕様に従う）
- **アクティブ表示**: グラデーション背景 + グロー効果
- ヘッダーにタブナビゲーションを**配置しない**

### 8.3 アニメーション

React Native Reanimated 3 を使用。

| アニメーション | 用途 |
|---|---|
| フェードイン | 画面遷移時 |
| スライドイン | モーダル表示時 |
| パルス | ポイント表示 |
| プログレスバー | 予算ゲージ・ミッション進捗バー |

### 8.4 アプリアイコン・スプラッシュスクリーン

- **アイコン**: 豚 🐷 モチーフ（既存 PWA デザイン流用）、背景色 `#667eea`
- **スプラッシュスクリーン**: Expo Splash Screen、ブランドカラー背景

### 8.5 OS ガイドライン準拠

| OS | 準拠ガイドライン |
|---|---|
| Android | Material Design 3 |
| iOS | Human Interface Guidelines（将来対応時） |

---

## 9. 非機能要件

| 項目 | 要件 |
|---|---|
| 起動時間 | コールドスタート 3 秒以内 |
| フレームレート | スクロール・アニメーション 60fps 以上 |
| オフライン動作 | 完全オフライン対応（ローカルストレージのみのため自動達成） |
| APK サイズ | 50MB 以内を目標 |
| 型安全性 | TypeScript strict モード必須（`noImplicitAny`, `strictNullChecks` 有効） |
| セキュリティ | ユーザーデータは端末内にのみ保存。外部送信なし |
| アクセシビリティ | RN の `accessibilityLabel` を主要インタラクション要素に付与 |

---

## 10. ビルド・デプロイ戦略

### 10.1 開発フロー

```
1. expo start
   → Expo Go（簡易確認）または Development Build（ネイティブ機能確認）で実機確認

2. eas build --platform android --profile preview
   → APK を生成し、Internal Distribution で配布・動作確認

3. eas build --platform android --profile production
   → AAB（Android App Bundle）を生成し、Google Play Console へアップロード
```

### 10.2 EAS Build プロファイル（`eas.json`）

| プロファイル | 用途 | 成果物 |
|---|---|---|
| `development` | 開発・デバッグ | Development Build（APK） |
| `preview` | 内部テスト・QA | Internal Distribution（APK） |
| `production` | 本番リリース | Google Play Store（AAB） |

### 10.3 Google Play Store リリースフロー

```
内部テスト → クローズドテスト（α/β） → 本番公開
```

### 10.4 アプリ情報

| 項目 | 内容 |
|---|---|
| アプリ名 | 食費管理アプリ - 節約マスター |
| パッケージ名 | `com.mealquest.app`（仮） |
| カテゴリ | ファイナンス / ライフスタイル |
| ターゲット SDK | 最新の Google Play 要件に準拠 |

---

## 11. 開発フェーズ

### Phase 1: 基盤構築（モノレポ・Expo 初期化）

- [ ] モノレポ構成へのリポジトリ改造（npm workspaces）
- [ ] `packages/shared` の作成と既存型定義・ユーティリティの移行
- [ ] `apps/web` へ既存 Web アプリを移動
- [ ] `apps/mobile` で Expo プロジェクトを新規作成（最新 Expo SDK）
- [ ] Expo Router v4 のセットアップ・6タブ構成の初期実装（ボトムタブのみ）
- [ ] TypeScript strict モードの設定

### Phase 2: 状態管理移行

- [ ] `@react-native-async-storage/async-storage` のセットアップ
- [ ] Zustand ストア（`useAppStore`, `useUIStore`）を mobile へ移植
- [ ] persist ミドルウェアを AsyncStorage アダプターへ差し替え
- [ ] 既存ビジネスロジック（ミッション・バッジ・ガチャ等）の動作確認

### Phase 3: 画面実装

- [ ] ヘッダー（アプリ名・ユーザー情報のみ・タブナビなし）
- [ ] ボトムタブナビゲーション（6タブ正式名称）
- [ ] 入力モーダル（テンキー UI・食事時間選択）
- [ ] ホーム画面（7カテゴリグリッド・予算ゲージ・各セクション）
- [ ] ミッション画面（デイリー3種・ウィークリー3種・カウントダウン）
- [ ] バッジ・称号画面（23種・フィルター・進捗バー）
- [ ] コレクション画面（15種・レアリティフィルター）
- [ ] 設定画面（月間目標・通知設定・データバックアップ・データリセット）
- [ ] 共通コンポーネント（通知トースト・確認ダイアログ・ヘルプ）

### Phase 4: グラフ実装

- [ ] Victory Native XL のセットアップ（Skia 依存関係含む）
- [ ] 統計画面: カテゴリ別支出円グラフ（7カテゴリ対応）
- [ ] 統計画面: 自炊・節約推移折れ線グラフ

### Phase 5: モバイル新機能

- [ ] Expo Notifications のセットアップ（権限リクエスト含む）
- [ ] デイリーリマインダー通知のスケジューリング
- [ ] ミッションリセット通知の実装
- [ ] データ書き出し機能（JSON エクスポート）
- [ ] データ読み込み機能（JSON インポート + 確認ダイアログ）

### Phase 6: 仕上げ（アニメーション・アイコン・スプラッシュ）

- [ ] React Native Reanimated 3 によるアニメーション実装
- [ ] アプリアイコン作成（各解像度）
- [ ] スプラッシュスクリーン設定（Expo Splash Screen）
- [ ] カラーパレット・デザインの最終調整

### Phase 7: ビルド・リリース準備

- [ ] EAS Build 設定（`eas.json` の各プロファイル）
- [ ] `preview` ビルドで実機テスト
- [ ] Google Play Console でアプリ登録・内部テスト
- [ ] `production` ビルドで本番申請

---

## 12. 付録: UIレビュー指摘と対応

UIキャプチャ（`docs/ui-captures/refined-pop-*.png`）のレビューで発覚した問題と、本要件定義書での対応。

| 優先度 | 指摘内容 | 対応箇所 |
|---|---|---|
| 🔴 | ヘッダータブ＋フッターの二重ナビゲーション | §4.1 でボトムタブ一本化を明記 |
| 🔴 | ホーム画面に「外食」カテゴリが欠落 | §5.1 で7カテゴリを表として明記 |
| 🔴 | バッジ総数がモック36種・仕様は23種 | §5.4・§6.5 で23種と明記 |
| 🔴 | ガチャアイテム数がモック60種・仕様は15種 | §5.5・§6.3 で15種と明記 |
| 🟡 | 予算ゲージの%と金額が不一致 | §5.1 に計算式を明記 |
| 🟡 | デイリーミッション数がモック4種・仕様は3種 | §5.3・§6.4 で3種と明記 |
| 🟡 | 設定画面の通知・データ書き出しが未定義 | §5.6 にモバイル新機能として追加 |
| 🟢 | フッタータブ名が正式名称と不一致 | §4.2 で正式名称を表として確定 |

---

## 付録: 移行ファイル対応表

| 既存 Web ファイル | 移行先 / 対応 |
|---|---|
| `src/types/index.ts` | `packages/shared/types/index.ts` へ移行 |
| `src/utils/dateHelpers.ts` | `packages/shared/utils/dateHelpers.ts` へ移行 |
| `src/utils/formatHelpers.ts` | `packages/shared/utils/formatHelpers.ts` へ移行 |
| `src/utils/calculationHelpers.ts` | `packages/shared/utils/calculationHelpers.ts` へ移行 |
| `src/store/useAppStore.ts` | `apps/mobile/store/useAppStore.ts` へ移植（AsyncStorage 差し替え） |
| `src/hooks/useNotifications.ts` | `apps/mobile/hooks/useNotifications.ts` へ移植 |
| `src/components/Modals/InputModal.tsx` | RN 版として再実装 |
| `src/components/Tabs/*.tsx` | RN 版として画面ごとに再実装 |
| `src/components/HomeTab/*.tsx` | RN 版として再実装 |
| `src/components/StatsTab/*.tsx` | RN 版として再実装（グラフは Victory Native XL） |
| `src/components/Common/*.tsx` | RN 版として再実装 |
| `src/components/Layout/*.tsx` | Expo Router の `_layout.tsx` として再実装（タブナビはボトムのみ） |
| `src/index.css` | RN StyleSheet + NativeWind に変換 |
| `vite.config.ts` / `package.json` | `apps/web/` へ移動・そのまま維持 |
