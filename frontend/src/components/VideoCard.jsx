import { useNavigate } from "react-router-dom";
import { resolveMediaUrl } from "../utils/resolveMediaUrl.js";

const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  const thumbnailUrl = resolveMediaUrl(video?.thumbnail?.url);

  return (
    <div
      className="bg-white/5 p-3 rounded-xl cursor-pointer hover:bg-white/10 transition"
      onClick={() => navigate(`/video/${video._id}`)}
    >
      {/* Thumbnail */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="thumbnail"
          className="w-full h-48 object-cover rounded-lg"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 rounded-lg bg-white/10" />
      )}

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