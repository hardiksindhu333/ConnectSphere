import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Auth/Login.jsx";
import Signup from "./pages/Auth/Signup.jsx";
import Home from "./pages/Home/Home.jsx";
import VideoPlayer from "./pages/VideoPlayer.jsx";
import Profile from "./pages/Profile.jsx";

import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const Layout = ({ children }) => {
  const location = useLocation();

  const hideSidebarRoutes = ["/video"]; 

  const shouldHideSidebar = hideSidebarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="bg-black text-white min-h-screen">

      <Navbar />

      <div className="flex">

        {/* ✅ CONDITIONAL SIDEBAR */}
        {!shouldHideSidebar && <Sidebar />}

        <div className="flex-1">
          {children}
        </div>

      </div>

    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🔥 WRAPPED ROUTES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/video/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <VideoPlayer />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;