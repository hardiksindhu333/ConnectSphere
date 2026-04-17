import useAuthStore from "../store/authStore.js";
import { NavLink, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../api/authApi.js";
import toast from "react-hot-toast";
import { Search, Menu } from "lucide-react";
import { resolveMediaUrl } from "../utils/resolveMediaUrl.js";
import { useState, useEffect, useRef } from "react";

const Navbar = ({ onMobileMenuClick }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success("Logged out");
      navigate("/login");
    },
  });

  const avatar = resolveMediaUrl(user?.avatar?.url || user?.avatar);

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 min-w-0">
          <h1
            onClick={() => navigate("/")}
            className="text-xl sm:text-2xl font-bold tracking-tight cursor-pointer whitespace-nowrap text-white"
          >
            ConnectSphere
          </h1>

          <div className="hidden md:flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 w-[420px] max-w-[45vw]">
            <Search size={16} className="text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search (title)..."
              className="bg-transparent outline-none text-sm w-full text-gray-200 placeholder:text-gray-500"
            />
            <button
              onClick={() => navigate(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/")}
              className="btn-secondary text-xs"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10 md:hidden"
            onClick={() => typeof onMobileMenuClick === "function" && onMobileMenuClick()}
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>

          <NavLink
            to="/upload"
            className="btn-primary text-sm"
          >
            Upload
          </NavLink>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
            className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/5 transition"
          >
            {avatar ? (
              <img src={avatar} className="w-9 h-9 rounded-full object-cover bg-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/10" />
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-black/90 border border-white/10 rounded-md p-4 text-sm z-50">
              <div className="flex items-center gap-3">
                {avatar ? (
                  <img src={avatar} className="w-12 h-12 rounded-full object-cover bg-white/10" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/10" />
                )}
                <div className="truncate">
                  <div className="font-medium text-gray-100">{user?.fullName || user?.username}</div>
                  <div className="text-gray-400 text-xs truncate">{user?.email}</div>
                  <div className="text-gray-400 text-xs">{user?.username && `@${user.username}`}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/profile?edit=1");
                  }}
                  className="btn-secondary text-sm"
                >
                  Edit profile
                </button>

                <button
                  onClick={() => logoutMutation.mutate()}
                  className="rounded-full bg-red-500/90 px-3 py-1 text-sm font-medium transition hover:bg-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default Navbar;