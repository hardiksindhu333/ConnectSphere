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

export const verifyOtp = async ({ email, otp }) => {
  const res = await API.post("/users/verify-otp", { email, otp });
  return res.data;
};

export const resendOtp = async ({ email }) => {
  const res = await API.post("/users/resend-otp", { email });
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await API.get("/users/current-user");
  return res.data;
};