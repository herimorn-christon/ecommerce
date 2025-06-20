import { io, Socket } from "socket.io-client";

class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const wsUrl = baseUrl.replace(/^http/, "ws");

      console.log("🔌 Connecting to WebSocket server:", wsUrl);

      this.socket = io(wsUrl, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        console.log("✅ WebSocket connected successfully");
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ WebSocket disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("⚠️ WebSocket connection error:", error);
      });

      this.socket.on("reconnect", (attemptNumber) => {
        console.log(
          "🔄 WebSocket reconnected after",
          attemptNumber,
          "attempts"
        );
      });

      this.socket.on("reconnect_attempt", (attemptNumber) => {
        console.log("🔄 Attempting to reconnect:", attemptNumber);
      });

      this.socket.on("reconnect_error", (error) => {
        console.error("⚠️ WebSocket reconnection error:", error);
      });

      this.socket.on("reconnect_failed", () => {
        console.error("❌ WebSocket reconnection failed after all attempts");
      });
    } catch (error) {
      console.error("🚨 Error initializing WebSocket:", error);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public emit(event: string, data: any): void {
    if (this.socket && this.isConnected()) {
      console.log(`📤 Emitting event: ${event}`, data);
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit ${event}: Socket not connected`);
    }
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      console.log(`🔄 Listening for event: ${event}`);
      this.socket.on(event, callback);
    }
  }

  public off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const webSocketService = WebSocketService.getInstance();
