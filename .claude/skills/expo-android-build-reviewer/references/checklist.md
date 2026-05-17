# Android ビルド設定 審査チェックリスト

## app.json — android セクション

### android.package
- **正解**: `com.xxx.yyy` 形式のリバースドメイン
- **問題**: 未設定 → Play Console でアプリを識別できない
- **修正**: `"package": "com.yourcompany.appname"` を追加

### android.versionCode
- **正解**: `eas.json` の `cli` に `"appVersionSource": "remote"` が設定されている（EAS がリモートで自動管理）
- **問題**: 未設定 → 初回提出は通るが、2回目以降に Play Console で「既存より大きいバージョンコードが必要」エラー
- **修正（推奨）**: `eas.json` の `cli` に `"appVersionSource": "remote"` を追加し、`app.json` の `versionCode` は削除
- **修正（代替）**: `app.json` に `"versionCode": 1` を追加して手動管理（リリースのたびに手動インクリメントが必要）

### android.blockedPermissions
- **正解**: 不要なパーミッションを明示除外している
- **問題**: 未設定でも動くが、`expo-file-system` が `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` を自動追加する。Play Store 審査でフラグが立つ可能性がある
- **判断基準**:
  - CSV エクスポートを `expo-sharing` 経由で行う場合 → 外部ストレージ権限は不要 → blockedPermissions に追加
  - `react-native-purchases` 等の IAP SDK を使っていない場合 → `com.android.vending.BILLING` も blockedPermissions に追加
- **修正例**:
```json
"blockedPermissions": [
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "com.android.vending.BILLING"
]
```

### adaptiveIcon
- **正解**: `foregroundImage` / `backgroundImage` / `monochromeImage` が揃っている
- **問題**: `monochromeImage` 欠損 → Android 13+ の一部端末でアイコンが崩れる可能性

---

## eas.json — build プロファイル

### preview.android.buildType
- **正解**: `"apk"` （テスト用サイドロード）
- **問題**: `"app-bundle"` にすると APK が生成されず実機テストできない

### preview.android.distribution
- **正解**: `"internal"` （EAS が配布リンク・QR コードを生成する）
- **問題**: 未設定または `"store"` → EAS ダッシュボードからの手動ダウンロードのみになる

### production.android.buildType
- **正解**: `"app-bundle"` （Play Store 提出用 AAB）
- **問題**: `"apk"` → Play Store は APK を受け付けない（2021年8月以降）

### production.android.distribution
- **正解**: `"store"` （明示推奨）
- **問題**: 未設定でもデフォルトが `"store"` なので動作上は問題ないが、意図が不明瞭になる

### production.android.autoIncrement（非推奨・旧方式）
- **現在の推奨**: `eas.json` の `cli.appVersionSource: "remote"` を使う（CLIレベルで全プロファイルに適用される）
- **このオプションについて**: プロファイル単位で個別に設定する旧方式。`appVersionSource: "remote"` を設定した場合は不要
- **修正**: `cli.appVersionSource: "remote"` を使うことを推奨。両方設定した場合は `appVersionSource` が優先される

---

## パーミッションに影響するパッケージ一覧

| パッケージ | 追加されるパーミッション | 通常必要か |
|---|---|---|
| `expo-haptics` | `VIBRATE` | ✅ 必要 |
| `expo-file-system` | `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` | ❌ アプリ内ストレージのみなら不要 |
| `expo-camera` | `CAMERA` | アプリによる |
| `expo-location` | `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` | アプリによる |
| `react-native-purchases` | `com.android.vending.BILLING` | IAP を使う場合のみ必要 |
| `expo-notifications` | `RECEIVE_BOOT_COMPLETED`, `VIBRATE` | プッシュ通知を使う場合のみ必要 |

---

## eas.json — submit セクション（任意）

`eas submit` で Play Console に自動提出する場合のみ必要。手動アップロードなら不要。

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./path/to/service-account.json",
      "track": "internal"
    }
  }
}
```

---

## 修正後の最終形（参考）

### app.json — android セクション
```json
"android": {
  "package": "com.yourcompany.appname",
  "versionCode": 1,
  "blockedPermissions": [
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE"
  ],
  "adaptiveIcon": {
    "foregroundImage": "./assets/images/android-icon-foreground.png",
    "backgroundImage": "./assets/images/android-icon-background.png",
    "monochromeImage": "./assets/images/android-icon-monochrome.png",
    "backgroundColor": "#FFFFFF"
  }
}
```

### eas.json — cli + build セクション
```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "distribution": "internal"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle",
        "distribution": "store"
      }
    }
  }
}
```
