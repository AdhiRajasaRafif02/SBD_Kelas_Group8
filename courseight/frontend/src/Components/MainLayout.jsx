import { Outlet, Navigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../Pages/Contexts/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./SideBar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useContext(AuthContext);

  // Close sidebar when clicked outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar");
      const toggleButton = document.getElementById("sidebar-toggle");

      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        toggleButton &&
        !toggleButton.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // Close sidebar when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 pt-16">
        {" "}
        {/* Space for fixed navbar */}
        <Sidebar
          id="sidebar"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-300 w-full">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
