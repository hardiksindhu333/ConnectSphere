import API from "./axios.js";

export const getAllVideos = async () => {
  const res = await API.get("/videos", {
  headers: {
    "Cache-Control": "no-cache",
  },
});
  return res.data;
};

export const getFeedVideos = async () => {
  const res = await API.get("/videos/feed");
  return res.data;
};

export const getVideoById = async (id) => {
  const res = await API.get(`/videos/${id}`);
  return res.data;
};