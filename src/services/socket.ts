import { io, Socket } from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
    this.connect(this.userId!);
  }

  public connect(userId: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.userId = userId;
    this.socket = io('http://localhost:4000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.reconnectAttempts = 0;
      this.socket?.emit('join', userId);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.attemptReconnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
      if (reason === 'io server disconnect') {
        this.attemptReconnect();
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.reconnectAttempts = 0;
    }
  }

  public sendMessage(receiverId: string, message: string): void {
    if (!this.socket?.connected || !this.userId) {
      console.error('Socket not connected or user not set');
      return;
    }

    this.socket.emit('sendMessage', {
      senderId: this.userId,
      receiverId,
      message
    });
  }

  public onReceiveMessage(callback: (data: { senderId: string; message: string }) => void): void {
    this.socket?.on('receiveMessage', callback);
  }

  public removeMessageListener(): void {
    this.socket?.off('receiveMessage');
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default SocketService;