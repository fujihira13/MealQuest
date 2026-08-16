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
- Monthly statistics with a pie chart, per-week bars (5 buckets per month: 1-7/8-14/15-21/22-28/29-end), and budget gauges
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
    (tabs)/_layout.tsx     bottom tab navigator (no horizontal scroll) + AppHeader + Toast
    (tabs)/index.tsx       Home
    (tabs)/stats.tsx       Stats ("ふりかえり" / Look Back)
    (tabs)/missions.tsx    Missions
    (tabs)/achievements.tsx Achievements ("実績") — segmented Badges/Items screen
    (tabs)/settings.tsx    Settings
  src/
    store/useAppStore.ts   AppStore + UIStore (single file)
    components/            InputModal, CookingModal, DateSelector, AppHeader,
                           CircularProgress, PieChart, BadgeList, CollectionList,
                           GachaResultModal, Toast
    types/index.ts         all type definitions
    utils/                 dateHelpers, formatHelpers, calculationHelpers, levelHelpers
    constants/              categories.ts (CATEGORY_LIST/COLORS/ICONS, WASTE_CATEGORIES),
                           game.ts (COOKING_RECORD_POINTS, ALL_DAY_COOKING_BONUS_POINTS),
                           rarity.ts (RARITY_COLORS/BG/STARS)
```

There are only 5 tabs now (down from 6): the old separate `badges.tsx` and `collection.tsx` screens were merged into a single `achievements.tsx` screen that switches between `BadgeList.tsx` and `CollectionList.tsx` via a segmented control.

This is **not** a monorepo. Types and utils are duplicated between root `src/` and `mobile/src/`; since the web app is frozen, they do not need to be kept in sync.

### Core State

**AppStore** (~820 lines, 17 actions) holds all business logic:
`userData`, `goals`, `expenses[]`, `cookingRecords[]`, `savingsRecords[]`, `collection[]`, `missions`, `badges`, `streaks`, `gachaItems[]`, `badgeDefinitions[]`, `savingsEquivalents[]`, `allDayCookingBonusDates[]`.

The 17 actions: `addExpenseRecord` / `updateExpenseRecord` / `deleteExpenseRecord`, `toggleCookingRecordWithDate`, `addSavingsRecord`, `playGacha`, `checkSavingsLevelUp`, `initializeMissions` / `updateMissionProgress` / `claimMissionReward`, `checkBadgeProgress`, `recordNoWasteDay` / `recordSnackFreeDay` / `resetStreakIfNeeded`, `updateGoals`, `updateMonthlyData`, `resetAllData`. A cleanup pass removed 9 actions that had zero UI callers (`checkLevelUp`, `toggleCookingRecord`, `addCookingRecord`, `updateCookingRecordMemo`, `deleteCookingRecord`, `generateDailyMissions`, `generateWeeklyMissions`, `resetDailyMissions`, `resetWeeklyMissions`) — generation/reset logic now lives entirely in `initializeMissions()`, and level recalculation in `applyXpChange()`.

**UIStore** now holds only `notifications[]` (consumed by `Toast.tsx`, rendered as a banner at the top of the screen and auto-dismissed after 3s) and `appHeaderHeight` (measured by `AppHeader.tsx` via `onLayout`, used to position the Toast just below the header). `showNotification()` is called on actions like cooking records. The previously-unused state carried over from the web version (`currentTab`, modal state, confirm dialog, help) and the `TabType` type have been deleted. Per-screen transient UI state (modal open/closed, etc.) still lives in `useAppStore` plus local `useState`.

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

**Expense input (`InputModal.tsx`):**
- Field order is category → amount → meal time → date (date is behind a collapsible section)
- The amount field has `autoFocus` and `keyboardType="number-pad"`; the save button sits in a `footer` outside the `ScrollView` so it's always reachable
- On Android, `KeyboardAvoidingView`'s `behavior` is set to `undefined` (not `padding`/`height`) because RN's Modal already forces `SOFT_INPUT_ADJUST_RESIZE` on the window — setting a behavior on top double-compensates. iOS uses `padding`
- スーパー disables meal-time selection and is forced to `'lunch'`; all other categories require a meal time including `snack`
- Both new entries and edits go through `InputModal`
- `addExpenseRecord()` runs `resetStreakIfNeeded()` → `updateMissionProgress("expense_record")` → `updateMissionProgress("record_habit")` **only when the record is dated today** — a backdated entry skips all three, so the streak is not reset either. It then always runs `updateMissionProgress("expense_control")` (see Missions below; recomputes the current week's expense total regardless of date) → `checkBadgeProgress()` → `updateMonthlyData()`

**Cooking input:** `CookingModal` → `toggleCookingRecordWithDate()`, which supports backdated records. Weekly mission progress is recomputed from records; daily progress only counts today. Each recorded meal shows a `🍳 +20pt` Toast; if morning/lunch/dinner are all recorded for that date, an additional `ALL_DAY_COOKING_BONUS_POINTS` (+50pt) Toast fires once per date, tracked via `allDayCookingBonusDates` to prevent double-awarding.

**Feedback:** `useUIStore().showNotification()` drives `Toast.tsx`, a banner shown for 3 seconds. Gacha results are shown in a dedicated `GachaResultModal.tsx` (launched from `CollectionList.tsx`) instead of an inline alert; odds, item pool, and point cost are unchanged.

**State updates:** never mutate state from components — always go through `useAppStore` actions. Point changes must go through `applyXpChange()` so `totalXp` and `level` stay consistent; writing `points` directly skips level recalculation.

**Points (actual values):** expense record 0pt, cooking +20pt, all-day cooking bonus (breakfast+lunch+dinner in one day) +50pt once per date, savings amount ÷ 10, daily missions 20–30pt, weekly missions 80–120pt, no-waste streak `streak × 5` (max 50), snack-free streak `streak × 3` (max 30), gacha rarity bonus rare +20 / epic +50 / legendary +100.

**Home screen budget gauge:** shows *remaining* balance shrinking, not amount spent growing (`getBudgetPercent()` returns the remaining share). The allowance (お小遣い) is the primary metric — large text, thick bar — while the supermarket budget is a thin, de-emphasized bar and the total is a single line of text. A goal of ¥0 renders the bar gray to distinguish "no budget set" from "fully spent" (`getBudgetColor()`).

**Level:** cumulative XP, `getTotalXpRequiredForLevel(L) = (L-1) × L × 100 / 2` (Lv2=100, Lv3=300, Lv4=600 …).

**Savings level:** `calculateSavingsLevel()` = `totalSavings / 1000 + 1`. `addSavingsRecord()` calls `checkSavingsLevelUp()`, which awards 20pt per level gained.

**Gacha:** 100pt per pull, 15 items, rarity odds common 60% / rare 25% / epic 12% / legendary 3%.

**Missions:** fixed templates, 3 daily and 3 weekly. Generation and reset are handled entirely by `initializeMissions()`, which runs on app startup, on foreground resume (`AppState` `change` listener in `app/_layout.tsx`), and when the missions screen is left open across midnight.

The weekly `cooking` / `total_savings` / `expense_control` missions don't accumulate via `m.progress + value`; `updateMissionProgress()`'s `weeklyProgress()` recomputes their progress from scratch every call, from records in the current week (`lastWeeklyReset` through 7 days later). `expense_control` (`weekly_expense_goal`) evaluates to progress 1 (done) only once **the week's final day has arrived (day 7, counted from `weekStart`) and** the week's expense total is at or under the weekly budget; before the final day, progress stays 0 no matter how low spending is so far — "stayed under budget for the whole week" can't be known until the week is over, and without this gate a single cheap purchase on day 1 would lock in completion immediately. The weekly budget is `(goals.monthlyExpenseGoal + goals.allowanceGoal) / weeks in that month` — the same "4 or 5 weeks" rule `stats.tsx`'s weekly chart uses, but applied to the mission's own `weekStart`–`weekStart+7days` window rather than the stats screen's date-based 5-way split of the month. A weekly budget of 0 or less (no goal set) is always treated as not achieved. It's recalculated from `addExpenseRecord` / `updateExpenseRecord` / `deleteExpenseRecord` regardless of the record's date. Like the other weekly missions, once a mission is `completed`, `updateMissionProgress()` stops updating it (`applyProgress()`'s `!m.completed` guard); since `expense_control` can only complete on the final day in the first place, this freeze rarely matters in practice.

**Badges:** 24 definitions evaluated dynamically by `checkBadgeProgress()` (by `category`: cooking 5 / savings 9 / level 4 / special 6).

**Budgets (naming is misleading):** `goals.monthlyExpenseGoal` is the **supermarket budget**, `goals.allowanceGoal` covers everything else, and the "食費合計予算" shown in settings is the sum of the two (read-only). `goals.cookingGoal` and `goals.monthlySavingsGoal` exist in state but have no editing UI.

## Data Persistence

- All state is persisted through Zustand's `persist` middleware into AsyncStorage
- Bumping the persisted schema requires incrementing `version` and extending `migrate`
- Manual reset available in the settings screen (`resetAllData()`)
- CSV export uses `expo-file-system` (`File` / `Paths`) + `expo-sharing`; the file is UTF-8 with BOM and CRLF line endings
- No backend. `firebase ^12.0.0` remains in the root web dependencies but is unused and not referenced by `mobile/`

## Release (Android)

- `mobile/eas.json` uses `appVersionSource: "remote"` with `production.autoIncrement: true`, so **EAS auto-assigns `android.versionCode`** on each production build. The `versionCode` value in `mobile/app.json` is a local placeholder only and does not need to be bumped by hand — it has no effect on what gets uploaded
- `mobile/app.json`'s `version` (the user-facing app version) is `2.0.0`
- Build profiles: `development` (dev client), `preview` (internal APK), `production` (AAB)
- Package `com.mealquest.app`, minSdkVersion 26, EAS owner `sakana1113`
- Store images live in `store-assets/`

## Legacy Reference Files

- Root `src/` is the React PWA version; `new-household-*` files are the original vanilla JS implementation
- Both are kept for historical reference only — no further development happens there
