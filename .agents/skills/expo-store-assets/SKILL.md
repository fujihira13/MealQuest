---
name: expo-store-assets
description: Check and generate app store assets for Expo/React Native apps before submitting to iOS App Store or Google Play Store. Use when the user asks about store submission readiness, missing screenshots, splash images, icons, or feature graphics. Covers: (1) auditing existing assets against store requirements, (2) identifying missing assets with specific size/count requirements, (3) generating Android feature graphic (1024x500px) via Gemini API script, (4) guiding screenshot capture for iPhone/iPad/Android simulators. Triggers on phrases like "ストアに提出したい", "App Store 提出", "Play Store 提出", "スクリーンショット足りてる", "フィーチャーグラフィック".
---

# Expo Store Assets

## Workflow

### Step 1: Audit Existing Assets

Check the following in the project:

1. **app.json** — Read `icon`, `ios.supportsTablet`, `android.adaptiveIcon`, splash plugin config
2. **assets/images/** — List files and confirm presence of:
   - `icon.png` (1024×1024)
   - `splash-icon.png` or similar splash image
   - Android adaptive icon files (foreground/background)
   - `feature-graphic.png` (Android only)
3. **screenshots folder** — Check for any existing screenshot directories

Report findings as a table with ✅ / ❌ status per asset.

### Step 2: Identify Missing Assets

Apply rules from `references/store-requirements.md`. Key flags:

- If `ios.supportsTablet: true` → iPad screenshots are **required** for App Store
- Android Play Store always requires a **feature graphic (1024×500px)**
- Both stores require a **minimum of 2 screenshots** per device type

### Step 3: Generate Missing Assets

#### Feature Graphic (Android — always missing on first submission)

Use the script template at `scripts/generate-feature-graphic.js`.

**Prerequisites:**
- `@google/genai` installed (`npm install @google/genai`)
- `GEMINI_API_KEY` set in `.env`
- `"type": "module"` in `package.json` (or rename to `.mjs`)

**Adaptation steps:**
1. Copy `scripts/generate-feature-graphic.js` to the project's `scripts/` folder
2. Customize the prompt — replace app name, colors, icon description to match the project
3. Adjust output paths to match the project's asset directory
4. Add to `package.json` scripts: `"generate-feature-graphic": "node scripts/generate-feature-graphic.js"`
5. Run: `npm run generate-feature-graphic`

The model `gemini-3.1-flash-image-preview` with `responseModalities: [IMAGE, TEXT]` generates the image inline as base64.

#### Screenshots

Screenshots must be captured from a running simulator — they cannot be generated. Guide the user:

**iOS (Mac required):**
```
Xcode → Simulator → select device → run app → Cmd+S to screenshot
Devices needed: iPhone 15 Pro Max (6.7"), iPad Pro 12.9" (if supportsTablet: true)
```

**Android:**
```
Android Studio → AVD Manager → create Pixel 7 Pro device → run app → camera icon to screenshot
```

Recommend 5 screens per device: home/list, create/add, summary, templates, settings.

### Step 4: Report Summary

After audit and generation, present:
- Full asset checklist with status
- Next actions the user must take manually (screenshots)
- Confirmation that generated files are saved correctly
