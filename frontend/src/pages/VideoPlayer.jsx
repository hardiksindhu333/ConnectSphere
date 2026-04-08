import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

import { toggleLike } from "../api/like";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../api/comment";

import useAuthStore from "../store/authStore";

const API = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

// 🎥 VIDEO
const getVideoById = async (id) => {
  const res = await API.get(`/videos/${id}`);
  return res.data.data;
};

// 📺 FEED
const getFeed = async () => {
  const res = await API.get(`/videos/feed`);
  return res.data.data;
};

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user } = useAuthStore();

  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  // 🎥 VIDEO
  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: () => getVideoById(id),
  });

  // 📺 FEED
  const { data: feed = [] } = useQuery({
    queryKey: ["feed"],
    queryFn: getFeed,
  });

  // ❤️ LIKE
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

  // 🔴 SUBSCRIBE
  const subscribeMutation = useMutation({
    mutationFn: async (channelId) => {
      await API.post(`/subscriptions/c/${channelId}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["video", id]);
      queryClient.invalidateQueries(["feed"]);
    },
  });

  // 💬 COMMENTS
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => getComments(id),
  });

  // ➕ ADD COMMENT / REPLY
  const commentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", id]);
      setCommentText("");
      setReplyText("");
      setReplyingTo(null);
    },
  });

  // ✏️ UPDATE
  const updateCommentMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", id]);
      setEditingCommentId(null);
    },
  });

  // ❌ DELETE
  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", id]);
    },
  });

  if (isLoading) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex gap-6">

        {/* LEFT SIDE */}
        <div className="flex-1 max-w-4xl">

          {/* VIDEO */}
          <div className="aspect-video bg-black rounded overflow-hidden">
            <video
              src={video?.videoFile?.url}
              controls
              autoPlay
              className="w-full h-full"
            />
          </div>

          {/* TITLE */}
          <h1 className="text-2xl font-bold mt-4">
            {video?.title}
          </h1>

          {/* OWNER + SUBSCRIBE */}
          <div className="flex justify-between mt-4 items-center">

            <div className="flex gap-3 items-center">
              <img
                src={video?.owner?.avatar}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p>{video?.owner?.username}</p>
                <p className="text-sm text-gray-400">
                  {video?.subscriberCount || 0} subscribers
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                subscribeMutation.mutate(video?.owner?._id)
              }
              className={`px-4 py-2 rounded ${
                video?.isSubscribed
                  ? "bg-gray-600"
                  : "bg-red-600"
              }`}
            >
              {video?.isSubscribed ? "Subscribed" : "Subscribe"}
            </button>

          </div>

          {/* LIKE */}
          <button
            onClick={() => likeMutation.mutate()}
            className="mt-4 bg-white/10 px-4 py-2 rounded"
          >
            👍 Like ({video?.likesCount || 0})
          </button>

          {/* ADD COMMENT */}
          <div className="mt-6">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-3 bg-white/10 rounded"
              placeholder="Add comment..."
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

          {/* COMMENTS */}
          <div className="mt-6 space-y-6">

            {comments.map((c) => (
              <div key={c._id}>

                {/* MAIN COMMENT */}
                <div className="flex gap-3">

                  <img
                    src={c.owner?.avatar}
                    className="w-8 h-8 rounded-full"
                  />

                  <div className="flex-1">

                    <p className="font-semibold text-sm">
                      {c.owner?.username}
                    </p>

                    {/* EDIT MODE */}
                    {editingCommentId === c._id ? (
                      <>
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 bg-white/10 rounded mt-1"
                        />

                        <button
                          onClick={() =>
                            updateCommentMutation.mutate({
                              commentId: c._id,
                              content: editText,
                            })
                          }
                          className="mt-1 bg-white text-black px-2 py-1 rounded"
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <p className="text-gray-300 mt-1">
                        {c.content}
                      </p>
                    )}

                    {/* ACTIONS */}
                    <div className="flex gap-4 text-sm text-gray-400 mt-1">

                      <button onClick={() => setReplyingTo(c._id)}>
                        Reply
                      </button>

                      {c.owner?._id === user?._id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingCommentId(c._id);
                              setEditText(c.content);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteCommentMutation.mutate(c._id)
                            }
                            className="text-red-400"
                          >
                            Delete
                          </button>
                        </>
                      )}

                    </div>

                    {/* REPLY INPUT */}
                    {replyingTo === c._id && (
                      <div className="mt-2">
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full p-2 bg-white/10 rounded"
                        />

                        <button
                          onClick={() =>
                            commentMutation.mutate({
                              videoId: id,
                              content: replyText,
                              parentComment: c._id,
                            })
                          }
                          className="mt-1 bg-white text-black px-3 py-1 rounded"
                        >
                          Reply
                        </button>
                      </div>
                    )}

                    {/* REPLIES */}
                    <div className="ml-6 mt-3 space-y-2 border-l border-gray-700 pl-4">

                      {c.replies?.map((r) => (
                        <div key={r._id} className="flex gap-2">

                          <img
                            src={r.owner?.avatar}
                            className="w-6 h-6 rounded-full"
                          />

                          <div>
                            <p className="text-sm font-semibold">
                              {r.owner?.username}
                            </p>
                            <p className="text-gray-300 text-sm">
                              {r.content}
                            </p>
                          </div>

                        </div>
                      ))}

                    </div>

                  </div>
                </div>

              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
};

export default VideoPlayer;