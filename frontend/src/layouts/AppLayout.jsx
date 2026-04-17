import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hideSidebarRoutes = ["/video/"];

  const shouldHideSidebar = hideSidebarRoutes.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar onMobileMenuClick={() => setSidebarOpen(true)} />
      <div className="flex min-h-[calc(100vh-72px)]">
        {!shouldHideSidebar && (
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

