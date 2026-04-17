import {
  Home,
  User,
  History as HistoryIcon,
  Heart,
  ListVideo,
  Users,
  LayoutDashboard,
  Upload,
  MessageSquare,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="hidden md:block w-72 shrink-0 border-r border-white/10 bg-slate-950/95 p-4 backdrop-blur-xl">
      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
        <div className="font-semibold text-white mb-1">Navigation</div>
        <p className="text-xs text-gray-400">Quick access to your feed, community, and library.</p>
      </div>
      <div className="flex flex-col gap-1">
        {[
          { to: "/", label: "Home", icon: Home },
          { to: "/community", label: "Community", icon: MessageSquare },
          { to: "/subscriptions", label: "Subscriptions", icon: Users },
          { to: "/history", label: "History", icon: HistoryIcon },
          { to: "/liked", label: "Liked videos", icon: Heart },
          { to: "/playlists", label: "Playlists", icon: ListVideo },
          { to: "/studio", label: "Creator Studio", icon: LayoutDashboard },
          { to: "/upload", label: "Upload", icon: Upload },
          { to: "/profile", label: "Profile", icon: User },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-4 py-3 rounded-3xl transition duration-200",
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-gray-300 hover:bg-white/5 hover:text-white",
                ].join(" ")
              }
              end={item.to === "/"}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;