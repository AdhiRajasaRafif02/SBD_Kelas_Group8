import { useState, useEffect, useContext } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { courseAPI, progressAPI, assessmentAPI } from "../Services/serviceApi";
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiBookOpen,
  FiCheck,
  FiLock,
  FiAward,
  FiTrendingUp,
  FiStar,
} from "react-icons/fi";
import toast from "react-hot-toast";

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [progress, setProgress] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const courseData = await courseAPI.getCourseById(id);
        setCourse(courseData);

        console.log("Course data:", courseData);
        console.log("Course ID:", courseData.id);

        // Jika course memiliki array assessments, fetch detail untuk setiap assessment
        if (courseData.assessments && courseData.assessments.length > 0) {
          console.log(
            `Course has ${courseData.assessments.length} assessments, fetching details...`
          );

          // Kasus 1: Jika assessments hanya berisi ID
          if (
            typeof courseData.assessments[0] === "string" ||
            courseData.assessments[0]._id
          ) {
            const assessmentDetails = await Promise.all(
              courseData.assessments.map((assessmentId) => {
                const idToUse =
                  typeof assessmentId === "string"
                    ? assessmentId
                    : assessmentId._id;
                return assessmentAPI.getAssessmentById(idToUse);
              })
            );

            console.log("Fetched assessment details:", assessmentDetails);
            setCourse((prev) => ({
              ...prev,
              assessmentObjects: assessmentDetails,
            }));
          }
          // Kasus 2: Jika assessments sudah berisi objek lengkap dari backend populate
          else {
            setCourse((prev) => ({
              ...prev,
              assessmentObjects: courseData.assessments,
            }));
          }
        } else {
          // Alternatif: Jika course tidak memiliki assessments array, coba cari berdasarkan courseId
          try {
            console.log("Trying to find assessments by courseId...");
            const assessmentsByCourseLookup =
              await assessmentAPI.getAssessmentsByCourse(id);

            if (
              assessmentsByCourseLookup &&
              assessmentsByCourseLookup.length > 0
            ) {
              console.log(
                `Found ${assessmentsByCourseLookup.length} assessments by courseId lookup`
              );
              setCourse((prev) => ({
                ...prev,
                assessmentObjects: assessmentsByCourseLookup,
              }));
            }
          } catch (err) {
            console.error("Error fetching assessments by courseId:", err);
          }
        }

        // Check if user is enrolled in this course
        if (user && courseData.students) {
          setIsEnrolled(courseData.students.includes(user.id));

          // If enrolled, fetch progress
          if (courseData.students.includes(user.id)) {
            try {
              const progressData = await progressAPI.getUserProgress(
                user.id,
                id
              );
              setProgress(progressData.progressPercentage);
            } catch (err) {
              console.error("Error fetching progress:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, user, location.state]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (isEnrolled && user) {
        try {
          const leaderboardData = await progressAPI.getCourseRanking(id);
          setLeaderboard(leaderboardData || []);
          console.log("Leaderboard data:", leaderboardData);
        } catch (err) {
          console.error("Error fetching leaderboard:", err);
          setLeaderboard([]);
        }
      }
    };

    fetchLeaderboardData();
  }, [isEnrolled, user, id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await courseAPI.enrollInCourse(id);
      setIsEnrolled(true);
      toast.success("Successfully enrolled in course!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to enroll in course");
      console.error(err);
    } finally {
      setEnrolling(false);
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
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <Link
          to="/courses"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {course.title}
              </h1>
              <div className="mt-2 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    {course.instructor?.username?.charAt(0) || "I"}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {course.instructor?.username || "Instructor"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {course.instructor?.email || ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <FiUsers className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                <span>{course.students?.length || 0} students enrolled</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FiCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                <span>Created {formatDate(course.createdAt)}</span>
              </div>

              {isEnrolled ? (
                <div className="mt-4 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {progress}%
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    enrolling ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {enrolling ? "Enrolling..." : "Enroll in Course"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "overview"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "content"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("assessments")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "assessments"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Assessments
            </button>
            <button
              onClick={() => setActiveTab("discussions")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "discussions"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Discussions
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "leaderboard"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Leaderboard
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === "overview" && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Course Description
            </h2>
            <p className="mt-4 text-gray-600">{course.description}</p>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">
                What You'll Learn
              </h3>
              <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learningObjectives?.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheck className="mt-1 mr-2 h-5 w-5 text-green-500" />
                    <span>{objective}</span>
                  </li>
                )) || (
                  <li className="flex items-start">
                    <FiCheck className="mt-1 mr-2 h-5 w-5 text-green-500" />
                    <span>Master the fundamentals covered in this course</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Course Content
            </h2>

            {course.topics?.length > 0 ? (
              <div className="mt-4 space-y-4">
                {course.topics.map((topic, index) => (
                  <div key={index} className="border rounded-md">
                    <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {isEnrolled ? (
                            <FiBookOpen className="h-5 w-5 text-indigo-600" />
                          ) : (
                            <FiLock className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <h3 className="ml-3 text-sm font-medium text-gray-900">
                          {topic.title}
                        </h3>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <FiClock className="mr-1 h-4 w-4" />
                        <span>{topic.duration} min</span>
                      </div>
                    </div>

                    {isEnrolled && (
                      <div className="p-4">
                        <p className="text-sm text-gray-600">
                          {topic.description}
                        </p>

                        {topic.resources?.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-xs font-medium text-gray-900">
                              Resources:
                            </h4>
                            <ul className="mt-1 space-y-1">
                              {topic.resources.map((resource, idx) => (
                                <li
                                  key={idx}
                                  className="text-xs text-indigo-600"
                                >
                                  {resource}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-gray-600">
                No content is available for this course yet.
              </p>
            )}

            {!isEnrolled && (
              <div className="mt-6 bg-indigo-50 p-4 rounded-md">
                <p className="text-indigo-700 text-sm">
                  Enroll in this course to access all content and resources.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "assessments" && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Assessments</h2>

            {course.assessmentObjects?.length > 0 ? (
              <div className="mt-4 space-y-4">
                {course.assessmentObjects.map((assessment, index) => (
                  <div
                    key={assessment._id || index}
                    className="border rounded-md p-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-900">
                        {assessment.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <FiCalendar className="mr-1 h-4 w-4" />
                        <span>Due {formatDate(assessment.dueDate)}</span>
                      </div>
                    </div>

                    {isEnrolled ? (
                      <div className="mt-4">
                        <Link
                          to={`/assessments/${assessment._id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50"
                        >
                          Take Assessment
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <FiLock className="mr-1 h-4 w-4" />
                        <span>Enroll to access this assessment</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-gray-600">
                No assessments are available for this course yet.
              </p>
            )}
          </div>
        )}

        {activeTab === "discussions" && (
          <div className="p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Course Discussions
              </h2>

              {isEnrolled && (
                <Link
                  to={`/discussions/new?courseId=${id}`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  New Discussion
                </Link>
              )}
            </div>

            {isEnrolled ? (
              <div className="mt-4">
                <Link
                  to={`/discussions?courseId=${id}`}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View all discussions for this course
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-gray-600">
                Enroll in this course to participate in discussions.
              </p>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Course Leaderboard
            </h2>

            {!isEnrolled ? (
              <div className="text-center py-8">
                <FiAward className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Leaderboard Locked
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enroll in this course to see the leaderboard
                </p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <FiTrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No data yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete assessments to appear on the leaderboard
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry.userId?._id || index}
                        className={
                          entry.userId?._id === user.id ? "bg-indigo-50" : ""
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index < 3 ? (
                              <span
                                className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center 
                        ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-600"
                            : index === 1
                            ? "bg-gray-100 text-gray-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                              >
                                <FiAward />
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-gray-900 pl-1.5">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                              {entry.userId?.username
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {entry.userId?.username || "Anonymous"}
                                {entry.userId?._id === user.id && " (You)"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  entry.progressPercentage > 75
                                    ? "bg-green-500"
                                    : entry.progressPercentage > 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${entry.progressPercentage || 0}%`,
                                }}
                              ></div>
                            </div>
                            <span className="ml-3 text-sm text-gray-500">
                              {entry.progressPercentage || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiStar className="mr-1 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {entry.averageScore
                                ? `${Math.round(entry.averageScore)}%`
                                : "N/A"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
