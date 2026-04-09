import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  status: "unknown", // 'unknown' | 'authenticated' | 'unauthenticated'

  login: (userData) =>
    set({
      user: userData,
      status: "authenticated",
    }),

  logout: () =>
    set({
      user: null,
      status: "unauthenticated",
    }),

  setUser: (userData) =>
    set({
      user: userData,
      status: userData ? "authenticated" : "unauthenticated",
    }),

  setStatus: (status) => set({ status }),
}));

export default useAuthStore;