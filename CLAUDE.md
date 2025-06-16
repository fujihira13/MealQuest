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

The application follows a **single-page application (SPA)** pattern with:

- **HTML Structure**: `household-app.html` - Main app interface with tab-based navigation
- **JavaScript Logic**: `household-script.js` - Core app logic using ES6 class-based architecture
- **Styling**: `household-style.css` - Complete CSS styling with animations and responsive design
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

This is a client-side only application. To develop:

1. **Local Development**: 
   - Main version: Open `household-app.html` directly in a web browser
   - New version: Open `new-household-app.html` for the updated interface
   - Or serve with any static file server: `python -m http.server 8000` or `npx serve .`
2. **Testing**: Manual testing in browser - no automated test framework configured
3. **Deployment**: Static hosting (can be deployed to any web server)

## Current Development State

There are currently two versions of the application in the repository:
- **Original version**: `household-app.html`, `household-script.js`, `household-style.css` (~1200 lines of JS)
- **New version**: `new-household-app.html`, `new-household-script.js`, `new-household-style.css` (~825 lines of JS)

When making changes, verify which version you're working with as they have different feature sets and UI implementations.

## Key Implementation Notes

- **Data Persistence**: All data stored in browser LocalStorage under key "householdApp"
- **No Build Process**: Pure vanilla JS/HTML/CSS - no compilation needed
- **Mobile-First**: Responsive design optimized for mobile devices
- **Offline Capable**: Designed to work without internet connection
- **Event-Driven Architecture**: UI updates triggered by user interactions through event listeners
- **State Management**: Centralized in HouseholdApp class with save/load methods for data persistence

## Data Structure

The main application state includes:
- `userData`: User level, points, HP, cooking skill, streaks
- `expenses`: Array of expense entries with category, amount, points, date
- `missions`: Daily/weekly challenge completion status
- `recipes`: Recipe collection with unlock status and metadata
- `badges`: Achievement tracking system
- `gachaItems`: Collectible items with rarity system

## File Structure

- `household-app.html` - Main application interface
- `household-script.js` - Application logic and state management
- `household-style.css` - Styles and animations
- `requirements_doc.md` - Detailed Japanese requirements document
- `aidea.txt` - Additional feature ideas and concepts (in Japanese)
- `app_wireframe.html` - UI wireframe reference

## UI/UX Patterns

- **Tab Navigation**: Dashboard, Input, Missions, Collection, Gacha
- **Character System**: Animated character with mood changes based on user behavior
- **Point System**: Positive points for cooking/grocery, negative for eating out/snacks
- **Mission Completion**: Daily and weekly challenges with rewards
- **Collection Elements**: Recipe unlocking, badge earning, gacha items

## Localization

The application is entirely in Japanese and designed for Japanese users focused on food expense management and cooking encouragement.