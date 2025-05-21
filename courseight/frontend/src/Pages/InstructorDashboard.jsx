import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./Contexts/AuthContext";
import { courseAPI, progressAPI } from "./Services/serviceApi";
import {
  FiUsers,
  FiBook,
  FiFileText,
  FiBarChart2,
  FiPlusCircle,
  FiArrowRight,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";

const InstructorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalAssessments: 0,
    completionRate: 0,
  });
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch instructor's courses
        const coursesData = await courseAPI.getCoursesByInstructor(user.id);
        setCourses(coursesData || []);

        // Calculate statistics
        const totalCourses = coursesData?.length || 0;
        let totalStudents = 0;
        let totalAssessments = 0;

        const courseStatsData = [];

        // Process course data for statistics
        if (coursesData?.length > 0) {
          coursesData.forEach((course) => {
            const studentCount = course.students?.length || 0;
            totalStudents += studentCount;

            const assessmentCount = course.assessments?.length || 0;
            totalAssessments += assessmentCount;

            // Add course stats for the chart
            courseStatsData.push({
              name:
                course.title.length > 20
                  ? course.title.substring(0, 20) + "..."
                  : course.title,
              students: studentCount,
              assessments: assessmentCount,
            });
          });
        }

        setCourseStats(courseStatsData);

        // Set overall statistics
        setStatistics({
          totalCourses,
          totalStudents,
          totalAssessments,
          // This is a placeholder - ideally fetch from backend
          completionRate:
            totalStudents > 0 ? Math.floor(Math.random() * 100) : 0,
        });

        // Fetch recent students (placeholder)
        // In a real implementation, this would come from an API call
        if (totalStudents > 0) {
          setStudents([
            {
              id: 1,
              name: "Student 1",
              course: coursesData[0]?.title,
              progress: 75,
            },
            {
              id: 2,
              name: "Student 2",
              course: coursesData[0]?.title,
              progress: 45,
            },
            {
              id: 3,
              name: "Student 3",
              course: coursesData[0]?.title,
              progress: 90,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Instructor Dashboard
        </h1>
        <p className="text-sm text-gray-600">
          Welcome back, {user?.username || "Instructor"}!
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-md">
              <FiBook className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-base font-medium text-gray-900">
                Total Courses
              </h2>
              <p className="text-3xl font-bold text-gray-800">
                {statistics.totalCourses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-3 rounded-md">
              <FiUsers className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-base font-medium text-gray-900">
                Total Students
              </h2>
              <p className="text-3xl font-bold text-gray-800">
                {statistics.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-md">
              <FiFileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-base font-medium text-gray-900">
                Assessments
              </h2>
              <p className="text-3xl font-bold text-gray-800">
                {statistics.totalAssessments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-md">
              <FiBarChart2 className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-base font-medium text-gray-900">
                Completion Rate
              </h2>
              <p className="text-3xl font-bold text-gray-800">
                {statistics.completionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/instructor/courses/create"
              className="flex flex-col items-center p-4 border rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="bg-indigo-100 p-3 rounded-full">
                <FiPlusCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <p className="mt-2 font-medium">Create New Course</p>
            </Link>

            <Link
              to="/instructor/assessments/create"
              className="flex flex-col items-center p-4 border rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="bg-blue-100 p-3 rounded-full">
                <FiFileText className="h-6 w-6 text-blue-600" />
              </div>
              <p className="mt-2 font-medium">Create Assessment</p>
            </Link>

            <Link
              to="/instructor/students"
              className="flex flex-col items-center p-4 border rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="bg-green-100 p-3 rounded-full">
                <FiUsers className="h-6 w-6 text-green-600" />
              </div>
              <p className="mt-2 font-medium">View Student Progress</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Course statistics */}
      {courseStats.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              Course Statistics
            </h2>
          </div>
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={courseStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#8884d8" name="Students" />
                  <Bar
                    dataKey="assessments"
                    fill="#82ca9d"
                    name="Assessments"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Students */}
      {students.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Student Activity
            </h2>
            <Link
              to="/instructor/students"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
            >
              View all <FiArrowRight className="ml-1" />
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Course: {student.course}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            student.progress >= 70
                              ? "bg-green-500"
                              : student.progress >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {student.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
