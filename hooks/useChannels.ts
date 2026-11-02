import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { channelService, ChannelConfig, ChannelStats, SyncLogEntry } from "../services/channel.service";

export const CHANNELS_QUERY_KEYS = {
  all: ["channels"] as const,
  stats: ["channels", "stats"] as const,
  logs: ["channels", "logs"] as const,
};

export function useChannels() {
  return useQuery({
    queryKey: CHANNELS_QUERY_KEYS.all,
    queryFn: () => channelService.getAllChannels(),
  });
}

export function useChannelStats() {
  return useQuery({
    queryKey: CHANNELS_QUERY_KEYS.stats,
    queryFn: () => channelService.getChannelStats(),
  });
}

export function useChannelSyncLogs(limit = 20) {
  return useQuery({
    queryKey: [...CHANNELS_QUERY_KEYS.logs, limit],
    queryFn: () => channelService.getSyncLogs(limit),
  });
}

export function useConnectChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, payload }: { channelId: string; payload: any }) =>
      channelService.connectChannel(channelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEYS.logs });
    },
  });
}

export function useDisconnectChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (channelId: string) => channelService.disconnectChannel(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEYS.logs });
    },
  });
}

export function useSyncChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, action = "all" }: { channelId: string; action?: "all" | "inventory" | "products" | "orders" }) =>
      channelService.syncChannel(channelId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEYS.logs });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
