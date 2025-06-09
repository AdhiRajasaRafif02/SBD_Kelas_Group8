import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Pages/Contexts/AuthContext";

const InstructorRoute = ({ children }) => {
  const { user, loading, isInstructor } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if not instructor or admin
  if (!isInstructor()) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is instructor or admin, render the children
  return children;
};

export default InstructorRoute;
