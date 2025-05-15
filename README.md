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

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px; width: 100%; margin-bottom: 30px;">
  <a href="https://kaiba.vercel.app/" style="text-decoration: none; padding: 10px 0;">Web Version</a>
  <a href="https://apps.apple.com/us/app/kaiba-nexus/id6743065823" style="text-decoration: none; padding: 10px 0;">Download on App Store</a>
  <a href="https://deedaw.cc/pages/privacy.html" style="text-decoration: none; padding: 10px 0;">Privacy Policy</a>
</div>

A feature-rich personal dashboard app built with React Native and Expo, designed to help you manage your life with style.

## Features

- **📝Notes**: Create rich notes with with Markdown formatting and drag-and-drop organization
- **✅Todo List**: Manage tasks with recurring, one-time todos, priority levels, and categories
- **📅Calendar**: Track birthdays, bills, events, and more
- **👤CRM**: Manage contacts with attributes like Payment Methods, Addresses, Birthdays (recieve notifications on day of to remind you to wish them a happy birthday)
- **🔒Password Vault**: Securely store passwords locally using Cryptograpgy
- **💰Finance Tracking**: Monitor portfolio with real-time stock updates
- **🔄Year Progress Bar**: Visualize the current year's progress
- **🌤️Weather**: 5 Day forecast with animations and current temp! 
- **🌐Network**: Check your network speed and ping right from the app
- **🏀NBA**: Follow your favorite teams' schedules
- **☑️HabitTracker** Track your habits, recieve notification reminders on mobile
- **🎨Customization**: Choose your favorite wallpaper and color scheme

**Coming Soon**: 
1. Cross-Device Sync with TinyBase integration
2. Feature Request powered by FeatureBase
3. Video Demo on Welcome Screen powered by ScreenStudio
4. 👀 WebSockets to connect to selfhosted Jellyfin Server 👀

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

| Category           | Technology       |
|--------------------|------------------|
| Framework          | Expo + React Native |
| UI Components      | Tamagui          |
| State Management   | Zustand          |
| Data Fetching      | React Query      |
| Testing            | Jest             |
| Web Hosting        | Vercel           |
| Updates            | Expo OTA Updates |

## License

MIT License - see [LICENSE](LICENSE) for details.

## Web Calendar Layout
<div style="margin-top: 30px;">
  <video controls autoplay muted loop style="width: 100%; max-width: 800px;">
    <source src="assets/videos/hero-ambient-1.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>

## Contributing

Contributions are welcome! Please open an issue or submit a pull request. 
  - The current workflow involves running npx expo-doctor on every push to ensure the project's health.
    - This is automatically done through github actions.

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).  
You may fork, modify, and submit pull requests, but **commercial use is strictly prohibited** and **credit is required**.
