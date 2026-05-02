# 配色パターン集

## 🎨 配色の基本ルール

1. **メイン3色**: 背景、テキスト、アクセント
2. **60-30-10の法則**: 背景60%、補助30%、アクセント10%
3. **原色は避ける**: #FF0000より#ef4444（彩度を落とす）

---

## 1. ダークモード（推奨）

### Tech Blue（テック系、解説動画）

```typescript
const techBlue = {
  bg: '#0f172a',          // スレートダーク
  bgGradient: '#1e293b',  // スレート
  primary: '#3b82f6',     // ブルー
  secondary: '#10b981',   // エメラルド
  accent: '#f59e0b',      // アンバー
  text: '#f8fafc',        // ホワイト
  textMuted: '#94a3b8',   // グレー
  code: '#1e1e1e',        // コードブロック背景
  codeText: '#22d3ee',    // シアン
};
```

### Midnight Purple（クリエイティブ、デザイン）

```typescript
const midnightPurple = {
  bg: '#0c0a1d',
  bgGradient: '#1a1533',
  primary: '#8b5cf6',     // バイオレット
  secondary: '#ec4899',   // ピンク
  accent: '#06b6d4',      // シアン
  text: '#f8fafc',
  textMuted: '#a1a1aa',
  code: '#18181b',
  codeText: '#a5f3fc',
};
```

### Forest Green（自然、健康、エコ）

```typescript
const forestGreen = {
  bg: '#0a1f0a',
  bgGradient: '#14341a',
  primary: '#22c55e',     // グリーン
  secondary: '#84cc16',   // ライム
  accent: '#facc15',      // イエロー
  text: '#f0fdf4',
  textMuted: '#86efac',
  code: '#0d1f0d',
  codeText: '#4ade80',
};
```

### Warm Sunset（エンタメ、感情的）

```typescript
const warmSunset = {
  bg: '#1c0f0a',
  bgGradient: '#2d1810',
  primary: '#f97316',     // オレンジ
  secondary: '#ef4444',   // レッド
  accent: '#fbbf24',      // アンバー
  text: '#fff7ed',
  textMuted: '#fdba74',
  code: '#1c0f0a',
  codeText: '#fb923c',
};
```

---

## 2. ライトモード

### Clean White（ビジネス、フォーマル）

```typescript
const cleanWhite = {
  bg: '#ffffff',
  bgGradient: '#f8fafc',
  primary: '#2563eb',     // ブルー
  secondary: '#059669',   // エメラルド
  accent: '#dc2626',      // レッド
  text: '#0f172a',
  textMuted: '#64748b',
  code: '#f1f5f9',
  codeText: '#0369a1',
};
```

### Soft Cream（温かみ、親しみ）

```typescript
const softCream = {
  bg: '#fffbeb',
  bgGradient: '#fef3c7',
  primary: '#b45309',     // アンバー
  secondary: '#0891b2',   // シアン
  accent: '#be123c',      // ローズ
  text: '#1c1917',
  textMuted: '#78716c',
  code: '#fef9c3',
  codeText: '#854d0e',
};
```

---

## 3. 特殊用途

### GitHub風（コード解説）

```typescript
const githubStyle = {
  bg: '#0d1117',
  bgGradient: '#161b22',
  primary: '#58a6ff',     // リンクブルー
  secondary: '#3fb950',   // グリーン（成功）
  accent: '#f85149',      // レッド（エラー）
  warning: '#d29922',     // イエロー（警告）
  text: '#c9d1d9',
  textMuted: '#8b949e',
  code: '#0d1117',
  codeText: '#79c0ff',
};
```

### Terminal風（ハッカー、CLI解説）

```typescript
const terminalStyle = {
  bg: '#000000',
  bgGradient: '#0a0a0a',
  primary: '#00ff00',     // マトリックスグリーン
  secondary: '#00ffff',   // シアン
  accent: '#ff6600',      // オレンジ
  text: '#00ff00',
  textMuted: '#00aa00',
  code: '#000000',
  codeText: '#00ff00',
};
```

---

## 4. グラデーションパターン

### 背景グラデーション

```typescript
// 斜めグラデーション（奥行き感）
const diagonalGradient = {
  background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgGradient} 100%)`,
};

// ラジアルグラデーション（中央強調）
const radialGradient = {
  background: `radial-gradient(circle at 50% 30%, ${colors.bgGradient} 0%, ${colors.bg} 70%)`,
};

// メッシュ風グラデーション
const meshGradient = {
  background: `
    radial-gradient(at 0% 0%, ${colors.primary}33 0%, transparent 50%),
    radial-gradient(at 100% 100%, ${colors.secondary}33 0%, transparent 50%),
    ${colors.bg}
  `,
};
```

### テキストグラデーション

```typescript
const gradientText = {
  background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};
```

### ボーダーグラデーション

```typescript
const gradientBorder = {
  border: '2px solid transparent',
  background: `linear-gradient(${colors.bg}, ${colors.bg}) padding-box,
               linear-gradient(90deg, ${colors.primary}, ${colors.secondary}) border-box`,
  borderRadius: 12,
};
```

---

## 5. アクセシビリティ

### コントラスト比の目安

- **大きな文字**: 3:1 以上
- **通常の文字**: 4.5:1 以上
- **重要な情報**: 7:1 以上

### 良いコントラストの組み合わせ

```typescript
// ダーク背景
const darkBgContrast = {
  background: '#0f172a',
  text: '#f8fafc',        // コントラスト比 15.8:1 ✅
  textMuted: '#94a3b8',   // コントラスト比 5.4:1 ✅
};

// ライト背景
const lightBgContrast = {
  background: '#ffffff',
  text: '#0f172a',        // コントラスト比 15.8:1 ✅
  textMuted: '#64748b',   // コントラスト比 5.1:1 ✅
};
```

---

## 6. 用途別の配色選び

| 用途 | 推奨パレット | 理由 |
|------|------------|------|
| プログラミング解説 | Tech Blue, GitHub風 | 落ち着き、信頼感 |
| ビジネス | Clean White, Tech Blue | プロフェッショナル |
| クリエイティブ | Midnight Purple | 創造性、個性 |
| 教育 | Soft Cream | 温かみ、親しみ |
| テック・スタートアップ | Tech Blue | モダン、信頼 |
| エコ・健康 | Forest Green | 自然、安心 |
| エンタメ | Warm Sunset | 情熱、エネルギー |
