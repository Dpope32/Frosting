export default {
  expo: {
    name: "frosting",
    slug: "frosting",
    scheme: "frosting",
    version: "1.0.0",
    assetBundlePatterns: [
      "assets/wallpapers-optimized/*",
      "assets/images/*"
    ],
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,
    jsEngine: "hermes",
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.deedaw22.frosting"
    },
    android: {
      package: "com.deedaw22.frosting",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#1e1e1e"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#1e1e1e"
        }
      ],
      "expo-sqlite"
    ],
    extra: {
      router: {
        origin: false
      },
      openWeatherApiKey: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || "",
      alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY || "",
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || "",
      POCKETBASE_URL: process.env.POCKETBASE_URL || "",
      POCKETBASE_PIN: process.env.POCKETBASE_PIN || "",
      eas: {
        projectId: "22727130-682f-425f-bedd-d8fd9ab0b3e0"
      }
    },
    owner: "deedaw22"
  }
};
