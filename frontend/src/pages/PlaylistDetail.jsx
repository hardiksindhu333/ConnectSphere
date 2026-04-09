import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  addVideoToPlaylist,
  deletePlaylist,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../api/playlists.js";
import { useState } from "react";
import toast from "react-hot-toast";
import VideoListItem from "../components/video/VideoListItem.jsx";
import BrowseVideosModal from "../components/video/BrowseVideosModal.jsx";

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["playlist", id],
    enabled: !!id,
    queryFn: () => getPlaylistById(id),
    staleTime: 30_000,
  });

  const playlist = data?.data;
  const videos = playlist?.videos || [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videoId, setVideoId] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: updatePlaylist,
    onSuccess: () => {
      toast.success("Playlist updated");
      queryClient.invalidateQueries({ queryKey: ["playlist", id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => {
      toast.success("Playlist deleted");
      navigate("/playlists");
    },
  });

  const addMutation = useMutation({
    mutationFn: addVideoToPlaylist,
    onSuccess: () => {
      toast.success("Added to playlist");
      setVideoId("");
      queryClient.invalidateQueries({ queryKey: ["playlist", id] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeVideoFromPlaylist,
    onSuccess: () => {
      toast.success("Removed from playlist");
      queryClient.invalidateQueries({ queryKey: ["playlist", id] });
    },
  });

  if (isLoading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (isError)
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200">
          Failed to load playlist
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-5xl">
      <BrowseVideosModal
        open={browseOpen}
        onClose={() => setBrowseOpen(false)}
        title="Add videos to playlist"
        onPickVideo={(v) => {
          addMutation.mutate({ playlistId: id, videoId: v._id });
        }}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{playlist?.name}</h1>
          <p className="text-sm text-gray-400 mt-1">{playlist?.description || "No description"}</p>
        </div>
        <button
          onClick={() => {
            const ok = window.confirm("Delete this playlist?");
            if (ok) deleteMutation.mutate(id);
          }}
          disabled={deleteMutation.isPending}
          className="px-4 py-2 rounded-full bg-red-500/90 hover:bg-red-500 text-white disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="font-semibold">Edit</div>
          <div className="mt-3 space-y-2">
            <input
              defaultValue={playlist?.name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full p-3 rounded-xl bg-black border border-white/10"
            />
            <textarea
              defaultValue={playlist?.description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full p-3 rounded-xl bg-black border border-white/10 resize-none"
            />
            <button
              onClick={() => {
                const payload = {
                  playlistId: id,
                  name: (name || playlist?.name || "").trim(),
                  description: (description || playlist?.description || "").trim(),
                };
                if (!payload.name) return toast.error("Name is required");
                updateMutation.mutate(payload);
              }}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-60"
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="font-semibold">Add video</div>
          <div className="mt-3 flex gap-2">
            <input
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="Video ID"
              className="flex-1 p-3 rounded-xl bg-black border border-white/10"
            />
            <button
              onClick={() => {
                if (!videoId.trim()) return toast.error("Video ID required");
                addMutation.mutate({ playlistId: id, videoId: videoId.trim() });
              }}
              disabled={addMutation.isPending}
              className="px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-60"
            >
              {addMutation.isPending ? "Adding..." : "Add"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tip: paste a video `_id` from MongoDB.
          </p>

          <div className="mt-4">
            <button
              onClick={() => setBrowseOpen(true)}
              className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium"
            >
              Browse videos (easy)
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="font-semibold">Videos</div>
        {videos.length === 0 ? (
          <div className="mt-3 text-gray-400">No videos in this playlist yet.</div>
        ) : (
          <div className="mt-3 space-y-2">
            {videos.map((v) => (
              <div key={v._id} className="flex items-center gap-2">
                <div className="flex-1">
                  <VideoListItem video={v} to={`/video/${v._id}`} />
                </div>
                <button
                  onClick={() => removeMutation.mutate({ playlistId: id, videoId: v._id })}
                  disabled={removeMutation.isPending}
                  className="px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

