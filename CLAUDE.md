# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **gamified household expense tracking web application** focused specifically on food expense management. The app is designed as a Progressive Web App (PWA) using React + TypeScript to help users reduce wasteful spending and encourage home cooking through game mechanics.

**Key Features:**
- Food expense tracking with categorization (スーパー, 自販機, コンビニ, 外食, 飲み会, デート, その他)
- Gamification elements including user levels, points, missions, and gacha collection system
- Badge system and achievements tracking
- Mission/challenge system with daily and weekly goals
- Data visualization for spending patterns with Chart.js
- Meal time tracking (morning, lunch, dinner, snack/間食)
- Statistics with visual progress gauges

## Architecture

The application follows a **Progressive Web App (PWA)** pattern with modern React + TypeScript:

- **React Components**: Modular component-based architecture with functional components and hooks
- **TypeScript**: Full type safety with strict mode enabled
- **State Management**: Zustand for efficient state management with persistence
- **Styling**: Single `src/index.css` file with mobile-first responsive design
- **PWA Features**: Vite PWA plugin with automatic service worker generation
- **Data Storage**: LocalStorage via Zustand persistence middleware (key: `"food-expense-app-storage"`)
- **Build System**: Vite with SWC for fast development and optimized builds

### Core Architecture Components

**State Management (Zustand):**
- `src/store/useAppStore.ts`: All business logic state (expenses, savings, missions, user data, badges, gacha)
- `src/store/useUIStore.ts` (or same file): UI state (modals, notifications, current tab)
- All state persisted to LocalStorage automatically

**Component Structure:**
- `App.tsx`: Root component with tab routing and mission initialization
- `Layout/`: Header and TabNavigation components
- `Tabs/`: Six main tab components (HomeTab, StatsTab, MissionsTab, BadgesTab, CollectionTab, SettingsTab)
- `Common/`: Reusable components (Avatar, Notification, ConfirmDialog, HelpModal)
- `Modals/`: InputModal for expense entry with number pad

**Key Data Models** (`src/types/index.ts`):
- `UserData`: Level, points, savings, cooking count, streaks, allowance tracking
- `ExpenseRecord`: Amount, category, meal time, timestamp
- `Mission`: Daily/weekly challenges with progress and rewards
- `Badge`: Achievement system with requirements and categories
- `GachaItem`/`CollectionItem`: Collectibles with rarity (common/rare/epic/legendary, 60/25/12/3%)
- `Goals`: Monthly user-set targets for expenses, allowance, cooking, savings

**Utility Functions:**
- `src/utils/dateHelpers.ts` — date formatting and range calculation
- `src/utils/formatHelpers.ts` — currency, emoji icons, rarity display
- `src/utils/calculationHelpers.ts` — budget and level progress calculations
- `src/hooks/useNotifications.ts` — level-up notification custom hook

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build (tsc + vite build)
npm run typecheck    # TypeScript type checking without emit
npm run lint         # ESLint checking (max-warnings 0)
npm run preview      # Preview production build locally
npm run test         # Run tests in watch mode (Vitest)
npm run test:run     # Run tests once (CI)
```

**Running a single test file:**
```bash
npx vitest run src/utils/__tests__/simple-test.test.ts
```

**Development Workflow:**
1. Always run `npm run typecheck` before committing
2. Run `npm run lint` to check code quality
3. Use `npm run dev` for development with hot reload

## Testing

Tests use **Vitest** with jsdom environment and `@testing-library/react`. Test files live in `src/utils/__tests__/`. The `src/test-setup.ts` clears localStorage between tests.

Path aliases configured in both `vite.config.ts` and `tsconfig.json`:
- `@/` → `src/`
- `@/components`, `@/types`, `@/store`, `@/utils`, `@/hooks`

## Key Implementation Patterns

**Input Modal System:**
- スーパー category disables meal time selection (defaults to 'lunch')
- All other categories require meal time selection including '間食' option
- Centralized expense recording through InputModal component

**State Updates:**
- All data modifications go through Zustand actions in `useAppStore`
- Automatic level-up checking after point-earning actions (`checkLevelUp()`)
- Mission progress automatically updates via `updateMissionProgress(actionType, value?)`
- Badge progress calculated dynamically via `checkBadgeProgress()`

**Gamification System:**
- Level progression: level × 100 points per level
- Savings level: every 1000¥ saved
- Gacha system: 100pt per pull, rarity distribution 60/25/12/3%
- Streak tracking for "no waste" and "snack-free" consecutive days
- All-day cooking bonus: 50pts for cooking all 3 meals in a day

## Data Persistence

All state persisted via Zustand `persist` middleware to LocalStorage under key `"food-expense-app-storage"`. Manual data reset available in SettingsTab.

**Note:** `firebase ^12.0.0` is installed as a dependency but currently unused (reserved for future backend integration).

## Localization

Entirely in Japanese. All UI text, categories, and user-facing content use Japanese language.
