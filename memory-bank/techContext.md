# Technical Context

## Core Technologies

### Frontend Framework
- **React Native**: Cross-platform mobile application framework
- **Expo**: Development platform for React Native, simplifying builds and deployment
- **Tamagui**: UI component library for cross-platform styling
- **Expo Router**: File-based routing system
- **StarsBackground**: Reusable animation component (`components/shared/StarsBackground.tsx`) implementing platform-specific star animations (native: Reanimated, web: CSS animations) while maintaining consistent visual effects across platforms (March 31, 2025)

### State Management
- **Zustand**: Lightweight state management library
- **AsyncStorage**: Persistent storage solution for React Native
- **WallpaperStore**: Zustand store for managing wallpaper state and caching (March 28, 2025 - `1459baa`)
- **CalendarStore/ToDo Integration**: Task-to-calendar event synchronization (March 29, 2025)

### Desktop/Web Support
- **Electron**: Framework for desktop applications
- **React Native Web**: Web support for React Native components

### Error Handling
- **ErrorBoundary**: Custom component (`components/shared/ErrorBoundary.tsx`) implemented to catch rendering errors in the component tree and display a fallback UI (March 30, 2025).

## Development Environment

### Build Tools
- **Expo CLI**: Command-line interface for Expo development
- **EAS Build**: Expo Application Services for cloud builds
- **TypeScript**: Typed JavaScript for improved developer experience

### Testing
- ShotBot for screenshot generation and UI testing

## External Dependencies

### APIs and Services
- Weather API for current conditions
- Stock market data APIs for portfolio tracking
- NBA and sports data APIs
- Holiday service for calendar integration

### Libraries
- React Native components for UI elements
- Navigation libraries for app routing
- Date/time manipulation libraries
- **`expo-file-system`**: Used for native wallpaper caching (March 28, 2025 - `1459baa`)
- **Removed (March 28, 2025 - `1459baa`, `1508286`):** `expo-av`, `expo-network`, `expo-sharing`, `expo-video`, `react-native-figma-squircle`, `react-native-progress`, `react-circular-progressbar`

## Deployment Targets

### Mobile
- iOS App Store
- Google Play Store

### Desktop/Web
- Electron packaged applications
- Web browser deployment
    - Deployed via Vercel (March 28, 2025)
    - Includes Vercel Analytics and Speed Insights (March 28, 2025 - `9e23284`, `f1136a2`)
    - Configured CORS proxy via Vercel function (`api/proxy/[[...path]].ts`) (March 28, 2025 - `b2d9f76`, `73f4091`)

## Technical Constraints

### Cross-Platform Compatibility
- Ensuring consistent UI/UX across iOS, Android, web, and desktop
- Managing platform-specific code and optimizations

### Performance
- Optimizing for mobile devices with limited resources
- Reducing bundle size and dependencies (completed initial pass March 28, 2025 - `1459baa`, `1508286`)

### Data Storage
- Local-first approach with AsyncStorage
- Investigating sync solutions with PocketBase

### Authentication
- Exploring lightweight authentication for cross-device synchronization
- Balancing security with ease of use

## Development Workflow

### Version Control
- Git for source code management

### CI/CD
- EAS Build for continuous integration
- Automated builds for different platforms

### Environment Configuration
- Environment variables for API keys and configuration
- Platform-specific settings
