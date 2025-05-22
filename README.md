<div style="display: flex; gap: 2px; margin-bottom: 20px; overflow-x: auto;">
  <img src="assets/screenshots/iosAppstore/image1.png" style="height: 300px; width: auto; object-fit: cover;" />
  <img src="assets/screenshots/iosAppstore/image2.png" style="height: 300px; width: auto; object-fit: cover;" />
  <img src="assets/screenshots/iosAppstore/image3.png" style="height: 300px; width: auto; object-fit: cover;" />
  <img src="assets/screenshots/iosAppstore/image4.png" style="height: 300px; width: auto; object-fit: cover;" />
  <img src="assets/screenshots/iosAppstore/image5.png" style="height: 300px; width: auto; object-fit: cover;" />
</div>

<h1 style="display: flex; align-items: center; margin-bottom: 20px;">
  <img src="assets/images/icon.png" style="height: 50px; width: auto; margin-right: 40px;" />
  Kaiba Nexus
</h1>

<div style="display: flex; flex-direction: row; align-items: flex-start; gap: 10px; width: 100%; margin-bottom: 30px;">
  <div style="padding: 10px 10px;"><a href="https://kaiba.vercel.app/" style="text-decoration: none;">Web Version</a></div>
  <div style="padding: 10px 10px;"><a href="https://apps.apple.com/us/app/kaiba-nexus/id6743065823" style="text-decoration: none;">Download on App Store</a></div>
  <div style="padding: 10px 10px;"><a href="https://deedaw.cc/pages/privacy.html" style="text-decoration: none;">Privacy Policy</a></div>
</div>

### A feature-rich personal management app built with React Native and Expo, designed to help you manage your life with style. 
- **Sync Engine**: Seamlessly synchronize your data across all your devices with our powerful sync engine
- **Offline Capability**: Built with a local-first approach, the app works fully offline. It pulls the latest information on startup and saves all your data when closed
- **Customizable Sync**: You have complete control over what data gets synchronized. Choose exactly which modules to sync across your devices
- **Privacy-First Design**: All data is encrypted at rest and in transit using AES-256 cryptography. Your information remains private - even we can't access it. Your devices are the only machines with the key to decrypt your data. Note: This security model means we cannot help recover data if you lose all your devices. Premium users with multiple devices effectively have "backups" of their data.

## Features

- **📝Notes**: Create rich notes with with Markdown formatting and drag-and-drop organization
- **✅Todo List**: Manage tasks with recurring, one-time todos, priority levels, and categories
- **📅Calendar**: Track birthdays, bills, events, sync with native device calendar, and more
- **👤CRM**: Manage contacts with attributes like Payment Methods, Addresses, Birthdays (recieve notifications on day of to remind you to wish them a happy birthday)
- **🔒Password Vault**: Securely store passwords locally using Cryptograpgy
- **💰Finance Tracking**: Monitor portfolio with real-time stock updates and a screen to manage your bills (comes in handy with spouses syncing their bills!)
- **🔄Year Progress Bar**: Visualize the current year's progress
- **🌤️Weather**: 5 Day forecast with animations and current temp! 
- **🌐Network**: Check your network speed and ping right from the app
- **🏀NBA**: Follow your favorite teams' schedules (deprecated during offseason)
- **🏆Project Tracker**: Track your projects, attach other people, notes, pictures, and more
- **☑️HabitTracker** Track your habits, recieve notification reminders on mobile
- **🎨Customization**: Choose your favorite wallpaper and color scheme

**Premium Features**: 
- Coming soon all for $3/month 
1. Cross-Device Sync (all encrypted with AES-256 of course)
2. Unlimited Devices 
3. Choose what you want to sync (Notes, Todos, Calendar, CRM, Password Vault)

![Home Screen Preview](assets/screenshots/web/loaded.png)

## 🚀 Getting Started

### Prerequisites

- Node.js 
- Yarn (recommended) or npm
- Expo CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/dpope32/frosting.git
cd frosting

# Install dependencies (Yarn recommended)
yarn install
```

### Running the App

#### Mobile (iOS/Android)
```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

#### Web Version
```bash
# Start with proxy server (recommended)
npx start web-dev

# See PROXY_SERVER.md for details on proxy setup
```

## Development Stack

| Category           | Technology          |
|--------------------|---------------------|
| Framework          | Expo + React Native |
| UI Components      | Tamagui             |
| State Management   | Zustand             |
| Data Fetching      | React Query         |
| Testing            | Jest                |
| Web Hosting        | Vercel              |
| Updates            | Expo OTA Updates    |

## License

MIT License - see [LICENSE](LICENSE) for details.

### Web Calendar Layout
![Web Calendar Demo](assets/videos/hero-ambient-1.gif)

### iPad Calendar Layout
<img src="assets/videos/hero-2.gif" style="height: 380px; width: auto;" />

### iPhone Calendar Layout
<img src="assets/videos/hero-3.gif" style="height: 300px; width: auto;" />

## Contributing

Contributions are welcome! Please open an issue or submit a pull request. 

## CI/CD Workflows

This project uses GitHub Actions for continuous integration and deployment:

- **Version Sync**: Automatically updates Android's build.gradle versionName to match the version in app.json when app.json changes
- **Expo Doctor**: Runs npx expo-doctor on every push to verify project configuration health
- **Dependency Check**: Runs yarn install on every push and pull request to ensure dependencies are properly installed


## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).  
You may fork, modify, and submit pull requests, but **commercial use is strictly prohibited** and **credit is required**.
