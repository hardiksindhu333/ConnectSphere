import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function AppLayout() {
  const location = useLocation();
  const hideSidebarRoutes = ["/video/"];

  const shouldHideSidebar = hideSidebarRoutes.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <div className="flex">
        {!shouldHideSidebar && <Sidebar />}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

