import { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Pages/Contexts/AuthContext";
import { FiMenu, FiX, FiBell, FiUser, FiLogOut, FiHome } from "react-icons/fi";

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Determine if current route is active
  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <nav className="fixed w-full bg-white shadow-sm z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Hamburger menu for mobile */}
            {user && (
              <button
                id="sidebar-toggle"
                type="button"
                aria-label="Toggle sidebar"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
                onClick={toggleSidebar}
              >
                {sidebarOpen ? (
                  <FiX className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <FiMenu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            )}

            {/* Logo */}
            <Link
              to={user ? "/dashboard" : "/"}
              className="flex-shrink-0 flex items-center ml-0 sm:ml-4"
            >
              <span className="font-bold text-xl sm:text-2xl text-indigo-600">
                Course<span className="text-blue-500">Eight</span>
              </span>
            </Link>

            {/* Desktop navigation */}
            {user && (
              <div className="hidden lg:ml-6 lg:flex lg:space-x-6">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/dashboard")
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FiHome className="mr-1" /> Dashboard
                </Link>
                <Link
                  to="/courses"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/courses")
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Courses
                </Link>
                <Link
                  to="/assessments"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/assessments")
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Assessments
                </Link>
                <Link
                  to="/discussions"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/discussions")
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Discussions
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="ml-3 relative" ref={dropdownRef}>
                <div>
                  <button
                    type="button"
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      {user.username?.charAt(0).toUpperCase() || <FiUser />}
                    </div>
                  </button>
                </div>

                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 text-xs text-gray-500">
                      Signed in as{" "}
                      <span className="font-bold truncate block">
                        {user.username}
                      </span>
                    </div>

                    <hr />

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiUser className="mr-2" /> Profile
                    </Link>

                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={handleLogout}
                    >
                      <FiLogOut className="mr-2" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2 sm:space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
