---
name: plan-issue
description: GitHubイシューの実装計画を作成し、次セッションへ引き継ぐ。implement-issue によるセットアップ完了後に実行する。要件の明確化、ファイル一覧・実装順序・検証方法の計画を行い、ユーザー承認後に plan.md / checklist.md / workflow-state.json を保存する。使用タイミング：セットアップ完了後（例:「計画を立てて」「/plan-issue」「設計して」）。
---

# 実装計画スキル

implement-issue 完了後に実行し、実装計画を作成して次セッションへ引き継ぐ。

## ワークフロー

### 1. イシュー番号の確認

現在のブランチ名からイシュー番号を自動取得する：

```bash
git branch --show-current
```

ブランチ名が `feat/<番号>-<説明>` 形式であれば番号を自動取得。
不明な場合は AskUserQuestion でユーザーに確認する。

続けてイシュー内容を取得する：

```bash
gh issue view <番号> --comments
```

### 2. 要件の明確化

AskUserQuestion で以下を確認する（大きな仮定を避ける）：
- **対応範囲**: 設計書のみ？実装も？テストも？
- **技術的選択肢**: 複数の実装方法がある場合、どちらを採用するか
- **不明点**: イシューの内容で曖昧な点

### 3. 計画の作成

計画モード（EnterPlanMode）で以下を整理する：

- **作成・変更するファイル一覧** と各ファイルの役割
- **実装の順序**（Phase分け）
- **検証方法**（テスト項目、動作確認手順）
- **結合試験コマンド**: 実装完了後に実行するコマンド（コピペ可能な形式）

### 4. 承認の取得

計画が完成したら ExitPlanMode でユーザーの承認を得る。
承認が得られるまで実装を開始しない。

### 5. ファイルの生成（承認後）

ユーザー承認を得たら、以下のファイルを生成する。

**保存先：**
- worktree 内（worktreeを選択した場合）: カレントディレクトリ直下
- worktree なしの場合: `./plans/`（ファイル名は `issue-<番号>-plan.md` / `issue-<番号>-checklist.md`）

#### plan.md のテンプレート

```markdown
# 実装計画: <イシュータイトル>

## 変更方針
<変更方針の概要>

## 影響ファイル
| ファイル | 変更内容 |
|---------|---------|
| path/to/file.ts | 新規作成 / 変更 |

## 実装フェーズ
### Phase 1: ...
### Phase 2: ...

## テスト方針
<テスト方針>

## 結合試験コマンド
\`\`\`bash
npm test
npm run build
\`\`\`
```

#### checklist.md のテンプレート

```markdown
# 作業チェックリスト: <イシュータイトル>

## Phase 1
- [ ] ...

## Phase 2
- [ ] ...

## テスト
- [ ] 単体テスト通過
- [ ] 結合試験コマンド実行

## PR前確認
- [ ] ビルド成功
- [ ] レビュー依頼
```

#### workflow-state.json の保存

`continue-work` スキルで引き継げるよう、`.Codex/workflow-state.json` を保存する：

```json
{
  "version": 1,
  "issueNumber": "<番号>",
  "branchName": "<git branch --show-current の結果>",
  "issueTitle": "<イシュータイトル>",
  "issueSummary": "<概要>",
  "acceptanceCriteria": ["基準1", "基準2"],
  "plan": {
    "overview": "<計画概要>",
    "files": [{"path": "...", "action": "create|modify", "description": "..."}],
    "steps": ["1. ...", "2. ..."],
    "verifyMethod": "verify-build|verify-all",
    "testTargets": ["テスト対象"],
    "integrationTestCommands": ["npm test", "npm run build"]
  },
  "phase": "planning_complete",
  "createdAt": "<ISO 8601>",
  "updatedAt": "<ISO 8601>"
}
```

#### 完了メッセージ

```
計画を保存しました。
- plan.md / checklist.md: 生成済み
- workflow-state.json: .Codex/workflow-state.json に保存済み

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
次のステップ: 新しいウィンドウを開き、以下を実行してください
  「続きをやって」または /continue-work
（コンテキストをリフレッシュするため、新しいウィンドウを推奨）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 成果物チェックリスト

計画には以下を含める：
- [ ] 仕様書（docs/）の有無と内容
- [ ] 型定義の追加・変更
- [ ] 実装コードの変更箇所
- [ ] テストの追加・変更
- [ ] 既存コードへの影響
- [ ] 結合試験コマンドの明示
- [ ] plan.md の生成
- [ ] checklist.md の生成
- [ ] workflow-state.json の保存
