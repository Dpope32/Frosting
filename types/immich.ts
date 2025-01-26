// types/immich.ts
interface ImmichConfig {
    serverUrl: string;
    apiKey: string;
  }
  
  // lib/immich.ts
  export class ImmichClient {
    constructor(config: ImmichConfig) {
      // Initialize with env variables
    }
    
    async getPhotos() {
      // Fetch from Immich API
    }
    
    async getFolders() {
      // Fetch from Immich API
    }
  }