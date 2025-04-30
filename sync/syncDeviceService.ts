// In your sync service
import { getRandomValues } from './randomValues';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegistryStore } from '../store/RegistryStore';
import * as Sentry from '@sentry/react-native';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';

// Define types for sync messages
type SyncMessage = {
  type: 'SYNC_REQUEST' | 'SYNC_DATA' | 'SYNC_COMPLETE';
  payload?: any;
  timestamp: number;
  deviceId: string;
};

class SyncDeviceService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private deviceId: string = '';
  private isInitialized: boolean = false;
  private deviceIdInitialized: boolean = false;
  private browserSupportsWebRTC: boolean = true;
  
  constructor() {
  }
  
  // Helper to generate a random alphanumeric code
  private generateRandomCode(length: number = 8): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = new Uint8Array(length);
    getRandomValues(randomValues);
    let code = '';
    for (let i = 0; i < length; i++) {
      code += charset[randomValues[i] % charset.length];
    }
    return code;
  }

  // Initialize with a device ID (create or retrieve existing)
  // Generate a fallback device ID when UUID fails
  private generateFallbackDeviceId(): string {
    // Generate a simpler ID using Math.random and timestamp
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `device-${timestamp}-${randomStr}`;
  }
  
  private async initializeDeviceId() {
    if (this.deviceIdInitialized) return this.deviceId;
    
    try {
      // First try to get from storage
      const storedId = await AsyncStorage.getItem('device_id');
      
      if (storedId) {
        this.deviceId = storedId;
      } else {
        this.deviceId = this.generateRandomCode(8);
        
        try {
          await AsyncStorage.setItem('device_id', this.deviceId);
        } catch (storageError) {
          console.warn('Failed to store device ID', storageError);
          // Continue anyway - we still have the ID in memory
        }
      }
      
      this.deviceIdInitialized = true;
      console.log(`Device initialized with new ID: ${this.deviceId}`);
      return this.deviceId;
    } catch (error) {
      console.error('Failed to initialize device ID:', error);
      Sentry.captureException(error);
      this.deviceId = this.generateRandomCode(8); // Fallback to temporary ID
      return this.deviceId;
    }
  }
  
  public getConnectionCode(): string {
    return this.deviceId;
  }
  
  public async initialize() {
    if (!this.deviceId) {
      await this.initializeDeviceId();
    }
    if (this.isInitialized) return;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    (this.peerConnection as any).onicecandidate = (event: { candidate: RTCIceCandidate | null }) => {
      if (event.candidate) {
        // TODO: Show candidate to user for manual transfer (copy-paste or QR)
        // e.g., add to a list of candidates to display as text/QR
        console.log('New ICE candidate:', event.candidate);
      }
    };

    (this.peerConnection as any).ondatachannel = (event: { channel: RTCDataChannel }) => {
      if (event.channel) {
        this.dataChannel = event.channel;
        this.setupDataChannel(event.channel);
      }
    };

    this.isInitialized = true;
  }
  
  private setupDataChannel(dataChannel: any) {
    if (!dataChannel) return;
    dataChannel.onopen = () => {
      console.log('Data channel open');
    };
    dataChannel.onmessage = (event: { data: any }) => {
      // Handle incoming sync messages
      console.log('Received:', event.data);
    };
    dataChannel.onclose = () => {
      console.log('Data channel closed');
    };
    dataChannel.onerror = (err: any) => {
      console.error('Data channel error:', err);
    };
  }
  
  // Create an offer for another device to connect
  public async createOffer() {
    await this.initialize();
    // @ts-ignore
    this.dataChannel = this.peerConnection!.createDataChannel('sync');
    // @ts-ignore
    if (this.dataChannel) {
      this.setupDataChannel(this.dataChannel);
    }
    // @ts-ignore
    const offer = await this.peerConnection!.createOffer({});
    await this.peerConnection!.setLocalDescription(offer);
    // Return offer.sdp for user to share (copy-paste or QR)
    return offer.sdp;
  }
  
  // Accept an offer from another device and create an answer
  public async acceptOffer(offerSdp: string) {
    await this.initialize();
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offerSdp }));
    // @ts-ignore
    const answer = await this.peerConnection!.createAnswer({});
    await this.peerConnection!.setLocalDescription(answer);
    // Return answer.sdp for user to share (copy-paste or QR)
    return answer.sdp;
  }
  
  // Accept an answer from another device
  public async acceptAnswer(answerSdp: string) {
    if (!this.peerConnection) return;
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerSdp }));
  }
  
  // Add ICE candidate received from the other device
  public async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) return;
    await this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidate));
  }
  
  // Send a sync message to the peer
  public sendSyncMessage(message: any) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    }
  }
  
  // Check if WebRTC is supported
  public isWebRTCSupported(): boolean {
    return this.browserSupportsWebRTC;
  }
  
  // Clean up connections
  public disconnect() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.isInitialized = false;
  }
}

// Create singleton instance
const syncService = new SyncDeviceService();
export default syncService;
