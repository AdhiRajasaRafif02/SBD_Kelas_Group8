import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../Pages/Contexts/AuthContext";
import {
  FiHome,
  FiBook,
  FiFileText,
  FiMessageSquare,
  FiUsers,
  FiBarChart2,
  FiPlusCircle,
  FiUser,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user, isInstructor, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  // Navigation items based on role
  const studentNavItems = [
    { icon: <FiHome />, text: "Dashboard", path: "/dashboard" },
    { icon: <FiBook />, text: "Courses", path: "/courses" },
    { icon: <FiFileText />, text: "Assessments", path: "/assessments" },
    { icon: <FiMessageSquare />, text: "Discussions", path: "/discussions" },
    { icon: <FiUser />, text: "Profile", path: "/profile" },
  ];

  const instructorNavItems = [
    {
      icon: <FiHome />,
      text: "Instructor Dashboard",
      path: "/instructor/dashboard",
    },
    { icon: <FiBook />, text: "Manage Courses", path: "/instructor/courses" },
    {
      icon: <FiFileText />,
      text: "Manage Assessments",
      path: "/instructor/assessments",
    },
    {
      icon: <FiUsers />,
      text: "Student Management",
      path: "/instructor/students",
    },
    { icon: <FiMessageSquare />, text: "Discussions", path: "/discussions" },
    { divider: true },
    {
      icon: <FiHome />,
      text: "Student View",
      path: "/dashboard",
      accent: true,
    },
    { icon: <FiUser />, text: "Profile", path: "/profile" },
  ];

  const navItems = isInstructor() ? instructorNavItems : studentNavItems;

  // Check if current route is active
  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:shadow-none lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:w-64 lg:flex-shrink-0 flex flex-col h-full overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg text-indigo-600">
            Course<span className="text-blue-500">Eight</span>
          </span>
          <button
            type="button"
            aria-label="Close sidebar"
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none lg:hidden"
            onClick={closeSidebar}
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              {user.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              {user.role && user.role !== "student" && (
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-grow overflow-y-auto">
          {navItems.map((item, index) =>
            item.divider ? (
              <div
                key={`divider-${index}`}
                className="my-4 border-t border-gray-200"
              ></div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && closeSidebar()}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.path)
                    ? "bg-indigo-50 text-indigo-700"
                    : item.accent
                    ? "text-green-700 bg-green-50 hover:bg-green-100"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={`mr-3 h-5 w-5 transition-colors ${
                    item.accent ? "text-green-600" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.text}</span>
              </Link>
            )
          )}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
          >
            <FiLogOut className="mr-3 h-5 w-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
