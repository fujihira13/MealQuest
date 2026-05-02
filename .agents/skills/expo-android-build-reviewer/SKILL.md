---
name: expo-android-build-reviewer
description: Expo / React Native アプリの Android ビルド設定（app.json / eas.json）を審査し、テスト配布用・Google Play ストア提出用として正しいか判定して修正するスキル。「Android ビルド設定をレビューして」「eas.json が正しいか確認して」「Play Store に提出できる状態か確認して」「Android の設定を整えて」などのリクエストで使用する。
---

# Expo Android Build Reviewer

## 概要

`app.json` と `eas.json` を読み込み、Android のテスト配布・Play Store 提出に必要な設定が正しいか審査し、問題点を報告・修正するワークフロー。

## ワークフロー

### Step 1: 設定ファイルを読み込む

以下のファイルを読む（存在しないものはスキップ）:
- `mobile/app.json` または `app.json`
- `mobile/eas.json` または `eas.json`
- `app.config.js` / `app.config.ts`（存在する場合は `app.json` より優先）
- `package.json`（使用パッケージからパーミッション影響を確認するため）

### Step 2: Android 設定を審査する

`references/checklist.md` のチェックリストに従って審査する。

### Step 3: 結果を報告する

以下の形式で出力する:

```
## 結論（1行）

## 確認したファイル一覧

## 審査結果
### ✅ 問題なし
（表形式：項目 / 値 / 評価）

### ⚠️ 要修正
（項目ごとに：現状 / 影響 / 推奨対応のコードスニペット）

## ユーザーへの確認事項
（番号付きリスト）
```

### Step 4: ユーザーに確認する

不明点があれば AskUserQuestion でまとめて確認する。典型的な確認事項:
- IAP（アプリ内課金）SDK（`react-native-purchases` 等）を実際に使っているか
- Play Console への提出方法（手動アップロード / `eas submit` 自動）

### Step 5: 修正を適用する

ユーザーの回答と承認後に `app.json` と `eas.json` を修正する。
変更前に必ず `Read` で現在の内容を確認してから `Edit` を使う。

## リソース

- **`references/checklist.md`** — 審査チェックリスト（各設定項目の正解・問題パターン・修正案）
