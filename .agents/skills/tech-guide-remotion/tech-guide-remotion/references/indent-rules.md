# インデントルール（最重要）

## ⚠️ コード文字列内のインデントに最大限注意すること

### 問題
コード文字列を書く際、TSXのインデントとコード内容のインデントが混在してバグになる。

### ルール

1. **コード行の文字列は左揃えで書く**
```typescript
// ✅ 正しい: 文字列内のインデントが正確
const lines = [
  'const prices = [100, 250, 500];',
  '',
  'const withTax = prices.map(p => ({',
  '  price: p,',          // ← 2スペースインデント
  '  tax: Math.floor(p * 0.1),',
  '  total: Math.floor(p * 1.1)',
  '}));',
];

// ❌ 間違い: TSXのインデントが混入
const lines = [
  'const withTax = prices.map(p => ({',
  '    price: p,',        // ← 4スペースになってしまう
  '    tax: Math.floor(p * 0.1),',
];
```

2. **インデントは2スペース統一**
```typescript
// ✅ 
'  price: p,'      // 2スペース
'    nested: {',   // 4スペース（2段ネスト）

// ❌
'   price: p,'     // 3スペース（NG）
'\tprice: p,'      // タブ（NG）
```

3. **空行は空文字列`''`で表現**
```typescript
const lines = [
  'const x = 1;',
  '',              // ← 空行
  'const y = 2;',
];
```

4. **コメント行のインデントも正確に**
```typescript
'// ✅ 元の配列は変更されない',   // インデントなし
'  // ネストされたコメント',       // 2スペースインデント
```
