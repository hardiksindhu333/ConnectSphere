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
    <div className="flex-1 p-6">

      <h1 className="text-2xl font-bold mb-2">
        {q ? `Search results for "${q}"` : "Home Feed"}
      </h1>
      <div className="text-sm text-gray-400 mb-6">
        {q ? "Showing related titles from your videos." : "Latest videos"}
      </div>

      {isError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg mb-6">
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
        <div className="text-gray-400 mt-8">
          {q ? "No results found." : "No videos yet."}
        </div>
      )}
    </div>
  );
};

export default Home;