# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **gamified household expense tracking web application** focused specifically on food expense management. The app is designed as a Progressive Web App (PWA) using vanilla HTML, CSS, and JavaScript to help users reduce wasteful spending and encourage home cooking through game mechanics.

**Key Features:**
- Food expense tracking with categorization (cooking, eating out, snacks, vending machine, grocery, other)
- Gamification elements including character stats, points, levels, missions, and gacha system
- Recipe collection that unlocks through cooking activities
- Badge system and achievements
- Mission/challenge system with daily and weekly goals
- Data visualization for spending patterns

## Architecture

The application follows a **Progressive Web App (PWA)** pattern with:

- **HTML Structure**: `new-household-app.html` - Main app interface with tab-based navigation
- **JavaScript Logic**: `new-household-script.js` - Core app logic using ES6 class-based architecture
- **Styling**: `new-household-style.css` - Complete CSS styling with animations and responsive design
- **PWA Manifest**: `manifest.json` - App metadata and icon configuration
- **Service Worker**: `sw.js` - Offline functionality and caching strategy
- **Data Storage**: LocalStorage for client-side data persistence
- **App State**: Centralized in `HouseholdApp` class with methods for data management

### Core Classes and Structure

- **HouseholdApp class**: Main application controller
  - Manages user data, expenses, missions, recipes, badges
  - Handles UI updates, data persistence, and game mechanics
  - Implements gamification logic (points, levels, character stats)

### Key Data Models

- **User Data**: Level, points, HP, cooking skill, monthly savings, cooking count
- **Expenses**: Amount, category, description, points, date
- **Missions**: Daily and weekly challenges with completion tracking
- **Recipes**: Unlockable cooking recipes with difficulty and savings info
- **Gacha System**: Collectible items with rarity levels

## Development Commands

This is a client-side only PWA application. To develop:

1. **Local Development**: 
   - **Primary version**: Open `new-household-app.html` directly in a web browser
   - **With static server** (recommended for PWA features): `python -m http.server 8000` or `npx serve .`
   - Access at `http://localhost:8000/new-household-app.html`
2. **Testing**: Manual testing in browser - no automated test framework configured
3. **PWA Testing**: Use browser dev tools to test offline functionality and service worker
4. **Deployment**: Static hosting (can be deployed to any web server supporting PWA)

## Current Development State

**Current active version**: `new-household-app.html`, `new-household-script.js`, `new-household-style.css`

This is the primary PWA version with full offline capabilities and optimized user experience. All new development should focus on this version unless specifically requested to work on legacy files.

## Key Implementation Notes

- **Data Persistence**: All data stored in browser LocalStorage under key "householdApp"
- **No Build Process**: Pure vanilla JS/HTML/CSS - no compilation needed
- **Mobile-First**: Responsive design optimized for mobile devices
- **PWA Features**: Full offline capability via service worker with cache-first strategy
- **External Dependencies**: Font Awesome 6.0.0 for icons, Chart.js for data visualization
- **Event-Driven Architecture**: UI updates triggered by user interactions through event listeners
- **State Management**: Centralized in HouseholdApp class with save/load methods for data persistence
- **Service Worker Caching**: App shell caching with network fallback for dynamic content

## Data Structure

The main application state includes:
- `userData`: User level, points, HP, cooking skill, streaks
- `expenses`: Array of expense entries with category, amount, points, date
- `missions`: Daily/weekly challenge completion status
- `recipes`: Recipe collection with unlock status and metadata
- `badges`: Achievement tracking system
- `gachaItems`: Collectible items with rarity system

## File Structure

**Active Application Files:**
- `new-household-app.html` - Main PWA application interface
- `new-household-script.js` - Application logic and state management  
- `new-household-style.css` - Styles and animations
- `manifest.json` - PWA manifest with app metadata
- `sw.js` - Service worker for offline functionality

**Documentation and Requirements:**
- `requirements_doc.md` - Detailed Japanese requirements document
- `aidea.txt` - Additional feature ideas and concepts (in Japanese)
- `CLAUDE.md` - Development guidance (this file)

## UI/UX Patterns

- **Tab Navigation**: Home, Stats, Missions, Badges, Collection
- **Character System**: Animated character with mood changes based on user behavior  
- **Point System**: Positive points for cooking/grocery, negative for eating out/snacks
- **Mission Completion**: Daily and weekly challenges with rewards
- **Collection Elements**: Recipe unlocking, badge earning, gacha items
- **Data Visualization**: Chart.js integration for expense tracking and trends

## Localization

The application is entirely in Japanese and designed for Japanese users focused on food expense management and cooking encouragement.