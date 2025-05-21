import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./Pages/Contexts/AuthContext";

// Layout
import MainLayout from "./Components/MainLayout";
import ProtectedRoute from "./Components/ProtectedRoute";
import PublicRoute from "./Components/PublicRoute";

// Pages
import Landing from "./Pages/Landing";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import CourseList from "./Pages/Course/CourseList";
import CourseDetail from "./Pages/Course/CourseDetail";
import AssessmentList from "./Pages/Assesment/AssessmentList";
import AssessmentDetail from "./Pages/Assesment/AssessmentDetail";
import DiscussionList from "./Pages/Discussion/DiscussionList";
import DiscussionDetail from "./Pages/Discussion/DiscussionDetail";
import UserProfile from "./Pages/UserProfile";
import NotFound from "./Pages/NotFound";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* Public routes - redirect to dashboard if already logged in */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected routes - require authentication */}
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CourseList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:id"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments"
              element={
                <ProtectedRoute>
                  <AssessmentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments/:id"
              element={
                <ProtectedRoute>
                  <AssessmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discussions"
              element={
                <ProtectedRoute>
                  <DiscussionList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discussions/:id"
              element={
                <ProtectedRoute>
                  <DiscussionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Root redirect for logged in users */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
