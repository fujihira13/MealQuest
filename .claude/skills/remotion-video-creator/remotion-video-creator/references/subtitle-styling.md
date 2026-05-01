# 字幕デザインガイド

## 🎯 字幕の役割

字幕は「読むもの」ではなく「見るもの」。
視聴者が**無意識に情報を受け取れる**デザインを目指す。

---

## 1. 配置の原則

### YouTubeショートの安全エリア

```
┌─────────────────────┐
│                     │
│                     │
│   コンテンツ        │
│                     │
│                     │
├─────────────────────┤ ← 下から280px
│   【字幕エリア】    │
│                     │
│   YouTubeのUI       │ ← 下から0-150px（ボタン類）
└─────────────────────┘
```

```typescript
const subtitlePosition = {
  position: 'absolute',
  bottom: 280,  // YouTubeのUIを避ける
  left: 40,
  right: 40,
};
```

### なぜ280pxなのか

- 下から0-80px: いいね/コメント/シェアボタン
- 下から80-150px: チャンネル情報、説明文
- 下から150-200px: 安全マージン
- **280px以上**: 字幕の安全エリア

---

## 2. 視認性のデザイン

### 背景をつける（必須）

```typescript
const subtitleBackground = {
  background: 'rgba(0, 0, 0, 0.85)',  // 85%の黒
  padding: '16px 28px',
  borderRadius: 12,
};
```

### なぜ背景が必要か

- 動画の背景色が変わっても読める
- コントラストが常に確保される
- 高齢者や視覚に課題がある人も読みやすい

### テキストシャドウも追加

```typescript
const subtitleText = {
  color: '#ffffff',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
};
```

---

## 3. フォント設定

### サイズ

```typescript
// 縦長動画（1080x1920）の場合
const subtitleFontSize = {
  standard: 32,    // 通常の字幕
  emphasis: 36,    // 強調時
  small: 26,       // 補足情報
};
```

### フォントウェイト

```typescript
const subtitleWeight = {
  normal: 600,     // セミボールド（推奨）
  bold: 700,       // 重要な部分
};
```

### フォントファミリー

```typescript
const subtitleFont = {
  // システムフォントで十分（軽量）
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
};
```

---

## 4. 行数とタイミング

### 1行あたりの文字数

- **最大15文字**が読みやすい
- 長い場合は改行

```typescript
// 悪い例
const badSubtitle = "GitのPullコマンドはリモートリポジトリから最新のコードを取得します";

// 良い例
const goodSubtitle = "GitのPullコマンドは\nリモートから最新コードを取得";
```

### 表示時間

```typescript
const subtitleTiming = {
  minimum: 1.5,    // 最低1.5秒
  perChar: 0.05,   // 1文字あたり0.05秒追加
  maximum: 5,      // 最大5秒
};

// 計算例: "こんにちは"（5文字）
// 1.5 + (5 * 0.05) = 1.75秒
```

### フェードイン/アウト

```typescript
const subtitleFade = {
  fadeIn: 0.15,    // 全体の15%でフェードイン
  fadeOut: 0.15,   // 全体の15%でフェードアウト
};

// Remotionでの実装
const fadeIn = interpolate(progress, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' });
const fadeOut = interpolate(progress, [0.85, 1], [1, 0], { extrapolateLeft: 'clamp' });
const opacity = Math.min(fadeIn, fadeOut);
```

---

## 5. 字幕コンポーネント実装

### 完全なコンポーネント

```typescript
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface Subtitle {
  start: number;  // 開始時間（秒）
  end: number;    // 終了時間（秒）
  text: string;
}

interface SubtitlesProps {
  subtitles: Subtitle[];
  fps?: number;
}

const colors = {
  bg: 'rgba(0, 0, 0, 0.85)',
  text: '#ffffff',
};

export const Subtitles: React.FC<SubtitlesProps> = ({ subtitles, fps = 30 }) => {
  const frame = useCurrentFrame();
  const currentTime = frame / fps;
  
  // 現在表示すべき字幕を探す
  const currentSubtitle = subtitles.find(
    sub => currentTime >= sub.start && currentTime < sub.end
  );
  
  if (!currentSubtitle) return null;
  
  // フェードイン/アウト計算
  const duration = currentSubtitle.end - currentSubtitle.start;
  const progress = (currentTime - currentSubtitle.start) / duration;
  
  const fadeIn = interpolate(progress, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(progress, [0.9, 1], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 280,
      left: 40,
      right: 40,
      display: 'flex',
      justifyContent: 'center',
      opacity,
    }}>
      <div style={{
        background: colors.bg,
        padding: '16px 28px',
        borderRadius: 12,
        maxWidth: '90%',
      }}>
        <p style={{
          color: colors.text,
          fontSize: 32,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 600,
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.5,
          whiteSpace: 'pre-line',  // 改行を反映
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        }}>
          {currentSubtitle.text}
        </p>
      </div>
    </div>
  );
};
```

### 使用例

```typescript
const subtitles: Subtitle[] = [
  { start: 0, end: 4, text: 'Git Pull と Push\nチーム開発の基本' },
  { start: 4, end: 8, text: 'まずはgit pull' },
  { start: 8, end: 12, text: '最新のコードを\nダウンロードします' },
];

export const MyVideo: React.FC = () => (
  <AbsoluteFill>
    {/* 他のコンテンツ */}
    <Subtitles subtitles={subtitles} />
  </AbsoluteFill>
);
```

---

## 6. SRTからの字幕データ生成

### SRTフォーマット

```
1
00:00:00,000 --> 00:00:04,000
Git Pull と Push

2
00:00:04,000 --> 00:00:08,000
チーム開発の基本をマスターしましょう
```

### SRT → JSON 変換スクリプト

```javascript
function parseSRT(srtContent) {
  const blocks = srtContent.trim().split(/\n\n+/);
  
  return blocks.map(block => {
    const lines = block.split('\n');
    const timeLine = lines[1];
    const text = lines.slice(2).join('\n');
    
    const [start, end] = timeLine.split(' --> ').map(timeToSeconds);
    
    return { start, end, text };
  });
}

function timeToSeconds(time) {
  const [h, m, s] = time.replace(',', '.').split(':');
  return parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s);
}
```

---

## 7. 字幕のスタイルバリエーション

### スタンダード（推奨）

```typescript
const standardStyle = {
  background: 'rgba(0, 0, 0, 0.85)',
  color: '#ffffff',
  borderRadius: 12,
};
```

### ネオン風

```typescript
const neonStyle = {
  background: 'transparent',
  color: '#00ffff',
  textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
  fontWeight: 700,
};
```

### ミニマル

```typescript
const minimalStyle = {
  background: 'transparent',
  color: '#ffffff',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
};
```

### カード風

```typescript
const cardStyle = {
  background: '#ffffff',
  color: '#0f172a',
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
};
```

---

## 8. チェックリスト

- [ ] 字幕は下から280px以上に配置か
- [ ] 背景色で視認性を確保しているか
- [ ] 1行15文字以内か
- [ ] 最低1.5秒表示されるか
- [ ] フェードイン/アウトがあるか
- [ ] フォントサイズは32px前後か
- [ ] テキストシャドウで縁取りしているか
