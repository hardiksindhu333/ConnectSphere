import API from "./axios.js";

export const toggleSubscription = async (channelId) => {
  const res = await API.post(`/subscriptions/c/${channelId}`);
  return res.data; // ApiResponse
};

export const getSubscribedChannels = async (subscriberId) => {
  const res = await API.get(`/subscriptions/u/${subscriberId}`);
  return res.data; // ApiResponse
};

