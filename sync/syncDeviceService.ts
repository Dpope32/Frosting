// In your sync service
import { getRandomValues } from './randomValues';
import { v4 as uuidv4 } from 'uuid';
import Peer from 'peerjs';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegistryStore } from '../store/RegistryStore';
import * as Sentry from '@sentry/react-native';

// Define types for sync messages
type SyncMessage = {
  type: 'SYNC_REQUEST' | 'SYNC_DATA' | 'SYNC_COMPLETE';
  payload?: any;
  timestamp: number;
  deviceId: string;
};

class SyncDeviceService {
  private peer: Peer | null = null;
  private connections: Record<string, any> = {};
  private deviceId: string = '';
  private isInitialized: boolean = false;
  private deviceIdInitialized: boolean = false;
  private browserSupportsWebRTC: boolean = true;
  
  constructor() {
    // Don't auto-initialize - we'll do this explicitly when needed
  }
  
  // Initialize with a device ID (create or retrieve existing)
  private async initializeDeviceId() {
    if (this.deviceIdInitialized) return this.deviceId;
    
    try {
      const storedId = await AsyncStorage.getItem('device_id');
      if (storedId) {
        this.deviceId = storedId;
      } else {
        this.deviceId = uuidv4();
        await AsyncStorage.setItem('device_id', this.deviceId);
      }
      this.deviceIdInitialized = true;
      console.log(`Device initialized with ID: ${this.deviceId}`);
      return this.deviceId;
    } catch (error) {
      console.error('Failed to initialize device ID:', error);
      Sentry.captureException(error);
      this.deviceId = uuidv4(); // Fallback to temporary ID
      this.deviceIdInitialized = true;
      return this.deviceId;
    }
  }
  
  // Check if WebRTC is supported in the current environment
  private checkWebRTCSupport(): boolean {
    try {
      // Check for required WebRTC APIs
      const hasRTCPeerConnection = typeof window !== 'undefined' && 
        ('RTCPeerConnection' in window || 
         'webkitRTCPeerConnection' in window || 
         'mozRTCPeerConnection' in window);
         
      const hasUserMedia = typeof navigator !== 'undefined' && 
        ('getUserMedia' in navigator || 
         'webkitGetUserMedia' in navigator || 
         'mozGetUserMedia' in navigator ||
         'mediaDevices' in navigator);
         
      return hasRTCPeerConnection && hasUserMedia;
    } catch (e) {
      return false;
    }
  }

  // Initialize PeerJS connection
  public async initialize(): Promise<boolean> {
    // Return early if already initialized
    if (this.isInitialized) return true;
    
    try {
      // First ensure we have a device ID
      const deviceId = await this.initializeDeviceId();
      
      // Check WebRTC support
      this.browserSupportsWebRTC = this.checkWebRTCSupport();
      if (!this.browserSupportsWebRTC) {
        console.warn('WebRTC is not supported in this browser/environment');
        return false;
      }
      
      return new Promise<boolean>((resolve, reject) => {
        try {
          // Only create Peer instance after device ID is ready
          this.peer = new Peer(deviceId);
          
          // Set timeout to handle initialization that never completes
          const timeout = setTimeout(() => {
            if (!this.isInitialized) {
              console.error('PeerJS initialization timed out');
              Sentry.captureMessage('PeerJS initialization timed out');
              reject(new Error('Connection timed out'));
            }
          }, 10000); // 10 second timeout
          
          this.peer.on('open', (id) => {
            console.log('PeerJS connection established with ID:', id);
            this.isInitialized = true;
            clearTimeout(timeout);
            resolve(true);
          });
          
          this.peer.on('connection', (conn) => {
            this.handleIncomingConnection(conn);
          });
          
          this.peer.on('error', (err) => {
            console.error('PeerJS error:', err);
            Sentry.captureException(err);
            if (!this.isInitialized) {
              clearTimeout(timeout);
              reject(err);
            }
          });
        } catch (error) {
          console.error('Failed to initialize PeerJS:', error);
          Sentry.captureException(error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Failed during sync initialization:', error);
      Sentry.captureException(error);
      return false;
    }
  }
  
  // Handle incoming connection
  private handleIncomingConnection(conn: any) {
    const connectionId = conn.peer;
    this.connections[connectionId] = conn;
    
    conn.on('data', (data: SyncMessage) => {
      this.handleSyncMessage(data, connectionId);
    });
    
    conn.on('close', () => {
      delete this.connections[connectionId];
      console.log(`Connection closed with device: ${connectionId}`);
    });
    
    console.log(`New connection established with device: ${connectionId}`);
  }
  
  private isSyncMessage(data: unknown): data is SyncMessage {
    return (
      typeof data === 'object' && 
      data !== null &&
      'type' in data &&
      'timestamp' in data &&
      'deviceId' in data
    );
  }

  // Connect to another device
  public async connectToDevice(peerId: string): Promise<void> {
    // Check for initialization first
    if (!this.isInitialized) {
      try {
        const success = await this.initialize();
        if (!success) {
          return Promise.reject(new Error('Failed to initialize before connecting'));
        }
      } catch (error) {
        return Promise.reject(error);
      }
    }

    if (!this.peer) {
      return Promise.reject(new Error('Peer not initialized'));
    }
    
    if (this.connections[peerId]) {
      return Promise.resolve(); // Already connected
    }

    return new Promise((resolve, reject) => {
      try {
        const conn = this.peer!.connect(peerId);
        
        // Set timeout for connection
        const timeout = setTimeout(() => {
          reject(new Error('Connection timed out'));
        }, 15000); // 15 second timeout

        conn.on('open', () => {
          clearTimeout(timeout);
          this.connections[peerId] = conn;
          console.log(`Connected to device: ${peerId}`);
          this.sendSyncRequest(peerId);
          resolve();
        });

        conn.on('error', (err: any) => {
          clearTimeout(timeout);
          console.error(`PeerJS connection error with device ${peerId}:`, err);
          Sentry.captureException(err);
          reject(err);
        });

        conn.on('data', (data: unknown) => {
          if (this.isSyncMessage(data)) {
            this.handleSyncMessage(data, peerId);
          } else {
            console.warn('Received invalid message format', data);
          }
        });

        conn.on('close', () => {
          delete this.connections[peerId];
          console.log(`Connection closed with device: ${peerId}`);
        });
      } catch (error) {
        console.error(`Failed to connect to device ${peerId}:`, error);
        Sentry.captureException(error);
        reject(error);
      }
    });
  }
  
  // Send sync request to peer
  private sendSyncRequest(peerId: string) {
    const message: SyncMessage = {
      type: 'SYNC_REQUEST',
      timestamp: Date.now(),
      deviceId: this.deviceId
    };
    
    this.sendMessage(peerId, message);
  }
  
  // Handle incoming sync messages
  private handleSyncMessage(message: SyncMessage, senderId: string) {
    console.log(`Received ${message.type} from ${senderId}`);
    
    switch (message.type) {
      case 'SYNC_REQUEST':
        this.handleSyncRequest(senderId);
        break;
      case 'SYNC_DATA':
        this.handleSyncData(message.payload, senderId);
        break;
      case 'SYNC_COMPLETE':
        console.log('Sync complete with', senderId);
        break;
    }
  }
  
  // Handle sync request by sending data
  private handleSyncRequest(peerId: string) {
    const registry = useRegistryStore.getState();
    const storeData = registry.getAllStoreStates();
    
    const message: SyncMessage = {
      type: 'SYNC_DATA',
      payload: storeData,
      timestamp: Date.now(),
      deviceId: this.deviceId
    };
    
    this.sendMessage(peerId, message);
  }
  
  // Handle received sync data with merging and conflict resolution
  private handleSyncData(payload: any, senderId: string) {
    const registry = useRegistryStore.getState();
    const localData = registry.getAllStoreStates();
    
    console.log(`Starting sync merge from ${senderId}`, { 
      localData, 
      remoteData: payload 
    });

    // Merge each store separately
    for (const [storeName, remoteStoreData] of Object.entries(payload as Record<string, {lastUpdated?: number}>)) {
      const localStore = localData[storeName];
      
      if (!localStore) {
        console.warn(`Unknown store in sync data: ${storeName}`);
        continue;
      }

      // Simple merge strategy - remote wins if newer
      if (remoteStoreData?.lastUpdated && remoteStoreData.lastUpdated > ((localStore as any).lastUpdated || 0)) {
        console.log(`Updating ${storeName} from remote`);
        Object.assign(localStore, remoteStoreData);
      } else {
        console.log(`Keeping local ${storeName} (newer or equal)`);
      }
    }

    registry.setSyncStatus('idle');
    console.log('Sync merge completed');

    // Send sync complete confirmation
    const message: SyncMessage = {
      type: 'SYNC_COMPLETE',
      timestamp: Date.now(),
      deviceId: this.deviceId
    };
    
    this.sendMessage(senderId, message);
  }
  
  // Send message to peer
  private sendMessage(peerId: string, message: SyncMessage) {
    const conn = this.connections[peerId];
    if (conn && conn.open) {
      conn.send(message);
    }
  }
  
  // Generate connection code for display/sharing
  public async getConnectionCode(): Promise<string> {
    // Ensure device ID is initialized
    if (!this.deviceIdInitialized) {
      await this.initializeDeviceId();
    }
    return this.deviceId;
  }
  
  // Check if WebRTC is supported
  public isWebRTCSupported(): boolean {
    return this.browserSupportsWebRTC;
  }
  
  // Clean up connections
  public disconnect() {
    Object.values(this.connections).forEach((conn: any) => {
      if (conn.open) conn.close();
    });
    
    this.connections = {};
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    
    this.isInitialized = false;
  }
}

// Create singleton instance
const syncService = new SyncDeviceService();
export default syncService;
