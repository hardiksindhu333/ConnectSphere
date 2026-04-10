import API from "./axios.js";

// GET COMMENTS
export const getComments = async (videoId) => {
  const res = await API.get(`/comments/video/${videoId}`);
  return res.data.data;
};

// ADD COMMENT / REPLY (FIXED)
export const addComment = async ({ videoId, content, parentComment = null }) => {
  const res = await API.post(`/comments/video/${videoId}`, {
    content,
    parentComment,
  });
  return res.data.data;
};

// UPDATE COMMENT
export const updateComment = async ({ commentId, content }) => {
  const res = await API.patch(`/comments/${commentId}`, { content });
  return res.data.data;
};

// DELETE COMMENT
export const deleteComment = async (commentId) => {
  const res = await API.delete(`/comments/${commentId}`);
  return res.data.data;
};