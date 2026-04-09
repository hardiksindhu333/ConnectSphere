import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/authApi.js";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getCurrentUser,
    staleTime: 60_000,
    retry: false,
  });
}

