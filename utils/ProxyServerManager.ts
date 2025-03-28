//utils/ProxyServerManager.ts

import { Platform } from 'react-native';

class ProxyServerManager {
  private static instance: ProxyServerManager;
  private isServerRunning: boolean = false;
  private serverCheckPromise: Promise<boolean> | null = null;
  private lastCheckTime: number = 0;
  private readonly CHECK_INTERVAL = 30000; 

  private constructor() {}

  public static getInstance(): ProxyServerManager {
    if (!ProxyServerManager.instance) {
      ProxyServerManager.instance = new ProxyServerManager();
    }
    return ProxyServerManager.instance;
  }

  public async isRunning(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      return true;
    }

    const now = Date.now();
    if (now - this.lastCheckTime < this.CHECK_INTERVAL && this.isServerRunning) {
      return this.isServerRunning;
    }

    if (this.serverCheckPromise) {
      return this.serverCheckPromise;
    }

    this.serverCheckPromise = this.checkServerStatus();
    try {
      this.isServerRunning = await this.serverCheckPromise;
      this.lastCheckTime = now;
      return this.isServerRunning;
    } finally {
      this.serverCheckPromise = null;
    }
  }

  public async getApiUrl(endpoint: string, directUrl: string): Promise<string> {
    if (Platform.OS !== 'web') {
      return directUrl; 
    }

    // Use Vercel API route in production
    if (process.env.NODE_ENV === 'production') {
      return `/api/proxy/${endpoint}`;
    }

    const isRunning = await this.isRunning();
    if (isRunning) {
      return `http://localhost:3000/api/${endpoint}`;
    } else {
      console.warn(`Proxy server not running. Some features may not work correctly.`);
      return directUrl; 
    }
  }

  private async checkServerStatus(): Promise<boolean> {
    try {
      const url = process.env.NODE_ENV === 'production' 
        ? '/api/proxy/ping' 
        : 'http://localhost:3000/api/ping';
        
      const response = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(2000)
      });
      
      const isRunning = response.ok;
      
      if (isRunning) {
        console.info(
          '%c[ProxyServerManager] Proxy server detected! ✅',
          'background: #4CAF50; color: white; padding: 2px 4px; border-radius: 2px;'
        );
      } else {
        this.showServerNotRunningWarning();
      }
      
      return isRunning;
    } catch (error) {
      console.error('[ProxyServerManager] Error checking proxy server:', error);
      this.showServerNotRunningWarning();
      return false;
    }
  }

  private showServerNotRunningWarning() {
    if (Platform.OS === 'web') {
      console.warn(
        '%c[ProxyServerManager] Proxy server not detected! ⚠️\n' +
        'Some features may not work correctly due to CORS restrictions.\n' +
        'To enable all features, start the proxy server with:\n' +
        '> node proxyServer.js',
        'background: #FFC107; color: black; padding: 2px 4px; border-radius: 2px;'
      );
    }
  }
}

export default ProxyServerManager.getInstance();
