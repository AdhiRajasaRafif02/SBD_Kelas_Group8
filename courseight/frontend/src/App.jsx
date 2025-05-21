import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./Pages/Contexts/AuthContext";
import { Toaster } from "react-hot-toast";

// Public components
import Landing from "./Pages/Landing";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";

// Layout components
import MainLayout from "./Components/MainLayout";
import PublicRoute from "./Components/PublicRoute";
import ProtectedRoute from "./Components/ProtectedRoute";
import InstructorRoute from "./Components/InstructorRoute";

// Components for both roles
import UserProfile from "./Pages/UserProfile";
import NotFound from "./Pages/NotFound";

// Student components
import Dashboard from "./Pages/Dashboard";
import CourseList from "./Pages/Course/CourseList";
import CourseDetail from "./Pages/Course/CourseDetail";
import AssessmentList from "./Pages/Assesment/AssessmentList";
import AssessmentDetail from "./Pages/Assesment/AssessmentDetail";
import AssessmentResult from "./Pages/Assesment/AssessmentResult";
import DiscussionList from "./Pages/Discussion/DiscussionList";
import DiscussionDetail from "./Pages/Discussion/DiscussionDetail";

// Instructor components
import InstructorDashboard from "./Pages/InstructorDashboard";
import CourseManagement from "./Pages/Course/CourseManagement";
import CourseCreation from "./Pages/Course/CourseCreate";
import AssessmentManagement from "./Pages/Assesment/AssessmentManagement";
import AssessmentCreation from "./Pages/Assesment/AssessmentCreate";
import InstructorAssessmentDetail from "./Pages/Assesment/InstructorAssessmentDetail";
import StudentStatistics from "./Pages/Statistics/StudentStatistics";
import InstructorCourseDetail from "./Pages/Course/InstructorCourseDetail";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* Public routes */}
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
            {/* Routes accessible to both roles */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            {/* Instructor Routes */}
            <Route
              path="/instructor/dashboard"
              element={
                <InstructorRoute>
                  <InstructorDashboard />
                </InstructorRoute>
              }
            />
            <Route
              path="/instructor/courses"
              element={
                <InstructorRoute>
                  <CourseManagement />
                </InstructorRoute>
              }
            />
            <Route
              path="/instructor/courses/create"
              element={
                <InstructorRoute>
                  <CourseCreation />
                </InstructorRoute>
              }
            />
            {/* <Route
              path="/instructor/courses/edit/:id"
              element={
                <InstructorRoute>
                  <CourseEdit />
                </InstructorRoute>
              }
            /> */}
            <Route
              path="/instructor/courses/:courseId/assessments"
              element={
                <InstructorRoute>
                  <AssessmentManagement />
                </InstructorRoute>
              }
            />
            <Route
              path="/instructor/assessments/:id"
              element={
                <InstructorRoute>
                  <InstructorAssessmentDetail />
                </InstructorRoute>
              }
            />
            <Route
              path="/instructor/assessments"
              element={
                <InstructorRoute>
                  <AssessmentManagement />
                </InstructorRoute>
              }
            />
            <Route
              path="/instructor/assessments/create"
              element={
                <InstructorRoute>
                  <AssessmentCreation />
                </InstructorRoute>
              }
            />
            <Route
              path="/instructor/courses/:courseId/assessments/create"
              element={
                <InstructorRoute>
                  <AssessmentCreation />
                </InstructorRoute>
              }
            />
            {/* <Route
              path="/instructor/assessments/:id/edit"
              element={
                <InstructorRoute>
                  <AssessmentEdit />
                </InstructorRoute>
              }
            /> */}
            <Route
              path="/instructor/courses/:courseId/statistics"
              element={
                <InstructorRoute>
                  <StudentStatistics />
                </InstructorRoute>
              }
            />
            <Route
              path="/instructor/courses/:id"
              element={
                <InstructorRoute>
                  <InstructorCourseDetail />
                </InstructorRoute>
              }
            />

            {/* Student Routes */}
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
              path="/assessments/result/:id"
              element={
                <ProtectedRoute>
                  <AssessmentResult />
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
          </Route>

          {/* Not found page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
