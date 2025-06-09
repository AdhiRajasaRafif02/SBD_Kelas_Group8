import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { assessmentAPI, courseAPI } from "../Services/serviceApi";
import {
  FiClock,
  FiFileText,
  FiAlertCircle,
  FiCheck,
  FiFilter,
  FiChevronDown,
  FiCalendar,
} from "react-icons/fi";
import toast from "react-hot-toast";

const AssessmentList = () => {
  const { user } = useContext(AuthContext);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState({}); // To store course info keyed by ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch courses first to get course info for assessments
        const coursesData = await courseAPI.getAllCourses(1, 100);
        const courseMap = {};
        const enrolledCourseIds = new Set(); // Track enrolled course IDs

        if (coursesData.courses) {
          coursesData.courses.forEach((course) => {
            courseMap[course._id] = course;

            // Cek apakah user terdaftar di course ini
            if (course.students && course.students.includes(user.id)) {
              enrolledCourseIds.add(course._id);
            }
          });
        }
        setCourses(courseMap);

        // Fetch assessments
        const assessmentsData = await assessmentAPI.getAllAssessments();
        console.log("Total assessments fetched:", assessmentsData.length);
        console.log("Enrolled course IDs:", Array.from(enrolledCourseIds));

        // Log detailed assessment data to debug
        assessmentsData.forEach((assessment) => {
          const courseIdInfo = assessment.courseId
            ? typeof assessment.courseId === "object"
              ? `Object with _id ${assessment.courseId._id}`
              : `String: ${assessment.courseId}`
            : "undefined";
          console.log(
            `Assessment "${assessment.title}" has courseId: ${courseIdInfo}`
          );
        });

        // Improved filter function that handles more edge cases
        const filteredAssessments = assessmentsData.filter((assessment) => {
          // Skip assessments without courseId
          if (!assessment.courseId) {
            console.log(`Assessment ${assessment.title} has no courseId`);
            return false;
          }

          // Handle various ID formats
          let courseIdToCheck;
          if (typeof assessment.courseId === "object") {
            // Handle populated object
            if (assessment.courseId._id) {
              courseIdToCheck = assessment.courseId._id.toString();
            } else {
              console.log(
                `Assessment ${assessment.title} has invalid courseId object`
              );
              return false;
            }
          } else {
            // Handle string ID
            courseIdToCheck = assessment.courseId.toString();
          }

          // Check if in any enrolled course (using includes for partial matching too)
          let matched = false;
          for (const enrolledId of enrolledCourseIds) {
            if (
              courseIdToCheck === enrolledId ||
              courseIdToCheck.includes(enrolledId) ||
              enrolledId.includes(courseIdToCheck)
            ) {
              matched = true;
              break;
            }
          }

          console.log(
            `Assessment ${assessment.title} with courseId ${courseIdToCheck}: enrolled=${matched}`
          );
          return matched;
        });

        console.log(
          "Filtered to enrolled courses:",
          filteredAssessments.length
        );

        // Enrich assessment data with course info and status
        const enrichedAssessments = filteredAssessments.map((assessment) => {
          const dueDate = new Date(assessment.dueDate || Date.now() + 86400000);
          const now = new Date();

          // Determine status based on dueDate
          let status = "upcoming";
          if (dueDate < now) {
            status = "completed";
          } else if (dueDate - now < 24 * 60 * 60 * 1000) {
            status = "inProgress";
          }

          // Perbaikan ekstraksi courseId dan courseName
          let courseName = "Unknown Course";
          let courseIdStr = "";

          // Handle kasus ketika courseId adalah objek hasil populate
          if (assessment.courseId && typeof assessment.courseId === "object") {
            // Jika courseId sudah di-populate, ambil title langsung
            if (assessment.courseId.title) {
              courseName = assessment.courseId.title;
            }
            // Simpan ID untuk lookup
            courseIdStr = assessment.courseId._id?.toString();
          } else if (assessment.courseId) {
            // Jika courseId string biasa
            courseIdStr = assessment.courseId.toString();
            // Coba ambil dari courseMap
            if (courseMap[courseIdStr]) {
              courseName = courseMap[courseIdStr].title;
            }
          }

          // Debug
          console.log(
            `Assessment ${
              assessment.title
            }: courseId type=${typeof assessment.courseId}, value=${JSON.stringify(
              assessment.courseId
            )}, resolved name=${courseName}`
          );

          return {
            ...assessment,
            status,
            courseName,
            type: assessment.type || "Quiz",
            questions: assessment.questions ? assessment.questions.length : 0,
            progress: Math.floor(Math.random() * 100), // Placeholder - replace with actual progress
            score:
              assessment.results && assessment.results.length > 0
                ? assessment.results[0].score
                : null,
            maxScore: 100, // Placeholder - replace with actual maxScore
          };
        });

        // Apply filter
        let filteredAssessmentsFinal = [...enrichedAssessments];
        if (filter !== "all") {
          filteredAssessmentsFinal = enrichedAssessments.filter(
            (a) => a.status === filter
          );
        }

        setAssessments(filteredAssessmentsFinal);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        toast.error("Failed to load assessments");
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, user.id]); // Tambahkan user.id ke dependency array

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to get days remaining
  const getDaysRemaining = (dateString) => {
    if (!dateString) return 0;
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to render status badge
  const getStatusBadge = (assessment) => {
    const { status } = assessment;

    if (status === "completed") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FiCheck className="mr-1" /> Completed
        </span>
      );
    } else if (status === "inProgress") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FiClock className="mr-1" /> In Progress
        </span>
      );
    } else {
      const days = getDaysRemaining(assessment.dueDate);
      return days <= 3 ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FiAlertCircle className="mr-1" /> Due soon
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <FiCalendar className="mr-1" /> Upcoming
        </span>
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Render list
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="border-b pb-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Assessments</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage and complete your course assessments
          </p>
        </div>
        <div className="mt-4 sm:mt-0 relative">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="mr-2 h-5 w-5 text-gray-500" />
            Filter
            <FiChevronDown
              className={`ml-2 h-5 w-5 text-gray-500 transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {showFilters && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {["all", "upcoming", "inProgress", "completed"].map(
                  (option) => (
                    <button
                      key={option}
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        filter === option
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700"
                      } hover:bg-gray-100`}
                      onClick={() => {
                        setFilter(option);
                        setShowFilters(false);
                      }}
                    >
                      {option === "all"
                        ? "All Assessments"
                        : option === "inProgress"
                        ? "In Progress"
                        : option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No assessments found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === "all"
              ? "You don't have any assessments yet."
              : `You don't have any ${filter} assessments.`}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {assessments.map((assessment) => (
              <li key={assessment._id || assessment.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center 
                        ${
                          assessment.type === "Quiz"
                            ? "bg-indigo-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <FiFileText
                          className={`h-5 w-5 ${
                            assessment.type === "Quiz"
                              ? "text-indigo-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/assessments/${assessment._id || assessment.id}`}
                          className="text-lg font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          {assessment.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          Course: {assessment.courseName}
                        </p>
                      </div>
                    </div>
                    <div>{getStatusBadge(assessment)}</div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      {assessment.description ||
                        "Complete this assessment to test your knowledge."}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium">{assessment.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Questions</p>
                      <p className="font-medium">{assessment.questions}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time Limit</p>
                      <p className="font-medium">
                        {assessment.timeLimit || 30} min
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-medium">
                        {formatDate(assessment.dueDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    {assessment.status === "completed" ? (
                      <div className="flex items-center">
                        <div className="relative w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                            style={{ width: `${assessment.score || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Score: {assessment.score || 0}/
                          {assessment.maxScore || 100}
                        </span>
                      </div>
                    ) : assessment.status === "inProgress" ? (
                      <div className="flex items-center">
                        <div className="relative w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                            style={{ width: `${assessment.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Progress: {assessment.progress || 0}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {getDaysRemaining(assessment.dueDate) > 0
                          ? `Due in ${getDaysRemaining(
                              assessment.dueDate
                            )} days`
                          : "Overdue"}
                      </span>
                    )}

                    <Link
                      to={`/assessments/${assessment._id || assessment.id}`}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        assessment.status === "completed"
                          ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {assessment.status === "completed"
                        ? "Review"
                        : assessment.status === "inProgress"
                        ? "Continue"
                        : "Start"}
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
