import { useQuery } from "@tanstack/react-query";
import { getMyProfile, getMyVideos } from "../api/user";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ["myVideos"],
    queryFn: getMyVideos,
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* PROFILE */}
      <div className="flex items-center gap-6 mb-10">
        <img
          src={user?.avatar}
          className="w-24 h-24 rounded-full border"
        />

        <div>
          <h1 className="text-3xl font-bold">
            {user?.username}
          </h1>
          <p className="text-gray-400">
            {user?.email}
          </p>
        </div>
      </div>

      {/* VIDEOS */}
      <h2 className="text-xl font-semibold mb-4">
        Your Videos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

        {videos.length === 0 && (
          <p className="text-gray-400">No videos uploaded</p>
        )}

        {videos.map((video) => (
          <div
            key={video._id}
            onClick={() => navigate(`/video/${video._id}`)}
            className="cursor-pointer bg-white/5 rounded-lg overflow-hidden hover:scale-105 transition"
          >
            <img
              src={video.thumbnail?.url}
              className="w-full h-48 object-cover"
            />

            <div className="p-3">
              <h3 className="font-semibold">
                {video.title}
              </h3>

              <p className="text-sm text-gray-400">
                {video.views || 0} views
              </p>
            </div>
          </div>
        ))}

      </div>

    </div>
  );
};

export default Profile;