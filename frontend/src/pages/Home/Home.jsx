import VideoCard from "../../components/VideoCard.jsx";
import { useVideos } from "../../hooks/useVideos.js";

const Home = () => {
  const { data, isLoading, isError } = useVideos();

  const videos =
    data?.data?.docs ||
    data?.data?.videos ||
    data?.data ||
    [];

  return (
    <div className="flex-1 p-6">

      <h1 className="text-2xl font-bold mb-6">
        Home Feed 🔥
      </h1>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Error loading videos</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

    </div>
  );
};

export default Home;