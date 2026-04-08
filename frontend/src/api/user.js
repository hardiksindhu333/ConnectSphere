import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/users";

export const getMyProfile = async () => {
  const res = await API.get("/users/current-user"); 
  return res.data.data;
};

export const getMyVideos = async () => {
  const res = await axios.get(
    "http://localhost:3000/api/v1/videos/my-videos",
    { withCredentials: true }
  );
  return res.data.data;
};