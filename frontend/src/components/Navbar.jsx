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
      
      <h1
        onClick={() => navigate("/")}
        className="text-xl font-bold cursor-pointer"
      >
        ConnectSphere
      </h1>

      <div className="flex items-center gap-4">

        <span
          onClick={() => navigate("/profile")}
          className="text-gray-300 hidden sm:block cursor-pointer hover:text-white"
        >
          {user?.fullName}
        </span>

        <button
          onClick={() => navigate("/upload")}
          className="bg-white text-black px-4 py-1 rounded-lg hover:bg-gray-200"
        >
          Upload
        </button>

       

        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-1 rounded-lg"
        >
          Logout
        </button>

      </div>
    </div>
  );
};

export default Navbar;