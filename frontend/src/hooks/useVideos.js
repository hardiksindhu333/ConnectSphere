import { useQuery } from "@tanstack/react-query";
import { getAllVideos } from "../api/videoApi.js";

export const useVideos = ({ query } = {}) => {
  return useQuery({
    queryKey: ["videos", query || ""],
    queryFn: () => getAllVideos({ query }),
    staleTime: 15_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};