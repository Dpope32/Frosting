declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_POCKETBASE_URL?: string;
      EXPO_PUBLIC_PB_LAN?: string;
      EXPO_PUBLIC_PB_URL?: string;
      EXPO_PUBLIC_S3_BUCKET_URL?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      PORT?: string;
    }
  }
}

export {}; 