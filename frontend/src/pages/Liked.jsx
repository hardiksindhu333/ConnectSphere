import { useQuery } from "@tanstack/react-query";
import { getLikedVideos } from "../api/like.js";
import VideoListItem from "../components/video/VideoListItem.jsx";

export default function Liked() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["likedVideosPage"],
    queryFn: getLikedVideos,
    staleTime: 30_000,
  });

  const items = data?.data || [];

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Liked videos</h1>
      <p className="text-sm text-gray-400 mt-1">Videos you’ve liked.</p>

      {isLoading ? <div className="mt-6 text-gray-400">Loading...</div> : null}
      {isError ? (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200">
          Failed to load liked videos
        </div>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <div className="mt-6 text-gray-400">No liked videos yet.</div>
      ) : null}

      <div className="mt-6 space-y-2">
        {items.map((v) => (
          <VideoListItem
            key={v.videoId}
            video={{
              videoId: v.videoId,
              thumbnail: v.thumbnail,
              title: v.title,
              views: v.views,
            }}
            to={`/video/${v.videoId}`}
          />
        ))}
      </div>
    </div>
  );
}

