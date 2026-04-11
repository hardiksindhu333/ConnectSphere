import API from "./axios";

export const loginUser = async (data) => {
  const res = await API.post("/users/login", data); 
  return res.data;
};

export const signupUser = async (formData) => {
  const res = await API.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const logoutUser = async () => {
  const res = await API.post("/users/logout");
  return res.data;
};

export const resetPassword = async ({ emailOrUsername, newPassword }) => {
  const res = await API.post("/users/reset-password", { emailOrUsername, newPassword });
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await API.get("/users/current-user");
  return res.data;
};