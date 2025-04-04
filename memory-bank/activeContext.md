# Active Context

## Recent Changes (Task & NBA Sync Fix - April 4, 2025)
- **Task Type (`types/task.ts`):** Added optional `gameId: number` field to link tasks to specific NBA games.
- **NBA Store (`store/NBAStore.ts`):**
    - Refactored `syncGameTasks` to use a non-destructive approach:
        - Identifies existing NBA tasks using `gameId`.
        - Adds tasks for new games, including the `gameId`.
        - Deletes tasks for games no longer present in the fetched schedule.
    - Removed the old `deleteAllGameTasks` function.
    - This resolves the issue where NBA game tasks could disappear intermittently due to a race condition between game start time and sync execution.
- **ToDo Store (`store/ToDo.ts`):**
    - Refined `isTaskDue` logic for `one-time` tasks (including specific NBA game handling) to ensure correct display based on scheduled date, creation date, or interaction.
    - Simplified `taskFilter`.
    - Corrected `toggleTaskCompletion` to rely solely on `completionHistory`.
    - Added diagnostic logging for NBA task filtering (can be removed later).
- **`isWeb` Refactor:** Replaced local `const isWeb = Platform.OS === 'web'` declarations across multiple components with the `isWeb` import directly from `tamagui`. (Previous change)
- **Task Debugging:** Added a temporary, development-only (`__DEV__`) button to `TaskSection.tsx` to trigger the `debugTasks` function for easier debugging. (Previous change)

## Recent Changes (Bills, Tasks, Network, UI - April 3, 2025)
- **Bills & Tasks Integration:** Refactored `AddBillModal` with improved amount input and date picking. Removed delete from `BillCard`. Ensured tasks created for bills use the 'bills' category and correct `dueDate`, updating `ToDo.ts` filtering logic. Added 'bills' category to `TaskCategory` type.
- **Network Speed Hook:** Overhauled `useNetworkSpeed` to prioritize latency measurement over potentially unreliable link speed. Improved loading, offline, and error states. Updated `WifiCard` to use the new hook logic and refined signal strength calculation/display.
- **UI & Modal Consistency:** Added `hideHandle` prop to `BaseCardModal` and applied it to numerous modals (`AddBillModal`, `BillsListModal`, `SettingsModal`, etc.). Refactored `TaskCard` and `TaskSection` layouts for better structure and web responsiveness (CSS Grid). Made specific style adjustments for web vs. mobile web in onboarding and `PortfolioTable`.
- **App Updates:** Improved OTA update handling in `_layout.tsx` with platform-specific prompts and periodic checks. Adjusted `runtimeVersion` policy in `app.json`.

## Current Focus
- Refining feature set for the public release.
- Setting up Electron for Desktop Applications
- Testing UI responsiveness across web, ios, and android
- Exploring the feasibility of syncing Zustand stores via PocketBase/Supabase.

## Recent Changes (Wallpaper Optimization - March 28, 2025)
- **Fixed Slow Switching (Onboarding):** Resolved significant delays in `app/screens/onboarding/step3.tsx` by removing redundant wallpaper downloads/caching on button press. The component now loads the selected wallpaper directly from the `WallpaperStore` cache.
- **Optimized Preloading:** Refined `components/wpPreload.tsx` to correctly `await` the asynchronous cache check (`getCachedWallpaper`) within `Promise.all`, ensuring efficient parallel preloading without redundant downloads. Removed unused `WallpaperPreloader` component.
- **Consolidated Caching:** Removed redundant web-specific caching logic from `store/WallpaperStore.ts` as preloading now handles this. Added checks to `cacheWallpaper` to prevent re-downloading already existing files on native platforms.
- **Improved Landing Page Display:** Updated `components/home/BackgroundSection.tsx` to correctly read the selected style from `UserStore`, handle Zustand store hydration (`hydrated` flag), add a loading state, and reliably fetch the cached wallpaper URI.
- **Refined Types:** Updated `FormData['backgroundStyle']` in `types/index.ts` to use a template literal (`wallpaper-${string}` | 'gradient') for accurate dynamic wallpaper naming.
- **Splash Screen:** Ensured `app/_layout.tsx` hides the splash screen appropriately after fonts are loaded and potential updates are checked.

## Recent Changes (StarsBackground Extraction - March 31, 2025)
- **Extracted Stars Animation:** Created reusable `components/shared/StarsBackground.tsx` component to encapsulate all stars animation logic previously in `app/screens/onboarding/step3.tsx`.
- **Optimized Imports:** Removed unused imports (`useWindowDimensions`, `useColorScheme`) from the new component.
- **Maintained Functionality:** Preserved all original animation behavior across platforms (web, iOS, Android).
- **Reduced Step3 Size:** Removed ~150 lines of code from step3.tsx by using the new component.

## Recent Changes (Web Onboarding Welcome Screen - March 29, 2025)
- **Added Web Welcome Screen:** Created `app/screens/onboarding/welcome.tsx` to display a welcome message and privacy notice specifically for web users before the main onboarding flow begins. Includes a simple cursor-following animation for the app icon.
- **Updated Onboarding Logic:** Modified `app/screens/onboarding/index.tsx` to conditionally render the new `WelcomeScreen` as the first step (`step = -2`) only when `Platform.OS === 'web'`. Adjusted step transitions and back button logic accordingly. Fixed related TypeScript errors.

## Recent Changes (Calendar View Improvements - April 1, 2025)
- **Responsive Sizing:** Updated calendar to dynamically adjust element sizes based on column count
- **Single-Column Optimizations:**
  - Increased day numbers 
  - Increased day names 
  - Increased holiday/birthday icons 
  - Increased NBA logo 
- **Width Adjustments:**
  - 3 columns: 33% width
  - 2 columns: 45% width (changed from 49%)
  - 1 column: 80% width (changed from 100%)

## Recent Changes (NewTaskModal Improvements - April 1, 2025)
- **Animation Improvements:**
  - Added platform-specific close delays to BaseCardAnimated
  - Implemented smooth animations for web with proper timing
  - Maintained fast response on mobile
- **Toast Integration:**
  - Ensured toast visibility before modal closes
  - Added proper timing between toast display and modal close

## Recent Changes (Modal Refactor & CRM Header - April 3, 2025)
- **Created `BaseCardWithRecommendationsModal`:** Abstracted common modal structure with a horizontal recommendation scroll view (`components/cardModals/BaseCardWithRecommendationsModal.tsx`). Includes basic gesture handling setup to allow horizontal scrolling within the modal without triggering the vertical close gesture.
- **Refactored Modals:** Updated `TaskListModal`, `BillsListModal`, and `VaultListModal` to use the new `BaseCardWithRecommendationsModal`, removing redundant code and standardizing structure.
- **Added `PeopleListModal`:** Created a new modal (`components/cardModals/PeopleListModal.tsx`) using the base component to display CRM contacts. Includes placeholder recommendations.
- **Updated Header:** Modified `components/Header.tsx` to display a "people" icon and trigger the `PeopleListModal` when the CRM screen (`app/(drawer)/crm.tsx`) is active.

## Immediate Tasks
- Test gesture handling in refactored modals (`TaskListModal`, `BillsListModal`, `VaultListModal`).
- Refine recommendations for `PeopleListModal`.
- Continue performance improvements and dependency reduction.
- Address remaining known issues listed in `progress.md`.
- Continue exploring cross-device sync solutions (PocketBase/Supabase).

### Current Form Architecture Refactor

```mermaid
flowchart LR
    EditForm[EditPersonForm] --> FormContent
    AddForm[AddPersonForm] --> FormContent
    FormContent --> ContactInfo
    FormContent --> Profile
    FormContent --> Payments
    
    style EditForm fill:#f9f,stroke:#333
    style AddForm fill:#f9f,stroke:#333
    style FormContent fill:#b8d,stroke:#333
```

Key improvements:
- Eliminated duplicate form logic between Add/Edit variants
- Created dedicated section components (ContactInfo, Profile, Payments)
- Implemented shared DebouncedInput component with proper TypeScript typing
- Standardized state management between form variants
- Improved mobile/web responsive layouts
