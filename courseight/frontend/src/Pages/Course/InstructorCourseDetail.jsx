import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { courseAPI, assessmentAPI, progressAPI } from "../Services/serviceApi";
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiCalendar,
  FiClock,
  FiBarChart2,
  FiFileText,
  FiCheckCircle,
  FiX,
  FiMessageSquare,
  FiBookOpen,
  FiTrendingUp,
  FiAward,
  FiAlertTriangle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const InstructorCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [courseStats, setCourseStats] = useState({
    avgScore: 0,
    avgProgress: 0,
    completionRate: 0,
    passingRate: 0,
  });
  const [topStudents, setTopStudents] = useState([]);
  const [flaggedStudents, setFlaggedStudents] = useState([]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);

        // Fetch course details
        const courseData = await courseAPI.getCourseById(id);

        // Get instructor ID regardless of format
        const instructorId =
          typeof courseData.instructor === "object"
            ? courseData.instructor._id?.toString()
            : courseData.instructor?.toString();

        // Check if user is the instructor of this course
        if (instructorId !== user.id?.toString() && user.role !== "admin") {
          toast.error("You don't have permission to view this course");
          navigate("/instructor/courses");
          return;
        }

        setCourse(courseData);

        // Fetch course assessments
        try {
          const assessmentsData = await assessmentAPI.getAssessmentsByCourse(
            id
          );
          setAssessments(assessmentsData || []);
        } catch (err) {
          console.error("Error fetching assessments:", err);
          setAssessments([]);
        }

        // Get student details if any students are enrolled
        if (courseData.students && courseData.students.length > 0) {
          // You'd need a userAPI or similar to fetch student details
          // For now, we'll create placeholder data
          setStudents(
            courseData.students.map((studentId, index) => ({
              id: studentId,
              name: `Student ${index + 1}`,
              email: `student${index + 1}@example.com`,
              progress: Math.floor(Math.random() * 100),
            }))
          );

          // Fetch detailed statistics
          try {
            // Get course ranking data (leaderboard)
            const rankingData = await progressAPI.getCourseRanking(id);

            // Calculate average score
            let totalScore = 0;
            let studentCount = 0;

            if (rankingData && rankingData.length > 0) {
              rankingData.forEach((entry) => {
                if (entry.averageScore) {
                  totalScore += entry.averageScore;
                  studentCount++;
                }
              });

              // Set top students (top 3)
              setTopStudents(rankingData.slice(0, 3));

              // Set flagged students (below 40% score)
              setFlaggedStudents(
                rankingData.filter((entry) => (entry.averageScore || 0) < 40)
              );

              // Calculate statistics
              const avgScore = studentCount > 0 ? totalScore / studentCount : 0;
              const avgProgress =
                studentCount > 0
                  ? rankingData.reduce(
                      (sum, entry) => sum + (entry.progressPercentage || 0),
                      0
                    ) / studentCount
                  : 0;
              const completionRate =
                studentCount > 0
                  ? (rankingData.filter(
                      (entry) => (entry.progressPercentage || 0) >= 90
                    ).length /
                      studentCount) *
                    100
                  : 0;
              const passingRate =
                studentCount > 0
                  ? (rankingData.filter(
                      (entry) => (entry.averageScore || 0) >= 60
                    ).length /
                      studentCount) *
                    100
                  : 0;

              setCourseStats({
                avgScore: Math.round(avgScore),
                avgProgress: Math.round(avgProgress),
                completionRate: Math.round(completionRate),
                passingRate: Math.round(passingRate),
              });
            }
          } catch (err) {
            console.error("Error fetching statistics:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    // Only run this effect when the component mounts or id changes
    if (id) {
      fetchCourseData();
    }
  }, [id, user?.id, navigate]);

  const handleDeleteCourse = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      await courseAPI.deleteCourse(id);
      toast.success("Course deleted successfully");
      navigate("/instructor/courses");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <p className="mt-2 text-gray-600">
          The course you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/instructor/courses"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Header with navigation and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center">
            <Link
              to="/instructor/courses"
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created on {formatDate(course.createdAt)}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to={`/instructor/courses/edit/${id}`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FiEdit2 className="mr-2 -ml-1 h-4 w-4" /> Edit Course
          </Link>
          <button
            onClick={handleDeleteCourse}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
              confirmDelete
                ? "text-white bg-red-600 hover:bg-red-700"
                : "text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            <FiTrash2 className="mr-2 -ml-1 h-4 w-4" />{" "}
            {confirmDelete ? "Confirm Delete" : "Delete"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`${
              activeTab === "overview"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("assessments")}
            className={`${
              activeTab === "assessments"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Assessments
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`${
              activeTab === "students"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`${
              activeTab === "content"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Course Content
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {activeTab === "overview" && (
          <div>
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Course Overview
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Details and statistics about this course.
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900">
                  Description
                </h4>
                <div className="mt-2 text-sm text-gray-600">
                  {course.description}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900">
                  Course Details
                </h4>
                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Level</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {course.level || "Not specified"}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Category
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {course.category || "Not specified"}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Duration
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {course.duration || "Not specified"}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Created At
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(course.createdAt)}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Last Updated
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(course.updatedAt || course.createdAt)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900">
                  Course Stats
                </h4>
                <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-white overflow-hidden rounded-lg border">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Enrolled Students
                      </dt>
                      <dd className="mt-1 flex items-baseline">
                        <span className="text-2xl font-semibold text-gray-900">
                          {course.students?.length || 0}
                        </span>
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden rounded-lg border">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Assessments
                      </dt>
                      <dd className="mt-1 flex items-baseline">
                        <span className="text-2xl font-semibold text-gray-900">
                          {assessments.length}
                        </span>
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden rounded-lg border">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Average Completion
                      </dt>
                      <dd className="mt-1 flex items-baseline">
                        <span className="text-2xl font-semibold text-gray-900">
                          {students.length > 0
                            ? Math.round(
                                students.reduce(
                                  (acc, student) => acc + student.progress,
                                  0
                                ) / students.length
                              )
                            : 0}
                          %
                        </span>
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Enhanced statistics section */}
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900">
                  Course Statistics
                </h4>
                <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-4">
                  <div className="bg-white overflow-hidden rounded-lg border">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Average Score
                      </dt>
                      <dd className="mt-1 flex items-baseline">
                        <span className="text-2xl font-semibold text-gray-900">
                          {courseStats.avgScore}%
                        </span>
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden rounded-lg border">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Average Progress
                      </dt>
                      <dd className="mt-1 flex items-baseline">
                        <span className="text-2xl font-semibold text-gray-900">
                          {courseStats.avgProgress}%
                        </span>
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden rounded-lg border">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completion Rate
                      </dt>
                      <dd className="mt-1 flex items-baseline">
                        <span className="text-2xl font-semibold text-gray-900">
                          {courseStats.completionRate}%
                        </span>
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden rounded-lg border">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Passing Rate
                      </dt>
                      <dd className="mt-1 flex items-baseline">
                        <span className="text-2xl font-semibold text-gray-900">
                          {courseStats.passingRate}%
                        </span>
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Pie chart for visual representation */}
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Student Performance Distribution
                </h4>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Below Passing",
                              value: 100 - courseStats.passingRate,
                            },
                            { name: "Passing", value: courseStats.passingRate },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          dataKey="value"
                        >
                          <Cell fill="#EF4444" />
                          <Cell fill="#10B981" />
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assessments" && (
          <div>
            <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Assessments
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage assessments for this course.
                </p>
              </div>
              <Link
                to={`/instructor/courses/${id}/assessments/create`}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FiPlus className="mr-2 -ml-1 h-4 w-4" /> Add Assessment
              </Link>
            </div>

            <div className="px-4 py-5 sm:p-6">
              {assessments.length === 0 ? (
                <div className="text-center py-6">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No assessments found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new assessment.
                  </p>
                  <div className="mt-6">
                    <Link
                      to={`/instructor/courses/${id}/assessments/create`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                      Create Assessment
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Questions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submissions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assessments.map((assessment) => (
                        <tr key={assessment._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <FiFileText className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {assessment.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {assessment.description?.substring(0, 50)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(assessment.dueDate || new Date())}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {assessment.questions?.length || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {assessment.results?.length || 0} /{" "}
                              {course.students?.length || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                to={`/instructor/assessments/${assessment._id}`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View
                              </Link>
                              <Link
                                to={`/instructor/assessments/${assessment._id}/edit`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div>
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Enrolled Students
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {course.students?.length || 0} students enrolled in this course.
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {students.length === 0 ? (
                <div className="text-center py-6">
                  <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No students enrolled
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are currently no students enrolled in this course.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrolled Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {student.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {student.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(course.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                  className="bg-green-600 h-2.5 rounded-full"
                                  style={{ width: `${student.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">
                                {student.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Detailed student statistics */}
            {topStudents.length > 0 && (
              <div className="mt-8 px-4 py-5 sm:px-6">
                <h4 className="text-base font-medium text-gray-900 flex items-center">
                  <FiAward className="mr-2 text-yellow-500" /> Top Performers
                </h4>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {topStudents.map((student, index) => (
                    <div
                      key={student.userId?._id || index}
                      className="bg-white p-4 rounded-lg border"
                    >
                      <div className="flex items-center">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center font-medium text-white ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-500"
                              : "bg-amber-700"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {student.userId?.username || `Student ${index + 1}`}
                          </p>
                          <div className="flex items-center mt-1">
                            <FiBarChart2 className="text-indigo-500 mr-1" />
                            <span className="text-sm text-gray-500">
                              {Math.round(student.averageScore || 0)}% Score
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">
                          Progress
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${student.progressPercentage || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {flaggedStudents.length > 0 && (
              <div className="mt-8 px-4 py-5 sm:px-6">
                <h4 className="text-base font-medium text-gray-900 flex items-center">
                  <FiAlertTriangle className="mr-2 text-amber-500" /> Students
                  Needing Assistance
                </h4>
                <div className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {flaggedStudents.map((student, index) => (
                          <tr key={student.userId?._id || index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium">
                                  {student.userId?.username
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {student.userId?.username ||
                                      `Student ${index + 1}`}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-red-500 h-2.5 rounded-full"
                                    style={{
                                      width: `${
                                        student.progressPercentage || 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-500">
                                  {student.progressPercentage || 0}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-red-600 font-medium">
                                {Math.round(student.averageScore || 0)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Low Performance
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                Contact Student
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "content" && (
          <div>
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Course Content
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage lessons, modules, and learning materials.
              </p>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <div className="text-center py-6">
                <FiBookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No content yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start creating content for your course.
                </p>
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <FiPlus className="mr-2 -ml-1 h-5 w-5" /> Add Module
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorCourseDetail;
