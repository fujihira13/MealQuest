# アプリリリース用 画像・設定 手順書

作成日: 2026-05-09  
対象: `mobile/` の Expo / React Native アプリ

## 結論

MealQuest のリリースで必要な画像は、用途で分けると次の3種類です。

1. アプリ本体に組み込む画像: アイコン、スプラッシュ、Android adaptive icon
2. Google Play Console に登録する画像: Play Store アイコン、フィーチャー画像、スクリーンショット
3. App Store Connect に登録またはビルドへ含める画像: iOSアイコン、スクリーンショット

このリポジトリでは、実装用画像は `mobile/assets/images/`、ストア掲載用画像は `store-assets/` に分けて管理します。

## 必要画像一覧

| 用途                           | ファイル                                                                          |                        サイズ | 形式                   | 透過     | 必須/推奨 | 備考                                          |
| ------------------------------ | --------------------------------------------------------------------------------- | ----------------------------: | ---------------------- | -------- | --------- | --------------------------------------------- |
| Expo共通アプリアイコン         | `mobile/assets/images/icon.png`                                                   |                   1024 x 1024 | PNG                    | なし推奨 | 必須      | iOS/Androidビルド元。角丸は入れない           |
| Android legacy icon            | `mobile/assets/images/icon.png`                                                   |                   1024 x 1024 | PNG                    | 可       | 必須扱い  | `android.icon` で指定                         |
| Android adaptive foreground    | `mobile/assets/images/adaptive-icon-foreground.png`                               |                   1024 x 1024 | PNG                    | あり     | 必須扱い  | ロゴや主役だけ。十分な余白を取る              |
| Android adaptive background    | `mobile/assets/images/adaptive-icon-background.png`                               |                   1024 x 1024 | PNG                    | なし     | 必須扱い  | foreground と同寸。背景色だけでも可           |
| Android themed icon            | `mobile/assets/images/adaptive-icon-monochrome.png`                               |                   1024 x 1024 | PNG                    | あり推奨 | 任意/推奨 | Android 13+ のテーマアイコン用。現状未作成    |
| Splash icon                    | `mobile/assets/images/splash-icon.png`                                            |                   1024 x 1024 | PNG                    | あり推奨 | 必須扱い  | Expo公式は透明背景を推奨                      |
| Google Play アイコン           | `store-assets/android/play-store-icon-512.png`                                    |                     512 x 512 | 32-bit PNG             | あり可   | 必須      | 最大 1024KB                                   |
| Google Play フィーチャー画像   | `store-assets/android/feature-graphic-1024x500.png`                               |                    1024 x 500 | JPEG または 24-bit PNG | なし     | 必須      | 文字や細かすぎる要素は避ける                  |
| Google Play スクリーンショット | 手動撮影                                                                          |         最小320px、最大3840px | JPEG または 24-bit PNG | なし     | 必須      | 最低2枚。推奨はスマホ縦 1080 x 1920 を4枚以上 |
| iOS App Store アイコン         | `store-assets/ios/app-store-icon-1024.png` または `mobile/assets/images/icon.png` |                   1024 x 1024 | PNG                    | なし     | 必須      | EAS Build では `icon.png` から生成可能        |
| iPhone スクリーンショット      | 手動撮影                                                                          | 例: 1290 x 2796 / 1320 x 2868 | PNG/JPEG               | なし     | 必須      | App Store Connect は1〜10枚                   |

## 現在の設定

`mobile/app.json` は、以下の設定が必要です。

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.mealquest.app"
    },
    "android": {
      "package": "com.mealquest.app",
      "minSdkVersion": 26,
      "icon": "./assets/images/icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon-foreground.png",
        "backgroundImage": "./assets/images/adaptive-icon-background.png",
        "backgroundColor": "#4CAF50"
      }
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 220,
          "resizeMode": "contain",
          "backgroundColor": "#4CAF50"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "9db64b7c-7530-46fa-806a-f87b850ff5fc"
      }
    },
    "owner": "sakana1113"
  }
}
```

`mobile/eas.json` は、実機確認とストア提出でビルド形式を分けます。

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## リリース前チェック手順

1. 画像サイズと透過を確認する。

```powershell
Add-Type -AssemblyName System.Drawing
Get-ChildItem -Path mobile/assets/images,store-assets -Recurse -File -Filter *.png |
  Sort-Object FullName |
  ForEach-Object {
    $img=[System.Drawing.Image]::FromFile($_.FullName)
    [PSCustomObject]@{
      Path=$_.FullName
      Width=$img.Width
      Height=$img.Height
      Alpha=[System.Drawing.Image]::IsAlphaPixelFormat($img.PixelFormat)
      Bytes=$_.Length
    }
    $img.Dispose()
  } | Format-Table -AutoSize
```

2. Expo設定を確認する。

```bash
cd mobile
npx expo config --json
```

3. ビルド前検証を実行する。

```bash
npm run typecheck
npm run lint
```

4. Android実機テスト用 APK を作る。

```bash
eas build --platform android --profile preview
```

5. Google Play提出用 AAB を作る。

```bash
eas build --platform android --profile production
```

6. iOS App Store / TestFlight 用 IPA を作る。

```bash
eas build --platform ios --profile production
```

## ストア登録時の注意

Google Play:

- Play Console の掲載アイコンは `512 x 512`、最大 `1024KB`。
- フィーチャー画像は `1024 x 500`、透過なし。
- スクリーンショットは最低2枚。アプリでは、縦向き `1080 x 1920` を4枚以上用意するとよい。
- ランキング、価格訴求、Google Playバッジ、第三者ロゴ、過度な文字は避ける。

App Store:

- iOSアイコンは `1024 x 1024` の正方形、透過なし、角丸なし。
- 現在 `supportsTablet: false` のため、まずは iPhone スクリーンショットだけで進める。
- iPad対応に変える場合は、iPad用スクリーンショットも必要になる。

Expo:

- Splash は Expo Go では正しく確認しない。`preview` または `production` ビルドで確認する。
- `android.adaptiveIcon.backgroundImage` を使う場合、`foregroundImage` と同じ寸法にする。
- `android.adaptiveIcon.monochromeImage` は任意だが、Android 13+ のテーマアイコン対応を良くするなら追加する。

## 公式参考リンク

- Google Play Console: Add preview assets  
  https://support.google.com/googleplay/android-developer/answer/9866151
- Google Play metadata policy  
  https://support.google.com/googleplay/android-developer/answer/9898842
- Apple App Store Connect: Screenshot specifications  
  https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- Apple App Store Connect: Add an app icon  
  https://developer.apple.com/help/app-store-connect/manage-app-information/add-an-app-icon/
- Expo: Splash screen and app icon  
  https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/
- Expo: app.json / app.config.js  
  https://docs.expo.dev/versions/latest/config/app/
