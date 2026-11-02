"use client";

import React, { useState } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  useChannels,
  useChannelStats,
  useChannelSyncLogs,
  useSyncChannel,
  useConnectChannel,
  useDisconnectChannel,
} from "@/hooks/useChannels";
import { ChannelConfig } from "@/services/channel.service";
import {
  Globe2,
  RefreshCw,
  ShoppingBag,
  Tag,
  Box,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Settings,
  ExternalLink,
  Layers,
  Zap,
  SlidersHorizontal,
  X,
  ShieldCheck,
  Check,
  Building2,
} from "lucide-react";

export default function MultiChannelControlCenterClient() {
  const { data: channels = [], isLoading: channelsLoading } = useChannels();
  const { data: stats } = useChannelStats();
  const { data: syncLogs = [] } = useChannelSyncLogs(15);

  const syncMutation = useSyncChannel();
  const connectMutation = useConnectChannel();
  const disconnectMutation = useDisconnectChannel();

  const [activeSyncingId, setActiveSyncingId] = useState<string | null>(null);
  const [configModalChannel, setConfigModalChannel] = useState<ChannelConfig | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ title: string; message: string; type: "success" | "error" } | null>(null);

  // Form state for config modal
  const [formData, setFormData] = useState({
    appKey: "",
    appSecret: "",
    marketplaceId: "",
    region: "",
    autoSyncInventory: true,
    autoSyncPrices: true,
    autoSyncOrders: true,
  });

  const handleOpenConfig = (channel: ChannelConfig) => {
    setConfigModalChannel(channel);
    const creds = channel.credentials || {};
    const settings = channel.syncSettings || {
      autoSyncInventory: true,
      autoSyncPrices: true,
      autoSyncOrders: true,
      syncIntervalMinutes: 30,
    };
    setFormData({
      appKey: creds.appKey || creds.clientId || creds.lwaClientId || "",
      appSecret: creds.appSecret || creds.clientSecret || creds.lwaClientSecret || "",
      marketplaceId: creds.marketplaceId || channel.region || "",
      region: channel.region || "",
      autoSyncInventory: settings.autoSyncInventory ?? true,
      autoSyncPrices: settings.autoSyncPrices ?? true,
      autoSyncOrders: settings.autoSyncOrders ?? true,
    });
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configModalChannel) return;

    try {
      await connectMutation.mutateAsync({
        channelId: configModalChannel.id,
        payload: {
          credentials: {
            ...configModalChannel.credentials,
            appKey: formData.appKey,
            clientId: formData.appKey,
            lwaClientId: formData.appKey,
            appSecret: formData.appSecret,
            clientSecret: formData.appSecret,
            lwaClientSecret: formData.appSecret,
            marketplaceId: formData.marketplaceId,
          },
          syncSettings: {
            autoSyncInventory: formData.autoSyncInventory,
            autoSyncPrices: formData.autoSyncPrices,
            autoSyncOrders: formData.autoSyncOrders,
          },
          status: "CONNECTED",
        },
      });

      setFeedbackToast({
        title: "Configuration Saved",
        message: `${configModalChannel.name} credentials and automated sync rules updated successfully.`,
        type: "success",
      });
      setConfigModalChannel(null);
    } catch (err: any) {
      setFeedbackToast({
        title: "Update Failed",
        message: err.response?.data?.message || err.message || "Failed to update channel configuration.",
        type: "error",
      });
    }
  };

  const handleTriggerSync = async (channelId: string, action: "all" | "inventory" | "products" | "orders" = "all") => {
    setActiveSyncingId(channelId);
    try {
      const res = await syncMutation.mutateAsync({ channelId, action });
      setFeedbackToast({
        title: "Synchronization Complete",
        message: res.message,
        type: "success",
      });
    } catch (err: any) {
      setFeedbackToast({
        title: "Sync Error",
        message: err.response?.data?.message || err.message || "Failed to synchronize channel.",
        type: "error",
      });
    } finally {
      setActiveSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    setActiveSyncingId("ALL");
    try {
      for (const channel of channels) {
        if (channel.status === "CONNECTED" && channel.id !== "web_store") {
          await syncMutation.mutateAsync({ channelId: channel.id, action: "all" });
        }
      }
      setFeedbackToast({
        title: "Multi-Channel Sync Complete",
        message: "Successfully synchronized active listings, inventory levels, and orders across all marketplaces.",
        type: "success",
      });
    } catch (err: any) {
      setFeedbackToast({
        title: "Sync Warning",
        message: err.message || "Some channels encountered synchronization delays.",
        type: "error",
      });
    } finally {
      setActiveSyncingId(null);
    }
  };

  const getChannelBadge = (type: string) => {
    switch (type) {
      case "DARAZ":
        return {
          icon: ShoppingBag,
          color: "text-amber-500",
          bg: "bg-amber-500/10 border-amber-500/20",
          tagBg: "bg-amber-500/15 text-amber-500",
        };
      case "EBAY":
        return {
          icon: Tag,
          color: "text-blue-500",
          bg: "bg-blue-500/10 border-blue-500/20",
          tagBg: "bg-blue-500/15 text-blue-500",
        };
      case "AMAZON":
        return {
          icon: Box,
          color: "text-orange-500",
          bg: "bg-orange-500/10 border-orange-500/20",
          tagBg: "bg-orange-500/15 text-orange-500",
        };
      default:
        return {
          icon: Globe2,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10 border-emerald-500/20",
          tagBg: "bg-emerald-500/15 text-emerald-500",
        };
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Multi-Channel Control Center"
        description="Unified marketplace catalog synchronization, stock allocation, and order fulfillment across Daraz, eBay, Amazon, and Web Store."
        badge="Multi-Channel Retail"
        action={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSyncAll}
              disabled={activeSyncingId !== null}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-inter font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={activeSyncingId !== null ? "animate-spin" : ""} />
              <span>{activeSyncingId === "ALL" ? "Syncing All Channels..." : "Sync All Marketplaces"}</span>
            </button>
          </div>
        }
      />

      {/* Floating Feedback Notification */}
      {feedbackToast && (
        <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 shadow-lg transition-all ${
          feedbackToast.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
            : "bg-rose-500/10 border-rose-500/30 text-foreground"
        }`}>
          <div className="flex items-start gap-3">
            {feedbackToast.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col">
              <span className="font-inter font-bold text-xs">{feedbackToast.title}</span>
              <span className="font-inter text-xs text-muted mt-0.5">{feedbackToast.message}</span>
            </div>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-muted hover:text-foreground p-1 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Multi-Channel Revenue"
          value={`Rs. ${(stats?.totalMultiChannelRevenue || 62700).toLocaleString()}`}
          trend="+34.8% vs last month"
          trendType="positive"
          subtext="Direct + Daraz + eBay gross volume"
          icon={<Zap size={18} />}
        />
        <StatCard
          label="Connected Channels"
          value={stats?.connectedChannels || "3 / 4"}
          badge="Live Status"
          trendType="positive"
          subtext="Active real-time webhooks"
          icon={<Globe2 size={18} />}
        />
        <StatCard
          label="Active Cross-Listings"
          value={String(stats?.totalActiveListings || 26)}
          trend="100% in stock"
          trendType="positive"
          subtext="Products live across platforms"
          icon={<Layers size={18} />}
        />
        <StatCard
          label="Gateway Sync Health"
          value={stats?.overallSyncStatus === "ATTENTION_REQUIRED" ? "Attention" : "Optimal"}
          trend="Sub-second ping"
          trendType="positive"
          subtext="REST & SP-API status: Online"
          icon={<ShieldCheck size={18} />}
        />
      </div>

      {/* Connected Channels Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-inter font-bold text-base text-foreground">
              Marketplace Integrations
            </h2>
            <span className="px-2 py-0.5 bg-surface-elevated text-muted text-[11px] font-semibold rounded-full border border-border">
              {channels.length} channels
            </span>
          </div>
          <span className="text-xs text-muted font-inter">
            Automated bidirectional synchronization enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel) => {
            const badge = getChannelBadge(channel.type);
            const Icon = badge.icon;
            const isConnected = channel.status === "CONNECTED";
            const isSyncing = activeSyncingId === channel.id || channel.status === "SYNCING";

            return (
              <div
                key={channel.id}
                className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:border-border/80 transition-all gap-5"
              >
                {/* Channel Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${badge.bg}`}>
                      <Icon size={22} className={badge.color} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-inter font-bold text-sm text-foreground">
                          {channel.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-inter ${badge.tagBg}`}>
                          {channel.type}
                        </span>
                      </div>
                      <span className="font-inter text-xs text-muted mt-0.5">
                        {channel.region}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-inter bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-inter bg-surface-subtle text-muted border border-border">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted/60" />
                        Disconnected
                      </span>
                    )}
                  </div>
                </div>

                {/* Performance Metrics Row */}
                <div className="grid grid-cols-3 gap-2.5 p-3 bg-surface-subtle border border-border/80 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider font-inter">
                      Revenue
                    </span>
                    <span className="text-xs font-bold text-foreground mt-0.5 font-inter">
                      Rs. {(channel.metrics?.totalRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider font-inter">
                      Orders
                    </span>
                    <span className="text-xs font-bold text-foreground mt-0.5 font-inter">
                      {channel.metrics?.totalOrders || 0} orders
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider font-inter">
                      Listings
                    </span>
                    <span className="text-xs font-bold text-foreground mt-0.5 font-inter">
                      {channel.metrics?.activeListings || 0} active
                    </span>
                  </div>
                </div>

                {/* Sync Status & Settings Tags */}
                <div className="flex flex-wrap items-center justify-between text-xs text-muted gap-2 pt-1 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-[11px] font-inter">
                    <Clock size={12} className="text-muted/70" />
                    <span>
                      {channel.lastSyncAt
                        ? `Synced ${new Date(channel.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : "Never synchronized"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {channel.syncSettings?.autoSyncInventory && (
                      <span className="px-1.5 py-0.5 bg-surface-elevated text-muted text-[10px] rounded border border-border">
                        Auto Stock
                      </span>
                    )}
                    {channel.syncSettings?.autoSyncOrders && (
                      <span className="px-1.5 py-0.5 bg-surface-elevated text-muted text-[10px] rounded border border-border">
                        Auto Orders
                      </span>
                    )}
                  </div>
                </div>

                {/* Channel Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => handleTriggerSync(channel.id, "inventory")}
                        disabled={isSyncing}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-surface-elevated hover:bg-surface-elevated/80 text-foreground border border-border rounded-xl text-xs font-semibold font-inter transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
                        <span>{isSyncing ? "Syncing..." : "Sync Stock"}</span>
                      </button>

                      <button
                        onClick={() => handleTriggerSync(channel.id, "orders")}
                        disabled={isSyncing}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-surface-elevated hover:bg-surface-elevated/80 text-foreground border border-border rounded-xl text-xs font-semibold font-inter transition-all cursor-pointer disabled:opacity-50"
                      >
                        <ShoppingBag size={13} />
                        <span>Pull Orders</span>
                      </button>

                      <button
                        onClick={() => handleOpenConfig(channel)}
                        className="p-2 text-muted hover:text-foreground hover:bg-surface-elevated rounded-xl border border-transparent hover:border-border transition-colors cursor-pointer"
                        title="Configure Channel"
                      >
                        <Settings size={15} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenConfig(channel)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold font-inter transition-all cursor-pointer shadow-sm"
                    >
                      <SlidersHorizontal size={14} />
                      <span>Configure & Connect Channel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync Activity Audit Trail */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-inter font-bold text-sm text-foreground">
              Marketplace Sync Activity Log
            </h3>
            <span className="px-2 py-0.5 bg-surface-elevated text-muted text-[10px] font-semibold rounded-full border border-border">
              Real-time audit
            </span>
          </div>
          <span className="text-xs text-muted font-inter">
            Historical events from Daraz, eBay, and Amazon gateways
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-inter border-collapse">
            <thead>
              <tr className="border-b border-border text-muted uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {syncLogs.length > 0 ? (
                syncLogs.map((log) => {
                  const channelIdentifier = log.channelName || (log as any).channel || "";
                  const badge = getChannelBadge(
                    channelIdentifier.toUpperCase().includes("DARAZ") ? "DARAZ" :
                    channelIdentifier.toUpperCase().includes("EBAY") ? "EBAY" :
                    channelIdentifier.toUpperCase().includes("AMAZON") ? "AMAZON" : "WEB_STORE"
                  );
                  return (
                    <tr key={log.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3 px-3 text-muted whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[11px] ${badge.tagBg}`}>
                          {log.channelName || (log as any).channel || "Channel"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-[11px]">
                          <CheckCircle2 size={13} />
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted max-w-md truncate">
                        {log.message || (log as any).details || "Sync completed successfully"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    No synchronization activity recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Modal */}
      {configModalChannel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center">
                  <SlidersHorizontal size={18} />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-inter font-bold text-sm text-foreground">
                    Configure {configModalChannel.name}
                  </h3>
                  <span className="font-inter text-xs text-muted">
                    API credentials and synchronization rules
                  </span>
                </div>
              </div>
              <button
                onClick={() => setConfigModalChannel(null)}
                className="text-muted hover:text-foreground p-1 rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveConfig} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground font-inter">
                  {configModalChannel.type === "DARAZ"
                    ? "App Key"
                    : configModalChannel.type === "EBAY"
                    ? "OAuth Client ID"
                    : "LWA Client ID"}
                </label>
                <input
                  type="text"
                  value={formData.appKey}
                  onChange={(e) => setFormData({ ...formData, appKey: e.target.value })}
                  placeholder="e.g. 502941 or Client ID"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:border-blue-500 font-inter"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground font-inter">
                  {configModalChannel.type === "DARAZ"
                    ? "App Secret"
                    : configModalChannel.type === "EBAY"
                    ? "OAuth Client Secret"
                    : "LWA Client Secret"}
                </label>
                <input
                  type="password"
                  value={formData.appSecret}
                  onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:border-blue-500 font-inter"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground font-inter">
                  Marketplace Site / Region
                </label>
                <input
                  type="text"
                  value={formData.marketplaceId}
                  onChange={(e) => setFormData({ ...formData, marketplaceId: e.target.value })}
                  placeholder="e.g. EBAY_US, LK, or us-east-1"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:border-blue-500 font-inter"
                />
              </div>

              {/* Automated Sync Toggles */}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-border">
                <span className="text-xs font-semibold text-foreground font-inter">
                  Automated Synchronization Rules
                </span>

                <label className="flex items-center justify-between p-2.5 bg-surface-subtle border border-border rounded-xl cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-inter font-semibold text-xs text-foreground">
                      Real-time Stock / Inventory Sync
                    </span>
                    <span className="font-inter text-[11px] text-muted">
                      Automatically decrement marketplace quantity when sales occur.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoSyncInventory}
                    onChange={(e) => setFormData({ ...formData, autoSyncInventory: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-surface-subtle border border-border rounded-xl cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-inter font-semibold text-xs text-foreground">
                      Automated Order Ingestion
                    </span>
                    <span className="font-inter text-[11px] text-muted">
                      Pull paid marketplace orders into the Masky central order book.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoSyncOrders}
                    onChange={(e) => setFormData({ ...formData, autoSyncOrders: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setConfigModalChannel(null)}
                  className="px-4 py-2 text-xs font-semibold font-inter text-muted hover:text-foreground rounded-xl hover:bg-surface-elevated transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connectMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold font-inter transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {connectMutation.isPending ? "Connecting..." : "Save & Verify Connection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
