import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, getMyVideos, updateAccount, updateAvatar, updateCoverImage, deleteAccount } from "../api/user";
import { useState, useEffect } from "react";
import API from "../api/axios.js";
import { resolveMediaUrl } from "../utils/resolveMediaUrl.js";
import toast from "react-hot-toast";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";

const Profile = () => {
  const queryClient = useQueryClient();

  const [editingVideo, setEditingVideo] = useState(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: null,
    videoFile: null, // NEW
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: "", fullName: "", email: "" });
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [newCoverFile, setNewCoverFile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("edit")) {
      setEditingProfile(true);
      setProfileForm({ username: (user?.username) || "", fullName: (user?.fullName) || "", email: (user?.email) || "" });
    }
  }, [location.search, user]);

  const { data: videos = [] } = useQuery({
    queryKey: ["myVideos"],
    queryFn: getMyVideos,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const form = new FormData();

      form.append("title", data.title);
      form.append("description", data.description);

      if (data.thumbnail instanceof File) {
        form.append("thumbnail", data.thumbnail);
      }

      if (data.videoFile instanceof File) {
        form.append("videoFile", data.videoFile);
      }

      if (removeThumbnail) {
        form.append("removeThumbnail", "true");
      }

      return await API.patch(`/videos/${id}`, form);
    },
    onSuccess: () => {
      toast.success("Video updated");
      queryClient.invalidateQueries(["myVideos"]);
      setEditingVideo(null);
      setRemoveThumbnail(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => API.delete(`/videos/${id}`),
    onSuccess: () => {
      toast.success("Video deleted");
      queryClient.invalidateQueries(["myVideos"]);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) =>
      API.patch(`/videos/${id}/toggle-publish`),
    onSuccess: () => {
      toast.success("Publish status updated");
      queryClient.invalidateQueries(["myVideos"]);
    },
  });

  // profile mutations
  const updateAccountMutation = useMutation({
    mutationFn: (data) => updateAccount(data),
    onSuccess: (res) => {
      toast.success("Profile updated");
      queryClient.invalidateQueries(["profile"]);
      setEditingProfile(false);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Error updating profile"),
  });

  const updateAvatarMutation = useMutation({
    mutationFn: (file) => updateAvatar(file),
    onSuccess: () => {
      toast.success("Avatar updated");
      queryClient.invalidateQueries(["profile"]);
      setNewAvatarFile(null);
    },
  });

  const updateCoverMutation = useMutation({
    mutationFn: (file) => updateCoverImage(file),
    onSuccess: () => {
      toast.success("Cover image updated");
      queryClient.invalidateQueries(["profile"]);
      setNewCoverFile(null);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: () => {
      toast.success("Account deleted");
      logout();
      queryClient.clear();
      navigate("/signup");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Error deleting account"),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">

      {/* PROFILE */}
      <div className="flex items-center gap-6 mb-6">
        {resolveMediaUrl(user?.avatar?.url || user?.avatar) ? (
          <img
            src={resolveMediaUrl(user?.avatar?.url || user?.avatar)}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white/10" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{user?.username}</h1>
              <p className="text-gray-400">{user?.email}</p>
            </div>

            <div className="ml-auto">
              <button
                onClick={() => {
                  setEditingProfile((v) => !v);
                  // populate form when opening
                  setProfileForm({ username: user?.username || "", fullName: user?.fullName || "", email: user?.email || "" });
                }}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-sm"
              >
                {editingProfile ? "Cancel" : "Edit profile"}
              </button>
            </div>
          </div>

          {editingProfile && (
            <div className="mt-4 bg-black/60 p-4 rounded-md border border-white/10">
              <label className="block text-xs text-gray-300">Username</label>
              <input
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                className="w-full mt-1 p-2 rounded bg-black border border-white/10"
              />

              <label className="block text-xs text-gray-300 mt-3">Full name</label>
              <input
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="w-full mt-1 p-2 rounded bg-black border border-white/10"
              />

              <label className="block text-xs text-gray-300 mt-3">Email</label>
              <input
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full mt-1 p-2 rounded bg-black border border-white/10"
              />

              <label className="block text-xs text-gray-300 mt-3">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewAvatarFile(e.target.files[0])}
                className="w-full mt-1"
              />

              <label className="block text-xs text-gray-300 mt-3">Cover image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewCoverFile(e.target.files[0])}
                className="w-full mt-1"
              />

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => {
                    updateAccountMutation.mutate(profileForm);
                    if (newAvatarFile) updateAvatarMutation.mutate(newAvatarFile);
                    if (newCoverFile) updateCoverMutation.mutate(newCoverFile);
                  }}
                  className="px-4 py-2 bg-white text-black rounded"
                  disabled={updateAccountMutation.isLoading}
                >
                  Save changes
                </button>

                <button
                  onClick={() => {
                    const ok = window.confirm("Are you sure you want to delete your account? This is irreversible.");
                    if (ok) deleteAccountMutation.mutate();
                  }}
                  className="px-4 py-2 bg-red-600 rounded text-sm"
                >
                  Delete account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIDEOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video._id}
            className="relative group rounded-2xl overflow-hidden bg-white/5 border border-white/10"
          >
            {resolveMediaUrl(video.thumbnail?.url) ? (
              <img
                src={resolveMediaUrl(video.thumbnail?.url)}
                className="w-full h-44 object-cover"
              />
            ) : (
              <div className="w-full h-44 bg-white/10" />
            )}

            <div className="p-4">
              <div className="font-semibold line-clamp-1">{video.title}</div>
              <div className="text-xs text-gray-400 line-clamp-2 mt-1">
                {video.description}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div
                  className={[
                    "text-xs px-2 py-1 rounded-full border",
                    video.isPublished
                      ? "bg-green-500/10 text-green-200 border-green-500/20"
                      : "bg-gray-500/10 text-gray-300 border-white/10",
                  ].join(" ")}
                >
                  {video.isPublished ? "Published" : "Unpublished"}
                </div>

                <button
                  onClick={() => toggleMutation.mutate(video._id)}
                  className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  {video.isPublished ? (
                    <span className="inline-flex items-center gap-2">
                      <EyeOff size={14} /> Unpublish
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Eye size={14} /> Publish
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex gap-2">
              <button
                onClick={() => {
                  setEditingVideo(video);
                  setFormData({
                    title: video.title,
                    description: video.description,
                    thumbnail: null,
                    videoFile: null,
                  });
                }}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => {
                  const ok = window.confirm("Delete this video?");
                  if (ok) deleteMutation.mutate(video._id);
                }}
                className="p-2 rounded-full bg-black/60 hover:bg-red-500/30 border border-white/10"
              >
                <Trash2 size={16} className="text-red-200" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-2xl w-[420px] border border-white/10">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit video</h2>
              <button
                onClick={() => {
                  setEditingVideo(null);
                  setRemoveThumbnail(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* CURRENT THUMBNAIL */}
            {!removeThumbnail && editingVideo.thumbnail?.url && (
              <img
                src={resolveMediaUrl(editingVideo.thumbnail.url)}
                className="w-full h-44 mb-3 rounded-xl object-cover"
              />
            )}

            <button
              onClick={() => setRemoveThumbnail(true)}
              className="text-red-300 text-sm hover:underline"
            >
              Remove Thumbnail
            </button>

            <input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full mt-4 p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            />

            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full mt-3 p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
            />

            {/*  VIDEO UPDATE */}
            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                setFormData({ ...formData, videoFile: e.target.files[0] })
              }
              className="mt-4"
            />

            {/*  THUMBNAIL */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  thumbnail: e.target.files[0],
                });
                setRemoveThumbnail(false);
              }}
              className="mt-3"
            />

            <button
              onClick={() =>
                updateMutation.mutate({
                  id: editingVideo._id,
                  data: formData,
                })
              }
              disabled={updateMutation.isPending}
              className="bg-white text-black hover:bg-gray-200 mt-5 px-4 py-2 rounded-full font-medium disabled:opacity-60"
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;