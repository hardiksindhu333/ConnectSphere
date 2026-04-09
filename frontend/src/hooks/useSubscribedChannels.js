import { useQuery } from "@tanstack/react-query";
import { getSubscribedChannels } from "../api/subscription.js";

export function useSubscribedChannels(subscriberId) {
  return useQuery({
    queryKey: ["subscribedChannels", subscriberId],
    enabled: !!subscriberId,
    queryFn: async () => {
      const res = await getSubscribedChannels(subscriberId);
      return res?.data || [];
    },
    staleTime: 60_000,
  });
}

