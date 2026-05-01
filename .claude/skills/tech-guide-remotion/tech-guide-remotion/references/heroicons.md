# Heroicons SVG リファレンス

絵文字の代わりにHeroicons（24px outline）をインラインSVGで使用する。
https://heroicons.com/

## 使い方

TSX内でReactコンポーネントとして定義:

```typescript
const HeroIcon: React.FC<{ d: string; size?: number; color?: string }> = ({
  d, size = 28, color = '#e6edf3'
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
```

## よく使うアイコンのパスデータ（d属性）

### 情報・解説系
```typescript
// light-bulb（解説カード用 — 💡の代替）
const ICON_LIGHT_BULB = "M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18";

// information-circle
const ICON_INFO = "m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z";
```

### 状態系
```typescript
// check-circle（成功 ✅の代替）
const ICON_CHECK = "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";

// x-circle（エラー ❌の代替）
const ICON_X_CIRCLE = "m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";

// exclamation-triangle（警告 ⚠️の代替）
const ICON_WARNING = "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z";
```

### アクション系
```typescript
// rocket-launch（起動 🚀の代替）
const ICON_ROCKET = "M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z";

// fire（重要 🔥の代替）
const ICON_FIRE = "M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z";

// bolt（電撃 ⚡の代替）
const ICON_BOLT = "m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z";

// command-line（ターミナル）
const ICON_TERMINAL = "m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z";
```

### ファイル・コード系
```typescript
// code-bracket（コード）
const ICON_CODE = "M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5";

// document-text（ファイル 📌の代替）
const ICON_DOCUMENT = "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z";

// cube（パッケージ 📦の代替）
const ICON_CUBE = "m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9";
```

### ナビゲーション系
```typescript
// arrow-right（矢印 →）
const ICON_ARROW_RIGHT = "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3";

// academic-cap（学習 📖の代替）
const ICON_ACADEMIC = "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5";

// wrench（ツール 🔧の代替）
const ICON_WRENCH = "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z";
```

## 使用例

```tsx
// 解説カードで使う場合
<div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
  <HeroIcon d={ICON_LIGHT_BULB} size={28} color="#58a6ff" />
  <span style={{ fontSize: 30, color: '#e6edf3' }}>constは再宣言を防ぐ</span>
</div>

// シーン見出しで使う場合
<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
  <HeroIcon d={ICON_FIRE} size={36} color="#f59e0b" />
  <span style={{ fontSize: 48, fontWeight: 'bold', color: '#e6edf3' }}>再宣言の危険</span>
</div>

// まとめのチェックリスト
<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <HeroIcon d={ICON_CHECK} size={32} color="#10b981" />
  <span>const → 基本はこれ！</span>
</div>
```

## 絵文字→Heroicon 置き換え表

| 絵文字 | Heroicon | 定数名 |
|--------|----------|--------|
| 💡 | light-bulb | ICON_LIGHT_BULB |
| ✅ | check-circle | ICON_CHECK |
| ❌ | x-circle | ICON_X_CIRCLE |
| ⚠️ | exclamation-triangle | ICON_WARNING |
| 🔥 | fire | ICON_FIRE |
| 🚀 | rocket-launch | ICON_ROCKET |
| ⚡ | bolt | ICON_BOLT |
| 📦 | cube | ICON_CUBE |
| 📌 | document-text | ICON_DOCUMENT |
| 📖 | academic-cap | ICON_ACADEMIC |
| 🔧 | wrench | ICON_WRENCH |
| 💻 | command-line | ICON_TERMINAL |
| </> | code-bracket | ICON_CODE |
