import API from "./axios.js";

export const toggleLike = async (videoId) => {
  const res = await API.post(`/likes/video/${videoId}`, {});

  return res.data;
};