import { Heart, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import IconButton from "../ui/IconButton.jsx";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl.js";
import { timeAgo } from "../../utils/formatters.js";
import CommentComposer from "./CommentComposer.jsx";

export default function CommentThread({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isLiking,
  isDeleting,
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.content || "");

  const avatar = resolveMediaUrl(comment?.owner?.avatar?.url || comment?.owner?.avatar);

  const mine = comment?.owner?._id && currentUserId && comment.owner._id === currentUserId;

  return (
    <div className="flex gap-3">
      {avatar ? (
        <img src={avatar} className="w-9 h-9 rounded-full object-cover bg-white/10" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-white/10" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">{comment?.owner?.username}</div>
          <div className="text-xs text-gray-500">{timeAgo(comment?.createdAt)}</div>
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full resize-none p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <div className="mt-2 flex gap-2">
              <IconButton
                onClick={() => {
                  const content = editText.trim();
                  if (!content) return;
                  onEdit?.(comment._id, content);
                  setIsEditing(false);
                }}
                className="bg-white text-black hover:bg-gray-200 border-transparent"
              >
                <span className="text-sm font-medium">Save</span>
              </IconButton>
              <IconButton onClick={() => setIsEditing(false)}>
                <span className="text-sm font-medium">Cancel</span>
              </IconButton>
            </div>
          </div>
        ) : (
          <div className="mt-1 text-gray-200 whitespace-pre-wrap break-words">
            {comment?.content}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <IconButton onClick={() => onLike?.(comment._id)} disabled={isLiking} title="Like">
            <Heart size={16} />
            <span className="text-sm text-gray-300">{comment?.likesCount || 0}</span>
          </IconButton>

          <IconButton
            onClick={() => setIsReplying((v) => !v)}
            title="Reply"
          >
            <MessageSquare size={16} />
            <span className="text-sm text-gray-300">Reply</span>
          </IconButton>

          {mine ? (
            <>
              <IconButton onClick={() => setIsEditing(true)} title="Edit">
                <Pencil size={16} />
                <span className="text-sm text-gray-300">Edit</span>
              </IconButton>
              <IconButton
                onClick={() => onDelete?.(comment._id)}
                disabled={isDeleting}
                className="hover:bg-red-500/10"
                title="Delete"
              >
                <Trash2 size={16} />
                <span className="text-sm text-red-300">Delete</span>
              </IconButton>
            </>
          ) : null}
        </div>

        {isReplying ? (
          <div className="mt-3">
            <CommentComposer
              avatarSrc={null}
              placeholder="Write a reply..."
              submitLabel="Reply"
              onSubmit={(content) => {
                onReply?.(comment._id, content);
                setIsReplying(false);
              }}
              autoFocus
            />
          </div>
        ) : null}

        {comment?.replies?.length ? (
          <div className="mt-4 pl-4 border-l border-white/10 space-y-4">
            {comment.replies.map((r) => {
              const rAvatar = resolveMediaUrl(r?.owner?.avatar?.url || r?.owner?.avatar);
              return (
                <div key={r._id} className="flex gap-3">
                  {rAvatar ? (
                    <img
                      src={rAvatar}
                      className="w-8 h-8 rounded-full object-cover bg-white/10"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{r?.owner?.username}</div>
                      <div className="text-xs text-gray-500">{timeAgo(r?.createdAt)}</div>
                    </div>
                    <div className="mt-1 text-gray-200 whitespace-pre-wrap break-words">
                      {r?.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

