import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login.jsx";
import Signup from "../pages/Auth/Signup.jsx";
import VerifyOtp from "../pages/Auth/VerifyOtp.jsx";

import Home from "../pages/Home/Home.jsx";
import VideoPlayer from "../pages/VideoPlayer.jsx";
import Profile from "../pages/Profile.jsx";
import UploadVideo from "../pages/Upload/UploadVideo.jsx";

import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AppLayout from "../layouts/AppLayout.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/video/:id" element={<VideoPlayer />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<UploadVideo />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

