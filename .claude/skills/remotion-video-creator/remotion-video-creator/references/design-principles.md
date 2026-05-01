# デザイン原則 - 人間らしい動画を作るために

## 🎯 根本原則: 「完璧を避ける」

AIが作る動画の最大の問題は「完璧すぎる」こと。
人間の手作業には必ず「ゆらぎ」がある。そのゆらぎこそが温かみ。

---

## 1. レイアウトの原則

### グリッドを「少しだけ」崩す

```typescript
// ❌ AIっぽい: 完璧な中央揃え
const badLayout = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
};

// ✅ 人間っぽい: 少しオフセット
const goodLayout = {
  position: 'absolute',
  left: '48%',  // 2%ずらす
  top: '52%',
  transform: 'translate(-50%, -50%)',
};
```

### 余白は「呼吸」

- 要素間の余白は均等にしない
- 重要な要素の周りは広く
- 関連する要素は近く（近接の法則）

```typescript
// 余白の黄金比率
const spacing = {
  tight: 8,    // 関連要素間
  normal: 24,  // 通常
  wide: 48,    // セクション間
  breathe: 80, // 重要な強調
};
```

### 視線の流れを設計する

縦長動画の視線パターン:
```
┌─────────────┐
│  ① タイトル │  ← 最初に目が行く
│             │
│  ② メイン   │  ← 次にここ
│   コンテンツ │
│             │
│  ③ 補足情報 │  ← 最後にここ
│             │
│  ④ 字幕エリア│  ← 常に見える位置
└─────────────┘
```

---

## 2. タイポグラフィの原則

### フォントの組み合わせ

```typescript
const typography = {
  // 見出し: 太く、大きく
  heading: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: 800,
    letterSpacing: '-2px',  // 大きい文字は詰める
  },
  
  // 本文: 読みやすく
  body: {
    fontFamily: 'system-ui',
    fontWeight: 500,
    letterSpacing: '0',
    lineHeight: 1.6,
  },
  
  // コード: 等幅
  code: {
    fontFamily: 'SF Mono, Menlo, monospace',
    fontWeight: 500,
  },
};
```

### サイズの比率（縦長動画向け）

```typescript
const fontSizes = {
  hero: 72,      // タイトル（画面の1/3程度）
  heading: 56,   // 見出し
  subheading: 36,// 小見出し
  body: 28,      // 本文
  caption: 20,   // キャプション
  code: 24,      // コードブロック
  subtitle: 32,  // 字幕
};
```

---

## 3. 配色の原則

### 3色ルール

```typescript
const colorScheme = {
  // メインカラー（60%）: 背景、大きな面積
  primary: '#0f172a',
  
  // セカンダリ（30%）: テキスト、境界線
  secondary: '#f8fafc',
  
  // アクセント（10%）: 強調、CTA
  accent: '#3b82f6',
};
```

### ビジネスライクな配色パターン

```typescript
// ダークモード（推奨）
const darkPalette = {
  bg: '#0f172a',
  bgGradient: '#1e293b',
  primary: '#3b82f6',    // 青
  secondary: '#10b981',  // 緑
  accent: '#f59e0b',     // オレンジ
  text: '#f8fafc',
  textMuted: '#94a3b8',
};

// ライトモード
const lightPalette = {
  bg: '#ffffff',
  bgGradient: '#f8fafc',
  primary: '#2563eb',
  secondary: '#059669',
  accent: '#d97706',
  text: '#0f172a',
  textMuted: '#64748b',
};
```

### 色の使い方

- **背景**: グラデーションで奥行き
- **テキスト**: 白 or 黒（コントラスト重視）
- **アクセント**: ボタン、重要な数字、CTA

```typescript
// グラデーション背景の例
const gradientBg = {
  background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgGradient} 100%)`,
};
```

---

## 4. 要素配置の原則（縦長動画）

### 安全エリアを守る

```
┌─────────────────────┐
│ ▲ 上部マージン 60px │  ← ステータスバー回避
│                     │
│                     │
│   コンテンツエリア   │
│                     │
│                     │
│ ▼ 下部マージン 280px│  ← 字幕 + YouTubeUI回避
└─────────────────────┘
```

```typescript
// 安全エリアの定義
const safeArea = {
  top: 60,
  bottom: 280,  // 字幕 + UIボタン
  left: 40,
  right: 40,
};
```

### 字幕の配置

```typescript
const subtitleStyle = {
  position: 'absolute',
  bottom: 280,  // YouTubeのUIが被らない位置
  left: 40,
  right: 40,
  textAlign: 'center',
  
  // 背景をつけて読みやすく
  background: 'rgba(0, 0, 0, 0.85)',
  padding: '16px 28px',
  borderRadius: 12,
};
```

---

## 5. 一貫性のルール

### 同じ種類の要素は同じスタイル

```typescript
// ステップバッジのスタイルを統一
const stepBadge = (color: string) => ({
  background: color,
  color: '#0f172a',
  padding: '10px 24px',
  borderRadius: 8,
  fontSize: 28,
  fontWeight: 700,
});
```

### アニメーションタイミングの統一

```typescript
// 全体で使うタイミング
const timing = {
  fast: 15,     // 0.5秒 @ 30fps
  normal: 30,   // 1秒
  slow: 60,     // 2秒
  stagger: 10,  // 連続アニメの間隔
};
```

---

## 6. チェックリスト

制作後、以下を確認:

- [ ] 色は3色以内か
- [ ] フォントは2種類以内か
- [ ] 要素間の余白は適切か
- [ ] 字幕は下部280px以上に配置か
- [ ] 完璧に揃いすぎていないか
- [ ] 視線の流れは自然か
- [ ] コントラストは十分か
