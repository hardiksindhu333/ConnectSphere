const VideoCard = ({ video }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:scale-[1.02] transition">

      {/* Thumbnail */}
      <img
        src={video?.thumbnail || "https://via.placeholder.com/300"}
        alt="thumbnail"
        className="h-40 w-full object-cover"
      />

      {/* Content */}
      <div className="p-3">
        <h2 className="font-semibold text-white">
          {video?.title}
        </h2>

        <p className="text-gray-400 text-sm">
          {video?.owner?.fullName || "Unknown"} • {video?.views || 0} views
        </p>
      </div>
    </div>
  );
};

export default VideoCard;