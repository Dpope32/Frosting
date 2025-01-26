interface ImmichConfig {
  serverUrl: string;
  apiKey: string;
}

export class ImmichClient {
  private serverUrl: string;
  private apiKey: string;

  constructor(config: ImmichConfig) {
    this.serverUrl = config.serverUrl;
    this.apiKey = config.apiKey;
  }

  async getPhotos() {
    const response = await fetch(`${this.serverUrl}/api/asset`, {
      headers: {
        'x-api-key': this.apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch photos: ${response.statusText}`);
    }

    return response.json();
  }

  async getFolders() {
    const response = await fetch(`${this.serverUrl}/api/album`, {
      headers: {
        'x-api-key': this.apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch folders: ${response.statusText}`);
    }

    return response.json();
  }
}
