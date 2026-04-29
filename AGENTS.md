# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a **gamified household expense tracking web application** focused specifically on food expense management. The app is designed as a Progressive Web App (PWA) using React + TypeScript to help users reduce wasteful spending and encourage home cooking through game mechanics.

**Key Features:**
- Food expense tracking with categorization (スーパー, 自販機, コンビニ, 飲み会, デート, その他)
- Gamification elements including user levels, points, missions, and gacha collection system
- Badge system and achievements tracking
- Mission/challenge system with daily and weekly goals
- Data visualization for spending patterns with Chart.js
- Meal time tracking including new "間食" (snack) option
- Statistics with visual progress gauges

## Architecture

The application follows a **Progressive Web App (PWA)** pattern with modern React + TypeScript:

- **React Components**: Modular component-based architecture with functional components and hooks
- **TypeScript**: Full type safety and IntelliSense support
- **State Management**: Zustand for efficient state management with persistence
- **Styling**: Single CSS file with responsive design and extensive animations
- **PWA Features**: Vite PWA plugin with automatic service worker generation
- **Data Storage**: LocalStorage with Zustand persistence middleware
- **Build System**: Vite with SWC for fast development and optimized builds

### Core Architecture Components

**State Management (Zustand):**
- `AppStore`: Main application data (expenses, savings, missions, user data, badges, etc.)
- `UIStore`: UI-specific state (modals, notifications, current tab)
- All state persisted to LocalStorage automatically

**Component Structure:**
- `App.tsx`: Main application with tab routing system
- `Layout/`: Header and TabNavigation components
- `Tabs/`: Five main tab components (HomeTab, StatsTab, MissionsTab, BadgesTab, CollectionTab, SettingsTab)
- `Common/`: Reusable components (Avatar, Notification, ConfirmDialog)
- `Modals/`: InputModal for expense entry

**Key Data Models:**
- `UserData`: Level, points, savings, cooking count, streaks
- `ExpenseRecord`: Amount, category, meal time, date tracking
- `Mission`: Daily/weekly challenges with progress and rewards
- `Badge`: Achievement system with requirements and progress
- `GachaItem`: Collectible items with rarity system

## Development Commands

**Essential Commands:**
```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build (TypeScript compile + Vite build)
npm run typecheck    # TypeScript type checking without emit
npm run lint         # ESLint checking
npm run preview      # Preview production build locally
```

**Development Workflow:**
1. Always run `npm run typecheck` before committing
2. Run `npm run lint` to check code quality
3. Use `npm run dev` for development with hot reload
4. Test PWA features using browser dev tools
5. No automated test framework - manual testing required

## Key Implementation Patterns

**Input Modal System:**
- スーパー category disables meal time selection (defaults to 'lunch')
- All other categories require meal time selection including new '間食' option
- Centralized expense recording through InputModal component

**State Updates:**
- All data modifications go through Zustand actions
- Automatic level-up checking after point-earning actions
- Mission progress automatically updates based on user actions
- Badge progress calculated dynamically from current state

**UI/UX Flow:**
- Tab-based navigation optimized for mobile
- Status summary displayed prominently at top of HomeTab
- Expense recording as primary action
- Daily activities (cooking + challenges) in side-by-side layout
- Statistics with visual progress gauges for key metrics

**Gamification System:**
- Points earned for positive actions (cooking, saving)
- Mission system with daily/weekly reset timers
- Badge progression with various requirement types
- Gacha collection system (100pt per pull)
- Streak tracking for consecutive behaviors

## Data Persistence

**LocalStorage Schema:**
- All application state persisted via Zustand persistence middleware
- Data automatically saved on state changes
- Manual data reset available in SettingsTab
- No external database - fully client-side application

**Key Data Relationships:**
- Expenses linked to categories and meal times
- Missions track various user behaviors automatically
- Badge progress calculated from accumulated user data
- Gacha collection maintains count and obtain dates

## Styling and Responsive Design

**CSS Architecture:**
- Single `src/index.css` file with all styles
- Mobile-first responsive design
- Extensive use of CSS Grid and Flexbox
- Custom animations and transitions
- Color-coded category system for expenses
- Recently improved for better readability and contrast

**Component Styling Patterns:**
- BEM-like class naming convention
- Gradient backgrounds for visual appeal
- Hover and active states for interactive elements
- Consistent spacing and typography scale
- PWA-optimized touch targets

## Localization

The application is entirely in Japanese and designed for Japanese users focused on food expense management and cooking encouragement. All UI text, categories, and user-facing content use Japanese language.

## Current Development State

**Active Implementation:**
- React + TypeScript application in `src/` directory
- Fully migrated from vanilla JavaScript (legacy files preserved for reference)
- Recent UI improvements for better readability and layout optimization
- Enhanced meal time tracking with snack option
- Improved statistics display with visual gauges

**Legacy Reference Files:**
- `new-household-*` files are the original vanilla implementation
- Keep for reference but no longer active development targets
- All new features should be implemented in React components