# UI Tone and Color Palette

## Direction

「節約マスター」は、食費を記録する日常性と、継続したくなるゲーム性を持つアプリです。新しいUIでは、可愛らしさよりも「落ち着き」「信頼感」「少し高級な達成感」を優先します。

目指す印象:

- 高級感: 暗めのネイビー、深いグリーン、控えめなゴールドを軸にする
- 信頼感: 情報の読みやすさ、明確な階層、過度な装飾を避ける
- 継続感: ポイント、レベル、ミッションは報酬感を残すが、演出は上品にする
- 食費管理らしさ: 食材や自炊を連想するセージ、オリーブ、ウォームグレーを補助色に使う

避ける印象:

- パステル中心のかわいい配色
- 紫系グラデーションの多用
- 強い彩度のカテゴリ色を画面全体に広げる
- 大きすぎる角丸、過剰な影、ポップなバッジ表現

## Primary Palette

| Role | Color | Usage |
| --- | --- | --- |
| Ink Navy | `#151C24` | 主要テキスト、ヘッダー、最重要UI |
| Deep Forest | `#183C34` | プライマリアクション、成功、節約の象徴 |
| Champagne Gold | `#C7A45D` | レベル、ポイント、達成、ガチャの希少感 |
| Porcelain | `#F7F5F0` | アプリ背景、セクション背景 |
| Warm White | `#FFFCF7` | カード、モーダル、入力面 |
| Stone Gray | `#8B867C` | 補助テキスト、メタ情報 |
| Line Beige | `#E6DED0` | 境界線、区切り、非アクティブ面 |

## Semantic Colors

| Role | Color | Usage |
| --- | --- | --- |
| Success | `#2F6F5E` | 自炊、節約成功、達成済み |
| Warning | `#B47A2B` | 予算注意、週次ミッションの警告 |
| Danger | `#A0443E` | 予算超過、削除、失敗 |
| Info | `#365F7D` | 統計、ヒント、詳細導線 |
| Muted Surface | `#EEE9DF` | 無効状態、セカンダリ背景 |

## Category Colors

カテゴリ色はカード全面の塗りではなく、左線・小さなアイコン背景・タグ・グラフの線色に限定して使います。

| Category | Color | Reason |
| --- | --- | --- |
| スーパー | `#2F6F5E` | 食材、自炊、健全な支出 |
| 自販機 | `#8A6A2F` | 少額だが積み上がる支出 |
| コンビニ | `#365F7D` | 日常的で中立的な支出 |
| 飲み会 | `#8F4F3F` | 外食・交際費の温度感 |
| デート | `#7C5A72` | 少し特別な支出 |
| その他 | `#6E7175` | 汎用・分類外 |

## Typography

基本フォントはシステムフォントを維持し、和文の可読性を優先します。

```css
font-family:
  "Inter",
  "Noto Sans JP",
  "Hiragino Kaku Gothic ProN",
  "Yu Gothic",
  system-ui,
  sans-serif;
```

文字の印象:

- 見出し: 太さ `700`、文字間隔は広げすぎない
- 本文: 太さ `400` から `500`
- 数値: 太さ `700`、金額とポイントは桁が読みやすいサイズにする
- ボタン: 太さ `600`、短く明確な日本語にする

## Layout Tone

- 角丸は基本 `8px`、大きなパネルでも `12px` まで
- 影は薄く、面の重なりは境界線と余白で表現する
- カードは白背景に細い境界線を基本とする
- グラデーションはヘッダーや特別な達成表示だけに限定する
- モバイル幅でも情報密度を保ち、カードを縦に積みすぎない

## Component Treatment

### Header

現在の紫グラデーションから、ネイビー基調へ変更します。レベルやポイントはゴールドをアクセントにして、ゲーム的な報酬感を上品に残します。

推奨:

- 背景: `#151C24`
- 下線: `rgba(199, 164, 93, 0.35)`
- レベルバッジ: 透明なネイビー面 + ゴールド線

### Primary Button

プライマリアクションは深いグリーンを使用します。

- 背景: `#183C34`
- テキスト: `#FFFCF7`
- Hover: `#225247`
- Focus ring: `rgba(199, 164, 93, 0.35)`

### Cards

カードは装飾よりも読みやすさを優先します。

- 背景: `#FFFCF7`
- 境界線: `#E6DED0`
- 影: `0 8px 24px rgba(21, 28, 36, 0.06)`
- 角丸: `8px`

### Gauges and Progress

ゲージは強い虹色ではなく、状態に応じた単色または2色までにします。

- 良好: `#2F6F5E`
- 注意: `#B47A2B`
- 超過: `#A0443E`
- 背景: `#EEE9DF`

### Gacha and Rewards

報酬要素はゴールドを使いますが、全面金色にはしません。

- 背景: `#151C24`
- アクセント: `#C7A45D`
- 補助面: `rgba(199, 164, 93, 0.12)`

## CSS Tokens Draft

```css
:root {
  --color-ink: #151c24;
  --color-forest: #183c34;
  --color-forest-hover: #225247;
  --color-gold: #c7a45d;
  --color-porcelain: #f7f5f0;
  --color-warm-white: #fffcf7;
  --color-stone: #8b867c;
  --color-line: #e6ded0;

  --color-success: #2f6f5e;
  --color-warning: #b47a2b;
  --color-danger: #a0443e;
  --color-info: #365f7d;
  --color-muted-surface: #eee9df;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --shadow-card: 0 8px 24px rgba(21, 28, 36, 0.06);
  --shadow-raised: 0 14px 36px rgba(21, 28, 36, 0.12);
}
```

## Sample Visual Rules

- 背景は `Porcelain`、カードは `Warm White`
- 重要数字は `Ink Navy`、良い変化は `Deep Forest`
- ポイント、レベル、達成演出だけ `Champagne Gold`
- エラーや予算超過は赤を使うが、彩度を抑える
- アイコンは単色を基本にし、カテゴリごとの色は小面積で使う

## Migration Notes

既存CSSから置き換える優先度:

1. `#667eea` と `#764ba2` の紫グラデーションを廃止し、ヘッダーと主要ボタンをネイビー/フォレストへ変更する
2. `#ffd32a`, `#ff9500`, `#fd79a8` など高彩度色をゴールド、ウォーム系、落ち着いた赤へ整理する
3. `border-radius: 15px`, `20px`, `25px` を原則 `8px` から `12px` に統一する
4. 強い `box-shadow` を薄い影と境界線中心に調整する
5. ゲージ、ミッション、ガチャの演出は色面を減らし、数値と状態が読みやすい構成にする
