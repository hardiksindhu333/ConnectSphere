import { Home, User, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-black border-r border-white/10 p-4 hidden md:block">
      
      <div className="flex flex-col gap-4">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-gray-300 hover:text-white"
        >
          <Home size={20} />
          Home
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 text-gray-300 hover:text-white"
        >
          <User size={20} />
          Profile
        </button>

        <button
          className="flex items-center gap-3 text-gray-300 hover:text-white"
        >
          <Video size={20} />
          Videos
        </button>

      </div>
    </div>
  );
};

export default Sidebar;