---
name: remotion-video-creator
description: |
  Remotion + Gemini TTS 2.5 + Whisper + BGMで本格的なショート動画を作成する。
  YouTubeショート、TikTok、Instagram Reels向けの縦長動画（1080x1920）に対応。
  AIっぽくない、人間が丁寧に手作業で作ったような温かみのある動画を生成する。

  Use when:
  - 「動画を作って」「PR動画」「ショート動画」「解説動画を作成」などの依頼
  - YouTubeショート、TikTok、Instagram Reels向けの動画制作
  - モーショングラフィックス、プロモーション動画、一般的な解説動画

  Don't use when:
  - プログラミング・技術コード解説動画 → tech-guide-remotion を使う
  - コード表示、ターミナル操作、Before/After比較のある技術解説 → tech-guide-remotion を使う

  Negative examples (誤発火防止):
  - ❌「Pythonの解説動画を作って」→ tech-guide-remotion
  - ❌「git コマンドの使い方動画」→ tech-guide-remotion
  - ❌「ターミナル操作の解説ショート」→ tech-guide-remotion
icon: icon.svg
---

# Remotion Video Creator

**人の心に響く動画を作る** — AIが作ったとバレない、魂のこもった映像制作スキル。

## 🎯 このスキルの哲学

動画は「情報の羅列」ではない。**ストーリー**であり、**体験**である。

- 視聴者の目線で考える
- 余白と間を大切にする
- 動きは意味を持たせる
- 音声と映像のシンクロを意識する

## 📁 ワークスペース

```
/Users/funakoshiakira-sub1-pc/workspace/<project-name>/
├── src/
│   ├── index.ts          # エントリーポイント
│   ├── Root.tsx          # Composition定義
│   └── <VideoName>.tsx   # メインコンポーネント
├── out/                   # 出力ファイル
├── scripts/               # ユーティリティ
└── public/                # 静的アセット
```

## 🚀 制作フロー

### Phase 1: 企画・構成（最重要）

**動画の骨格を決める。ここで8割決まる。**

1. **目的を明確に**: 誰に、何を、どう感じてほしいか
2. **構成を設計**: 起承転結、または問題→解決パターン
3. **尺を決める**: YouTubeショートは60秒以内
4. **ナレーション原稿を先に書く**: 映像は音声に合わせる

```markdown
## 構成例（60秒動画）
- 0-5秒: フック（興味を引く）
- 5-15秒: 問題提起 or 導入
- 15-40秒: メインコンテンツ
- 40-55秒: まとめ・CTA
- 55-60秒: エンディング
```

### ⚠️ 音声・映像同期の鉄則（超重要）

**動画の尺は必ずナレーション音声の長さに合わせる！**

1. **先にナレーション音声を生成** → 長さを確認（例: 30.2秒）
2. **動画のdurationInFramesを音声に合わせる**
   - 30秒の音声 → `durationInFrames = 30 * 30 = 900`（30fps時）
3. **各シーンのタイミングをナレーション内容に合わせて設計**

```typescript
// ❌ NG: 動画60秒、音声30秒 → ズレる！
durationInFrames={1800}  // 60秒

// ✅ OK: 音声の長さに合わせる
durationInFrames={906}   // 30.2秒（音声と同じ）
```

**シーン設計の例（30秒ナレーション）:**
```typescript
// ナレーション原稿のタイミングを見積もる
// 「たった3つのコマンドで〜」(0-5秒)
// 「1つ目、git add〜」(5-12秒)
// 「2つ目、git commit〜」(12-19秒)
// 「3つ目、git push〜」(19-25秒)
// 「この流れを覚えれば〜」(25-30秒)

<Sequence from={0} durationInFrames={150}>      {/* 0-5秒 */}
  <TitleScene />
</Sequence>
<Sequence from={150} durationInFrames={210}>    {/* 5-12秒 */}
  <GitAddScene />
</Sequence>
<Sequence from={360} durationInFrames={210}>    {/* 12-19秒 */}
  <GitCommitScene />
</Sequence>
<Sequence from={570} durationInFrames={180}>    {/* 19-25秒 */}
  <GitPushScene />
</Sequence>
<Sequence from={750} durationInFrames={156}>    {/* 25-30秒 */}
  <EndingScene />
</Sequence>
```

**ffmpegで合成時の注意:**
```bash
# -map で明示的に音声トラックを指定
ffmpeg -y \
  -i video.mp4 \
  -i audio_mixed.mp3 \
  -map 0:v -map 1:a \      # ← 重要！映像は0番、音声は1番から
  -c:v copy -c:a aac -b:a 192k \
  -shortest \
  final.mp4
```

### 🗂️ プロジェクト隔離ルール（2026-02-17 反省会議で追加・最重要）

**🚨 全動画は個別ディレクトリで制作すること。共有ディレクトリの使い回し禁止。**

```
/Users/funakoshiakira-sub1-pc/workspace/
├── video-mcp-auth/        ← MCP認証動画
├── video-plan-mode/       ← Plan Mode動画
└── video-subagents/       ← サブエージェント動画
```

**ルール:**
1. **1動画 = 1ディレクトリ** — 共有ワークスペースの使い回し禁止
2. **out/の使い回し禁止** — 前の動画のnarration.wav、.srtが残って音声ミスマッチの原因になる

### 🚨 アップロード前の整合性検証（必須・スキップ厳禁）

完成動画をアップする前に、音声と映像の整合性を自動検証する：

```bash
# 完成動画の音声をWhisperで文字起こし → タイトルと一致するか確認
ffmpeg -y -i out/final.mp4 -vn -acodec pcm_s16le -ar 16000 /tmp/verify_audio.wav
whisper /tmp/verify_audio.wav --model small --language ja --output_format txt --output_dir /tmp/
head -3 /tmp/verify_audio.txt
# → タイトルのテーマと一致していればOK、不一致なら即中断
```

**この検証をスキップしてアップロードすることは絶対禁止。**

### Phase 2: プロジェクト初期化

```bash
cd /Users/funakoshiakira-sub1-pc/workspace/
mkdir <project-name> && cd <project-name>
npm init -y
npm install remotion @remotion/cli @remotion/bundler react react-dom
npm install -D typescript @types/react
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

**src/index.ts:**
```typescript
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';
registerRoot(RemotionRoot);
```

### Phase 3: 映像コンポーネント作成

**人間らしさを出すためのデザイン原則** → [references/design-principles.md](references/design-principles.md)

**縦長動画テンプレート（1080x1920）:**
```typescript
// src/Root.tsx
import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';

export const RemotionRoot = () => (
  <Composition
    id="MyVideo"
    component={MyVideo}
    durationInFrames={1800}  // 60秒 @ 30fps
    fps={30}
    width={1080}
    height={1920}
  />
);
```

**アニメーションの基本パターン** → [references/animation-patterns.md](references/animation-patterns.md)

### Phase 4: Gemini TTS 2.5 でナレーション生成

**必須: 音声合成は必ずGemini TTS 2.5を使用する**

```bash
# ナレーション生成
curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{"parts":[{"text": "ナレーション原稿をここに"}]}],
    "generationConfig": {
      "response_modalities": ["AUDIO"],
      "speech_config": {
        "voice_config": {
          "prebuilt_voice_config": {
            "voice_name": "Kore"
          }
        }
      }
    }
  }' -o /tmp/tts_response.json

# デコード（PCM L16 24kHz → WAV）
node scripts/decode-gemini-audio.js
```

**音声の選び方:**
- **Kore**: 落ち着いた説明向け（ビジネス、解説）
- **Zephyr**: 明るく元気（エンタメ、紹介）
- **Aoede**: 柔らかく優しい（ナレーション、物語）

デコードスクリプト → [scripts/decode-gemini-audio.js](scripts/decode-gemini-audio.js)

### Phase 5: Whisper で字幕生成 & シーン同期（超重要！）

```bash
# ローカルWhisperで字幕生成（無料・高速）
whisper narration.wav --model small --language ja --output_format srt --output_dir .
```

**字幕の調整ポイント:**
- 1行は15文字以内が読みやすい
- 表示時間は最低1.5秒
- 句読点で区切る

### 🚨 シーン同期の改善策（2026年2月反省会議より）

**問題:** ナレーションとシーン切り替えがズレる
**原因:** シーンの秒数を「想定」で決めていた

**解決策: Whisper SRTタイムスタンプを使った正確な同期**

```bash
# 1. Whisper APIでSRT字幕を取得（タイムスタンプ付き）
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F file=@narration.wav \
  -F model=whisper-1 \
  -F response_format=srt \
  -F language=ja \
  -o narration.srt
```

**2. SRTからシーン境界を特定:**
```srt
1
00:00:00,000 --> 00:00:05,200
MongoDBの基礎を学びましょう！

2
00:00:05,200 --> 00:00:15,800
MongoDBはNoSQLデータベースです。
RDBとは違い、テーブルではなく...

3
00:00:15,800 --> 00:00:27,500
ドキュメント指向とは、JSON形式で...
```

**3. タイムスタンプをフレーム数に変換:**
```typescript
// SRT: 00:00:05,200 → 5.2秒 → 5.2 * 30 = 156フレーム
// SRT: 00:00:15,800 → 15.8秒 → 15.8 * 30 = 474フレーム

<Sequence from={0} durationInFrames={156}>      {/* 0-5.2秒: タイトル */}
  <TitleScene />
</Sequence>
<Sequence from={156} durationInFrames={318}>    {/* 5.2-15.8秒: NoSQL説明 */}
  <NoSQLScene />
</Sequence>
<Sequence from={474} durationInFrames={351}>    {/* 15.8-27.5秒: ドキュメント */}
  <DocumentScene />
</Sequence>
```

**4. シーン同期チェックリスト:**
- [ ] ナレーション原稿をセクションごとに明記
- [ ] 音声生成後、Whisperでタイムスタンプ取得
- [ ] SRTの各セクション開始時間をフレーム数に変換
- [ ] Sequenceのfrom値がSRTと一致しているか確認
- [ ] プレビューで音声とシーンが同期しているか最終確認

### Phase 6: BGM追加・音声ミックス

```bash
# BGMダウンロード（Bensound - クレジット必須）
curl -sL "https://www.bensound.com/bensound-music/bensound-inspire.mp3" -o bgm.mp3

# ナレーション + BGM ミックス
ffmpeg -y \
  -i narration.wav \
  -i bgm.mp3 \
  -filter_complex "[0:a]volume=1.2,apad=whole_dur=60[voice];[1:a]volume=0.15,atrim=0:60,afade=t=out:st=55:d=5[bgm];[voice][bgm]amix=inputs=2:duration=first[out]" \
  -map "[out]" -ac 2 -ar 44100 -b:a 192k \
  audio_mixed.mp3
```

**BGMの音量バランス:**
- ナレーション: 100%（volume=1.0〜1.2）
- BGM: 15-20%（volume=0.15〜0.2）
- 最後5秒でBGMフェードアウト

### Phase 7: レンダリング・合成

```bash
# Remotionでレンダリング
npx remotion render src/index.ts MyVideo out/video.mp4 --codec h264

# 音声合成
ffmpeg -y \
  -i out/video.mp4 \
  -i audio_mixed.mp3 \
  -c:v copy -c:a aac -b:a 192k \
  -map 0:v:0 -map 1:a:0 -shortest \
  out/final.mp4
```

## 🎨 人間らしさを出すコツ

### やるべきこと ✅

1. **タイミングをずらす**: 全てが同時に動くとAIっぽい
2. **イージングを使う**: `spring()` で自然な動き
3. **余白を作る**: 詰め込みすぎない
4. **色は3色まで**: メイン、アクセント、背景
5. **フォントは2種類まで**: 見出し用、本文用
6. **アニメーションに緩急**: 早い→遅い→早い

### やってはいけないこと ❌

1. **均等配置**: 完璧すぎると不自然
2. **同時アニメーション**: 全部一緒に動く
3. **派手すぎるエフェクト**: チカチカ、グラデ過多
4. **情報詰め込み**: 1画面に要素多すぎ
5. **フォント混ぜすぎ**: 3種類以上
6. **原色そのまま**: #FF0000, #00FF00 は避ける

## 📚 リファレンス

- [design-principles.md](references/design-principles.md) - デザイン原則詳細
- [animation-patterns.md](references/animation-patterns.md) - アニメーションパターン集
- [color-palettes.md](references/color-palettes.md) - 配色パターン
- [subtitle-styling.md](references/subtitle-styling.md) - 字幕デザイン

## 🛠️ スクリプト

- [decode-gemini-audio.js](scripts/decode-gemini-audio.js) - Gemini TTS音声デコード
- [generate-subtitles.sh](scripts/generate-subtitles.sh) - Whisper字幕生成
- [mix-audio.sh](scripts/mix-audio.sh) - 音声ミックス

## 💡 トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| 音声が出ない | `-map 1:a:0` を確認、音声トラック指定 |
| 字幕がズレる | SRTのタイムコードを手動調整 |
| 動画が重い | `--codec h264` でH.264エンコード |
| 色が違う | `yuvj420p` カラースペース確認 |

## 📝 クレジット

BGM使用時は必ずクレジットを入れる:
```
Music: Bensound.com
```
