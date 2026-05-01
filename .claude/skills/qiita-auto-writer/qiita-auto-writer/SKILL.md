---
name: qiita-auto-writer
description: |
  あきらパパの行動ログやAIニュース・開発経験から独自に技術記事を設計し、
  あきらパパ口調で5タスクプロセス（ニーズ分析→4人会議→章立て→KPTレビュー→清書）を経て
  Qiita記事を全自動で下書き保存するスキル。

  Use when:
  - cronやサブエージェントから「Qiita記事を全自動で書いて」と指示された場合
  - 「Qiitaの記事ストック作って」「自動でQiita下書き」等の依頼

  Don't use when:
  - note.com記事 → note-auto-writer
  - Zenn記事 → zenn-auto-writer
  - X投稿 → x-scheduled-post
---

# qiita-auto-writer: 全自動Qiita技術記事作成スキル

あきらパパの開発経験・AIツール活用ノウハウ・最新技術情報から、
**5タスクプロセス**で高品質な記事を企画→執筆→Qiita下書き保存まで全自動で行う。

## アカウント情報

- **ユーザー名**: akira_papa_AI
- **プロフィールURL**: https://qiita.com/akira_papa_AI

## ⚠️ 鉄則ルール

1. **自動公開は絶対にしない** → 下書き保存まで（「下書き保存する」ボタン）
2. **作業フォルダを必ず作成** → `workspace/note-writer/{YYYY-MM-DD}-qiita-{slug}/`
3. **中間成果物は全てファイルに保存** → セッション跨ぎ対応
4. **ブラウザプロファイルは `openclaw`** を使用
5. **5タスクプロセスを必ず全て実行** → 省略禁止
6. **あきらパパ口調で書く** → ですます調の一般技術記事ではない

---

## 📁 フォルダ構成

```
workspace/note-writer/
  └── {YYYY-MM-DD}-qiita-{slug}/
      ├── 01-research.md             # ネタ収集・リサーチ結果
      ├── 02-needs-analysis.md       # タスク1: ニーズ分析
      ├── 03-meeting-minutes.md      # タスク1: 4人会議議事録
      ├── 04-chapter-designs.md      # タスク1: 章立て5パターン+確定版
      ├── 05-tone-conversion.md      # タスク2: 口調変換
      ├── 06-draft-design.md         # タスク3: 下書き設計
      ├── 07-kpt-review.md           # タスク4: KPTレビュー
      ├── 08-final-article.md        # タスク5: 清書完成版
      └── 09-post-log.md             # 投稿ログ
```

---

## Phase 0: ネタ収集・リサーチ 🔍

### Step 0: 情報源の読み取り

```
# あきらパパの開発ログ
memory/YYYY-MM-DD.md（直近3-7日分）
MEMORY.md

# Obsidian Daily Notes
/Users/funakoshiakira-sub1-pc/workspace/akirapapa-obsidian-1/02_Daily/

# 技術トレンド（Web検索）
web_search で関連キーワードを検索
```

→ 結果を `01-research.md` に保存（これが {{メモ}} になる）

---

## Phase 1: タスク1 — ニーズ分析 & 章立て確定 📐

### Step 1: ニーズ分析（02-needs-analysis.md に保存）

{{メモ}} から以下を構造化して整理する:

1. **筆者（あきらパパ）の本質的なニーズ** — なぜこのブログを書きたいのか
2. **架空の読者のニーズ** — この投稿に関連する読者が求めていること
3. **ターゲット** — 誰に向けて書くのか
4. **各ポイントの読者にとっての有益性** — 読者が得られる具体的な価値
5. **あきらパパの投稿ニーズ** — 信頼向上・認知拡大・コミュニティ貢献等

### Step 2: 4人キャラ会議（03-meeting-minutes.md に保存）

以下の4人キャラを作成し、多角的かつ網羅的な会議議事録を500文字で作成:

| キャラ | 役割 | 視点 |
|--------|------|------|
| 🎯 **天才出版社ディレクター** | 構成・市場価値の専門家 | 最大リーチ・最大インパクトの設計 |
| 🌱 **初心者ディレクター** | 初学者目線の代弁者 | わかりやすさ・つまずきポイントの指摘 |
| 😰 **心配性ディレクター** | リスク・誤解・炎上回避の番人 | 正確性・誤読防止・注意事項の網羅 |
| ☀️ **ポジティブディレクター** | モチベーション・ワクワク担当 | 読者を鼓舞する表現・希望の提示 |

**会議ルール:**
- 同意のみの意見は不要（深掘りか横展開のみ）
- 批判的思考で本質をついた反論・代替案を活発に
- 否定する場合は必ず代替案を出す
- 根拠と理由を明確化する

### Step 3: 章立て5パターン作成

4人キャラそれぞれの目線で、最高に役立つ濃密で充実した章立てを**5パターン**作成。

**章立てルール（全パターン共通）:**
1. テーマとゴールの明確化（なぜ書くのか、どんな結末に導くか）
2. 問題提起とフック（冒頭で強烈な問いかけ、数行で「続きが気になる」状態に）
3. ドラマ性を意識した流れ（起承転結・三幕構成）
4. 具体的エピソードやキャラクターで描写を豊かに
5. 感情の起伏・サプライズ要素（意外性やユーモア）
6. 結論と余韻（「読んでよかった」と思わせる読後感）

### Step 4: 天才審査員による章立て確定

5パターンを天才審査員目線で評価・融合し、**最高の構成**を確定。

→ 全て `04-chapter-designs.md` に保存

---

## Phase 2: タスク2 — あきらパパ口調変換 🎤

### Step 5: 口調分析 & 変換（05-tone-conversion.md に保存）

**あきらパパ口調の公式:**

| 特徴 | 説明 | 例 |
|------|------|-----|
| **落ち着いたポジティブ大阪人** | 「！」不使用、冷静だが温かい | 「なんかこれって〜な気がする」 |
| **自分への気づきをシェア** | 押し付けない、発見の共有 | 「正直に言いましょう」「ちょっと考えてみましょう」 |
| **比喩・逆説・体言止め** | リアルな人間感 | 「情報を見つけることと、理解することは全然違う。」 |
| **読者への問いかけ** | 対話的、共感ベース | 「なんでだと思います？」「めっちゃもったいなくないですか？」 |
| **具体例と抽象を行き来** | わかりやすさ | 「電卓が発明された時、数学者の仕事がなくなりましたか？」 |
| **断定しすぎない** | 柔らかい主張 | 「〜な気がする」「〜かなと」「〜だと思う」 |
| **カジュアルだが知的** | 信頼感 | 専門用語は使うが、必ず噛み砕いて説明 |
| **語尾のバリエーション** | 単調回避 | 「〜なんです」「〜ですよね」「〜かと」「〜なので」 |
| **「…」の活用** | 間・余韻 | 「でも、不思議なことに...」 |
| **短文と長文のリズム** | 読みやすさ | 短い文→展開→短い文の繰り返し |

**NGパターン:**
- 「！」の多用（感嘆符は使わない）
- 煽り系（「やばすぎ」「えぐい」）
- 上から目線の教え諭し
- 機械的・テンプレ感のある文章
- 胡散臭い表現

確定した章立てをあきらパパ口調に変換 → `05-tone-conversion.md` に保存

---

## Phase 3: タスク3 — ブログ下書き設計 ✍️

### Step 6: 下書き設計（06-draft-design.md に保存）

口調変換した章立てを元に、完全にあきらパパ口調で各章の下書き設計を書く。

**Qiitaブログ記載ルール（全て必須）:**

- 独自でニッチな視点の内容を書く
- リアルな日本人の口調（胡散臭くならないよう注意）
- 世界一優しい人の目線で初心者にもわかりやすく
- **文章は最も長くなるような構成** にする（省略しない）
- 比喩・逆説・体言止めを使用し、リアルな人間が書いた文章に
- 重要箇所は ** 太字 ** にし、適切に改行を入れる
- 読者のお悩みシチュエーションを理解した上で役立つ情報を
- 落ち着いたポジティブな大阪人目線で冷静に
- 読者に共感し、尊重した丁寧な愛情溢れる言葉遣い
- 頭が良さそうな信頼が高まる口調
- 押し付けがましくない、自分への気づきをシェアする口調
- **(重要)** 見出し・改行・太字・インデントを活用して見やすく
- **図解・画像は不要** — Qiita記事はテキストとコードで勝負する
- md記法マークの前後に半角スペースを入れる（ `** aaa **` ）
- コードブロックには必ず言語指定

**文字数目安**: 各章1000文字程度、全体5000〜10000文字

→ `06-draft-design.md` に保存

---

## Phase 4: タスク4 — KPTレビュー 🔍

### Step 7: 4人キャラKPT分析（07-kpt-review.md に保存）

天才・初心者・ポジティブ・心配性の4人キャラで批判的思考KPTレビュー。

**各キャラ:** K×3、P×3、T×3 を非常に簡潔に記述

**レビュー観点:**
- ちゃんと有益でわかりやすい文章になっているか
- ちゃんとリアルなあきらパパ口調になっているか
- 読者の悩みに寄り添えているか
- 技術的に正確か

---

## Phase 5: タスク5 — 清書 & 投稿 📝

### Step 8: KPT改善 → 清書（08-final-article.md に保存）

KPTの指摘を **全て** 改善した最終版を出力。
- 省略せず1つずつ丁寧に
- リアルなあきらパパ口調
- 濃密で充実した長い文章

### Step 9: セルフレビュー

- [ ] あきらパパ口調になっているか（「！」不使用、落ち着いたポジティブ）
- [ ] コード例は正しいか
- [ ] 文章は十分に長いか（各章1000文字以上）
- [ ] 太字・改行・見出しで見やすいか
- [ ] 図解は入れていないか（Qiitaはテキスト+コードのみ）
- [ ] 技術的に不正確な記述はないか

---

## Phase 6: Qiita投稿（下書き保存）🖥️

### Step 10: Qiita新規記事ページを開く

```javascript
browser.open({ profile: "openclaw", targetUrl: "https://qiita.com/drafts/new" })
```

→ targetId をメモ

### Step 11: タイトル入力

```javascript
browser.snapshot({ profile: "openclaw", targetId: "<targetId>", refs: "aria" })
browser.act({ ..., request: { kind: "click", ref: "<タイトルref>" } })
browser.act({ ..., request: { kind: "type", ref: "<タイトルref>", text: "{タイトル}" } })
```

### Step 12: タグ入力

⚠️ **重要: Qiitaのタグ入力にはオートサジェスト（自動補完）がある！**
- `type` → `Enter` だとサジェスト候補が優先されて意図しないタグが入る
- **必ず `Escape` でサジェストを閉じてから `Enter` で確定**すること

```javascript
// タグ入力の正しい手順（1タグずつ）:
// 1. タグ入力欄をクリック
browser.act({ ..., request: { kind: "click", ref: "<タグ入力ref>" } })
// 2. タグ名を入力
browser.act({ ..., request: { kind: "type", ref: "<タグ入力ref>", text: "{タグ名}" } })
// 3. ★ Escapeでオートサジェストを閉じる（これが重要！）
browser.act({ ..., request: { kind: "press", ref: "<タグ入力ref>", key: "Escape" } })
// 4. Enterでタグを確定
browser.act({ ..., request: { kind: "press", ref: "<タグ入力ref>", key: "Enter" } })
// → 次のタグも同じ手順で繰り返す
```

**タグ入力後の検証（必須）:**
```javascript
// snapshotを取得してタグ欄の値を確認
browser.snapshot({ ..., refs: "aria", compact: true })
// タグ入力欄のtextbox値に意図したタグが含まれているか確認
// 意図と違うタグが入っていた場合:
// - 間違ったタグをクリックして削除
// - 正しいタグを再入力（Escape → Enter の手順で）
```

### Step 13: 本文入力

QiitaのエディタはCodeMirror 6（CM6）ベース。`.cm-content` にClipboardEventでペーストする。

**推奨方法: CM6 `.cm-content` に ClipboardEvent paste（2026-02-19検証済み）**

```javascript
browser.act({ ..., request: {
  kind: "evaluate",
  fn: `() => {
    const cmContent = document.querySelector('.cm-content');
    if (!cmContent) return 'cm-content not found';
    cmContent.focus();
    document.execCommand('selectAll');
    document.execCommand('delete');
    const dt = new DataTransfer();
    dt.setData('text/plain', \`{Markdown本文}\`);
    const evt = new ClipboardEvent('paste', {
      clipboardData: dt, bubbles: true, cancelable: true
    });
    cmContent.dispatchEvent(evt);
    return 'pasted';
  }`
}})
```

⚠️ 注意:
- `CodeMirror` (CM5) の `.CodeMirror.setValue()` は使えない（CM6にはない）
- `textarea` 直接操作も使えない（CM6はdiv.cm-contentベース）
- ClipboardEvent が最も確実な方法

### Step 14: 下書き保存

```javascript
browser.act({ ..., request: { kind: "click", ref: "<下書き保存ref>" } })
```

⚠️ 「公開する」ボタンは絶対にクリックしない！

### Step 15: 完了報告

```javascript
browser.screenshot({ profile: "openclaw", targetId: "<targetId>", fullPage: true })
message({ action: "send", channel: "discord", target: "1473542293465338060",
  message: "✅ Qiita記事の下書き保存完了！\n📌 タイトル: {タイトル}\n🔗 URL: {下書きURL}\n📊 文字数: {N}文字\nタグ: {タグ}",
  filePath: "<screenshot_path>" })
```

→ `09-post-log.md` に記録

---

## エラーハンドリング

### ブラウザ操作失敗時
- `08-final-article.md` にMarkdown保存済み
- Discord に報告し、手動コピペを依頼

### エディタ操作失敗時
- snapshot を再取得して ref を再確認
- evaluate でのDOM操作にフォールバック
- 最悪、Markdown本文をDiscordに送信して手動投稿

---

## クイックリファレンス

| 用途 | URL |
|------|------|
| 新規記事 | `https://qiita.com/drafts/new` |
| 下書き一覧 | `https://qiita.com/drafts` |
| マイページ | `https://qiita.com/akira_papa_AI` |

| 報告先 | Discord Channel |
|--------|----------------|
| #qiita作業 | `1473542293465338060` |
