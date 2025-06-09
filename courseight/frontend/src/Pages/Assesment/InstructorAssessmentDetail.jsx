import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { assessmentAPI, courseAPI } from "../Services/serviceApi";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiBarChart2,
  FiLink,
} from "react-icons/fi";
import toast from "react-hot-toast";

const InstructorAssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [assessment, setAssessment] = useState(null);
  const [course, setCourse] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [stats, setStats] = useState({
    averageScore: 0,
    completionRate: 0,
    highestScore: 0,
    lowestScore: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch assessment details
        const assessmentData = await assessmentAPI.getAssessmentById(id);
        setAssessment(assessmentData);

        // Fetch the associated course
        if (assessmentData.courseId) {
          const courseData = await courseAPI.getCourseById(
            assessmentData.courseId
          );
          setCourse(courseData);

          // Verify instructor has access to this course
          if (courseData.instructor !== user.id && user.role !== "admin") {
            toast.error("You don't have permission to view this assessment");
            navigate("/instructor/assessments");
            return;
          }
        }

        // Get submission data
        if (assessmentData.results && assessmentData.results.length > 0) {
          setSubmissions(assessmentData.results);

          // Calculate stats
          const scores = assessmentData.results
            .map((r) => r.score)
            .filter((s) => s !== undefined);
          if (scores.length > 0) {
            setStats({
              averageScore: Math.round(
                scores.reduce((a, b) => a + b, 0) / scores.length
              ),
              completionRate: Math.round(
                (scores.length / (course?.students?.length || 1)) * 100
              ),
              highestScore: Math.max(...scores),
              lowestScore: Math.min(...scores),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching assessment details:", error);
        toast.error("Failed to load assessment details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user.id, navigate, user.role]);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      await assessmentAPI.deleteAssessment(id);
      toast.success("Assessment deleted successfully");
      navigate(
        course
          ? `/instructor/courses/${course._id}/assessments`
          : "/instructor/assessments"
      );
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("Failed to delete assessment");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
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

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Assessment not found
        </h2>
        <p className="mt-2 text-gray-600">
          The assessment you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header with navigation and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <div className="flex items-center">
            <Link
              to={
                course
                  ? `/instructor/courses/${course._id}/assessments`
                  : "/instructor/assessments"
              }
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {assessment.title}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {course ? `Course: ${course.title}` : "No course assigned"}
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to={`/instructor/assessments/${id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FiEdit2 className="mr-2 -ml-1 h-4 w-4" /> Edit Assessment
          </Link>
          <button
            onClick={handleDelete}
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

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left and center */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assessment overview card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Assessment Overview
              </h2>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <p>{assessment.description || "No description provided."}</p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FiClock className="h-5 w-5 text-gray-400 mr-2" />
                  <span>Time Limit: {assessment.timeLimit || 30} minutes</span>
                </div>
                <div className="flex items-center">
                  <FiBarChart2 className="h-5 w-5 text-gray-400 mr-2" />
                  <span>Passing Score: {assessment.passingMarks || 60}%</span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span>Due Date: {formatDate(assessment.dueDate)}</span>
                </div>
                <div className="flex items-center">
                  <FiFileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span>Questions: {assessment.questions?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Questions preview */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Questions Preview
              </h2>
              <span className="text-sm text-gray-500">
                Total: {assessment.questions?.length || 0} questions
              </span>
            </div>
            <div className="p-6">
              {assessment.questions && assessment.questions.length > 0 ? (
                <div className="space-y-6">
                  {assessment.questions.map((question, index) => (
                    <div
                      key={index}
                      className="pb-4 border-b border-gray-200 last:border-0"
                    >
                      <div className="flex items-start">
                        <span className="flex-shrink-0 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm font-medium mr-3">
                          Q{index + 1}
                        </span>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {question.question || question.text}
                          </h3>

                          {question.options && question.options.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`pl-2 py-1 text-sm rounded ${
                                    question.correctAnswer === optIndex
                                      ? "bg-green-50 border-l-2 border-green-500"
                                      : ""
                                  }`}
                                >
                                  {optIndex === question.correctAnswer && (
                                    <FiCheckCircle className="inline mr-1 text-green-500" />
                                  )}
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-2 text-xs text-gray-500">
                            Points: {question.points || 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No questions added to this assessment yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - right */}
        <div className="space-y-6">
          {/* Statistics card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Assessment Stats
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {submissions.length}
                  </div>
                  <div className="text-xs text-gray-500">Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {stats.averageScore}%
                  </div>
                  <div className="text-xs text-gray-500">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {stats.completionRate}%
                  </div>
                  <div className="text-xs text-gray-500">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {stats.highestScore}%
                  </div>
                  <div className="text-xs text-gray-500">Highest Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent submissions */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Submissions
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {submissions.length > 0 ? (
                submissions.slice(0, 5).map((submission, index) => (
                  <div key={index} className="p-4">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-800">
                              {submission.studentName?.charAt(0) || "U"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {submission.studentName || "Student"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            submission.score >= (assessment.passingMarks || 60)
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {submission.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No submissions yet.</p>
                </div>
              )}

              {submissions.length > 5 && (
                <div className="p-4 text-center">
                  <Link
                    to={`/instructor/assessments/${id}/submissions`}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View all {submissions.length} submissions
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Quick Actions
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <Link
                to={`/instructor/assessments/${id}/edit`}
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiEdit2 className="inline mr-2" /> Edit Assessment
              </Link>

              <Link
                to={`/assessments/${id}`}
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiFileText className="inline mr-2" /> Preview as Student
              </Link>

              {course && (
                <Link
                  to={`/instructor/courses/${course._id}`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiLink className="inline mr-2" /> Go to Course
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorAssessmentDetail;
