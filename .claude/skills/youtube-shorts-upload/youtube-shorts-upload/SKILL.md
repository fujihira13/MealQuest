---
name: youtube-shorts-upload
description: >
  YouTube Studioでショート動画をアップロードし、タイトル・説明を設定して公開する。アップロード操作のみ。

  Use when: 完成済みの動画ファイルをYouTubeにアップロードする依頼、「YouTubeにアップ」「ショート動画を公開」「YouTube Studioでアップロード」等。

  Don't use when: 動画の作成・編集・レンダリング→remotion系スキルを使う。サムネイル作成のみの依頼。YouTube以外のプラットフォームへの投稿。

  Negative examples: 「ショート動画を作って」→ 動画作成はremotion系。「動画を編集して」→ 編集はremotion系。本スキルはアップロード操作のみ。
---

# YouTube ショート動画アップロードスキル

YouTube Studioのブラウザ操作でショート動画をアップロード→詳細入力→公開するワークフロー。

## 🎬 アップロード前セルフレビュー（必須）

**動画をアップロードする前に、必ず自分で動画を視聴してレビューすること。**
レイアウト崩れ、タイミングのズレ、可読性の問題がないか確認し、問題があれば修正→再レンダリングしてからアップロードする。
**セルフレビューをスキップしてアップロードすることは絶対禁止。**

## ⚠️ 重要：広告の適合性ステップ

**YouTubeパートナープログラム参加チャンネルでは「広告の適合性」の自己評価が必須。**
これを完了しないと「公開」ボタンがdisabledのまま永遠に押せない。

## ブラウザ設定

- **profile**: `"openclaw"`
- YouTube Studioは既にログイン済みの前提

## 🪟 並列ブラウザ操作（必須）

複数プラットフォームに同時アップロードする場合は、**`parallel-browser` スキルを読み込んで従うこと。**

## ワークフロー

### Step 1: YouTube Studio を開く

```javascript
browser.navigate({
  profile: "openclaw",
  targetUrl: "https://studio.youtube.com/"
})
```

### Step 2: 「動画をアップロード」ボタンをクリック

ダッシュボードの「動画をアップロード」ボタンをクリック。

```javascript
// スナップショットで ref を確認して
browser.act({ request: { kind: "click", ref: "<動画をアップロードのref>" } })
```

### Step 3: ファイルをアップロード

「ファイルを選択」ボタンに `upload` アクション。

```javascript
browser.upload({
  profile: "openclaw",
  ref: "<ファイルを選択のref>",
  paths: ["/path/to/video.mp4"]
})
```

5秒待ってからスナップショット。

### Step 4: タイトルを入力

既存テキストを全選択してから上書き。

```javascript
// タイトル欄をクリック
browser.act({ request: { kind: "click", ref: "<タイトルのref>" } })
// 全選択
browser.act({ request: { kind: "press", key: "Meta+a" } })
// タイトル入力
browser.act({ request: { kind: "type", ref: "<タイトルのref>", text: "タイトル" } })
```

### Step 5: 説明を入力

```javascript
browser.act({ request: { kind: "click", ref: "<説明のref>" } })
browser.act({ request: { kind: "type", ref: "<説明のref>", text: "説明文" } })
```

### Step 6: 「次へ」で広告の適合性ステップへ進む

```javascript
// 「次へ」ボタンをクリック（詳細 → 広告の適合性）
browser.act({
  request: {
    kind: "evaluate",
    fn: "() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '次へ' && !b.disabled); if (btn) { btn.click(); return 'clicked'; } return 'not found'; }"
  }
})
```

### Step 7: 🔴 広告の適合性 — 自己評価（最重要！）

**このステップをスキップすると公開ボタンが永遠にdisabledになる。**

1. 「上記のいずれも含まない」チェックボックスをクリック
2. 「評価を送信」ボタンをクリック

```javascript
// 「上記のいずれも含まない」をクリック
browser.act({
  request: {
    kind: "evaluate",
    fn: "() => { const labels = Array.from(document.querySelectorAll('*')).filter(el => el.textContent.trim() === '上記のいずれも含まない' && el.offsetParent); if (labels.length > 0) { labels[0].click(); return 'clicked'; } return 'not found'; }"
  }
})

// 1秒待機

// 「評価を送信」をクリック
browser.act({
  request: {
    kind: "evaluate",
    fn: "() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('評価を送信') && !b.disabled); if (btn) { btn.click(); return 'clicked'; } return 'disabled or not found'; }"
  }
})
```

**注意**: 動画に不適切な表現等が含まれる場合は、該当項目を正確に選択すること。技術解説動画なら基本的に「上記のいずれも含まない」でOK。

### Step 8: 公開設定まで「次へ」を連打

広告の適合性 → 動画の要素 → チェック → 公開設定 の順に進む。

```javascript
// 3回「次へ」をクリック（各1秒待機）
for (let i = 0; i < 3; i++) {
  browser.act({
    request: {
      kind: "evaluate",
      fn: "() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '次へ' && !b.disabled); if (btn) { btn.click(); return 'clicked'; } return 'not found'; }"
    }
  })
  // 1秒待機
}
```

### Step 9: 「公開」ラジオを選択

```javascript
browser.act({
  request: {
    kind: "evaluate",
    fn: "() => { const radios = Array.from(document.querySelectorAll('tp-yt-paper-radio-button, [role=\"radio\"]')); const pub = radios.find(r => r.textContent.trim() === '公開'); if (pub) { pub.click(); return 'clicked'; } return 'not found'; }"
  }
})
```

### Step 10: 「公開」ボタンをクリック

```javascript
// 1秒待機後
browser.act({
  request: {
    kind: "evaluate",
    fn: "() => { const btns = Array.from(document.querySelectorAll('button')); const pub = btns.find(b => b.textContent.trim() === '公開' && !b.disabled); if (pub) { pub.click(); return 'clicked'; } return 'disabled or not found'; }"
  }
})
```

### Step 11: 公開確認

「動画の公開日時」ダイアログが表示されれば成功。動画リンクを確認。

## よくあるトラブル

### 「公開」ボタンがdisabledのまま

**原因**: 広告の適合性の自己評価が未完了
**対処**: Step 7 を実行する。「ドラフトを編集」から再度ダイアログを開き、広告の適合性タブで自己評価を送信する。

### refが見つからない

YouTube Studioのダイアログはrefが頻繁に変わる。`evaluate` でJSから直接操作するのが確実。

### 「チェック中」で待たされる

動画処理（SD/HD変換）が完了するまで数分かかることがある。広告の適合性が完了していれば、処理完了後に「公開」ボタンが有効になる。

### ダイアログが閉じてしまった

動画の編集ページ（`/video/<VIDEO_ID>/edit`）から「ドラフトを編集」ボタンで再度開ける。

## チャンネル情報

- **チャンネル名**: あきらパパのAI活用学習部屋
- **YouTube Studio URL**: https://studio.youtube.com/channel/UCDGYA9Zhwc6BIGxgigBLLdg
- **チャンネル登録者**: 5,074人

## タイトル・説明のガイドライン

- タイトルにハッシュタグを含める（例: `#Git #プログラミング #エンジニア`）
- 説明に制作フローを記載（OpenClaw / Remotion / Gemini TTS等）
- 子ども向け設定: 「いいえ」
- 広告の適合性: 技術解説なら「上記のいずれも含まない」
