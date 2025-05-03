export const CHANGELOG = [
  {
    version: '1.1.124',
    date: '2025-05-04',
    notes: 'Polishing the Experience: UI Refinements',
    bullets: [
      'Fixed edit person form adding missing save button',
      'Centered notes empty state on mobile',
      'Turned down BlurView intensity in landing page',
      'Added tags to CRM screen',
      'Removed React Native masked view dependency',
    ],
  },
  {
    version: '1.1.117',
    date: '2025-05-03',
    notes: 'Stock Screen',
    bullets: [
      'Added missing Stock to Floating Action Button',
      'Added missing autofocus to stock modal',
      'Fixed bug with Notifications still sending for completed Habits',

    ],
  },
  {
    version: '1.1.111',
    date: '2025-05-01',
    notes: 'Small UI updates to iPad',
    bullets: [
      'Export app registry store on mount',
      'Changed UI in Changelog',
      'Added missing person form in fab',
    ],
  },
  {
    version: '1.1.107',
    date: '2025-04-30',
    notes: 'Smarter Tags & Smoother Inputs',
    bullets: [
      'Tags are now saved and persist across sessions',
      'Most input fields now auto-focus for faster entry',
      'Fixed a bug where new notes with titles would default to "Untitled"',
      'Updated toast notifications with a fresh color',
    ],
  },
  {
    version: '1.1.102',
    date: '2025-04-24',
    notes: 'Custom Categories!',
    bullets: [
      'Added custom categories to Tasks',
      'Improved task list sheet by adding categories to filter',
      'Patched bug with the recommendation modals not having a background color on light mode',
    ],
  },
  {
    version: '1.1.100',
    notes: 'A New Way to Navigate: Floating Action Button',
    bullets: [
      'Patched notification bug',
      'New FAB includes CRUD operations for 7 features',
      'Removed NBA screen with upcoming season ending',
      'Improved light mode styles on iPad',
    ],
  },
  {
    version: '1.1.97',
    date: '2025-04-20',
    notes: 'Easter Egg ;) (happy easter!)',
    bullets: [
      'Enhanced UI responsiveness and consistency across devices',
      '(Long hold year progress bar)',
      'Refined background colors, padding, and font sizes in drawer layout, notes screen, and modals',
      'Removed obsolete ghost note style from noteStyles utility for cleaner code',
    ],
  },
  {
    version: '1.1.93',
    date: '2025-04-19',
    notes: 'Began testing sync feature',
    bullets: [
      'Patched minor bug in greeting with extra commas',
      'Fixed lots of styles on Web',
      'Fixed time picker on Web ',
    ],
  },
  {
    version: '1.1.89',
    date: '2025-04-13',
    notes: 'Finished Habit Screen',
    bullets: [
      'Reoccuring Notification reminders for Habits not yet completed',
      'Habit Card analytics',
      'Fixed bug with Habit notifications all sending at once',
      'Fixed small styling adjustment preventing homescreen from showing bottom of Task Section'
    ],
  },
    {
      version: '1.1.87',
      notes: 'Added changelog screen',
      date: '2025-04-10',
      bullets: [
        'Began implementing new sync feature',
        'Enhanced drawer layout',
        'Integrated LongPressDelete for HabitCards',
        'Added Whats New? FAB to the Home screen',
      ],
    },
    {
      version: '1.1.81',
      date: '2025-03-20',
      notes: 'Todo Creation, Now Smoother Than Ever',
      bullets: [
        'Patched time picker bug on mobile',
        'Easier to add/remove devices',
        'Added hidden Sync button to drawer',
        'Added Expo Doctor CICD Pipeline to commits',
      ],
    },
    {
      version: '1.1.77',
      notes: 'Faster Launch, Better Reliability',
      bullets: [
        'Cut app startup time by 25-30% by lazy loading Home screen',
        'Improved error reporting (sentry)',
      ],
    },
    {
      version: '1.1.70',
      notes: 'Added drag and drop delete for Notes!',
      date: '2025-2-20',
      bullets: [
        'Security audit completed',
        'Moved greeting to header on iPad', 
        'Removed settings icon and replaced with settings Card on iPad',
      ],
    },
    {
      version: '1.1.69',
      notes: 'Initial release of Android',
      date: '2025-02-02',
      bullets: [
        'Created closed testing track for Android',
        'Beta testers welcome!',
      ],
    },
    {
      version: '1.1.64',
      notes: 'Improved onboarding and welcome experience',
      bullets: [
        'Added web-specific welcome screen for onboarding',
        'Optimized onboarding animations and transitions',
        'Fixed bug with onboarding step navigation',
        'Improved privacy notice display for web users',
      ],
    },
    {
      version: '1.1.63',
      notes: 'Enhanced calendar and event features',
      bullets: [
        'Responsive calendar sizing for different layouts',
        'Improved event preview and display',
        'Added support for NBA game schedules',
        'Fixed bug with recurring event reminders',
      ],
    },
    {
      version: '1.1.59',
      notes: 'Refactored modals and improved CRM',
      bullets: [
        'Created BaseCardWithRecommendationsModal for consistent modals',
        'Refactored Task, Bill, and Vault modals for better gesture handling',
        'Added PeopleListModal for CRM contacts',
        'Updated header to show people icon on CRM screen',
      ],
    },
    {
      version: '1.1.55',
      date: '2025-01-10',
      notes: 'Under the Hood: Stability & Cleanup',
      bullets: [
        'Optimized state management with Zustand',
        'Improved error handling in global ErrorBoundary',
        'Refactored shared components for maintainability',
        'Updated dependencies and cleaned up unused code',
      ],
    },
  ];
