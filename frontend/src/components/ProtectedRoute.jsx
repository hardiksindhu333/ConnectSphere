import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  if (status === "unknown") {
    return <div className="text-white p-6">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;