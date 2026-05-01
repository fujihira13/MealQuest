---
name: tech-guide-remotion
description: |
  プログラミング・AI技術解説のショート動画をRemotionで作成する。
  3パターン対応: A)比較型（Before/After）、B)コード単体型（メソッド解説）、C)ターミナル型（CLI操作）。
  共通UI: プログレスドット、シーン見出し、タイプライター+カーソル点滅、解説カードポップアップ。

  Use when:
  - 「技術解説動画」「コーディング解説ショート」「プログラミング動画」「ターミナル解説」などの依頼
  - コードのBefore/After比較、メソッド解説、CLI操作の動画
  - シンタックスハイライト付きのコード表示が必要な動画

  Don't use when:
  - PR動画、プロモーション動画、一般的な解説動画 → remotion-video-creator を使う
  - コード表示を含まない動画（製品紹介、イベント告知等） → remotion-video-creator を使う

  Negative examples (誤発火防止):
  - ❌「商品のPR動画を作って」→ remotion-video-creator
  - ❌「会社紹介のショート動画」→ remotion-video-creator
  - ❌「イベント告知動画」→ remotion-video-creator
---

# Tech Guide Remotion

プログラミング・AI解説のショート動画を、ビジネスライクで分かりやすいデザインで作成する。

## 🎯 3パターン

| パターン | 用途 | コードUI |
|----------|------|---------|
| **A: 比較型** | var vs const、Before/After | 上下分割ウィンドウ |
| **B: コード単体型** | メソッド解説、関数紹介 | フルサイズ+行番号 |
| **C: ターミナル型** | CLI操作、環境構築 | macOSターミナル |

## 📐 レイアウト仕様（必須）

1080×1920 縦長。Webレスポンシブを意識した余白設計。

```
┌──────────────────────────┐ 0px
│                          │
│  ●━━○━━○  1/3           │  ← プログレスドット（top: 80px）
│                          │
│  🔥 シーン見出し         │  ← 見出し（top: ~180px, fontSize:48, bold）
│  ────────────            │     アクセントライン（accent色, 3px）
│                          │
│        余白              │
│                          │  576px (30%)
│  コンテンツ開始           │  ← コード/ターミナル（top: 30%から）
│  ┌────────────────────┐  │
│  │  コードウィンドウ    │  │     左右パディング: 60px
│  │  幅: 960px          │  │     角丸16px, shadow
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │  ← 解説カード（spring popup）
│  │💡 解説テキスト      │  │     タイプライター完了後に出現
│  └────────────────────┘  │
│                          │  1536px (80%)
│                          │
│    （空きエリア 20%）     │  ← 何も置かない
│                          │
└──────────────────────────┘  1920px
```

**数値:**
- 左右パディング: 60px
- コンテンツ幅: 960px
- プログレスドット: top 80px
- シーン見出し: top ~180px
- コンテンツ開始: top 30% (576px)
- コンテンツ下限: 80% (1536px) — これ以下に要素を置かない

## 🎨 共通デザイン仕様

### 配色（デフォルト: GitHub Dark基調）
```
背景: linear-gradient(135deg, #0d1117, #161b22) + 微かグリッド(opacity 0.04)
テキスト: #e6edf3（メイン）, #8b949e（サブ）
アクセント: #3b82f6（青）
```

### 配色オーバーライド（テーマ別）
特定ツール/サービスの解説動画では、そのブランドカラーに合わせる。

**Claude Code テーマ:**
```
背景: linear-gradient(135deg, #1f1e1d, #26261f) — Anthropicダークベース
テキスト: #faf9f5（オフホワイト）, #87867f（サブ）
アクセント: #d97757（テラコッタオレンジ — Claude Code公式アクセント）
サブアクセント: #bcd1ca（ミントグリーン）, #6a9bcc（ブルー）
コードウィンドウbg: #141413
ボタン/CTA: #d97757（オレンジ）or #141413（黒）
```
→ Claude Code解説動画では必ずこのテーマを使用すること。

### シンタックスハイライト
```
キーワード(const/var/let/if/return): #c084fc（紫）
文字列: #4ade80（緑）
数値: #f59e0b（黄）
メソッド/関数: #60a5fa（青）
コメント: #6b7280（グレー）
句読点: #8b949e
```

### 共通コンポーネント

**プログレスドット:**
- アクティブ/完了: #58a6ff（白青）、未完了: #30363d
- ドット14px、接続線30px×3px
- 右端に「n/N」テキスト（#8b949e）

**シーン見出し:**
- fontSize: 48, fontWeight: bold, color: #e6edf3
- spring fade-in + translateY(20→0)
- 下にアクセントライン（gradient #58a6ff→#c084fc, height 4px, width 120px）
- **アイコンは絵文字を使わない。Heroicons（SVGインライン）を使用する。** → [references/heroicons.md](references/heroicons.md)

**タイプライター:**
- **速度: 1文字1フレーム**（重要！遅すぎるとシーン時間が足りなくなる）
- **🚨 カーソル点滅（最重要！違和感を絶対に出さない）:**
  - カーソル文字: `▌`（太めのパイプ）
  - **タイプライター入力中: カーソルは常に表示（点滅しない）**— 入力中に点滅すると不自然
  - **タイプライター完了後: カーソルが点滅開始**（15フレーム周期 = 500ms）
  - 実装: `const blinking = typingDone ? (Math.floor(frame / 15) % 2 === 0) : true;`
  - カーソル色: アクセント色、コードテキストと同じ行の末尾に配置
  - カーソルはコードの最後の文字の直後に表示（改行しない）
  - **🚨 カーソルは最後の行にだけ表示する** — 複数行のタイプライターで、全行にカーソルが出るのはNG。現在タイピング中の最後の行の末尾にだけカーソルを表示すること。完了後も最終行の末尾のみ。

**🚨 解説カード（最重要！必ず左右中央寄せ）:**
- タイプライター完了後にspring popup（下からスライド）
- **必ず左右中央寄せ**: `display: 'flex', justifyContent: 'center'` で親要素をセンタリング
- カード自体: `width: 960px`（コードウィンドウと同幅）、`margin: '0 auto'`
- または `position: 'absolute', left: 60, right: 60` で左右均等配置
- bg: rgba(59,130,246,0.12), border: 1px solid rgba(59,130,246,0.3), borderRadius: 12
- 内部レイアウト: Heroicon SVG（light-bulb等）+ テキスト（fontSize: 30）、`textAlign: 'center'`
- **絶対に左寄せにしない。必ず画面の左右中央に来ること。**
- **絵文字(💡🔥📦等)は使わない。全てHeroicons SVGで統一する。**

**コードウィンドウ（A,B共通）:**
- macOS風タイトルバー: 赤(#ff5f57)/黄(#febc2e)/緑(#28c840)ドット + ファイル名
- bg: #0d1117, border: 1px solid #30363d, borderRadius: 16
- boxShadow: 0 8px 32px rgba(0,0,0,0.4)

**ターミナルウィンドウ（C用）:**
- 同上のmacOSタイトルバー + 「akira@mac — zsh」
- プロンプト: `akira@mac`(#10b981) `~`(#3b82f6) `%`(白)
- コマンド: 白、出力: #94a3b8、成功: #10b981(✅)、ビルドステップ: #f59e0b

## 🛠️ 環境要件

### ローカルWhisper（必須）
字幕（SRT）生成は**必ずローカルWhisper**を使用する。API版は使わない（コスト¥0）。

```bash
# インストール済みパス
export PATH="$HOME/Library/Python/3.9/bin:$PATH"

# 使用コマンド
whisper out/narration.wav --model small --language ja --output_format srt --output_dir out/
```

| 項目 | 値 |
|------|-----|
| パッケージ | openai-whisper 20240930 |
| PyTorch | 2.2.2（CPU） |
| NumPy | 1.26.4（※2.x不可） |
| 推奨モデル | `small`（精度と速度のバランス） |
| 注意 | テキスト精度はやや低め（カタカナ混じり）だが**タイムスタンプ精度は十分** |

⚠️ Intel Mac (i9-9980HK) では `large` モデルは時間がかかりすぎるため `small` を使用。

### コスト
| 工程 | ツール | コスト |
|------|--------|--------|
| ナレーション | Gemini TTS 2.5 Flash | **¥0**（Free Tier） |
| 字幕(SRT) | ローカルWhisper | **¥0** |
| BGM | 固定ファイル（著作権フリー確認済み） | **¥0** |
| ミックス | ffmpeg | **¥0** |
| レンダリング | Remotion（ローカル） | **¥0** |
| **合計** | | **¥0 / 本** |

## 🚀 制作フロー

### 1. テーマ・構成決定
- パターン（A/B/C）を選択
- 3〜4シーン構成（タイトル + メインシーン2-3個 + **まとめ**）
- ナレーション原稿を先に書く（**最後に必ずまとめセクションを入れる**）

### 🎙️ ナレーション口調（あきらパパ口調）

**全てのナレーション原稿は「あきらパパ口調」で書くこと。**

| 特徴 | 説明 | 例 |
|------|------|-----|
| **語尾** | 「〜ですね」「〜しましょう」「〜ですよね」 | 「これで完了ですね」「やってみましょう」 |
| **親しみやすさ** | カジュアルすぎず、堅すぎない丁寧語 | 「めちゃくちゃ便利なんですよ」 |
| **共感** | 初心者の気持ちに寄り添う | 「最初はちょっと難しいですよね」 |
| **盛り上げ** | ポジティブに背中を押す | 「これだけで、もう立派なエンジニアです！」 |
| **呼びかけ** | 視聴者に語りかける | 「皆さん」「ここ、ポイントです」 |
| **簡潔さ** | ショート動画なので短文テンポ重視 | 長い説明より、短く区切って伝える |

**NG例:**
- ❌ 「〜である」「〜だ」（論文調・偉そう）
- ❌ 「〜でございます」（堅すぎ）
- ❌ 感情のない淡々とした説明
- ❌ **「簡単ですよね」「簡単ですよね？」等の上から目線フレーズ** — 視聴者を見下す印象になる。絶対禁止！
- ❌ **「こんなの誰でもできます」「当たり前ですが」等のマウント表現** — 初心者を萎縮させる
- 💡 代わりに「これで完了です！」「シンプルですね」「一瞬で終わりますね」など、事実ベースのポジティブ表現を使う

**🚫 X投稿時の絶対禁止ハッシュタグ:**
- ❌ `#駆け出しエンジニアと繋がりたい`（ダサい・キモい）
- ❌ `#プログラミング初心者`
- ❌ 「繋がりたい」系タグ全般
- あきらパパ様のブランドに合わないタグは使用禁止

**OK例:**
```
はい、今回はGitの基本コマンドを紹介していきます。
まず最初に、git initですね。
これを実行すると、プロジェクトフォルダがGitリポジトリになります。
簡単ですよね？ では次に行きましょう。
```

### 2. ナレーション生成（Gemini TTS 2.5）
```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{"parts":[{"text": "原稿テキスト"}]}],
    "generationConfig": {
      "response_modalities": ["AUDIO"],
      "speech_config": {"voice_config": {"prebuilt_voice_config": {"voice_name": "Kore"}}}
    }
  }' -o /tmp/tts_response.json

node <skill-dir>/scripts/decode-gemini-audio.js /tmp/tts_response.json out/narration.wav
```
音声: Kore（ビジネス向け）推奨。

### 3. 音声の長さ確認 → durationInFrames設定
```bash
ffprobe -v quiet -show_entries format=duration -of csv=p=0 out/narration.wav
# 秒数 × 30 = durationInFrames
```

### 4. TSXコンポーネント作成
テンプレートTSXを参照: [assets/](assets/) 内の各パターンテンプレ。
- `assets/FusionA_Compare.tsx` — 比較型テンプレ
- `assets/FusionB_CodeSingle.tsx` — コード単体型テンプレ
- `assets/FusionC_Terminal.tsx` — ターミナル型テンプレ

**⚠️ インデント注意:** コード文字列内のインデントは正確に。スペース2個のインデントを統一すること。

### 5. プロジェクトセットアップ（初回のみ）
```bash
cd /Users/funakoshiakira-sub1-pc/workspace/<project-name>
npm init -y
npm install remotion @remotion/cli @remotion/bundler react react-dom typescript @types/react
```

tsconfig.json、src/index.ts、src/Root.tsx を作成（標準構成）。

### 6. BGM & ミックス
```bash
# 固定BGMファイルをコピー（著作権フリー確認済み・YouTube著作権クレームなし）
cp /Users/funakoshiakira-sub1-pc/.openclaw/skills/tech-guide-remotion/bgm.mp3 out/bgm.mp3

# ナレーション + BGM ミックス（duration=ナレーションの秒数に合わせる）
ffmpeg -y \
  -i out/narration.wav -i out/bgm.mp3 \
  -filter_complex "[0:a]volume=1.2[voice];[1:a]volume=0.15,atrim=0:<秒数+1>,afade=t=out:st=<秒数-5>:d=5[bgm];[voice][bgm]amix=inputs=2:duration=first[out]" \
  -map "[out]" -ac 2 -ar 44100 -b:a 192k \
  out/audio_mixed.mp3
```
- ナレーション: 120% (volume=1.2)
- BGM: 15% (volume=0.15)
- ラスト5秒でBGMフェードアウト

### 7. レンダリング & 最終合成
```bash
# 映像レンダリング
npx remotion render src/index.ts <CompositionId> out/video.mp4 --codec h264

# 映像 + ミックス済み音声を合成
ffmpeg -y -i out/video.mp4 -i out/audio_mixed.mp3 \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest \
  out/final.mp4
```

## 🎬 ナレーション×シーン同期（天才編集者ルール）

**最重要: ナレーションの内容と画面のシーン切り替えを完璧に合わせること！**

### 手順
1. **ナレーション音声を生成**（Gemini TTS）
2. **ローカルWhisperでSRT字幕を取得**（無料・高速）
```bash
whisper out/narration.wav --model small --language ja --output_format srt --output_dir out/
```
※ ローカルWhisperを必ず使用すること（API不要・コスト¥0）
3. **SRTタイムスタンプからフレーム番号を計算**: `秒数 × 30 = フレーム`
4. **各シーンのSequence `from`をSRTに合わせる**

### 例: SRT → フレーム変換
```
SRT: 00:00:05,320 → 5.32秒 → frame 160
SRT: 00:00:15,800 → 15.80秒 → frame 474
SRT: 00:00:20,760 → 20.76秒 → frame 623
```

### NG例
- ❌ ナレーションが「次にスコープ」と言っているのにまだ前のシーンが表示されている
- ❌ シーンが変わったのにナレーションがまだ前の内容を話している
- ❌ フレーム数を「だいたい」で決める

### OK例
- ✅ SRTの「次に〜」「そして〜」等の転換語でシーン切り替え
- ✅ 各セクションの開始タイムスタンプを正確にフレーム変換
- ✅ TSXファイル冒頭にSRTタイムスタンプをコメントで記載

## 🔊 音声の入れ方

### Remotion `<Audio>` コンポーネントを使う（必須）
```tsx
import { Audio, staticFile } from 'remotion';

// publicフォルダに音声ファイルを配置
// public/narration.wav

// コンポーネント内で:
<Audio src={staticFile('narration.wav')} />
```

**publicフォルダ**: プロジェクトルートに `public/` を作成し、WAVファイルをコピー。
`staticFile()` はpublicフォルダからの相対パスを返す。

### ⚠️ propsでの音声指定は使わない
Remotion CLIのpropsで音声ファイルパスを渡す方法は不安定。
`staticFile()` で直接参照するのが確実。

## 📌 解説カードの配置ルール

**解説カードはコンテンツ（コードウィンドウ/ターミナル）の直下に配置する。**

```tsx
// ✅ 正しい配置: コンテンツの下にmargin-top: 50px
<div style={{ position: 'absolute', top: '30%', left: PAD }}>
  <CodeWindow ... />
  <ExplainCard ... style={{ marginTop: 50, width: 960 }} />
</div>

// ❌ 間違い: absoluteで固定位置に配置
<div style={{ position: 'absolute', top: '62%', ... }}>
  <ExplainCard />
</div>
```

- `marginTop: 50` でコンテンツとの間隔を確保
- `width: 960`（コードウィンドウと同幅）
- absoluteのtop固定は禁止（コンテンツの高さが変わると重なる）

## 🎬 まとめシーン（必須・全動画共通）

**🚨 全ての動画の最後に必ず「まとめシーン」を入れること。省略禁止。**

### ナレーション原稿
原稿の最後に必ずまとめセクションを書く：
```
最後にまとめです。
ポイント1は〜です。
ポイント2は〜です。
ポイント3は〜です。
```
→ SRTの「最後にまとめ」のタイムスタンプでシーン切り替え。

### まとめシーンUI仕様
- プログレスドット: 最後のステップ（全完了状態）
- シーン見出し: 「📝 まとめ」+ アクセントライン
- **3ポイントのカードリスト**をspring fade-inで順次表示

### 実装例（番号付きカード形式）
```tsx
function SummaryScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = [
    'ポイント1のテキスト',
    'ポイント2のテキスト',
    'ポイント3のテキスト',
  ];

  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ padding: '0 60px' }}>
      {/* プログレスドット */}
      <div style={{ position: 'absolute', top: 80, left: 60 }}>
        <ProgressDots current={totalSteps - 1} total={totalSteps} />
      </div>
      {/* 見出し */}
      <div style={{
        position: 'absolute', top: 160, left: 60,
        opacity: titleOpacity, transform: `scale(${titleScale})`,
      }}>
        <div style={{ fontSize: 48, fontWeight: 'bold', color: '#e6edf3' }}>
          📝 まとめ
        </div>
        <div style={{ width: 120, height: 4, background: 'linear-gradient(90deg, #58a6ff, #c084fc)', borderRadius: 2, marginTop: 12 }} />
      </div>
      {/* 3ポイントカード */}
      <div style={{ position: 'absolute', top: '30%', left: 60, width: 960 }}>
        {items.map((item, i) => {
          const delay = 20 + i * 25;
          const itemScale = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 100 } });
          const itemOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{
              opacity: itemOpacity, transform: `scale(${itemScale})`,
              display: 'flex', alignItems: 'center', gap: 20,
              marginBottom: 40, padding: '28px 32px',
              background: 'linear-gradient(135deg, rgba(88,166,255,0.1), rgba(192,132,252,0.1))',
              border: '1px solid rgba(88,166,255,0.3)', borderRadius: 16,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #58a6ff, #c084fc)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 'bold', color: '#fff', flexShrink: 0,
              }}>{i + 1}</div>
              <span style={{ fontSize: 38, color: '#e6edf3', fontWeight: 600, lineHeight: 1.4 }}>{item}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
```

## 🗂️ プロジェクト隔離ルール（2026-02-17 反省会議で追加・最重要）

**🚨 全動画は個別ディレクトリで制作すること。共有ディレクトリの使い回し禁止。**

### ディレクトリ構造（必須）
```
/Users/funakoshiakira-sub1-pc/workspace/
├── cc-shorts-mcp-auth/        ← MCP認証動画
│   ├── src/
│   ├── out/
│   └── public/
├── cc-shorts-plan-mode/       ← Plan Mode動画
│   ├── src/
│   ├── out/
│   └── public/
└── cc-shorts-subagents/       ← サブエージェント動画
    ├── src/
    ├── out/
    └── public/
```

**ルール:**
1. **1動画 = 1ディレクトリ** — `cc-shorts-auto`のような共有ワークスペースは使わない
2. **ディレクトリ名にトピックを含める** — `cc-shorts-{topic}`形式
3. **out/の使い回し禁止** — 前の動画のnarration.wav、.srtが残って事故の原因になる
4. **ファイル名にトピック接頭辞不要** — ディレクトリで分離されているので`narration.wav`でOK

### 制作開始時の初期化（毎回必須）
```bash
PROJECT="cc-shorts-$(echo $TOPIC | tr ' ' '-' | tr '[:upper:]' '[:lower:]')"
cd /Users/funakoshiakira-sub1-pc/workspace/
mkdir -p $PROJECT/{src,out,public}
cd $PROJECT
```

### 🚨 アップロード前の整合性検証（必須・スキップ厳禁）

完成動画をYouTubeにアップする前に、以下の自動検証を実行する：

```bash
# Step 1: 完成動画の音声を抽出してWhisperで文字起こし
ffmpeg -y -i out/final.mp4 -vn -acodec pcm_s16le -ar 16000 /tmp/verify_audio.wav
whisper /tmp/verify_audio.wav --model small --language ja --output_format txt --output_dir /tmp/

# Step 2: 冒頭テキストが動画タイトル/テーマと一致するか確認
head -3 /tmp/verify_audio.txt
# → タイトルのテーマと一致していればOK
# → 別の動画の内容が聞こえたら即STOP
```

**判定基準:**
- ✅ 音声冒頭が「今回はMCP機能を〜」→ MCP動画タイトルと一致 → OK
- ❌ 音声冒頭が「サブエージェント機能を〜」→ MCP動画なのに不一致 → **即中断・修正**

**この検証をスキップしてアップロードすることは絶対禁止。**

## 🔒 品質管理ルール（2026-02-13 反省会議で追加）

### 実装前チェック（必須）
1. **SKILL.md必読チェック** — 実装前にこのファイルのレイアウトセクションを必ず読み、数値（top:80px, top:180px, top:30%, width:960px, PAD:60px）をコードにコメントとして転記する
2. **リファレンス実装の参照** — 新規制作時は、過去のあきらパパ様承認済み実装を必ず参照する。ゼロから書き直さない。承認済みリファレンス: `~/workspace/claude-code-video-1/src/ClaudeCodeInstall.tsx`

### レイアウト鉄則（position: absolute方式）
**paddingTopによる「なんとなく配置」は絶対禁止。** 以下の構造を厳守する:
```tsx
// ✅ 正しいレイアウト — position: absoluteで明確な位置指定
<AbsoluteFill>
  <div style={{ position: 'absolute', top: 80, left: PAD }}>
    <ProgressDots current={0} total={3} />
  </div>
  <div style={{ position: 'absolute', top: 180, left: PAD }}>
    <SceneHeading icon={ICON} text="見出し" frame={frame} fps={fps} />
  </div>
  <div style={{ position: 'absolute', top: '30%', left: PAD }}>
    <TerminalWindow> ... </TerminalWindow>
    <HintCard text="解説テキスト" frame={frame} delay={200} fps={fps} />
  </div>
</AbsoluteFill>

// ❌ 絶対禁止 — paddingTopで配置
<div style={{ paddingTop: 320, paddingLeft: 40 }}>
  <TerminalWindow> ... </TerminalWindow>
</div>
```

### シーン見出し必須
**全てのシーン（Title以外）にシーン見出しを必ず表示する。** 見出しなしでターミナルだけが表示されるのはNG。

### 🎬 セルフレビュー（レンダリング後、必須）
**動画を作り終えたら、必ず自分で動画を視聴してレビューする。** アップロード前に以下を確認：
1. **レイアウト** — テキストが画面外にはみ出していないか、余白は適切か
2. **タイミング** — ナレーションとシーン切り替えがズレていないか
3. **可読性** — コード・テキストが小さすぎないか、背景と被って読めないか
4. **シーン見出し** — 全シーンに見出しが表示されているか
5. **カーソル** — 最終行のみに表示されているか、不自然な点滅がないか
6. **全体の印象** — 視聴者として見て「これは良い動画だ」と思えるか

**判断基準:**
- 問題あり → 修正してから再レンダリング → 再レビュー
- 問題なし → アップロードに進む

**セルフレビューをスキップしてアップロードすることは絶対禁止。**

### 量産テンプレート品質ゲート
- cronジョブで量産する前に、最初の1本をあきらパパ様に確認いただく
- テンプレートの品質が承認されてから量産に入る
- render前にRemotionプレビューで各シーンを視覚確認する

### 共通定数（全動画で統一）
```tsx
const PAD = 60;       // 左右パディング
const TERM_W = 960;   // ターミナル/コードウィンドウ幅
const FONT = 'SF Mono, Menlo, monospace';
// ProgressDots: top 80px
// SceneHeading: top 180px
// Content: top '30%'
```

## ⚠️ 重要ルール

1. **インデントは正確に** — コード文字列内のスペースを間違えない。2スペースインデント統一
2. **タイプライターは1文字/1フレーム** — 遅すぎるとシーン時間が足りない
3. **タイプライター完了後に次シーン** — 途中で切れない設計
4. **上部80%にコンテンツ収める** — 下部20%は空き
5. **コンテンツは30%から開始** — 上部はプログレス+見出し+余白
6. **音声の長さに動画を合わせる** — durationInFrames = 秒数 × 30
7. **🚨 ナレーション×シーン同期は絶対** — ローカルWhisperでSRT取得→フレーム変換。「だいたい」禁止。API版Whisperは使わない
8. **🚨 音声は`<Audio src={staticFile()}>` で入れる** — publicフォルダにWAV配置。propsは使わない
9. **🚨 カーソル点滅は自然に** — 入力中は常時表示、完了後のみ点滅（10フレーム周期）。違和感を出さない
10. **🚨 解説カードはコンテンツ直下margin-top:50px** — absolute top固定禁止。コードウィンドウと同幅960px
11. **🚨 解説カードは大きめ文字（42px, fontWeight:600）** — 二行になってもOK。読みやすさ最優先
12. **絵文字禁止。Heroicons SVGを使う** — 💡🔥📦等の絵文字は一切使わない。全てHeroiconsのSVGインラインで統一
13. **BGMを必ず入れる** — 固定BGM（`skills/tech-guide-remotion/bgm.mp3`）を使用。ダウンロード不要！ナレ120%/BGM15%、ラスト5秒フェードアウト。**他のBGMは使わない**
14. **🚨 まとめシーン必須** — 全動画の最後に3ポイントspring fade-inまとめを入れる。省略禁止
15. **🚨 字幕はローカルWhisperのみ** — `whisper --model small --language ja`。Whisper API（OpenAI）は使わない。コスト¥0を維持
