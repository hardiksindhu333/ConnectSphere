import { useQuery } from "@tanstack/react-query";
import { getAllVideos } from "../api/videoApi.js";

export const useVideos = () => {
  return useQuery({
    queryKey: ["videos"],
    queryFn: getAllVideos,
    staleTime: 15_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};