import { useQuery } from "@tanstack/react-query";
import { getWatchHistory } from "../api/user.js";
import VideoListItem from "../components/video/VideoListItem.jsx";

export default function History() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["history"],
    queryFn: getWatchHistory,
    staleTime: 30_000,
  });

  const items = data?.data || [];

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Watch history</h1>
          <p className="text-sm text-gray-400 mt-1">Videos you watched recently.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 text-gray-400">Loading...</div>
      ) : null}

      {isError ? (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200">
          Failed to load history
        </div>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <div className="mt-6 text-gray-400">No history yet.</div>
      ) : null}

      <div className="mt-6 space-y-2">
        {items.map((v) => (
          <VideoListItem key={v._id} video={v} to={`/video/${v._id}`} />
        ))}
      </div>
    </div>
  );
}

