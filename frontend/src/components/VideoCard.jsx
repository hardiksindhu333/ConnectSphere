import { useNavigate } from "react-router-dom";
import { resolveMediaUrl } from "../utils/resolveMediaUrl.js";
import { formatCompactNumber, timeAgo } from "../utils/formatters.js";

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const thumbnailUrl = resolveMediaUrl(video?.thumbnail?.url);

  return (
    <div
      className="surface-card cursor-pointer overflow-hidden rounded-[28px] transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
      onClick={() => navigate(`/video/${video._id}`)}
    >
      {/* Thumbnail */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="thumbnail"
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 bg-white/10" />
      )}

      <div className="bg-slate-950/90 p-4">
        <h3 className="font-semibold text-lg leading-tight text-white line-clamp-2">
          {video.title}
        </h3>

        <div className="mt-3 flex flex-col gap-1 text-sm text-gray-400">
          <span>{video?.owner?.username || "Unknown channel"}</span>
          <span>
            {formatCompactNumber(video?.views)} views • {timeAgo(video?.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;