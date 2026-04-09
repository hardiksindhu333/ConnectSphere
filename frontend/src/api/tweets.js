import API from "./axios.js";

export const createTweet = async ({ content }) => {
  const res = await API.post("/tweets", { content });
  return res.data; // ApiResponse
};

export const getUserTweets = async ({ userId, page = 1, limit = 10 } = {}) => {
  const res = await API.get(`/tweets/user/${userId}`, { params: { page, limit } });
  return res.data; // ApiResponse
};

export const updateTweet = async ({ tweetId, content }) => {
  const res = await API.patch(`/tweets/${tweetId}`, { content });
  return res.data;
};

export const deleteTweet = async (tweetId) => {
  const res = await API.delete(`/tweets/${tweetId}`);
  return res.data;
};

export const toggleTweetLike = async (tweetId) => {
  const res = await API.put(`/tweets/${tweetId}/like`);
  return res.data;
};

