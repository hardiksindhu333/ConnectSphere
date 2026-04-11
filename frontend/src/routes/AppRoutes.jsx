import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login.jsx";
import Signup from "../pages/Auth/Signup.jsx";
import ForgotPassword from "../pages/Auth/ForgotPassword.jsx";

import Home from "../pages/Home/Home.jsx";
import VideoPlayer from "../pages/VideoPlayer.jsx";
import Profile from "../pages/Profile.jsx";
import UploadVideo from "../pages/Upload/UploadVideo.jsx";
import History from "../pages/History.jsx";
import Liked from "../pages/Liked.jsx";
import Subscriptions from "../pages/Subscriptions.jsx";
import Playlists from "../pages/Playlists.jsx";
import PlaylistDetail from "../pages/PlaylistDetail.jsx";
import Studio from "../pages/Studio.jsx";
import Tweets from "../pages/Tweets.jsx";

import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AppLayout from "../layouts/AppLayout.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

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
        <Route path="/history" element={<History />} />
        <Route path="/liked" element={<Liked />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlists/:id" element={<PlaylistDetail />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/community" element={<Tweets />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

