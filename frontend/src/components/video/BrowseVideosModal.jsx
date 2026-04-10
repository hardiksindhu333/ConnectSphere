import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllVideos } from "../../api/videoApi.js";
import VideoListItem from "./VideoListItem.jsx";

export default function BrowseVideosModal({ open, onClose, title, onPickVideo }) {
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["browseVideos", q],
    enabled: open,
    queryFn: () => getAllVideos({ query: q.trim() }),
    staleTime: 15_000,
  });

  const videos =
    data?.data?.docs ||
    data?.data?.videos ||
    data?.data ||
    [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-gray-950 border border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="font-semibold">{title || "Browse videos"}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            Close
          </button>
        </div>

        <div className="p-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search videos by title..."
            className="w-full p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          />

          <div className="mt-4 max-h-[60vh] overflow-auto pr-1 space-y-2">
            {isLoading ? <div className="text-gray-400 text-sm">Loading...</div> : null}

            {videos.map((v) => (
              <div key={v._id} className="flex items-center gap-2">
                <div className="flex-1">
                  <VideoListItem video={v} to={`/video/${v._id}`} />
                </div>
                <button
                  onClick={() => onPickVideo?.(v)}
                  className="px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 text-sm font-medium"
                >
                  Add
                </button>
              </div>
            ))}

            {!isLoading && videos.length === 0 ? (
              <div className="text-gray-400 text-sm">No videos found.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

