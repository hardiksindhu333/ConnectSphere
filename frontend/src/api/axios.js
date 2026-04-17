import axios from "axios";

let onApiError = null;

export function setApiErrorHandler(handler) {
  onApiError = typeof handler === "function" ? handler : null;
}

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const API = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong. Please try again.";

    if (onApiError) onApiError(message, error);
    return Promise.reject(error);
  }
);

export default API;