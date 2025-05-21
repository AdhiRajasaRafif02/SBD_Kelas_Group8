import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { assessmentAPI, courseAPI } from "../Services/serviceApi";
import {
  FiFileText,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiUsers,
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

const AssessmentManagement = () => {
  const { courseId } = useParams(); // Added this to get courseId from URL
  const { user } = useContext(AuthContext);
  const [assessments, setAssessments] = useState([]);
  const [course, setCourse] = useState(null); // Added course state
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(null);
  const [submissions, setSubmissions] = useState({}); // Added submissions state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch specific course if courseId is provided
        if (courseId) {
          const courseData = await courseAPI.getCourseById(courseId);
          setCourse(courseData);
        }

        // Fetch instructor's courses
        const coursesData = await courseAPI.getCoursesByInstructor(user.id);

        // Create a lookup map for courses
        const courseMap = {};
        if (coursesData) {
          coursesData.forEach((course) => {
            courseMap[course._id] = course;
          });
        }
        setCourses(courseMap);

        // Fetch assessments for instructor's courses
        let assessmentsData = [];

        // If courseId is provided, only fetch assessments for that course
        if (courseId) {
          try {
            const courseAssessments =
              await assessmentAPI.getAssessmentsByCourse(courseId);
            assessmentsData = courseAssessments.map((assessment) => ({
              ...assessment,
              courseId,
              courseName: course?.title || "Course",
              questionCount: assessment.questions?.length || 0,
              submissionCount: assessment.results?.length || 0,
            }));
          } catch (err) {
            console.error(
              `Error fetching assessments for course ${courseId}:`,
              err
            );
          }
        } else {
          // Otherwise fetch assessments for all instructor's courses
          for (const course of Object.values(courseMap)) {
            if (course.assessments && course.assessments.length > 0) {
              for (const assessmentId of course.assessments) {
                try {
                  const assessment = await assessmentAPI.getAssessmentById(
                    assessmentId
                  );
                  if (assessment) {
                    // Enrich with course data
                    assessment.courseId = course._id;
                    assessment.courseName = course.title;
                    assessment.questionCount =
                      assessment.questions?.length || 0;
                    assessment.submissionCount =
                      assessment.results?.length || 0;
                    assessmentsData.push(assessment);
                  }
                } catch (err) {
                  console.error(
                    `Error fetching assessment ${assessmentId}:`,
                    err
                  );
                }
              }
            }
          }
        }

        // Process submissions data
        const submissionsMap = {};
        assessmentsData.forEach((assessment) => {
          if (assessment.results && assessment.results.length > 0) {
            submissionsMap[assessment._id] = assessment.results.map(
              (result) => ({
                ...result,
                assessmentId: assessment._id,
                assessmentTitle: assessment.title,
                submittedAt: result.submittedAt || new Date(),
                studentName: "Student", // This would ideally be populated with real data
              })
            );
          }
        });
        setSubmissions(submissionsMap);
        setAssessments(assessmentsData);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        toast.error("Failed to load assessments");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, courseId]);

  const handleDeleteAssessment = async (assessmentId) => {
    // When first clicked, just set confirmation state
    if (confirmDelete !== assessmentId) {
      setConfirmDelete(assessmentId);
      return;
    }

    try {
      await assessmentAPI.deleteAssessment(assessmentId);
      toast.success("Assessment deleted successfully");
      // Remove deleted assessment from state
      setAssessments(assessments.filter((a) => a._id !== assessmentId));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("Failed to delete assessment");
    }
  };

  const formatDate = (date) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "No date";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to render status badge
  const getStatusBadge = (status) => {
    if (!status) status = "upcoming";

    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheckCircle className="mr-1" /> Completed
          </span>
        );
      case "in_progress":
      case "inProgress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FiClock className="mr-1" /> In Progress
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiAlertCircle className="mr-1" /> Expired
          </span>
        );
      case "due-soon":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiClock className="mr-1" /> Due Soon
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FiCalendar className="mr-1" /> Upcoming
          </span>
        );
    }
  };

  // Filter and search assessments
  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assessment.description &&
        assessment.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    if (filter === "all") return matchesSearch;
    return matchesSearch && assessment.type === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Assessments
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {course?.title || "All Courses"} • {assessments.length} Assessment
            {assessments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex-shrink-0">
          <Link
            to={
              courseId
                ? `/instructor/courses/${courseId}/assessments/create`
                : "/instructor/assessments/create"
            }
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="mr-2 -ml-1" /> Create Assessment
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {/* Search and filters */}
          <div className="mb-6">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filter controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <FiFilter className="mr-2" />
                Filters
                <FiChevronDown
                  className={`ml-2 h-4 w-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showFilters && (
                <div className="mt-2 bg-gray-50 p-4 rounded-lg shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                      <label
                        htmlFor="course-filter"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Filter by Course
                      </label>
                      <select
                        id="course-filter"
                        className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="all">All Courses</option>
                        {Object.values(courses).map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assessment list or empty state */}
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No assessments found
              </h3>
              {searchTerm ? (
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search term.
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new assessment.
                </p>
              )}
              <div className="mt-6">
                <Link
                  to={
                    courseId
                      ? `/instructor/courses/${courseId}/assessments/create`
                      : "/instructor/assessments/create"
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiPlus className="mr-2 -ml-1" /> Create Assessment
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssessments.map((assessment) => (
                    <tr key={assessment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FiFileText className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <Link
                              to={`/instructor/assessments/${assessment._id}`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              {assessment.title}
                            </Link>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {assessment.description ||
                                "No description provided"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          <div>Questions: {assessment.questionCount}</div>
                          <div>
                            Time limit: {assessment.timeLimit || 30} min
                          </div>
                          <div>
                            Passing score: {assessment.passingMarks || 60}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {assessment.dueDate
                            ? formatDate(assessment.dueDate)
                            : "No due date"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(assessment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiUsers className="mr-1.5 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {assessment.submissionCount}
                          </span>
                          {assessment.submissionCount > 0 && (
                            <button
                              onClick={() =>
                                setShowSubmissionDetails(
                                  showSubmissionDetails === assessment._id
                                    ? null
                                    : assessment._id
                                )
                              }
                              className="ml-2 text-xs text-indigo-600 hover:text-indigo-900"
                            >
                              {showSubmissionDetails === assessment._id
                                ? "Hide"
                                : "View"}
                              {showSubmissionDetails === assessment._id ? (
                                <FiChevronUp className="inline ml-1" />
                              ) : (
                                <FiChevronDown className="inline ml-1" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/instructor/assessments/${assessment._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <FiEdit2 className="inline mr-1" /> Edit
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(assessment._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Submissions details panel */}
      {showSubmissionDetails &&
        submissions[showSubmissionDetails]?.length > 0 && (
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Submissions for{" "}
                {assessments.find((a) => a._id === showSubmissionDetails)
                  ?.title || "Assessment"}
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions[showSubmissionDetails].map(
                      (submission, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.studentName ||
                                `Student ID: ${submission.userId}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {submission.score}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDateTime(submission.submittedAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              to={`/instructor/assessments/${showSubmissionDetails}/submissions/${submission.userId}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiAlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Assessment
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this assessment? This
                        action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleDeleteAssessment(confirmDelete)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentManagement;
