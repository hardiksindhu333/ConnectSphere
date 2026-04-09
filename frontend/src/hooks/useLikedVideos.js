import { useQuery } from "@tanstack/react-query";
import { getLikedVideos } from "../api/like.js";

export function useLikedVideos() {
  return useQuery({
    queryKey: ["likedVideos"],
    queryFn: async () => {
      const res = await getLikedVideos();
      return res?.data || [];
    },
    staleTime: 60_000,
  });
}

