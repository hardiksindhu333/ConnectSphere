import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/comments";

// ✅ GET COMMENTS
export const getComments = async (videoId) => {
  const res = await axios.get(
    `${BASE_URL}/video/${videoId}`,
    { withCredentials: true }
  );

  return res.data.data;
};

export const addComment = async ({ videoId, content }) => {
  const res = await axios.post(
    `${BASE_URL}/video/${videoId}`,
    { content },
    { withCredentials: true }
  );

  return res.data.data;
};

export const updateComment = async ({ commentId, content }) => {
  const res = await axios.patch(
    `${BASE_URL}/${commentId}`,
    { content },
    { withCredentials: true }
  );

  return res.data.data;
};

export const deleteComment = async (commentId) => {
  const res = await axios.delete(
    `${BASE_URL}/${commentId}`,
    { withCredentials: true }
  );

  return res.data.data;
};