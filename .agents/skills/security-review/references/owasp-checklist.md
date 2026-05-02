# OWASP 主要項目 実装レベルチェックリスト

実装コードに対するOWASP主要項目（A01/A02/A03/A05/A06/A07/A09/A10）の具体的な検証ガイド。
コードパターンとYES/NO形式のチェックで脆弱性を検出する。

---

## A01: アクセス制御の欠陥

### チェック項目

| # | チェック内容 | YES（安全）| NO（要対応）|
|---|------------|-----------|------------|
| 1 | リソースアクセス前にユーザー認証・認可を確認しているか | ✅ 通過 | ❌ 未認証アクセス可能 |
| 2 | IDを使ったリソース取得でオーナー確認があるか（IDOR対策） | ✅ 通過 | ❌ 他ユーザーのデータ閲覧可能 |
| 3 | 管理者APIに適切なロールチェックがあるか | ✅ 通過 | ❌ 権限昇格可能 |

### IDORの脆弱なコードパターン

```typescript
// ❌ NG: IDを検証せずにDBから取得（他ユーザーのデータにアクセス可能）
app.get('/api/orders/:id', async (req, res) => {
  const order = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  res.json(order);
});

// ✅ OK: ユーザーIDでフィルタリング
app.get('/api/orders/:id', requireAuth, async (req, res) => {
  const order = await db.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]  // ユーザーID条件を追加
  );
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});
```

---

## A02: 暗号化の失敗

### チェック項目

| # | チェック内容 | YES（安全）| NO（要対応）|
|---|------------|-----------|------------|
| 1 | パスワードはbcrypt/argon2/scryptでハッシュしているか | ✅ 通過 | ❌ MD5/SHA1/平文保存 |
| 2 | セッションID/トークンにcrypto.randomBytes()を使っているか | ✅ 通過 | ❌ Math.random()使用 |
| 3 | センシティブデータはHTTPS経由のみで転送されているか | ✅ 通過 | ❌ HTTP通信あり |
| 4 | JWTのアルゴリズムを`alg: "none"`で受け入れていないか | ✅ 通過 | ❌ alg検証なし |

### 脆弱なコードパターン

```typescript
// ❌ NG: MD5でパスワードハッシュ（衝突・レインボーテーブル攻撃に脆弱）
const hash = crypto.createHash('md5').update(password).digest('hex');

// ❌ NG: Math.randomでトークン生成（予測可能）
const token = Math.random().toString(36).substring(2);

// ✅ OK
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 12); // saltRounds >= 10

import crypto from 'crypto';
const token = crypto.randomBytes(32).toString('hex'); // 暗号学的安全な乱数
```

---

## A03: インジェクション

### SQLインジェクション

```typescript
// ❌ NG: 文字列結合でSQL組み立て
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.query(query);

// ❌ NG: テンプレートリテラルでの結合
db.query(`SELECT * FROM users WHERE id = ${req.params.id}`);

// ✅ OK: プリペアドステートメント
db.query('SELECT * FROM users WHERE email = ?', [email]);
// または
db.query('SELECT * FROM users WHERE email = $1', [email]); // PostgreSQL

// ✅ OK: ORMのクエリビルダー（パラメータバインディングを内部で処理）
User.findOne({ where: { email } }); // Sequelize
prisma.user.findUnique({ where: { email } }); // Prisma
```

### コマンドインジェクション

```typescript
// ❌ NG: shell:true でユーザー入力を展開（コマンドインジェクション）
exec(`ffmpeg -i ${userFilename} output.mp4`, { shell: true });
exec(`ls ${req.query.dir}`); // shell:trueなしでもテンプレートリテラルは危険

// ❌ NG: 文字列結合でコマンド組み立て
exec('convert ' + req.body.filename + ' output.png');

// ✅ OK: 配列形式でコマンドと引数を分離
execFile('ffmpeg', ['-i', userFilename, 'output.mp4']);
spawn('convert', [req.body.filename, 'output.png']);

// ✅ OK: ファイル名のバリデーション（許可文字のみ）
const safeFilename = /^[a-zA-Z0-9_\-\.]+$/.test(filename) ? filename : null;
```

### チェック項目

- [ ] DB操作はすべてプリペアドステートメント/ORMを使っているか
- [ ] `exec` / `execSync` に `shell: true` オプションがないか
- [ ] `exec` / `system` にユーザー入力（文字列結合・テンプレートリテラル）を渡していないか
- [ ] `execFile` / `spawn` を使う場合、第2引数（配列）でユーザー入力を渡しているか

---

## A05: セキュリティの設定ミス

### チェック項目

- [ ] デフォルト認証情報（admin/admin 等）が変更されているか
- [ ] デバッグモード・詳細エラーが本番環境で無効化されているか
- [ ] 不要なHTTPメソッド（TRACE/TRACK）が無効化されているか
- [ ] セキュリティヘッダーが設定されているか（`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`）
- [ ] CORSが適切に制限されているか（`*` でなく特定ドメインを許可）
- [ ] ディレクトリリスティングが無効か

---

## A06: 脆弱なコンポーネント

### チェック項目

- [ ] 既知の重大脆弱性を持つバージョンの依存ライブラリを使っていないか（`npm audit` / `pip audit` 相当での確認）
- [ ] ロックファイル（`package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` / `poetry.lock` 等）がコミットされているか（再現可能なビルドの保証）
- [ ] Python の `requirements.txt` では `==` による明示ピン留めがされているか（`>=`・`*`・無制約は脆弱バージョンが混入するリスクあり）
- [ ] サポート終了（EOL）バージョンのランタイム（Node.js、Python 等）を使っていないか

---

## A07: 認証の失敗

### チェック項目

| # | チェック内容 | YES（安全）| NO（要対応）|
|---|------------|-----------|------------|
| 1 | ログイン試行にレート制限があるか（ブルートフォース対策） | ✅ 通過 | ❌ 無制限試行可能 |
| 2 | パスワードポリシーが実装されているか（最小長・複雑性） | ✅ 通過 | ❌ 弱いパスワード許可 |
| 3 | ログイン失敗時のエラーメッセージが「ユーザー名またはパスワードが正しくありません」等の汎用表現か | ✅ 通過 | ❌ ユーザー存在を漏洩 |
| 4 | パスワードリセットトークンに有効期限があるか | ✅ 通過 | ❌ 無期限トークン |
| 5 | JWTのsecretが十分に長くランダムか（256bit以上推奨） | ✅ 通過 | ❌ 弱いシークレット |

```typescript
// ❌ NG: レート制限なし・ユーザー存在漏洩
app.post('/login', async (req, res) => {
  const user = await findUserByEmail(req.body.email);
  if (!user) return res.status(404).json({ error: 'User not found' }); // ユーザー存在を漏洩
  // ...
});

// ✅ OK: レート制限 + 汎用エラー
import rateLimit from 'express-rate-limit';
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

app.post('/login', loginLimiter, async (req, res) => {
  const user = await findUserByEmail(req.body.email);
  const valid = user && await bcrypt.compare(req.body.password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' }); // 汎用エラー
  // ...
});
```

---

## A09: セキュリティログの失敗

### チェック項目

| # | チェック内容 | YES（安全）| NO（要対応）|
|---|------------|-----------|------------|
| 1 | パスワード・トークン・PII がログに出力されていないか | ✅ 通過 | ❌ センシティブ情報がログに記録 |
| 2 | エラーメッセージにスタックトレースが含まれていないか（本番環境） | ✅ 通過 | ❌ 内部情報漏洩 |
| 3 | 認証失敗がログに記録されているか（攻撃検知用） | ✅ 通過 | ❌ ログなし |

### 脆弱なコードパターン

```typescript
// ❌ NG: パスワードをログに記録
console.log('Login attempt:', { email, password }); // パスワード漏洩

// ❌ NG: スタックトレースをクライアントに返す
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack }); // 内部パス・ライブラリ情報漏洩
});

// ✅ OK: センシティブ情報をマスク
console.log('Login attempt:', { email, password: '[REDACTED]' });

// ✅ OK: 本番環境では汎用エラーメッセージ
app.use((err, req, res, next) => {
  logger.error(err); // サーバー側にのみ詳細記録
  res.status(500).json({ error: 'Internal server error' }); // クライアントには汎用メッセージ
});
```

---

## A10: サーバーサイドリクエストフォージェリ（SSRF）

### チェック項目

- [ ] ユーザー指定のURLをfetch/axiosで取得する処理があるか → ある場合は下記を確認
  - [ ] プライベートIPアドレス（10.x.x.x、192.168.x.x、169.254.x.x）をブロックしているか
  - [ ] `localhost` / `127.0.0.1` をブロックしているか
  - [ ] 許可するドメインのホワイトリストがあるか
  - [ ] リダイレクト追跡を無効化（`redirect: 'manual'`）しているか
  - [ ] **DNSリバインディング対策**: ホスト名検証後、名前解決されたIPがRFC1918・リンクローカル・ループバックでないことを再検証しているか（ホスト名は許可されても解決先IPが内部アドレスになる場合がある）

```typescript
// ❌ NG: ユーザー指定URLをそのままフェッチ（内部サービスへのリクエスト可能）
app.post('/proxy', async (req, res) => {
  const response = await fetch(req.body.url);
  res.send(await response.text());
});

// ⚠️ 不十分: ホスト名ホワイトリストのみ（DNSリバインディングに脆弱）
// ホスト名は許可されていても、DNS解決後のIPが内部アドレスになる場合がある
const ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com'];
function validateUrlByHostname(url: string): boolean {
  const parsed = new URL(url);
  if (!['https:'].includes(parsed.protocol)) return false;
  if (!ALLOWED_DOMAINS.includes(parsed.hostname)) return false;
  return true; // DNS解決後のIPは未検証
}

// ✅ OK: ホスト名検証 + 全A/AAAAレコードのIP検証 + 解決済みIPへ直接接続（TOCTOU排除）
// undici.Agent の connect.lookup で事前解決済みIPを固定し、fetch 時の再解決を防ぐ
import dns from 'dns/promises';
import { Agent } from 'undici'; // Node.js 内蔵 fetch の Dispatcher

// IPv4/IPv6の内部・ループバック・リンクローカル・ULAを全て網羅
function isPrivateIp(ip: string): boolean {
  // IPv4
  if (/^10\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^127\./.test(ip)) return true;
  if (/^169\.254\./.test(ip)) return true; // リンクローカル (169.254.0.0/16)
  if (/^0\./.test(ip)) return true;        // 0.0.0.0/8
  // IPv6
  if (/^::1$/.test(ip)) return true;               // ループバック
  if (/^fe[89ab][0-9a-f]/i.test(ip)) return true;  // リンクローカル (fe80::/10)
  if (/^f[cd][0-9a-f]{2}/i.test(ip)) return true;  // ULA (fc00::/7 = fc00::〜fdff::)
  return false;
}

async function resolveAndValidate(
  hostname: string
): Promise<{ address: string; family: 4 | 6 }> {
  // 全A/AAAAレコードを取得して一つでも内部IPなら拒否
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  for (const { address } of records) {
    if (isPrivateIp(address)) {
      throw new Error(`Blocked: resolved IP ${address} is private`);
    }
  }
  const { address, family } = records[0];
  return { address, family: family as 4 | 6 };
}

app.post('/proxy', async (req, res) => {
  const parsed = new URL(req.body.url);
  if (!['https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'HTTPS only' });
  }
  if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
    return res.status(400).json({ error: 'Domain not allowed' });
  }

  let resolvedIp: string;
  let resolvedFamily: 4 | 6;
  try {
    ({ address: resolvedIp, family: resolvedFamily } = await resolveAndValidate(parsed.hostname));
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // undici.Agent で lookup を上書きして検証済みIPへ直接接続（TOCTOU回避）
  // fetch 内部でホスト名を再解決せず resolvedIp を使う
  const agent = new Agent({
    connect: {
      lookup: (_h, _opts, cb) => cb(null, resolvedIp, resolvedFamily),
    },
  });

  const response = await fetch(req.body.url, {
    redirect: 'manual',
    // @ts-ignore Node.js 18+ fetch (undici) の dispatcher オプション
    dispatcher: agent,
  });
  res.send(await response.text());
});
```

---

## シークレット/APIキーのハードコード検出

### 検出パターン

以下のパターンがソースコード中に存在する場合は CRITICAL:

```
# APIキー・シークレット
sk-[a-zA-Z0-9]{20,}          # OpenAI APIキー
sk-ant-[a-zA-Z0-9\-_]{90,}   # Anthropic APIキー
[A-Z0-9]{20}                   # AWS Access Key IDパターン
[a-zA-Z0-9/+=]{40}             # AWS Secret Key パターン

# 一般的なハードコードパターン
const apiKey = "..."
const secret = "..."
const password = "..."
token = "..."
```

### 安全なパターン

```typescript
// ✅ OK: 環境変数から取得
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required');

// ✅ OK: シークレットマネージャーから取得
const secret = await secretsManager.getSecretValue({ SecretId: 'my-secret' });
```

---

## 入力バリデーション詳細

### バリデーション原則

1. **型チェック**: 期待する型であることを確認
2. **長さ制限**: 最大長を設定してバッファオーバーフロー・DoS防止
3. **許可リスト**: 禁止リストではなく許可リスト方式を使う
4. **ReDoS対策**: 複雑な正規表現はバックトラッキング攻撃に注意

### ReDoS脆弱なパターン

```typescript
// ❌ NG: バックトラッキングが発生する正規表現
const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
// 悪意のある入力で指数時間かかる可能性

// ✅ OK: シンプルな正規表現 + 長さ制限
function validateEmail(email: string): boolean {
  if (email.length > 254) return false; // RFC 5321最大長
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // シンプルなパターン
}
```

---

## セッション管理実装検証

### チェック項目

| # | チェック内容 | YES（安全）| NO（要対応）|
|---|------------|-----------|------------|
| 1 | セッションIDはcrypto.randomBytesで生成しているか | ✅ 通過 | ❌ 予測可能なID |
| 2 | ログイン後にセッションIDを再生成しているか（固定化攻撃対策） | ✅ 通過 | ❌ セッション固定化 |
| 3 | CookieにSameSite属性を設定しているか（CSRF対策） | ✅ 通過 | ❌ CSRF脆弱 |
| 4 | CookieにHttpOnly属性を設定しているか（XSS経由のCookie窃取対策） | ✅ 通過 | ❌ JSからCookie読み取り可能 |

```typescript
// ✅ OK: 安全なCookie設定
res.cookie('session', sessionId, {
  httpOnly: true,        // JavaScriptからアクセス不可
  secure: true,          // HTTPS経由のみ
  sameSite: 'strict',    // CSRF対策
  maxAge: 24 * 60 * 60 * 1000, // 有効期限
});
```

---

## タイミング攻撃・レース条件チェックリスト

### タイミング攻撃

文字列比較で早期リターンする比較を使うと、攻撃者が応答時間から正しい値を推測できる。

```typescript
// ❌ NG: 通常の文字列比較（タイミング攻撃に脆弱）
if (userToken === storedToken) { ... }
if (hmac === expectedHmac) { ... }

// ✅ OK: 定時間比較
import { timingSafeEqual } from 'crypto';
const isValid = timingSafeEqual(
  Buffer.from(userToken),
  Buffer.from(storedToken)
);
```

### チェック項目

- [ ] APIキー・HMACの比較に `crypto.timingSafeEqual` を使っているか
- [ ] パスワードリセットトークンの比較に `crypto.timingSafeEqual` を使っているか
- [ ] 残高更新・在庫更新などでDBトランザクション/ロックを使っているか（レース条件対策）
