# Kaiba-Nexus

A feature-rich personal dashboard app built with React Native and Expo, designed to help you manage your life with style.

## Features

- **Task Management**: Track recurring and one-time tasks on the landing page
- **Calendar**: Track birthdays, bills, events, NBA schedules, and more. 
- **CRM**: Manage your contacts with intuitive attributes like Payment Methods, Addresses, Phone Numbers, and more
- **Notifications**: Never miss another birthday or anniversary
- **Password Vault**: Securely store your passwords locally
- **Finance Tracking**: Monitor your portfolio with real-time stock updates. Build your own Watchlist on the Web version
- **Weather & Network**: Check current conditions and network status from the home page.
- **NBA**: Follow your favorite NBA teams' schedule
- **Customization**: Choose from various wallpapers, themes, and more

All data is stored locally first, with future plans for cross-device synchronization.

## Getting Started

### Prerequisites

- Node.js 
- npm or yarn
- Expo CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/dpope32/kaiba-nexus.git
cd kaiba-nexus

# Install dependencies
npm install
```

### Running the App
```bash
npx expo run
```

#### Web
```bash
# Option 1: Standard web start (some features may not work due to CORS)
npm run web

# Option 2: Recommended for web development (includes proxy server)
npm run web-dev
```

See [PROXY_SERVER.md](PROXY_SERVER.md) for more details on the proxy server used for web development.

## Development

- The app uses Expo and React Native for cross-platform compatibility
- Tamagui is used for UI components
- Zustand for state management
- React Query for data fetching

## License

This project is licensed under the MIT License - see the LICENSE file for details.
