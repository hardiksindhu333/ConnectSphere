import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

import { toggleLike } from "../api/like";
import { getComments, addComment } from "../api/comment";

// 🎥 FETCH VIDEO
const getVideoById = async (id) => {
  const res = await axios.get(
    `http://localhost:3000/api/v1/videos/${id}`,
    { withCredentials: true }
  );
  return res.data.data;
};

const VideoPlayer = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");

  // 🎥 VIDEO DATA
  const { data: video } = useQuery({
    queryKey: ["video", id],
    queryFn: () => getVideoById(id),
  });

  // ❤️ LIKE SYSTEM
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(id),

    onSuccess: (data) => {
      queryClient.setQueryData(["video", id], (old) => {
        if (!old) return old;

        return {
          ...old,
          likesCount: data?.data?.likesCount ?? old.likesCount,
        };
      });
    },
  });

  // 💬 FETCH COMMENTS
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => getComments(id),
  });

  // 💬 ADD COMMENT
  const commentMutation = useMutation({
    mutationFn: addComment,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setCommentText("");
    },
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* 🎥 VIDEO PLAYER */}
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <video
            src={video?.videoFile?.url}
            controls
            autoPlay
            className="absolute top-0 left-0 w-full h-full object-contain"
          />
        </div>

        {/* 📌 TITLE */}
        <h1 className="text-2xl font-bold mt-4">
          {video?.title}
        </h1>

        {/* 📝 DESCRIPTION */}
        <p className="text-gray-400 mt-2">
          {video?.description}
        </p>

        {/* 👤 OWNER */}
        <div className="flex items-center gap-3 mt-4">
          <img
            src={video?.owner?.avatar}
            className="w-10 h-10 rounded-full"
          />
          <span>{video?.owner?.username}</span>
        </div>

        {/* ❤️ LIKE BUTTON */}
        <button
          key={video?.likesCount}
          onClick={() => likeMutation.mutate()}
          className="bg-white/10 px-4 py-2 rounded mt-4 hover:bg-white/20"
        >
          👍 Like ({video?.likesCount || 0})
        </button>

        {/* 💬 ADD COMMENT */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-3 rounded bg-white/10 outline-none"
          />

          <button
            onClick={() =>
              commentMutation.mutate({
                videoId: id,
                content: commentText,
              })
            }
            className="mt-2 bg-white text-black px-4 py-2 rounded"
          >
            Comment
          </button>
        </div>

        {/* 💬 COMMENTS LIST */}
        <div className="mt-6 space-y-4">
          {comments.length === 0 && (
            <p className="text-gray-400">No comments yet</p>
          )}

          {comments.map((c) => (
            <div key={c._id} className="bg-white/5 p-3 rounded">
              
              <div className="flex items-center gap-2">
                <img
                  src={c.owner?.avatar}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold">
                  {c.owner?.username}
                </span>
              </div>

              <p className="mt-2 text-gray-300">
                {c.content}
              </p>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default VideoPlayer;