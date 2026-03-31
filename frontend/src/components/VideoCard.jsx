import { useNavigate } from "react-router-dom";

const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white/5 p-3 rounded-xl cursor-pointer hover:bg-white/10 transition"
      onClick={() => navigate(`/video/${video._id}`)}
    >
      {/* Thumbnail */}
      <img
        src={video.thumbnail?.url}
        alt="thumbnail"
        className="w-full h-48 object-cover rounded-lg"
      />

      <h3 className="mt-2 font-semibold">
        {video.title}
      </h3>

      <p className="text-gray-400 text-sm">
        {video.description}
      </p>
    </div>
  );
};

export default VideoCard;