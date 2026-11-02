"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "@/services/socket.client";

export interface StockUpdateEvent {
  variantId: string;
  productId?: string;
  sku?: string;
  quantity: number;
  stockStatus: "instock" | "lowstock" | "outofstock";
  channel?: string;
  branchId?: string;
  reason?: string;
  timestamp: string;
  zeroStock?: boolean;
}

export interface UseStockSocketOptions {
  variantIds?: string[];
  isAdminChannel?: boolean;
  onStockUpdate?: (data: StockUpdateEvent) => void;
  onStockDepleted?: (data: StockUpdateEvent) => void;
  onSyncEvent?: (data: any) => void;
}

export function useStockSocket(options: UseStockSocketOptions = {}) {
  const { variantIds = [], isAdminChannel = false, onStockUpdate, onStockDepleted, onSyncEvent } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [stockLevels, setStockLevels] = useState<Record<string, number>>({});
  const [depletedVariants, setDepletedVariants] = useState<Record<string, boolean>>({});

  const callbacksRef = useRef({ onStockUpdate, onStockDepleted, onSyncEvent });
  callbacksRef.current = { onStockUpdate, onStockDepleted, onSyncEvent };

  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("[useStockSocket] useEffect mounted, isAdminChannel:", isAdminChannel, "variantIds:", variantIds);

    const socket = getSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Join variant-specific rooms
    variantIds.forEach((id) => {
      if (id) socket.emit("join:variant", id);
    });

    if (isAdminChannel) {
      socket.emit("join:admin:channels");
    }

    // Listen for stock updates
    const handleStockUpdated = (data: StockUpdateEvent) => {
      setStockLevels((prev) => ({
        ...prev,
        [data.variantId]: data.quantity,
      }));

      if (data.quantity <= 0) {
        setDepletedVariants((prev) => ({
          ...prev,
          [data.variantId]: true,
        }));
      } else {
        setDepletedVariants((prev) => {
          const updated = { ...prev };
          delete updated[data.variantId];
          return updated;
        });
      }

      callbacksRef.current.onStockUpdate?.(data);
      if (data.quantity <= 0) {
        callbacksRef.current.onStockDepleted?.(data);
      }
    };

    // Listen for emergency stock depletion lockout event
    const handleStockDepleted = (data: StockUpdateEvent) => {
      setStockLevels((prev) => ({
        ...prev,
        [data.variantId]: 0,
      }));
      setDepletedVariants((prev) => ({
        ...prev,
        [data.variantId]: true,
      }));
      callbacksRef.current.onStockDepleted?.(data);
    };

    // Listen for admin channel sync events
    const handleChannelSync = (data: any) => {
      console.log("[useStockSocket] handleChannelSync called with:", data);
      callbacksRef.current.onSyncEvent?.(data);
    };

    socket.on("stock:updated", handleStockUpdated);
    socket.on("stock:depleted", handleStockDepleted);
    socket.on("channel:sync_event", handleChannelSync);

    const handleWindowSync = (e: any) => {
      console.log("[useStockSocket] handleWindowSync received custom event detail:", e?.detail);
      handleChannelSync(e.detail);
    };
    const handleWindowDepleted = (e: any) => {
      console.log("[useStockSocket] handleWindowDepleted received custom event detail:", e?.detail);
      handleStockDepleted(e.detail);
    };
    const handleWindowUpdate = (e: any) => {
      console.log("[useStockSocket] handleWindowUpdate received custom event detail:", e?.detail);
      handleStockUpdated(e.detail);
    };

    window.addEventListener("masky:channel:sync", handleWindowSync);
    window.addEventListener("masky:stock:depleted", handleWindowDepleted);
    window.addEventListener("masky:stock:updated", handleWindowUpdate);

    return () => {
      variantIds.forEach((id) => {
        if (id) socket.emit("leave:variant", id);
      });
      if (isAdminChannel) {
        socket.emit("leave:admin:channels");
      }
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("stock:updated", handleStockUpdated);
      socket.off("stock:depleted", handleStockDepleted);
      socket.off("channel:sync_event", handleChannelSync);

      window.removeEventListener("masky:channel:sync", handleWindowSync);
      window.removeEventListener("masky:stock:depleted", handleWindowDepleted);
      window.removeEventListener("masky:stock:updated", handleWindowUpdate);
    };
  }, [variantIds.join(","), isAdminChannel]);

  const clearDepletedWarning = useCallback((variantId: string) => {
    setDepletedVariants((prev) => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
  }, []);

  return {
    isConnected,
    stockLevels,
    depletedVariants,
    clearDepletedWarning,
  };
}

export default useStockSocket;
