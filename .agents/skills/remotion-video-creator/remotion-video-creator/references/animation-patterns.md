# アニメーションパターン集

## 🎬 根本原則: 「意味のある動き」

アニメーションは装飾ではない。**情報を伝える手段**。

- 登場 → 「見て！」
- 退場 → 「次へ」
- 強調 → 「ここ重要！」
- 待機 → 「まだあるよ」

---

## 1. 基本のイージング

### spring() - 自然な動き（推奨）

```typescript
import { spring, useCurrentFrame } from 'remotion';

const MyComponent = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  
  // 自然なバネアニメーション
  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 30,  // 1秒
    config: {
      damping: 12,    // 減衰（大きいほど早く止まる）
      stiffness: 100, // 硬さ（大きいほど早く動く）
      mass: 1,        // 質量（大きいほどゆっくり）
    },
  });
  
  return <div style={{ transform: `scale(${scale})` }} />;
};
```

### spring の config プリセット

```typescript
const springPresets = {
  // ポップな登場（ボタン、バッジ）
  bouncy: { damping: 8, stiffness: 200, mass: 0.5 },
  
  // 滑らかな登場（テキスト、カード）
  smooth: { damping: 15, stiffness: 100, mass: 1 },
  
  // ゆったり（背景、大きな要素）
  gentle: { damping: 20, stiffness: 50, mass: 2 },
  
  // キビキビ（アイコン、数字）
  snappy: { damping: 12, stiffness: 300, mass: 0.3 },
};
```

### interpolate() - 線形補間

```typescript
import { interpolate } from 'remotion';

const opacity = interpolate(
  frame,
  [0, 30],      // 入力範囲（フレーム）
  [0, 1],       // 出力範囲
  {
    extrapolateLeft: 'clamp',   // 範囲外は固定
    extrapolateRight: 'clamp',
  }
);
```

---

## 2. 登場アニメーション

### フェードイン + スライドアップ（王道）

```typescript
const FadeSlideIn: React.FC<{ delay?: number }> = ({ delay = 0, children }) => {
  const frame = useCurrentFrame();
  const adjustedFrame = frame - delay;
  
  const opacity = interpolate(
    adjustedFrame,
    [0, 20],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  
  const y = spring({
    frame: adjustedFrame,
    fps: 30,
    from: 30,
    to: 0,
    durationInFrames: 25,
  });
  
  return (
    <div style={{
      opacity,
      transform: `translateY(${y}px)`,
    }}>
      {children}
    </div>
  );
};
```

### スケールイン（ポップ）

```typescript
const PopIn: React.FC<{ delay?: number }> = ({ delay = 0, children }) => {
  const frame = useCurrentFrame();
  
  const scale = spring({
    frame: frame - delay,
    fps: 30,
    from: 0,
    to: 1,
    durationInFrames: 20,
    config: { damping: 8, stiffness: 200 },
  });
  
  return (
    <div style={{
      transform: `scale(${Math.max(0, scale)})`,
      opacity: scale > 0 ? 1 : 0,
    }}>
      {children}
    </div>
  );
};
```

### 左からスライドイン

```typescript
const SlideFromLeft: React.FC<{ delay?: number }> = ({ delay = 0, children }) => {
  const frame = useCurrentFrame();
  
  const x = spring({
    frame: frame - delay,
    fps: 30,
    from: -100,
    to: 0,
    durationInFrames: 30,
  });
  
  const opacity = interpolate(
    frame - delay,
    [0, 15],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  
  return (
    <div style={{
      transform: `translateX(${x}px)`,
      opacity,
    }}>
      {children}
    </div>
  );
};
```

---

## 3. 連続アニメーション（スタガー）

### リストアイテムを順番に表示

```typescript
const StaggeredList: React.FC<{ items: string[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const staggerDelay = 10; // 各アイテム間の遅延（フレーム）
  
  return (
    <div>
      {items.map((item, index) => {
        const itemDelay = index * staggerDelay;
        const opacity = interpolate(
          frame - itemDelay,
          [0, 20],
          [0, 1],
          { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
        );
        const x = interpolate(
          frame - itemDelay,
          [0, 20],
          [30, 0],
          { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
        );
        
        return (
          <div
            key={index}
            style={{
              opacity,
              transform: `translateX(${x}px)`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};
```

---

## 4. 強調アニメーション

### パルス（注目）

```typescript
const Pulse: React.FC = ({ children }) => {
  const frame = useCurrentFrame();
  
  // ループするパルス
  const pulse = Math.sin(frame * 0.15) * 0.05 + 1;
  
  return (
    <div style={{ transform: `scale(${pulse})` }}>
      {children}
    </div>
  );
};
```

### グロー（光る）

```typescript
const Glow: React.FC<{ color: string; intensity?: number }> = ({ 
  color, 
  intensity = 1,
  children 
}) => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [0, 30], [0, intensity], { 
    extrapolateRight: 'clamp' 
  });
  
  return (
    <div style={{
      filter: `drop-shadow(0 0 ${glow * 20}px ${color})`,
    }}>
      {children}
    </div>
  );
};
```

---

## 5. 退場アニメーション

### フェードアウト

```typescript
const FadeOut: React.FC<{ startFrame: number }> = ({ startFrame, children }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 20],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  return <div style={{ opacity }}>{children}</div>;
};
```

---

## 6. 背景アニメーション

### グリッド（微かに動く）

```typescript
const AnimatedGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame % 60,
    [0, 30, 60],
    [0.03, 0.06, 0.03]
  );
  
  return (
    <AbsoluteFill style={{
      backgroundImage: `
        linear-gradient(#3b82f622 1px, transparent 1px),
        linear-gradient(90deg, #3b82f622 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      opacity,
    }} />
  );
};
```

### グラデーション背景

```typescript
const GradientBackground: React.FC = () => (
  <AbsoluteFill style={{
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  }} />
);
```

---

## 7. 図解アニメーション

### 矢印の動き

```typescript
const AnimatedArrow: React.FC<{ direction: 'up' | 'down' }> = ({ direction }) => {
  const frame = useCurrentFrame();
  
  const y = interpolate(
    frame,
    [0, 60],
    direction === 'down' ? [0, 50] : [50, 0],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <div style={{ transform: `translateY(${y}px)` }}>
      {direction === 'down' ? '↓' : '↑'}
    </div>
  );
};
```

### ライン描画

```typescript
const DrawLine: React.FC<{ width: number }> = ({ width }) => {
  const frame = useCurrentFrame();
  
  const lineWidth = interpolate(
    frame,
    [0, 40],
    [0, width],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <div style={{
      width: lineWidth,
      height: 4,
      background: 'linear-gradient(90deg, #3b82f6, #10b981)',
      borderRadius: 2,
    }} />
  );
};
```

---

## 8. タイミングのコツ

### 「ずらす」ことで人間らしく

```typescript
// ❌ 全部同時（AIっぽい）
<Title delay={0} />
<Subtitle delay={0} />
<Image delay={0} />

// ✅ 少しずつずらす（人間っぽい）
<Title delay={0} />
<Subtitle delay={15} />   // 0.5秒後
<Image delay={30} />      // 1秒後
```

### シーン構成の目安

```typescript
// 60秒動画のシーン構成例
const scenes = {
  title: { from: 0, duration: 150 },      // 0-5秒
  step1: { from: 150, duration: 450 },    // 5-20秒
  step2: { from: 600, duration: 450 },    // 20-35秒
  summary: { from: 1050, duration: 450 }, // 35-50秒
  ending: { from: 1500, duration: 300 },  // 50-60秒
};
```

---

## 9. パフォーマンスのコツ

- `useMemo` で重い計算をキャッシュ
- 画像は事前に最適化
- グラデーションはCSSで（SVGより軽い）
- アニメーションは `transform` と `opacity` 優先
