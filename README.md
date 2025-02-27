# Frosting

A feature-rich personal dashboard app built with React Native and Expo, designed to help you manage your life with style.

## Features

- **Task Management**: Track recurring and one-time tasks on the landing page
- **Calendar**: Track birthdays, bills, events, and more
- **PRM**: Manage your contacts and relationships
- **Password Vault**: Securely store your passwords
- **Finance Tracking**: Monitor your portfolio with real-time stock updates
- **Weather & Network**: Check current conditions and network status
- **Sports Tracking**: Follow your favorite teams' schedules
- **Customization**: Choose from various wallpapers and themes

All data is stored locally first, with future plans for cross-device synchronization.

## Getting Started

### Prerequisites

- Node.js 
- npm or yarn
- Expo CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/dpope32/frosting.git
cd frosting

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
