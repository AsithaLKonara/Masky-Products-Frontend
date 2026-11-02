import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (typeof window === "undefined") {
    // Server-side rendering dummy mock
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
      disconnect: () => {},
      connected: false,
    } as unknown as Socket;
  }

  if (!socketInstance) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
        : "http://127.0.0.1:5000");

    socketInstance = io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log(`[Socket.IO] Connected to backend gateway (${socketInstance?.id})`);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log(`[Socket.IO] Disconnected from backend gateway: ${reason}`);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn(`[Socket.IO] Connection error (retrying): ${err.message}`);
    });
  }

  if (typeof window !== "undefined") {
    (window as any).__MASKY_SOCKET__ = socketInstance;
    (window as any).__MASKY_DISPATCH_SOCKET_EVENT__ = (event: string, data: any) => {
      console.log(`[socket.client] __MASKY_DISPATCH_SOCKET_EVENT__ called for event: ${event}`, data);
      if (socketInstance && (socketInstance as any)._callbacks) {
        const callbacks = (socketInstance as any)._callbacks["$" + event];
        if (Array.isArray(callbacks)) {
          callbacks.forEach((cb: any) => {
            try {
              cb(data);
            } catch (err) {
              console.error(`Error in socket listener for ${event}:`, err);
            }
          });
        }
      }

      // Also trigger corresponding DOM CustomEvent
      if (event === "channel:sync_event") {
        window.dispatchEvent(new CustomEvent("masky:channel:sync", { detail: data }));
      } else if (event === "stock:depleted") {
        window.dispatchEvent(new CustomEvent("masky:stock:depleted", { detail: data }));
      } else if (event === "stock:updated") {
        window.dispatchEvent(new CustomEvent("masky:stock:updated", { detail: data }));
      }
    };
  }

  return socketInstance;
}

export default getSocket;
