---
name: cleanup-worktrees
description: マージ済みのGit worktreeディレクトリを削除してディスク容量を確保する。ブランチは保持したまま、不要になったworktreeのディレクトリのみを削除する。使用タイミング：worktreeを片付けたいとき（例:「worktreeを掃除して」「マージ済みのworktreeを削除して」「worktreeを整理して」「ディスクを空けて」「不要なworktreeをクリーンアップして」「worktreeのお掃除」）。
---

# Worktree クリーンアップ

マージ済みブランチのworktreeディレクトリを削除してディスク容量を確保する。**ブランチは削除しない。**

## ワークフロー

### Step 1: リモート情報を最新化する

```bash
git fetch origin
```

### Step 2: worktree一覧とマージ済みブランチを取得する

以下を実行して情報を収集する：

```bash
# 全worktreeをパース可能な形式で取得
git worktree list --porcelain

# origin/main にマージ済みのブランチ一覧を取得
git branch --merged origin/main
```

**パース手順：**

1. `git worktree list --porcelain` の出力からworktreeごとの `worktree <パス>` と `branch refs/heads/<ブランチ名>` を抽出する
2. 最初のエントリ（リポジトリルート）は除外する
3. `git branch --merged origin/main` の出力から各行をトリムしてブランチ名リストを作成する
4. worktreeのブランチがマージ済みリストに含まれているか照合し、削除候補を絞り込む

### Step 3: 削除候補をユーザーに確認する

削除候補が存在する場合、以下の形式で一覧を表示した後、`AskUserQuestion` で確認を取る：

```
以下の worktree ディレクトリを削除します（ブランチは残します）：

  パス: ../wt-issue-5/    ブランチ: feat/5-add-login
  パス: ../wt-issue-12/   ブランチ: feat/12-fix-api

合計: 2件
```

**削除候補がない場合：**「削除対象のworktreeはありません。」と報告して終了する。

### Step 4: worktreeディレクトリを削除する

確認が取れたら、候補ごとに以下を実行する：

```bash
git worktree remove <パス>
```

> **注意:** 未コミットの変更がある場合は `git worktree remove` が失敗する。
> その場合は AskUserQuestion で強制削除（`--force`）するか対象をスキップするか確認してから進む。

### Step 5: ゴースト参照をクリーンアップして結果を報告する

```bash
git worktree prune
```

実行後、以下の形式でサマリーを表示する：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Worktree クリーンアップ完了

削除したディレクトリ: 2件
  - ../wt-issue-5/   (feat/5-add-login)
  - ../wt-issue-12/  (feat/12-fix-api)

ブランチは保持されています。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## エラーハンドリング

| 状況 | 対応 |
|------|------|
| 削除候補が0件 | "削除対象のworktreeはありません" と報告して終了 |
| `git worktree remove` が未コミット変更で失敗 | ユーザーに確認し `--force` または スキップを選択 |
| mainブランチのworktreeが候補に含まれた場合 | 除外して警告表示する |
| `git fetch origin` が失敗 | オフライン状態の可能性を警告し、ローカル情報のみで続行するか確認 |
