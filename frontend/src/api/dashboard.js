import API from "./axios.js";

export const getChannelStats = async () => {
  const res = await API.get("/dashboard/stats");
  return res.data;
};

export const getChannelVideos = async ({ page = 1, limit = 10 } = {}) => {
  const res = await API.get("/dashboard/videos", { params: { page, limit } });
  return res.data;
};

