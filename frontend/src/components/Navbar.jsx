import useAuthStore from "../store/authStore.js";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black sticky top-0 z-50">
      
      {/* Logo */}
      <h1
        onClick={() => navigate("/")}
        className="text-xl font-bold cursor-pointer"
      >
        ConnectSphere
      </h1>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        <span className="text-gray-300 hidden sm:block">
          {user?.fullName}
        </span>

        {/* 🔥 Upload Button */}
        <button
          onClick={() => navigate("/upload")}
          className="bg-white text-black px-4 py-1 rounded-lg hover:bg-gray-200 transition"
        >
          Upload
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-1 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>

      </div>
    </div>
  );
};

export default Navbar;