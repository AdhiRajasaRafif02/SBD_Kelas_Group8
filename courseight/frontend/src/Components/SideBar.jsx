import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../Pages/Contexts/AuthContext";
import {
  FiHome,
  FiBook,
  FiFileText,
  FiMessageSquare,
  FiBarChart2,
  FiX,
} from "react-icons/fi";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { icon: <FiHome />, text: "Dashboard", path: "/dashboard" },
    { icon: <FiBook />, text: "Courses", path: "/courses" },
    { icon: <FiFileText />, text: "Assessments", path: "/assessments" },
    { icon: <FiMessageSquare />, text: "Discussions", path: "/discussions" },
    { icon: <FiBarChart2 />, text: "Profile", path: "/profile" },
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 h-full ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:w-64 md:flex md:flex-col md:min-h-screen`}
      >
        <div className="flex items-center justify-between p-4 md:hidden">
          <span className="font-bold text-lg text-indigo-600">
            Course<span className="text-blue-500">Eight</span>
          </span>
          <button
            type="button"
            aria-label="Close sidebar"
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none"
            onClick={closeSidebar}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-3 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              {user.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user.username}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-grow overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 768 && closeSidebar()}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                location.pathname === item.path
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="mr-3 h-5 w-5">{item.icon}</span>
              {item.text}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
