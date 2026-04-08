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

// ✅ ADD COMMENT / REPLY (🔥 FIXED)
export const addComment = async ({ videoId, content, parentComment = null }) => {
  const res = await axios.post(
    `${BASE_URL}/video/${videoId}`,
    { content, parentComment }, // 🔥 IMPORTANT
    { withCredentials: true }
  );
  return res.data.data;
};

// ✏️ UPDATE COMMENT
export const updateComment = async ({ commentId, content }) => {
  const res = await axios.patch(
    `${BASE_URL}/${commentId}`,
    { content },
    { withCredentials: true }
  );
  return res.data.data;
};

// ❌ DELETE COMMENT
export const deleteComment = async (commentId) => {
  const res = await axios.delete(
    `${BASE_URL}/${commentId}`,
    { withCredentials: true }
  );
  return res.data.data;
};