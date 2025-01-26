export default {
  name: "frosting",
  slug: "frosting",
  expo: {
    scheme: "frosting",
    extra: {
      openAiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      eas: {
        projectId: "22727130-682f-425f-bedd-d8fd9ab0b3e0"
      }
    }
  }
};
