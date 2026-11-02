import api from "./api";

export interface ChannelConfig {
  id: string; // 'daraz' | 'ebay' | 'amazon' | 'web_store'
  name: string;
  type: "DARAZ" | "EBAY" | "AMAZON" | "WEB_STORE";
  status: "CONNECTED" | "DISCONNECTED" | "SYNCING" | "ERROR";
  icon: string;
  region: string;
  credentials: Record<string, string>;
  syncSettings: {
    autoSyncInventory: boolean;
    autoSyncPrices: boolean;
    autoSyncOrders: boolean;
    syncIntervalMinutes: number;
  };
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    activeListings: number;
    syncHealth: string;
  };
  lastSyncAt: string | null;
  lastErrorMessage?: string | null;
}

export interface SyncLogEntry {
  id: string;
  channelId: string;
  channelName: string;
  action: "SYNC_INVENTORY" | "SYNC_PRODUCTS" | "PULL_ORDERS" | "WEBHOOK_EVENT" | "CONNECT";
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS";
  message: string;
  itemsProcessed: number;
  timestamp: string;
}

export interface ChannelStats {
  connectedChannels: string;
  totalActiveListings: number;
  totalMultiChannelOrders: number;
  totalMultiChannelRevenue: number;
  overallSyncStatus: string;
}

export const channelService = {
  async getAllChannels(): Promise<ChannelConfig[]> {
    const res = await api.get("/channels");
    return res.data.data;
  },

  async getChannelStats(): Promise<ChannelStats> {
    const res = await api.get("/channels/stats");
    return res.data.data;
  },

  async getSyncLogs(limit = 20): Promise<SyncLogEntry[]> {
    const res = await api.get("/channels/logs", { params: { limit } });
    return res.data.data;
  },

  async connectChannel(channelId: string, payload: {
    credentials?: Record<string, string>;
    syncSettings?: Partial<ChannelConfig["syncSettings"]>;
    status?: ChannelConfig["status"];
  }): Promise<ChannelConfig> {
    const res = await api.post(`/channels/${channelId}/connect`, payload);
    return res.data.data;
  },

  async disconnectChannel(channelId: string): Promise<ChannelConfig> {
    const res = await api.post(`/channels/${channelId}/disconnect`);
    return res.data.data;
  },

  async syncChannel(channelId: string, action: "all" | "inventory" | "products" | "orders" = "all"): Promise<{
    channel: ChannelConfig;
    itemsProcessed: number;
    message: string;
  }> {
    const res = await api.post(`/channels/${channelId}/sync`, { action });
    return res.data.data;
  },
};

export default channelService;
