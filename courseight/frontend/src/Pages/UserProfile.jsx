import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./Contexts/AuthContext";
import { courseAPI, progressAPI } from "./Services/serviceApi";
import {
  FiEdit,
  FiSave,
  FiX,
  FiUser,
  FiBookOpen,
  FiBarChart2,
} from "react-icons/fi";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [averageScore, setAverageScore] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
      });

      const fetchUserData = async () => {
        try {
          setLoadingCourses(true);

          // Fetch user's enrolled courses
          const coursesData = await courseAPI.getAllCourses(1, 100);
          const userEnrolledCourses = coursesData.courses.filter((course) =>
            course.students?.includes(user.id)
          );

          // Get progress for each course
          const coursesWithProgress = await Promise.all(
            userEnrolledCourses.map(async (course) => {
              try {
                const progressData = await progressAPI.getUserProgress(
                  user.id,
                  course._id
                );
                return {
                  ...course,
                  progress: progressData.progressPercentage || 0,
                };
              } catch (err) {
                return { ...course, progress: 0 };
              }
            })
          );

          setEnrolledCourses(coursesWithProgress);

          // Get user's average score across all assessments
          try {
            const scoreData = await progressAPI.getUserAverageScore(user.id);
            setAverageScore(scoreData.averageScore);
          } catch (err) {
            console.error("Error fetching average score:", err);
            setAverageScore(null);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          toast.error("Failed to load user data");
        } finally {
          setLoadingCourses(false);
        }
      };

      fetchUserData();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            Personal Information
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl">
              {user?.username?.charAt(0).toUpperCase() || (
                <FiUser className="h-12 w-12" />
              )}
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-medium text-gray-900">
                {user?.username}
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Role:{" "}
                <span className="capitalize">{user?.role || "Student"}</span>
              </p>
            </div>
          </div>

          {!isEditing ? (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiEdit className="mr-2 h-4 w-4" /> Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: user?.username || "",
                      email: user?.email || "",
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiX className="mr-2 h-4 w-4" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <FiSave className="mr-2 h-4 w-4" />{" "}
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Your Courses</h2>
          <div className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm">
            {enrolledCourses.length} Enrolled
          </div>
        </div>
        <div className="p-6">
          {loadingCourses ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : enrolledCourses.length > 0 ? (
            <div className="space-y-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course._id}
                  className="border-b pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Instructor:{" "}
                        {course.instructor?.username || "Instructor"}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      <FiBookOpen className="mr-1 h-4 w-4" /> Enrolled
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">
                        Progress:
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {course.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiBookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No courses enrolled
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't enrolled in any courses yet.
              </p>
              <div className="mt-6">
                <a
                  href="/courses"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Browse Courses
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            Learning Statistics
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 rounded-md">
                  <FiBarChart2 className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Average Assessment Score
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageScore !== null
                      ? `${averageScore.toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-md">
                  <FiBookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Course Completion Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrolledCourses.length > 0
                      ? `${(
                          enrolledCourses.reduce(
                            (sum, course) => sum + course.progress,
                            0
                          ) / enrolledCourses.length
                        ).toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Account Activity
            </h3>
            <div className="border rounded-md p-4 bg-gray-50">
              <p className="text-sm text-gray-600">
                Account created:{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Last login:{" "}
                {user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
