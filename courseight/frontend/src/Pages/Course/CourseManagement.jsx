import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { courseAPI } from "../Services/serviceApi";
import {
  FiBook,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiBarChart2,
  FiSearch,
  FiCalendar,
} from "react-icons/fi";
import toast from "react-hot-toast";

const CourseManagement = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Fetch only instructor's courses
        const coursesData = await courseAPI.getCoursesByInstructor(user.id);
        setCourses(coursesData || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user.id]);

  const handleDeleteCourse = async (courseId) => {
    // When first clicked, just set confirmation state
    if (confirmDelete !== courseId) {
      setConfirmDelete(courseId);
      return;
    }

    // If already confirmed, proceed with deletion
    try {
      await courseAPI.deleteCourse(courseId);
      toast.success("Course deleted successfully");
      // Remove deleted course from state
      setCourses(courses.filter((course) => course._id !== courseId));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Course Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage your courses and track student progress
          </p>
        </div>
        <Link
          to="/instructor/courses/create"
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FiPlus className="mr-2 -ml-1 h-5 w-5" />
          Create New Course
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiBook className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No courses found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {courses.length === 0
              ? "You haven't created any courses yet."
              : "No courses match your search criteria."}
          </p>
          <div className="mt-6">
            <Link
              to="/instructor/courses/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FiPlus className="mr-2 -ml-1 h-5 w-5" />
              Create New Course
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredCourses.map((course) => (
              <li key={course._id} className="px-4 py-4 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-md">
                        <FiBook className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/instructor/courses/${course._id}`}
                          className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          {course.title}
                        </Link>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FiCalendar className="mr-1.5 h-4 w-4" />
                          <span>
                            Last updated: {formatDate(course.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4">
                      <div className="flex items-center">
                        <FiUsers className="mr-1.5 h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {course.students?.length || 0} enrolled students
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiBarChart2 className="mr-1.5 h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {course.assessments?.length || 0} assessments
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex mt-4 sm:mt-0 space-x-3">
                    <Link
                      to={`/instructor/courses/edit/${course._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FiEdit2 className="mr-1.5 h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                        confirmDelete === course._id
                          ? "text-white bg-red-600 hover:bg-red-700"
                          : "text-red-700 bg-red-100 hover:bg-red-200"
                      }`}
                    >
                      <FiTrash2 className="mr-1.5 h-4 w-4" />
                      {confirmDelete === course._id ? "Confirm" : "Delete"}
                    </button>
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

export default CourseManagement;
