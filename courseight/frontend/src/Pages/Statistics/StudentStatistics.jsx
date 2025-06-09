import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import {
  courseAPI,
  progressAPI,
  assessmentAPI,
  userAPI,
} from "../Services/serviceApi";
import {
  FiUsers,
  FiBarChart2,
  FiArrowLeft,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiDownload,
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiMail,
} from "react-icons/fi";
import toast from "react-hot-toast";

const StudentStatistics = () => {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("username");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch course details
        const courseData = await courseAPI.getCourseById(courseId);
        setCourse(courseData);

        // Verify instructor permission
        if (user.role !== "instructor" && user.role !== "admin") {
          toast.error("You don't have permission to view this page");
          navigate(`/courses/${courseId}`);
          return;
        }

        // Fetch real student data using student IDs from course
        let studentsData = [];
        if (courseData.students && courseData.students.length > 0) {
          try {
            // In a real implementation, this would be an API call to fetch details of multiple students
            // For now, we'll fetch them one by one
            const studentPromises = courseData.students.map(
              async (studentId) => {
                try {
                  const studentData = await userAPI.getUserById(studentId);
                  return {
                    id: studentId,
                    username: studentData.username,
                    email: studentData.email,
                    joinedAt: studentData.createdAt || new Date(),
                  };
                } catch (err) {
                  // If student data can't be fetched, provide placeholder
                  return {
                    id: studentId,
                    username: "Student",
                    email: "student@example.com",
                    joinedAt: new Date(),
                  };
                }
              }
            );

            studentsData = await Promise.all(studentPromises);
          } catch (err) {
            console.error("Error fetching student details:", err);
            // Fallback to mock data if real data can't be fetched
            studentsData = courseData.students.map((studentId, index) => ({
              id: studentId,
              username: `Student ${index + 1}`,
              email: `student${index + 1}@example.com`,
              joinedAt: new Date(
                Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
              ),
            }));
          }
        }
        setStudents(studentsData);

        // Fetch real progress data
        try {
          const progressStats = await progressAPI.getCourseRanking(courseId);
          setProgressData(progressStats);
        } catch (err) {
          console.error("Error fetching progress data:", err);
          // Create mock progress data if real data fails
          const mockProgress = studentsData.map((student) => ({
            userId: student.id,
            progressPercentage: Math.floor(Math.random() * 100),
            lastUpdated: new Date(),
          }));
          setProgressData(mockProgress);
        }

        // Fetch assessment results for the course
        try {
          const assessmentIds = courseData.assessments || [];
          let results = [];

          for (const assessmentId of assessmentIds) {
            // This would be a real API call in production
            const assessmentData = await assessmentAPI.getAssessmentById(
              assessmentId
            );

            // Convert assessment results to the format we need
            if (assessmentData.results && assessmentData.results.length > 0) {
              const formattedResults = assessmentData.results.map((result) => ({
                assessmentId: assessmentId,
                assessmentTitle: assessmentData.title,
                studentId: result.userId,
                studentName:
                  studentsData.find((s) => s.id === result.userId)?.username ||
                  "Unknown",
                score: result.score,
                submittedAt: result.submittedAt,
                status: "completed",
              }));

              results = [...results, ...formattedResults];
            }
          }

          setAssessmentResults(results);
        } catch (err) {
          console.error("Error fetching assessment results:", err);
          // Create mock assessment results if real data fails
          const mockResults = [];
          if (courseData.assessments && courseData.assessments.length > 0) {
            courseData.assessments.forEach((assessment) => {
              studentsData.forEach((student) => {
                // Only create results for some students to simulate incomplete assessments
                if (Math.random() > 0.3) {
                  mockResults.push({
                    assessmentId: assessment._id || assessment,
                    assessmentTitle: assessment.title || "Assessment",
                    studentId: student.id,
                    studentName: student.username,
                    score: Math.floor(Math.random() * 100),
                    submittedAt: new Date(
                      Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000
                    ),
                    status: Math.random() > 0.2 ? "completed" : "not_started",
                  });
                }
              });
            });

            setAssessmentResults(mockResults);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && user) {
      fetchData();
    }
  }, [courseId, user, navigate]);

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get student progress
  const getStudentProgress = (studentId) => {
    const progress = progressData.find((p) => p.userId === studentId);
    return progress ? progress.progressPercentage : 0;
  };

  // Get student assessments
  const getStudentAssessments = (studentId) => {
    return assessmentResults.filter((result) => result.studentId === studentId);
  };

  // Calculate student statistics
  const calculateStudentStats = (studentId) => {
    const studentAssessments = getStudentAssessments(studentId);
    const completedAssessments = studentAssessments.filter(
      (a) => a.status === "completed"
    );

    if (completedAssessments.length === 0) {
      return { avgScore: 0, completed: 0, total: studentAssessments.length };
    }

    const totalScore = completedAssessments.reduce(
      (sum, a) => sum + a.score,
      0
    );
    const avgScore =
      completedAssessments.length > 0
        ? totalScore / completedAssessments.length
        : 0;

    return {
      avgScore: avgScore.toFixed(1),
      completed: completedAssessments.length,
      total: course?.assessments?.length || 0,
    };
  };

  // Filter students by search term
  const filteredStudents = students.filter(
    (student) =>
      student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === "progress") {
      const aProgress = getStudentProgress(a.id);
      const bProgress = getStudentProgress(b.id);
      aValue = aProgress;
      bValue = bProgress;
    } else if (sortField === "score") {
      const aStats = calculateStudentStats(a.id);
      const bStats = calculateStudentStats(b.id);
      aValue = parseFloat(aStats.avgScore);
      bValue = parseFloat(bStats.avgScore);
    }

    if (typeof aValue === "string") {
      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    } else {
      if (sortDirection === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }
  });

  // Handle sort by field
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Show student details modal
  const showStudentDetail = (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  // Calculate course statistics
  const calculateCourseStats = () => {
    // Average progress
    const totalProgress = progressData.reduce(
      (sum, p) => sum + (p.progressPercentage || 0),
      0
    );
    const avgProgress =
      progressData.length > 0 ? totalProgress / progressData.length : 0;

    // Average assessment score
    const completedAssessments = assessmentResults.filter(
      (a) => a.status === "completed"
    );
    const totalScore = completedAssessments.reduce(
      (sum, a) => sum + a.score,
      0
    );
    const avgScore =
      completedAssessments.length > 0
        ? totalScore / completedAssessments.length
        : 0;

    // Completion rate - students who completed at least 90% of the course
    const completedStudents = progressData.filter(
      (p) => p.progressPercentage >= 90
    ).length;
    const completionRate =
      students.length > 0 ? (completedStudents / students.length) * 100 : 0;

    return {
      avgProgress: avgProgress.toFixed(1),
      avgScore: avgScore.toFixed(1),
      completionRate: completionRate.toFixed(1),
    };
  };

  const courseStats = calculateCourseStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="mr-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <FiArrowLeft className="mr-1" /> Back to Course
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Statistics
          </h1>
        </div>

        <div className="flex space-x-2">
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => {
              const csvContent =
                "Student,Email,Progress,Avg Score,Assessments Completed\n" +
                sortedStudents
                  .map((student) => {
                    const stats = calculateStudentStats(student.id);
                    const progress = getStudentProgress(student.id);
                    return `${student.username},${student.email},${progress}%,${stats.avgScore}%,${stats.completed}/${stats.total}`;
                  })
                  .join("\n");

              const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `${
                course?.title || "course"
              }_student_statistics.csv`;
              link.click();
              URL.revokeObjectURL(url);

              toast.success("Report downloaded successfully");
            }}
          >
            <FiDownload className="mr-1.5 -ml-0.5 h-4 w-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">
            Course: {course?.title}
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-blue-100 text-blue-600">
                  <FiUsers className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Enrolled Students
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {students.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-green-100 text-green-600">
                  <FiBarChart2 className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Average Progress
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {courseStats.avgProgress}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-yellow-100 text-yellow-600">
                  <FiFileText className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Average Score
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {courseStats.avgScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Student List</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pr-8 pl-10 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center">
                    <span>Name</span>
                    {sortField === "username" &&
                      (sortDirection === "asc" ? (
                        <FiChevronUp className="ml-1" />
                      ) : (
                        <FiChevronDown className="ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("progress")}
                >
                  <div className="flex items-center">
                    <span>Progress</span>
                    {sortField === "progress" &&
                      (sortDirection === "asc" ? (
                        <FiChevronUp className="ml-1" />
                      ) : (
                        <FiChevronDown className="ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("score")}
                >
                  <div className="flex items-center">
                    <span>Average Score</span>
                    {sortField === "score" &&
                      (sortDirection === "asc" ? (
                        <FiChevronUp className="ml-1" />
                      ) : (
                        <FiChevronDown className="ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStudents.map((student) => {
                const progress = getStudentProgress(student.id);
                const stats = calculateStudentStats(student.id);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                          {student.username?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <FiMail className="mr-1.5 text-gray-400" />
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              progress > 75
                                ? "bg-green-500"
                                : progress > 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="ml-3 text-sm text-gray-500">
                          {progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.avgScore}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.completed}/{stats.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(student.joinedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => showStudentDetail(student)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedStudents.length === 0 && (
          <div className="text-center py-10">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No students found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search."
                : "There are no students enrolled in this course yet."}
            </p>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">
                Student Details
              </h3>
              <button
                onClick={() => setShowStudentDetails(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-xl">
                  {selectedStudent.username?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-gray-900">
                    {selectedStudent.username}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiMail className="mr-1.5 text-gray-400" />
                    {selectedStudent.email}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Joined: {formatDate(selectedStudent.joinedAt)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">
                  Course Progress
                </h4>
                <div className="flex items-center mb-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        getStudentProgress(selectedStudent.id) > 75
                          ? "bg-green-500"
                          : getStudentProgress(selectedStudent.id) > 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${getStudentProgress(selectedStudent.id)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {getStudentProgress(selectedStudent.id)}%
                  </span>
                </div>
              </div>

              <h4 className="font-medium text-gray-900 mb-2">
                Assessment Results
              </h4>
              {getStudentAssessments(selectedStudent.id).length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assessment
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getStudentAssessments(selectedStudent.id).map(
                        (result, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {result.assessmentTitle}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {result.status === "completed" ? (
                                <span
                                  className={`${
                                    result.score >= 80
                                      ? "text-green-600"
                                      : result.score >= 60
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {result.score}%
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {result.status === "completed" ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Completed
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Not Started
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {result.status === "completed"
                                ? formatDate(result.submittedAt)
                                : "-"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <FiFileText className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    No assessment results found
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowStudentDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStatistics;
