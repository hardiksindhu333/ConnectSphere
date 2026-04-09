import { useNavigate } from "react-router-dom";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl.js";
import { formatCompactNumber, timeAgo } from "../../utils/formatters.js";

export default function VideoListItem({ video, to }) {
  const navigate = useNavigate();
  const href = to || `/video/${video?._id || video?.videoId}`;

  const thumb =
    resolveMediaUrl(video?.thumbnail?.url || video?.thumbnail?.url) ||
    resolveMediaUrl(video?.thumbnail?.url) ||
    resolveMediaUrl(video?.thumbnail?.url);

  const title = video?.title || "";
  const views = video?.views;
  const createdAt = video?.createdAt;
  const owner = video?.owner?.username;

  return (
    <button
      onClick={() => navigate(href)}
      className="w-full text-left flex gap-3 p-2 rounded-xl hover:bg-white/5 transition"
    >
      <div className="w-48 max-w-[45%] aspect-video bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
        {thumb ? (
          <img src={thumb} className="w-full h-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold line-clamp-2">{title}</div>
        <div className="text-xs text-gray-400 mt-1">
          {owner ? `${owner} • ` : ""}
          {views != null ? `${formatCompactNumber(views)} views • ` : ""}
          {createdAt ? timeAgo(createdAt) : ""}
        </div>
      </div>
    </button>
  );
}

