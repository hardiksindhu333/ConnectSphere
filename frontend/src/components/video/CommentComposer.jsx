import { useState } from "react";
import { Send } from "lucide-react";
import IconButton from "../ui/IconButton.jsx";

export default function CommentComposer({
  avatarSrc,
  placeholder = "Add a comment...",
  submitLabel = "Comment",
  onSubmit,
  isSubmitting,
  autoFocus,
}) {
  const [text, setText] = useState("");

  const canSubmit = text.trim().length > 0 && !isSubmitting;

  const submit = () => {
    if (!canSubmit) return;
    const content = text.trim();
    onSubmit?.(content);
    setText("");
  };

  return (
    <div className="flex gap-3">
      {avatarSrc ? (
        <img
          src={avatarSrc}
          className="w-9 h-9 rounded-full object-cover bg-white/10"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-white/10" />
      )}

      <div className="flex-1">
        <textarea
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20"
        />

        <div className="mt-2 flex justify-end">
          <IconButton
            onClick={submit}
            disabled={!canSubmit}
            className="bg-white text-black hover:bg-gray-200 border-transparent"
            title={submitLabel}
          >
            <Send size={16} />
            <span className="text-sm font-medium">
              {isSubmitting ? "Posting..." : submitLabel}
            </span>
          </IconButton>
        </div>
      </div>
    </div>
  );
}

