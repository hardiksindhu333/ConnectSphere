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
    <div className="w-64 bg-black border-r border-white/10 p-4 hidden md:block">
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
                  "flex items-center gap-3 px-3 py-2 rounded-xl transition",
                  isActive
                    ? "bg-white/10 text-white"
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
    </div>
  );
};

export default Sidebar;