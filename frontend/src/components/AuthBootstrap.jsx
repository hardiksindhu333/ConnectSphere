import { useEffect } from "react";
import useAuthStore from "../store/authStore.js";
import { useMe } from "../hooks/useMe.js";

export default function AuthBootstrap({ children }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  const { data, isLoading, isError } = useMe();

  useEffect(() => {
    if (isLoading) {
      setStatus("unknown");
      return;
    }
    if (isError) {
      setUser(null);
      return;
    }

    setUser(data?.data?.user || data?.data || null);
  }, [data, isError, isLoading, setStatus, setUser]);

  return children;
}

