import { useSubscribedChannels } from "../hooks/useSubscribedChannels.js";
import useAuthStore from "../store/authStore.js";
import { resolveMediaUrl } from "../utils/resolveMediaUrl.js";
import { useNavigate } from "react-router-dom";

export default function Subscriptions() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data = [], isLoading, isError } = useSubscribedChannels(user?._id);

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      <p className="text-sm text-gray-400 mt-1">Channels you follow.</p>

      {isLoading ? <div className="mt-6 text-gray-400">Loading...</div> : null}
      {isError ? (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200">
          Failed to load subscriptions
        </div>
      ) : null}

      {!isLoading && !isError && data.length === 0 ? (
        <div className="mt-6 text-gray-400">You haven’t subscribed to any channels yet.</div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((c) => {
          const avatar = resolveMediaUrl(c?.avatar?.url || c?.avatar);
          return (
            <button
              key={c.channelId}
              onClick={() => navigate(`/profile`)}
              className="text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              <div className="flex items-center gap-3">
                {avatar ? (
                  <img src={avatar} className="w-12 h-12 rounded-full object-cover bg-white/10" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/10" />
                )}
                <div className="min-w-0">
                  <div className="font-semibold truncate">{c.username}</div>
                  <div className="text-xs text-gray-400 truncate">{c.channelId}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

