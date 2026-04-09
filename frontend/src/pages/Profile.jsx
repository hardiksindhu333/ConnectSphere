import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, getMyVideos } from "../api/user";
import { useState } from "react";
import API from "../api/axios.js";
import { resolveMediaUrl } from "../utils/resolveMediaUrl.js";

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
      queryClient.invalidateQueries(["myVideos"]);
      setEditingVideo(null);
      setRemoveThumbnail(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => API.delete(`/videos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["myVideos"]);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) =>
      API.patch(`/videos/${id}/toggle-publish`),
    onSuccess: () => {
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
          <div key={video._id} className="relative group">
            {resolveMediaUrl(video.thumbnail?.url) ? (
              <img
                src={resolveMediaUrl(video.thumbnail?.url)}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-white/10" />
            )}

            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2">
              
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
                className="bg-blue-600 px-3 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => {
                  const ok = window.confirm("Delete this video?");
                  if (ok) deleteMutation.mutate(video._id);
                }}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Delete
              </button>

              <button
                onClick={() => toggleMutation.mutate(video._id)}
                className={`px-3 py-1 rounded ${
                  video.isPublished ? "bg-green-600" : "bg-gray-600"
                }`}
              >
                {video.isPublished ? "Published" : "Unpublished"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded w-96">

            <h2>Edit Video</h2>

            {/* CURRENT THUMBNAIL */}
            {!removeThumbnail && editingVideo.thumbnail?.url && (
              <img
                src={resolveMediaUrl(editingVideo.thumbnail.url)}
                className="w-full h-40 mb-3"
              />
            )}

            <button
              onClick={() => setRemoveThumbnail(true)}
              className="text-red-400 text-sm"
            >
              Remove Thumbnail
            </button>

            <input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full mt-3 p-2 bg-gray-800"
            />

            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full mt-3 p-2 bg-gray-800"
            />

            {/*  VIDEO UPDATE */}
            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                setFormData({ ...formData, videoFile: e.target.files[0] })
              }
              className="mt-3"
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
              className="bg-blue-600 mt-4 px-3 py-1 rounded"
            >
              Save
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;