import API from "./axios.js";

export const toggleLike = async (videoId) => {
  const res = await API.post(`/likes/video/${videoId}`, {});

  return res.data;
};

export const toggleCommentLike = async (commentId) => {
  const res = await API.post(`/likes/comment/${commentId}`, {});
  return res.data;
};

export const getLikedVideos = async () => {
  const res = await API.get("/likes/videos");
  return res.data; // ApiResponse
};