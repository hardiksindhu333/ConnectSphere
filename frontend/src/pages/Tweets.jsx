import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  toggleTweetLike,
  updateTweet,
} from "../api/tweets.js";
import { resolveMediaUrl } from "../utils/resolveMediaUrl.js";
import { Heart, Pencil, Trash2 } from "lucide-react";
import { timeAgo } from "../utils/formatters.js";

function TweetCard({ tweet, currentUserId, onLike, onDelete, onUpdate, liking }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(tweet?.content || "");

  const avatar = resolveMediaUrl(tweet?.owner?.avatar?.url || tweet?.owner?.avatar);
  const mine = tweet?.owner?._id === currentUserId;

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex gap-3">
        {avatar ? (
          <img src={avatar} className="w-10 h-10 rounded-full object-cover bg-white/10" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold truncate">{tweet?.owner?.username}</div>
              <div className="text-xs text-gray-500">{timeAgo(tweet?.createdAt)}</div>
            </div>

            {mine ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing((v) => !v)}
                  className="p-2 rounded-full hover:bg-white/5 border border-white/10"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => onDelete(tweet._id)}
                  className="p-2 rounded-full hover:bg-red-500/10 border border-white/10"
                  title="Delete"
                >
                  <Trash2 size={16} className="text-red-200" />
                </button>
              </div>
            ) : null}
          </div>

          {editing ? (
            <div className="mt-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              />
              <div className="mt-2 flex gap-2 justify-end">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const content = text.trim();
                    if (!content) return toast.error("Tweet cannot be empty");
                    onUpdate(tweet._id, content);
                    setEditing(false);
                  }}
                  className="px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 whitespace-pre-wrap break-words text-gray-200">
              {tweet?.content}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onLike(tweet._id)}
              disabled={liking}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-60"
            >
              <Heart size={16} />
              <span className="text-sm font-medium">{tweet?.likesCount || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tweets() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [content, setContent] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tweets", user?._id, 1],
    enabled: !!user?._id,
    queryFn: () => getUserTweets({ userId: user._id, page: 1, limit: 20 }),
    staleTime: 10_000,
  });

  const tweets = data?.data?.docs || data?.data?.tweets || data?.data || [];

  const createMutation = useMutation({
    mutationFn: createTweet,
    onSuccess: () => {
      toast.success("Posted");
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["tweets", user?._id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTweet,
    onSuccess: () => {
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["tweets", user?._id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTweet,
    onSuccess: () => {
      toast.success("Updated");
      queryClient.invalidateQueries({ queryKey: ["tweets", user?._id] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: toggleTweetLike,
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey: ["tweets", user?._id] });
      const prev = queryClient.getQueryData(["tweets", user?._id, 1]);

      // optimistic likesCount toggle (backend returns isLiked only)
      queryClient.setQueryData(["tweets", user?._id, 1], (old) => {
        const docs = old?.data?.docs || old?.data || old;
        if (!Array.isArray(docs)) return old;
        const nextDocs = docs.map((t) => {
          if (t._id !== tweetId) return t;
          const delta = 1; // can't know direction; keep it simple
          return { ...t, likesCount: (t.likesCount || 0) + delta };
        });
        if (old?.data?.docs) return { ...old, data: { ...old.data, docs: nextDocs } };
        if (old?.data) return { ...old, data: nextDocs };
        return nextDocs;
      });

      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tweets", user?._id, 1], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tweets", user?._id] });
    },
  });

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Community</h1>
      <p className="text-sm text-gray-400 mt-1">Post updates like YouTube Community.</p>

      <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
        <div className="font-semibold">Create post</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="What’s new?"
          className="mt-3 w-full p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => {
              const c = content.trim();
              if (!c) return toast.error("Content required");
              createMutation.mutate({ content: c });
            }}
            disabled={createMutation.isPending}
            className="px-5 py-2 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-60"
          >
            {createMutation.isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {isLoading ? <div className="mt-6 text-gray-400">Loading...</div> : null}
      {isError ? (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200">
          Failed to load posts
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {tweets.map((t) => (
          <TweetCard
            key={t._id}
            tweet={t}
            currentUserId={user?._id}
            onLike={(id) => likeMutation.mutate(id)}
            onDelete={(id) => {
              const ok = window.confirm("Delete this post?");
              if (ok) deleteMutation.mutate(id);
            }}
            onUpdate={(tweetId, content) => updateMutation.mutate({ tweetId, content })}
            liking={likeMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}

