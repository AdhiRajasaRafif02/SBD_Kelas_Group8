import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Pages/Contexts/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Redirect to dashboard if user is already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is not logged in, render the children (public pages)
  return children;
};

export default PublicRoute;
