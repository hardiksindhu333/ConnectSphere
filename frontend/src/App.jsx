import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore.js";

import Login from "./pages/Auth/Login.jsx";
import Signup from "./pages/Auth/Signup.jsx";
import Home from "./pages/Home/Home.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 Public Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />

        <Route
          path="/signup"
          element={user ? <Navigate to="/" /> : <Signup />}
        />

        {/* 🔒 Protected Route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* ❌ Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;