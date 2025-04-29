export const CHANGELOG = [
    {
      version: '1.1.88',
      notes: 'Added changelog screen',
      bullets: [
        'Began implementing new sync feature',
        'Enhanced drawer layout',
        'Integrated LongPressDelete for HabitCards',
        'Added React Native Masked View for the Onboarding Screen',
        'Added Whats New? FAB to the Home screen',
      ],
    },
    {
      version: '1.1.87',
      notes: 'Added Floating Action Button to the Home screen',
      bullets: [
        'Patched notification bug',
        'New FAB includes CRUD operations for 7 features',
        'Removed NBA screen with upcoming season ending',
        'Improved light mode styles on iPad',
      ],
    },
    {
      version: '1.1.86',
      notes: 'Refactored New Todo Modal',
      bullets: [
        'Patched time picker bug on mobile',
        'Easier to add/remove devices',
        'Added hidden Sync button to drawer',
        'Added Expo Doctor CICD Pipeline to commits',
      ],
    },
    {
      version: '1.1.85',
      notes: 'Optimized App initialization',
      bullets: [
        'Cut app startup time by 25-30% by lazy loading Home screen',
        'Improved error reporting (sentry)',
      ],
    },
    {
      version: '1.1.84',
      notes: 'Added drag and drop delete for Notes!',
      bullets: [
        'Security audit completed',
        'Moved greeting to header on iPad', 
        'Removed settings icon and replaced with settings Card on iPad',
      ],
    },
    {
      version: '1.1.83',
      notes: 'Initial release of Android',
      bullets: [
        'Created closed testing track for Android',
        'Beta testers welcome!',
      ],
    },
    {
      version: '1.1.82',
      notes: 'Improved onboarding and welcome experience',
      bullets: [
        'Added web-specific welcome screen for onboarding',
        'Optimized onboarding animations and transitions',
        'Fixed bug with onboarding step navigation',
        'Improved privacy notice display for web users',
      ],
    },
    {
      version: '1.1.81',
      notes: 'Enhanced calendar and event features',
      bullets: [
        'Responsive calendar sizing for different layouts',
        'Improved event preview and display',
        'Added support for NBA game schedules',
        'Fixed bug with recurring event reminders',
      ],
    },
    {
      version: '1.1.80',
      notes: 'Performance and dependency optimizations',
      bullets: [
        'Reduced bundle size by removing unused packages',
        'Optimized wallpaper caching and loading',
        'Improved app startup speed',
        'Fixed slow wallpaper switching during onboarding',
      ],
    },
    {
      version: '1.1.79',
      notes: 'Refactored modals and improved CRM',
      bullets: [
        'Created BaseCardWithRecommendationsModal for consistent modals',
        'Refactored Task, Bill, and Vault modals for better gesture handling',
        'Added PeopleListModal for CRM contacts',
        'Updated header to show people icon on CRM screen',
      ],
    },
    {
      version: '1.1.78',
      notes: 'Notes drag & drop and bug fixes',
      bullets: [
        'Implemented cross-platform drag and drop for notes',
        'Improved note reordering UX',
        'Fixed settings modal wallpaper bug',
        'Resolved Sentry error for invalid wallpaper path',
      ],
    },
    {
      version: '1.1.77',
      notes: 'General improvements and code cleanup',
      bullets: [
        'Optimized state management with Zustand',
        'Improved error handling in global ErrorBoundary',
        'Refactored shared components for maintainability',
        'Updated dependencies and cleaned up unused code',
      ],
    },
  ];