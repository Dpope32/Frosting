// In your sync service
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Peer from 'peerjs';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegistryStore } from '../store/RegistryStore';

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
  
  constructor() {
    this.initializeDeviceId();
  }
  
  // Initialize with a device ID (create or retrieve existing)
  private async initializeDeviceId() {
    try {
      const storedId = await AsyncStorage.getItem('device_id');
      if (storedId) {
        this.deviceId = storedId;
      } else {
        this.deviceId = uuidv4();
        await AsyncStorage.setItem('device_id', this.deviceId);
      }
      console.log(`Device initialized with ID: ${this.deviceId}`);
    } catch (error) {
      console.error('Failed to initialize device ID:', error);
      this.deviceId = uuidv4(); // Fallback to temporary ID
    }
  }
  
  // Initialize PeerJS connection
  public async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.peer = new Peer(this.deviceId);
      
      this.peer.on('open', (id) => {
        console.log('PeerJS connection established with ID:', id);
        this.isInitialized = true;
      });
      
      this.peer.on('connection', (conn) => {
        this.handleIncomingConnection(conn);
      });
      
      this.peer.on('error', (err) => {
        console.error('PeerJS error:', err);
      });
    } catch (error) {
      console.error('Failed to initialize PeerJS:', error);
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
  public async connectToDevice(peerId: string) {
    if (!this.peer || this.connections[peerId]) return;
    
    try {
      const conn = this.peer.connect(peerId);
      
      conn.on('open', () => {
        this.connections[peerId] = conn;
        console.log(`Connected to device: ${peerId}`);
        
        // Initial sync request
        this.sendSyncRequest(peerId);
      });
      
      conn.on('data', (data: unknown) => {
        // Type check/cast the data before using it
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
    }
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
  public getConnectionCode(): string {
    return this.deviceId;
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
