import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { toggleLike } from "../api/like";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../api/comment";

import useAuthStore from "../store/authStore";
import API from "../api/axios.js";
import { getFeedVideos, getVideoById as getVideoApiById } from "../api/videoApi.js";
import { resolveMediaUrl } from "../utils/resolveMediaUrl.js";
import { useNavigate } from "react-router-dom";

const VideoPlayer = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { user } = useAuthStore();

  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  // 🎥 VIDEO
  const {
    data: video,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["video", id],
    enabled: !!id,
    queryFn: async () => {
      // `getVideoApiById` returns the response JSON body (ApiResponse),
      // so the actual payload is at `res.data` (not `res.data.data`).
      const res = await getVideoApiById(id);
      const value = res?.data ?? null;
      // React Query: queryFn MUST NOT return undefined
      if (value === null) throw new Error("Video not found");
      return value;
    },
  });

  // 📺 FEED
  const { data: feed = [] } = useQuery({
    queryKey: ["feed"],
    queryFn: async () => {
      const res = await getFeedVideos();
      // ApiResponse: videos array is at `res.data`
      return res?.data || [];
    },
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

  if (isLoading) return <div className="text-white p-6">Loading...</div>;
  if (isError) {
    return (
      <div className="text-white p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          {error?.message || "Failed to load video"}
        </div>
      </div>
    );
  }

  const videoSrc = resolveMediaUrl(video?.videoFile?.url);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8">

        {/* LEFT SIDE */}
        <div className="min-w-0">

          {/* VIDEO */}
          <div className="aspect-video bg-black rounded overflow-hidden">
            {videoSrc ? (
              <video
                src={videoSrc}
                controls
                autoPlay
                playsInline
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Video source missing
              </div>
            )}
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

        {/* RIGHT SIDE: RELATED */}
        <aside className="hidden lg:block">
          <h2 className="text-sm font-semibold text-gray-200 mb-3">
            Related
          </h2>
          <div className="space-y-3">
            {feed
              .filter((v) => v?._id && v._id !== id)
              .slice(0, 12)
              .map((v) => (
                <button
                  key={v._id}
                  onClick={() => navigate(`/video/${v._id}`)}
                  className="w-full text-left flex gap-3 p-2 rounded-lg hover:bg-white/5 transition"
                >
                  <div className="w-40 aspect-video bg-white/10 rounded overflow-hidden flex-shrink-0">
                    {resolveMediaUrl(v.thumbnail?.url) ? (
                      <img
                        src={resolveMediaUrl(v.thumbnail?.url)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium line-clamp-2">
                      {v.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {v.owner?.username || "Channel"}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default VideoPlayer;