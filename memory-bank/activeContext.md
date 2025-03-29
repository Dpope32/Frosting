# Active Context

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

## Recent Changes (Web Onboarding Welcome Screen - March 29, 2025)
- **Added Web Welcome Screen:** Created `app/screens/onboarding/welcome.tsx` to display a welcome message and privacy notice specifically for web users before the main onboarding flow begins. Includes a simple cursor-following animation for the app icon.
- **Updated Onboarding Logic:** Modified `app/screens/onboarding/index.tsx` to conditionally render the new `WelcomeScreen` as the first step (`step = -2`) only when `Platform.OS === 'web'`. Adjusted step transitions and back button logic accordingly. Fixed related TypeScript errors.

## Immediate Tasks
- Continue performance improvements and dependency reduction across other modules.
- Address known issues listed in `progress.md`.
- Continue exploring cross-device sync solutions (PocketBase/Supabase).
