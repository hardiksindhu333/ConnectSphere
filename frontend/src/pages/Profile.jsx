import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, getMyVideos } from "../api/user";
import { useState } from "react";
import API from "../api/axios.js";
import { resolveMediaUrl } from "../utils/resolveMediaUrl.js";
import toast from "react-hot-toast";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";

const Profile = () => {
  const queryClient = useQueryClient();

  const [editingVideo, setEditingVideo] = useState(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: null,
    videoFile: null, // ✅ NEW
  });

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

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

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">

      {/* PROFILE */}
      <div className="flex items-center gap-6 mb-10">
        {resolveMediaUrl(user?.avatar?.url || user?.avatar) ? (
          <img
            src={resolveMediaUrl(user?.avatar?.url || user?.avatar)}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white/10" />
        )}
        <div>
          <h1 className="text-3xl font-bold">{user?.username}</h1>
          <p className="text-gray-400">{user?.email}</p>
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
                ✕
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