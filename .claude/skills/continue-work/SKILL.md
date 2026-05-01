---
name: continue-work
description: 保存済みのワークフロー状態を読み込み、実装・検証・PR作成を一括で行う。前回の会話で計画まで完了した続きを実行するとき（例:「続きをやって」「continue」「実装を始めて」「ワークフローの続き」「作業を再開して」「実装フェーズを開始」「計画の続きから」）に使用する。
---

# イシュー実装オーケストレーション（実装フェーズ）

保存された計画に基づいて実装・検証・PR作成を行う。

## ワークフロー

### Phase 0: 状態の読み込みと確認

1. `.claude/workflow-state.json` を読み込む
2. ファイルが存在しない場合 → 以下を表示して終了：
   > ワークフロー状態ファイルが見つかりません。先に「#<番号>をやって」で計画を作成してください。
3. 正しいブランチにいるか確認し、必要ならチェックアウト：

```bash
git switch <branchName>
```

4. 状態の要約をユーザーに表示する：
   - イシュー番号とタイトル
   - 計画の概要
   - 変更対象ファイル一覧
   - 検証方法（verify-build or verify-all）

5. 「この内容で実装を開始しますか？」とAskUserQuestionで確認する

### Phase 1: 実装

`plan.steps` を順番に実行する。

各ステップで：
1. 対象ファイルを読み、既存の実装パターンを把握する
2. 計画に沿って実装する
3. ステップ完了をユーザーに報告する

全ステップ完了後、`workflow-state.json` の `phase` を `"implementation_complete"` に更新する。

### Phase 2: 検証

`plan.verifyMethod` に基づいて検証を実行する。

**verify-build の場合:**

```bash
npm test
npm run build
```

失敗があれば修正して再実行する。

**verify-all の場合:**

verify-all スキルの全フェーズを実行する：
1. 自動テスト + ビルド確認
2. API統合テスト（影響範囲のエンドポイント）
3. 手動テスト手順書の生成（`docs/manual-testing/` に出力）
4. 検証結果のまとめ

検証通過後、`phase` を `"verified"` に更新する。

### Phase 3: コミットとPR作成

1. 変更内容の確認：

```bash
git status
git diff --stat
```

2. コミット作成（日本語、イシュー番号付き）：

```
feat: <変更内容の要約> (#<issueNumber>)

- <変更点1>
- <変更点2>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

3. プッシュとPR作成（日本語）：

```bash
git push -u origin <branchName>
gh pr create --title "<タイトル>" --body "..."
```

PRの本文には概要・変更内容・テスト計画・`Closes #<issueNumber>` を含める。

PR作成後、`phase` を `"pr_created"` に更新する。

### Phase 4: 完了報告

以下をユーザーに報告する：
- PR URL
- 実装した内容のサマリー
- テスト結果のサマリー

## エッジケース対応

| 状況 | 対応 |
|------|------|
| 状態ファイルが存在しない | エラーメッセージを表示して終了 |
| `updatedAt` が24時間以上前 | 警告を表示し、続行するか確認 |
| `phase` が `implementation_in_progress` | `git diff --stat` で進捗を表示し、続きから再開するか確認 |
| ブランチが状態ファイルと異なる | チェックアウト前にユーザーに確認 |
| ユーザーが検証スキップを要求 | 警告を表示した上でPhase 3に進む |
| ユーザーが計画修正を要求 | 計画を修正し、状態ファイルを更新 |
