---
name: implement-issue
description: GitHubイシューへの着手方法を選択し、環境セットアップから計画まで実行する。イシュー番号を指定して実装を開始するとき（例:「イシュー番号5をやって」「イシュー12を実装して」「イシューの3を実施してください」「イシューの7に取り掛かって」「イシュー番号20を対応して」「42番のイシューを始める」）に使用する。worktreeまたは通常ブランチをユーザーが選択する。
---

# イシュー実装ワークフロー（着手方法の選択）

## ワークフロー

### Step 1: イシュー番号の確認

イシュー番号が指定されていない場合は AskUserQuestion で確認する。

### Step 2: 着手方法の選択

AskUserQuestion で以下を確認する：

**worktree**（推奨: 並行作業・長期作業・別ウィンドウで作業する場合）

- 専用フォルダ `../wt-issue-<番号>/` を作成して作業
- ブランチが main から隔離されるため、複数イシューの並行作業に適している

**通常ブランチ**（シンプル・短期作業・現在のウィンドウで続けて作業する場合）

- `git checkout -b` でフィーチャーブランチを作成
- worktree フォルダは作らず、現在のディレクトリで作業

### Step 3: 選択に応じたセットアップ実行

#### worktree を選んだ場合（issue-start のワークフロー）

1. mainブランチの最新化
   ```bash
   git switch main && git fetch origin && git merge --ff-only origin/main
   ```
2. イシュー内容の確認・整理（gh issue view）
3. worktree + ブランチ作成
   ```bash
   git branch -a | head -20
   git worktree add ../wt-issue-<番号> -b feat/<番号>-<短い説明> origin/main
   for f in .env .env.local; do
     [ -f "$f" ] && cp "$f" ../wt-issue-<番号>/
   done
   ```
4. 完了メッセージ：
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   次のステップ:
     cd ../wt-issue-<番号> && npm install
     /plan-issue を実行してください
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

#### 通常ブランチを選んだ場合（branch-start のワークフロー）

1. mainブランチの最新化
   ```bash
   git switch main && git fetch origin && git merge --ff-only origin/main
   ```
2. イシュー内容の確認・整理（gh issue view）
3. フィーチャーブランチ作成
   ```bash
   git branch -a | head -20
   git checkout -b feat/<番号>-<短い説明>
   ```
4. 完了メッセージ：
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   次のステップ: /plan-issue を実行してください
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

## 注意事項

- イシュー番号が指定されていない場合、最初にユーザーに確認する
- セットアップ完了後、実装計画は `/plan-issue` スキルで行う
- 実装フェーズは新しいウィンドウで `/continue-work` で行う
