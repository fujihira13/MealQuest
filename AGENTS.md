# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

> This document describes the **current implementation under `mobile/`** as the single source of truth.
> If the code and this document disagree, trust the code and update this file.
> `CLAUDE.md` contains the same facts — keep both in sync when editing either.

## Primary Work Target

Unless the user explicitly says otherwise, all future implementation requests in this repository target the **mobile app under `mobile/`**.

- Treat `mobile/` as the active application for feature work, bug fixes, UI changes, validation, and build checks.
- Do **not** modify the web app under root `src/` (or `new-household-*`, `dist/`, `vite.config.ts`). It is frozen and reference-only.
- When a request mentions "the app", "home screen", "settings", "stats", "categories", "points", "budget", or similar product behavior without specifying a platform, assume it means the mobile app in `mobile/`.
- Run mobile validation commands from `mobile/`, such as `npm run typecheck` and `npm run lint`.

## Project Overview

**MealQuest** is a gamified expense tracker focused specifically on food spending.
The shipping product is an **Expo / React Native Android app** submitted to Google Play. iOS is not currently a build target.
All UI text is Japanese.

**Key Features:**
- Food expense tracking with 7 categories (スーパー, 自販機, コンビニ, 外食, 飲み会, デート, その他)
- Meal-time tracking: morning / lunch / dinner / snack (間食)
- Gamification: levels (cumulative XP), points, daily/weekly missions, 24 badges, gacha collection, streaks
- Monthly statistics with a pie chart, per-day bars, and budget gauges
- CSV export of expense records

## Architecture

- **Framework**: Expo SDK 54 / React Native 0.81 / React 19, New Architecture enabled (`newArchEnabled: true`)
- **Routing**: Expo Router v6, file-based under `mobile/app/`
- **State**: Zustand v5 with `persist` middleware
- **Storage**: AsyncStorage, key `"food-expense-app-storage"`, `version: 3` with a `migrate` function (recomputes `totalXp`/`level`, and repairs `savingsLevel` from `totalSavings`)
- **Styling**: React Native `StyleSheet` only (no NativeWind / CSS)
- **Charts**: hand-written components on `react-native-svg` (`PieChart`, `CircularProgress`). No Chart.js, no Victory Native
- **Build**: EAS Build (`mobile/eas.json`)
- **Tests**: none on mobile (no Jest / RNTL). Validation is `npm run typecheck` plus manual testing

### Directory Layout

```
mobile/
  app/
    _layout.tsx            root Stack; calls initializeMissions() on startup
    (tabs)/_layout.tsx     bottom tab navigator + AppHeader
    (tabs)/index.tsx       Home
    (tabs)/stats.tsx       Statistics
    (tabs)/missions.tsx    Missions
    (tabs)/badges.tsx      Badges
    (tabs)/collection.tsx  Gacha collection
    (tabs)/settings.tsx    Settings
  src/
    store/useAppStore.ts   AppStore + UIStore (single file)
    components/            InputModal, CookingModal, DateSelector, AppHeader,
                           CircularProgress, PieChart
    types/index.ts         all type definitions
    utils/                 dateHelpers, formatHelpers, calculationHelpers, levelHelpers
    constants/game.ts      COOKING_RECORD_POINTS only
```

This is **not** a monorepo. Types and utils are duplicated between root `src/` and `mobile/src/`; since the web app is frozen, they do not need to be kept in sync.

### Core State

**AppStore** (~1000 lines, 26 actions) holds all business logic:
`userData`, `goals`, `expenses[]`, `cookingRecords[]`, `savingsRecords[]`, `collection[]`, `missions`, `badges`, `streaks`, `gachaItems[]`, `badgeDefinitions[]`, `savingsEquivalents[]`, `allDayCookingBonusDates[]`.

**UIStore** is defined in the same file but is **not referenced anywhere in the mobile app**. It was carried over from the web version. Screens use `useAppStore` plus local `useState`. Do not introduce new usages of UIStore.

**Key Data Models** (`mobile/src/types/index.ts`):
- `UserData`: level, points, totalXp, savings, cooking count, allowanceUsed, savingsLevel
- `ExpenseRecord` / `CookingRecord` / `SavingsRecord`: amount, category, meal, date, timestamp
- `Mission` / `MissionState`: daily & weekly maps, reset markers, claim history
- `Badge`: requirement-typed achievements
- `GachaItem` / `CollectionItem`: rarity-based collectibles

## Development Commands

```bash
cd mobile
npm install
npm run start        # Expo dev server
npm run android      # run on Android
npm run typecheck    # tsc --noEmit
npm run lint         # expo lint
```

**Workflow:** always run `npm run typecheck` from `mobile/` before committing. There is no automated test suite — verify behavior on an emulator or device.

## Key Implementation Patterns

**Expense input:**
- スーパー disables meal-time selection and is forced to `'lunch'`; all other categories require a meal time including `snack`
- Both new entries and edits go through `InputModal`
- `addExpenseRecord()` internally runs `resetStreakIfNeeded()` → `updateMissionProgress("expense_record")` → `updateMissionProgress("record_habit")` → `checkBadgeProgress()` → `updateMonthlyData()`; mission updates only apply when the record is dated today

**Cooking input:** `CookingModal` → `toggleCookingRecordWithDate()`, which supports backdated records. Weekly mission progress is recomputed from records; daily progress only counts today.

**State updates:** never mutate state from components — always go through `useAppStore` actions. Point changes must go through `applyXpChange()` so `totalXp` and `level` stay consistent; writing `points` directly skips level recalculation.

**Points (actual values):** expense record 0pt, cooking +20pt, savings amount ÷ 10, daily missions 20–30pt, weekly missions 80–120pt, no-waste streak `streak × 5` (max 50), snack-free streak `streak × 3` (max 30), gacha rarity bonus rare +20 / epic +50 / legendary +100.

**Level:** cumulative XP, `getTotalXpRequiredForLevel(L) = (L-1) × L × 100 / 2` (Lv2=100, Lv3=300, Lv4=600 …).

**Savings level:** `calculateSavingsLevel()` = `totalSavings / 1000 + 1`. `addSavingsRecord()` calls `checkSavingsLevelUp()`, which awards 20pt per level gained.

**Gacha:** 100pt per pull, 15 items, rarity odds common 60% / rare 25% / epic 12% / legendary 3%.

**Missions:** fixed templates, 3 daily and 3 weekly. Generation and reset are handled entirely by `initializeMissions()`, which runs on app startup, on foreground resume (`AppState` `change` listener in `app/_layout.tsx`), and when the missions screen is left open across midnight.

**Badges:** 24 definitions evaluated dynamically by `checkBadgeProgress()` (by `category`: cooking 5 / savings 9 / level 4 / special 6).

**Budgets (naming is misleading):** `goals.monthlyExpenseGoal` is the **supermarket budget**, `goals.allowanceGoal` covers everything else, and the "食費合計予算" shown in settings is the sum of the two (read-only). `goals.cookingGoal` and `goals.monthlySavingsGoal` exist in state but have no editing UI.

## Data Persistence

- All state is persisted through Zustand's `persist` middleware into AsyncStorage
- Bumping the persisted schema requires incrementing `version` and extending `migrate`
- Manual reset available in the settings screen (`resetAllData()`)
- CSV export uses `expo-file-system` (`File` / `Paths`) + `expo-sharing`; the file is UTF-8 with BOM and CRLF line endings
- No backend. `firebase ^12.0.0` remains in the root web dependencies but is unused and not referenced by `mobile/`

## Release (Android)

- `mobile/eas.json` uses `appVersionSource: "local"`, so `android.versionCode` in `mobile/app.json` must be incremented **by hand** before each production build (currently 4). Forgetting this causes a duplicate-version error on Play Console
- Build profiles: `development` (dev client), `preview` (internal APK), `production` (AAB)
- Package `com.mealquest.app`, minSdkVersion 26, EAS owner `sakana1113`
- Store images live in `store-assets/`

## Known Issues

- `checkLevelUp()`, `generateDailyMissions()`, `generateWeeklyMissions()`, `resetDailyMissions()`, `resetWeeklyMissions()`, `toggleCookingRecord()`, `addCookingRecord()`, and `deleteCookingRecord()` are unused from the UI (their behavior is covered by `initializeMissions()` and `applyXpChange()`)

## Legacy Reference Files

- Root `src/` is the React PWA version; `new-household-*` files are the original vanilla JS implementation
- Both are kept for historical reference only — no further development happens there
