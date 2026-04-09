import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { setApiErrorHandler } from "./api/axios.js";

setApiErrorHandler((message) => {
  toast.error(message);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#111", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" },
        }}
      />
    </QueryClientProvider>
  </StrictMode>
);
