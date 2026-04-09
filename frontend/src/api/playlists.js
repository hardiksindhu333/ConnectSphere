import API from "./axios.js";

export const createPlaylist = async ({ name, description }) => {
  const res = await API.post("/playlists", { name, description });
  return res.data;
};

export const getUserPlaylists = async ({ userId, page = 1, limit = 12, search = "" }) => {
  const res = await API.get(`/playlists/user/${userId}`, {
    params: { page, limit, search },
  });
  return res.data;
};

export const getPlaylistById = async (playlistId) => {
  const res = await API.get(`/playlists/${playlistId}`);
  return res.data;
};

export const updatePlaylist = async ({ playlistId, name, description }) => {
  const res = await API.patch(`/playlists/${playlistId}`, { name, description });
  return res.data;
};

export const deletePlaylist = async (playlistId) => {
  const res = await API.delete(`/playlists/${playlistId}`);
  return res.data;
};

export const addVideoToPlaylist = async ({ playlistId, videoId }) => {
  const res = await API.post(`/playlists/${playlistId}/add/${videoId}`);
  return res.data;
};

export const removeVideoFromPlaylist = async ({ playlistId, videoId }) => {
  const res = await API.delete(`/playlists/${playlistId}/remove/${videoId}`);
  return res.data;
};

