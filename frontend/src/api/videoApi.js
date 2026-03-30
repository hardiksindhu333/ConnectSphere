import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

export const getAllVideos = async () => {
  const res = await API.get("/videos");
  return res.data;
};