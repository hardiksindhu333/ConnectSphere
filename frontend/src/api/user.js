import API from "./axios.js";

export const getMyProfile = async () => {
  const res = await API.get("/users/current-user");
  return res.data.data;
};

export const getMyVideos = async () => {
  const res = await API.get("/videos/my-videos");
  return res.data.data;
};

export const getWatchHistory = async () => {
  const res = await API.get("/users/history");
  return res.data;
};

export const updateAccount = async (data) => {
  const res = await API.patch("/users/update-account", data);
  return res.data;
};

export const updateAvatar = async (file) => {
  const form = new FormData();
  form.append("avatar", file);
  const res = await API.patch("/users/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateCoverImage = async (file) => {
  const form = new FormData();
  form.append("coverImage", file);
  const res = await API.patch("/users/cover-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteAccount = async () => {
  const res = await API.delete("/users/delete-account");
  return res.data;
};

export const updatePassword = async (data) => {
  const res = await API.post("/users/change-password", data);
  return res.data;
};