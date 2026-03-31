import axios from "axios";

export const toggleLike = async (videoId) => {
  const res = await axios.post(
    `http://localhost:3000/api/v1/likes/video/${videoId}`,
    {},
    { withCredentials: true }
  );

  return res.data;
};