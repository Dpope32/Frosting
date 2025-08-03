const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Add resolver configuration to handle environment variables properly
config.resolver = {
  ...config.resolver,
  alias: {
    ...config.resolver?.alias,
    // Prevent resolution of expo/virtual/env
    'expo/virtual/env': false,
  },
  // Ensure environment variables are handled correctly
  resolverMainFields: ['react-native', 'browser', 'main'],
  // Add platform extensions
  platforms: ['ios', 'android', 'native', 'web'],
};

// Add transformer configuration
config.transformer = {
  ...config.transformer,
  // Ensure proper handling of environment variables
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
