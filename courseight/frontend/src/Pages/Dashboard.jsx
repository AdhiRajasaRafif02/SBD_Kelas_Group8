import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "./Contexts/AuthContext";
import { courseAPI, assessmentAPI, progressAPI } from "./Services/serviceApi";
import { FiBook, FiFileText, FiBarChart2, FiArrowRight } from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingAssessments, setUpcomingAssessments] = useState([]);
  const [progressStats, setProgressStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch all courses to find enrolled ones
        const coursesData = await courseAPI.getAllCourses(1, 100);
        if (!coursesData.courses) {
          throw new Error("Failed to fetch courses data");
        }

        // Filter to get enrolled courses
        const userCourses = coursesData.courses.filter((course) =>
          course.students?.includes(user.id)
        );

        // For each enrolled course, fetch progress
        const coursesWithProgress = await Promise.all(
          userCourses.map(async (course) => {
            try {
              const progressData = await progressAPI.getUserProgress(
                user.id,
                course._id
              );
              return {
                id: course._id,
                title: course.title,
                instructor: course.instructor?.username || "Instructor",
                progress: progressData.progressPercentage || 0,
              };
            } catch (err) {
              console.error(
                `Error fetching progress for course ${course._id}:`,
                err
              );
              return {
                id: course._id,
                title: course.title,
                instructor: course.instructor?.username || "Instructor",
                progress: 0,
              };
            }
          })
        );

        setEnrolledCourses(coursesWithProgress);

        // Fetch all assessments
        try {
          const assessmentsData = await assessmentAPI.getAllAssessments();

          // Filter for upcoming assessments
          const upcoming = assessmentsData
            .filter((assessment) => new Date(assessment.dueDate) > new Date())
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 3);

          setUpcomingAssessments(upcoming);
        } catch (err) {
          console.error("Error fetching assessments:", err);
          setUpcomingAssessments([]);
        }

        // Prepare progress stats for chart
        const chartData = coursesWithProgress.map((course) => ({
          name:
            course.title.length > 10
              ? course.title.substring(0, 10) + "..."
              : course.title,
          progress: course.progress,
        }));

        setProgressStats(chartData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");

        // Initialize with empty data instead of mocks
        setEnrolledCourses([]);
        setUpcomingAssessments([]);
        setProgressStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, location.state]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm text-gray-600">
          Welcome back, {user?.username || "Student"}!
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 p-2 sm:p-3 rounded-md">
              <FiBook className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">
                Enrolled Courses
              </h2>
              <p className="text-xl sm:text-3xl font-bold text-gray-800">
                {enrolledCourses.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 p-2 sm:p-3 rounded-md">
              <FiFileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">
                Upcoming Assessments
              </h2>
              <p className="text-xl sm:text-3xl font-bold text-gray-800">
                {upcomingAssessments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-2 sm:p-3 rounded-md">
              <FiBarChart2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">
                Average Progress
              </h2>
              <p className="text-xl sm:text-3xl font-bold text-gray-800">
                {Math.round(
                  enrolledCourses.reduce(
                    (sum, course) => sum + course.progress,
                    0
                  ) / (enrolledCourses.length || 1)
                )}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">
            Course Progress
          </h2>
          <Link
            to="/courses"
            className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            View all <FiArrowRight className="ml-1" />
          </Link>
        </div>
        <div className="p-4 sm:p-6">
          {enrolledCourses.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-1">
                      {course.title}
                    </h3>
                    <Link
                      to={`/courses/${course.id}`}
                      className="mt-1 sm:mt-0 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 shrink-0"
                    >
                      Continue
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Instructor: {course.instructor}
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 text-xs font-medium text-gray-700 whitespace-nowrap">
                      {course.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <FiBook className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No enrolled courses
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Start learning by enrolling in a course.
              </p>
              <Link
                to="/courses"
                className="mt-3 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Assessments Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Upcoming Assessments
          </h2>
          <Link
            to="/assessments"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            View all <FiArrowRight className="ml-1" />
          </Link>
        </div>
        <div className="p-6">
          {upcomingAssessments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {assessment.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {assessment.courseTitle}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-500">
                      Due: {new Date(assessment.dueDate).toLocaleDateString()}
                    </div>
                    <Link
                      to={`/assessments/${assessment.id}`}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Take Assessment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No upcoming assessments.</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Course Progress</h2>
        </div>
        <div className="p-6">
          <div className="h-64">
            {progressStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={progressStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No progress data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
