import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getChannelStats, getChannelVideos } from "../api/dashboard.js";
import { formatCompactNumber } from "../utils/formatters.js";
import VideoListItem from "../components/video/VideoListItem.jsx";
import { useState } from "react";
import API from "../api/axios.js";
import toast from "react-hot-toast";
import { Eye, EyeOff, Trash2 } from "lucide-react";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-2xl font-bold mt-1">{formatCompactNumber(value)}</div>
    </div>
  );
}

export default function Studio() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const stats = useQuery({
    queryKey: ["studioStats"],
    queryFn: getChannelStats,
    staleTime: 30_000,
  });

  const videos = useQuery({
    queryKey: ["studioVideos", page],
    queryFn: () => getChannelVideos({ page, limit: 10 }),
    staleTime: 30_000,
  });

  const v = videos.data?.data?.videos || [];
  const pagination = videos.data?.data?.pagination;

  const toggleMutation = useMutation({
    mutationFn: async (videoId) => API.patch(`/videos/${videoId}/toggle-publish`),
    onSuccess: () => {
      toast.success("Publish status updated");
      queryClient.invalidateQueries({ queryKey: ["studioVideos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (videoId) => API.delete(`/videos/${videoId}`),
    onSuccess: () => {
      toast.success("Video deleted");
      queryClient.invalidateQueries({ queryKey: ["studioVideos"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold">Creator Studio</h1>
      <p className="text-sm text-gray-400 mt-1">Your channel performance and uploads.</p>

      {stats.isError ? (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200">
          Failed to load stats
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total videos" value={stats.data?.data?.totalVideos || 0} />
        <StatCard label="Total views" value={stats.data?.data?.totalViews || 0} />
        <StatCard label="Subscribers" value={stats.data?.data?.totalSubscribers || 0} />
        <StatCard label="Total likes" value={stats.data?.data?.totalLikes || 0} />
      </div>

      <div className="mt-8">
        <div className="font-semibold">Your uploads</div>

        {videos.isLoading ? <div className="mt-3 text-gray-400">Loading...</div> : null}
        {videos.isError ? (
          <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200">
            Failed to load videos
          </div>
        ) : null}

        <div className="mt-3 space-y-2">
          {v.map((item) => (
            <div key={item._id} className="flex items-center gap-2">
              <div className="flex-1">
                <VideoListItem video={item} to={`/video/${item._id}`} />
              </div>
              <button
                onClick={() => toggleMutation.mutate(item._id)}
                disabled={toggleMutation.isPending}
                className="px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-60"
                title={item.isPublished ? "Unpublish" : "Publish"}
              >
                {item.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={() => {
                  const ok = window.confirm("Delete this video?");
                  if (ok) deleteMutation.mutate(item._id);
                }}
                disabled={deleteMutation.isPending}
                className="px-3 py-2 rounded-full bg-white/5 hover:bg-red-500/10 border border-white/10 disabled:opacity-60"
                title="Delete"
              >
                <Trash2 size={16} className="text-red-200" />
              </button>
            </div>
          ))}
        </div>

        {pagination ? (
          <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
            <div>
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-60"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

