import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import VideoCard from "../../components/VideoCard.jsx";
import { useVideos } from "../../hooks/useVideos.js";

const Home = () => {
  const { data, isLoading, isError } = useVideos();

console.log("FULL:", data);
console.log("INNER:", data?.data);

const videos =
  data?.data?.docs ||
  data?.data?.videos ||
  data?.data ||
  [];

  return (
    <div className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6">

          <h1 className="text-2xl font-bold mb-6">
            Home Feed 🔥
          </h1>

          {/* Loading */}
          {isLoading && (
            <p className="text-gray-400">Loading videos...</p>
          )}

          {/* Error */}
          {isError && (
            <p className="text-red-500">Failed to load videos</p>
          )}

          {/* Empty */}
          {!isLoading && videos.length === 0 && (
            <p className="text-gray-400">No videos found</p>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;