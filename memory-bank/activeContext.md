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

## Immediate Tasks
- Continue performance improvements and dependency reduction across other modules.
- Address known issues listed in `progress.md`.
- Continue exploring cross-device sync solutions (PocketBase/Supabase).
