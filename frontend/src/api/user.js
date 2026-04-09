import API from "./axios.js";

export const getMyProfile = async () => {
  const res = await API.get("/users/current-user");
  return res.data.data;
};

export const getMyVideos = async () => {
  const res = await API.get("/videos/my-videos");
  return res.data.data;
};