import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { toggleCommentLike, toggleLike } from "../api/like";
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
import { Heart, MessageSquareText } from "lucide-react";
import IconButton from "../components/ui/IconButton.jsx";
import SubscribeButton from "../components/video/SubscribeButton.jsx";
import CommentComposer from "../components/video/CommentComposer.jsx";
import CommentThread from "../components/video/CommentThread.jsx";
import { formatCompactNumber } from "../utils/formatters.js";
import { useSubscribedChannels } from "../hooks/useSubscribedChannels.js";
import { useLikedVideos } from "../hooks/useLikedVideos.js";
import SaveToPlaylistModal from "../components/video/SaveToPlaylistModal.jsx";
import { Bookmark } from "lucide-react";

const VideoPlayer = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const [saveOpen, setSaveOpen] = useState(false);

  // NOTE: Hooks must be called before early returns
  const { data: subscribedChannels = [] } = useSubscribedChannels(user?._id);
  const { data: likedVideos = [] } = useLikedVideos();

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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["video", id] });
      const previous = queryClient.getQueryData(["video", id]);
      queryClient.setQueryData(["video", id], (old) => {
        if (!old) return old;
        const wasLiked = !!old.isLikedByUser;
        return {
          ...old,
          isLikedByUser: !wasLiked,
          likesCount: Math.max(0, (old.likesCount || 0) + (wasLiked ? -1 : 1)),
        };
      });
      return { previous };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["video", id], (old) => {
        if (!old) return old;
        return {
          ...old,
          likesCount: data?.data?.likesCount ?? old.likesCount,
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["likedVideos"] });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["video", id], ctx.previous);
    },
  });

  // 🔴 SUBSCRIBE
  const subscribeMutation = useMutation({
    mutationFn: async (channelId) => {
      const res = await API.post(`/subscriptions/c/${channelId}`);
      return res.data;
    },
    onMutate: async (channelId) => {
      await queryClient.cancelQueries({ queryKey: ["video", id] });
      const previous = queryClient.getQueryData(["video", id]);
      queryClient.setQueryData(["video", id], (old) => {
        if (!old) return old;
        if (!channelId || old?.owner?._id !== channelId) return old;
        const was = !!old.isSubscribed;
        return {
          ...old,
          isSubscribed: !was,
          subscriberCount: Math.max(
            0,
            (old.subscriberCount || 0) + (was ? -1 : 1)
          ),
        };
      });
      return { previous };
    },
    onSuccess: (res) => {
      const isSubscribed = res?.data?.isSubscribed;
      if (typeof isSubscribed !== "boolean") return;
      queryClient.setQueryData(["video", id], (old) => {
        if (!old) return old;
        return { ...old, isSubscribed };
      });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["video", id], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["video", id] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["subscribedChannels", user?._id] });
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
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["video", id] });
    },
  });

  // UPDATE
  const updateCommentMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
  });

  // DELETE
  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["video", id] });
    },
  });

  const commentLikeMutation = useMutation({
    mutationFn: toggleCommentLike,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["comments", id] }),
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
  const ownerAvatar = resolveMediaUrl(video?.owner?.avatar?.url || video?.owner?.avatar);

  // derive subscription/like state (because backend video routes are public and don't run verifyJWT)
  const subscribedSet = new Set(subscribedChannels.map((c) => c.channelId));
  const derivedIsSubscribed = !!(video?.owner?._id && subscribedSet.has(video.owner._id));

  const likedSet = new Set(likedVideos.map((v) => v.videoId));
  const derivedIsLiked = !!(id && likedSet.has(id));

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <SaveToPlaylistModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        videoId={id}
      />
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
          <div className="flex justify-between mt-4 items-center gap-4">

            <div className="flex gap-3 items-center">
              {ownerAvatar ? (
                <img
                  src={ownerAvatar}
                  className="w-10 h-10 rounded-full object-cover bg-white/10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/10" />
              )}
              <div>
                <p className="font-semibold">{video?.owner?.username}</p>
                <p className="text-sm text-gray-400">
                  {formatCompactNumber(video?.subscriberCount || 0)} subscribers
                </p>
              </div>
            </div>

            <SubscribeButton
              isSubscribed={derivedIsSubscribed}
              disabled={subscribeMutation.isPending || !video?.owner?._id}
              onClick={() => subscribeMutation.mutate(video?.owner?._id)}
            />

          </div>

          {/* ACTIONS */}
          <div className="mt-4 flex flex-wrap gap-2">
            <IconButton
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={derivedIsLiked ? "bg-white/15" : ""}
              title="Like"
            >
              <Heart size={16} />
              <span className="text-sm font-medium">
                {formatCompactNumber(video?.likesCount || 0)}
              </span>
            </IconButton>
            <IconButton title="Comments">
              <MessageSquareText size={16} />
              <span className="text-sm font-medium">
                {formatCompactNumber(video?.commentsCount || 0)}
              </span>
            </IconButton>
            <IconButton onClick={() => setSaveOpen(true)} title="Save to playlist">
              <Bookmark size={16} />
              <span className="text-sm font-medium">Save</span>
            </IconButton>
          </div>

          {/* ADD COMMENT */}
          <div className="mt-8">
            <div className="text-sm font-semibold text-gray-200 mb-4">
              Comments ({formatCompactNumber(video?.commentsCount || comments.length || 0)})
            </div>
            <CommentComposer
              avatarSrc={resolveMediaUrl(user?.avatar?.url || user?.avatar)}
              onSubmit={(content) =>
                commentMutation.mutate({
                  videoId: id,
                  content,
                })
              }
              isSubmitting={commentMutation.isPending}
            />
          </div>

          {/* COMMENTS */}
          <div className="mt-6 space-y-6">
            {comments.length === 0 ? (
              <div className="text-gray-400 text-sm">
                Be the first to comment.
              </div>
            ) : null}

            {comments.map((c) => (
              <CommentThread
                key={c._id}
                comment={c}
                currentUserId={user?._id}
                onReply={(parentId, content) =>
                  commentMutation.mutate({
                    videoId: id,
                    content,
                    parentComment: parentId,
                  })
                }
                onEdit={(commentId, content) =>
                  updateCommentMutation.mutate({ commentId, content })
                }
                onDelete={(commentId) => {
                  const ok = window.confirm("Delete this comment?");
                  if (ok) deleteCommentMutation.mutate(commentId);
                }}
                onLike={(commentId) => commentLikeMutation.mutate(commentId)}
                isLiking={commentLikeMutation.isPending}
                isDeleting={deleteCommentMutation.isPending}
              />
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