import { Platform } from 'react-native';

// Singleton class to manage proxy server status
class ProxyServerManager {
  private static instance: ProxyServerManager;
  private isServerRunning: boolean = false;
  private serverCheckPromise: Promise<boolean> | null = null;
  private lastCheckTime: number = 0;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): ProxyServerManager {
    if (!ProxyServerManager.instance) {
      ProxyServerManager.instance = new ProxyServerManager();
    }
    return ProxyServerManager.instance;
  }

  // Check if the proxy server is running
  public async isRunning(): Promise<boolean> {
    // Only relevant for web platform
    if (Platform.OS !== 'web') {
      return true; // Native platforms don't need the proxy
    }

    const now = Date.now();
    // Use cached result if checked recently
    if (now - this.lastCheckTime < this.CHECK_INTERVAL && this.isServerRunning) {
      return this.isServerRunning;
    }

    // If a check is already in progress, return that promise
    if (this.serverCheckPromise) {
      return this.serverCheckPromise;
    }

    // Start a new check
    this.serverCheckPromise = this.checkServerStatus();
    try {
      this.isServerRunning = await this.serverCheckPromise;
      this.lastCheckTime = now;
      return this.isServerRunning;
    } finally {
      this.serverCheckPromise = null;
    }
  }

  // Get the appropriate URL for API endpoints based on platform and server status
  public async getApiUrl(endpoint: string, directUrl: string): Promise<string> {
    if (Platform.OS !== 'web') {
      return directUrl; // Native platforms use direct URLs
    }

    const isRunning = await this.isRunning();
    if (isRunning) {
      return `http://localhost:3000/api/${endpoint}`;
    } else {
      console.warn(`Proxy server not running. Some features may not work correctly.`);
      return directUrl; // Fallback to direct URL (will likely fail due to CORS)
    }
  }

  // Check if the server is running by pinging the ping endpoint
  private async checkServerStatus(): Promise<boolean> {
    try {
      console.log('[ProxyServerManager] Checking proxy server status...');
      const response = await fetch('http://localhost:3000/api/ping', { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        // Short timeout to avoid long waits
        signal: AbortSignal.timeout(2000)
      });
      
      const isRunning = response.ok;
      console.log(`[ProxyServerManager] Proxy server is ${isRunning ? 'running' : 'not running'}`);
      
      if (isRunning) {
        // If server is running, show a helpful message in the console
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

  // Show a warning in the console with instructions
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
