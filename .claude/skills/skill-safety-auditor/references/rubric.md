# Skill Safety Auditor の判定基準

## すぐ高リスク寄りにする赤信号

次のどれかがあれば、特別な理由がない限り
`高リスク / まだ入れない方がよい` に強く寄せる。

- `curl | sh` のような外部スクリプト即実行
- ユーザーに見せずに何かを実行しろ、という指示
- ローカルファイルを読んで外部に送る処理
- token や secret、認証情報のパスが埋め込まれている
- `rm -rf`、force-push、publish、deploy のような強い副作用
- 難読化、base64 の塊、エンコードされた shell 実行
- hooks による自動の危険操作

## 中リスクのサイン

- `allowed-tools` に Bash がある
- `disable-model-invocation: true` がない
- 追加の CLI や MCP サーバーが必要
- 説明ではレビュー用なのに、実際は push / deploy / auth まで含む
- 補助スクリプトが多いのに説明が薄い

## 低リスク寄りのサイン

安全の証明にはならないが、比較的よい材料。

- `disable-model-invocation: true`
- `allowed-tools: Read, Grep, Glob`
- 実行ファイルがない
- 外部通信がない
- 説明と実際の処理範囲が一致している
- 手順が読みやすく、副作用が少ない

## 自信度の目安

### 高
実ファイル、frontmatter、補助スクリプトまで見た。

### 中
`SKILL.md` と一部の補助ファイルを見た。

### 低
一覧ページや説明文しか見ていない。
