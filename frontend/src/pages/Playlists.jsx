import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPlaylist, getUserPlaylists } from "../api/playlists.js";
import useAuthStore from "../store/authStore.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Playlists() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["playlists", user?._id, search],
    enabled: !!user?._id,
    queryFn: () => getUserPlaylists({ userId: user._id, search }),
    staleTime: 30_000,
  });

  const playlists = data?.data?.playlists || [];

  const createMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      toast.success("Playlist created");
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["playlists", user?._id] });
    },
  });

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Playlists</h1>
          <p className="text-sm text-gray-400 mt-1">Organize videos you like.</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search playlists..."
          className="w-full sm:w-80 p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="font-semibold">Create playlist</div>
          <div className="mt-3 space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (required)"
              rows={3}
              className="w-full p-3 rounded-xl bg-black border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
            />
            <button
              onClick={() => {
                if (!name.trim()) return toast.error("Name is required");
                createMutation.mutate({ name: name.trim(), description: description.trim() });
              }}
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-60"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="font-semibold">Your playlists</div>

          {isLoading ? <div className="mt-4 text-gray-400">Loading...</div> : null}
          {isError ? (
            <div className="mt-4 text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              Failed to load playlists
            </div>
          ) : null}

          {!isLoading && !isError && playlists.length === 0 ? (
            <div className="mt-4 text-gray-400">No playlists yet.</div>
          ) : null}

          <div className="mt-4 space-y-2">
            {playlists.map((p) => (
              <button
                key={p._id}
                onClick={() => navigate(`/playlists/${p._id}`)}
                className="w-full text-left p-3 rounded-xl hover:bg-white/5 border border-white/10 transition"
              >
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-gray-400 line-clamp-1">
                  {p.description || "No description"}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

