import { useState } from "react";

const VideoCard = ({ video }) => {
  const [play, setPlay] = useState(false);

  return (
    <div className="bg-white/5 p-3 rounded-xl">

      {/* 🎥 THUMBNAIL / VIDEO SWITCH */}
      {!play ? (
        <img
          src={video.thumbnail?.url}
          alt="thumbnail"
          onClick={() => setPlay(true)}
          className="w-full h-48 object-cover rounded-lg cursor-pointer"
        />
      ) : (
        <video
          src={video.videoFile?.url}
          controls
          autoPlay
          className="w-full h-48 object-cover rounded-lg"
        />
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