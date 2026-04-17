import VideoCard from "../../components/VideoCard.jsx";
import { useVideos } from "../../hooks/useVideos.js";
import VideoCardSkeleton from "../../components/skeletons/VideoCardSkeleton.jsx";
import { useSearchParams } from "react-router-dom";

const Home = () => {
  const [sp] = useSearchParams();
  const q = (sp.get("q") || "").trim();

  const { data, isLoading, isError } = useVideos({ query: q });

  const videos =
    data?.data?.docs ||
    data?.data?.videos ||
    data?.data ||
    [];

  return (
    <div className="flex-1">
      <div className="surface-card p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {q ? `Search results for "${q}"` : "Home Feed"}
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              {q ? "Showing related titles from your videos." : "Latest videos"}
            </p>
          </div>
          <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-200">
            {videos.length} videos available
          </div>
        </div>
      </div>

      {isError && (
        <div className="surface-panel border-red-500/20 text-red-200 p-4 rounded-3xl mb-6">
          Error loading videos
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))
          : videos.map((video) => <VideoCard key={video._id} video={video} />)}
      </div>

      {!isLoading && !isError && videos.length === 0 && (
        <div className="surface-panel border-dashed border-white/10 text-gray-300 p-6 rounded-3xl mt-8 text-center">
          <p className="font-semibold text-white mb-2">No videos found.</p>
          <p className="text-sm text-gray-400">
            {q ? "Try a different search term." : "Upload a new video to see it here."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;