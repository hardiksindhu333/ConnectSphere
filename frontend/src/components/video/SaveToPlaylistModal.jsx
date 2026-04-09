import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore.js";
import { getUserPlaylists, addVideoToPlaylist, removeVideoFromPlaylist } from "../../api/playlists.js";

export default function SaveToPlaylistModal({ open, onClose, videoId }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [addedTo, setAddedTo] = useState(() => new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["playlists", user?._id, search],
    enabled: open && !!user?._id,
    queryFn: () => getUserPlaylists({ userId: user._id, search }),
    staleTime: 30_000,
  });

  const playlists = data?.data?.playlists || [];

  const addMutation = useMutation({
    mutationFn: addVideoToPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", user?._id] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeVideoFromPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", user?._id] });
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-950 border border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="font-semibold">Save to playlist</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your playlists..."
            className="w-full p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          />

          <div className="mt-4 space-y-2 max-h-[55vh] overflow-auto pr-1">
            {isLoading ? <div className="text-gray-400 text-sm">Loading...</div> : null}

            {playlists.map((p) => {
              const checked = addedTo.has(p._id);
              return (
                <label
                  key={p._id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {p.description || "No description"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked;
                        if (!videoId) return;
                        setAddedTo((prev) => {
                          const n = new Set(prev);
                          if (next) n.add(p._id);
                          else n.delete(p._id);
                          return n;
                        });
                        if (next) addMutation.mutate({ playlistId: p._id, videoId });
                        else removeMutation.mutate({ playlistId: p._id, videoId });
                      }}
                      className="w-5 h-5"
                    />
                  </div>
                </label>
              );
            })}

            {!isLoading && playlists.length === 0 ? (
              <div className="text-gray-400 text-sm">No playlists found.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

