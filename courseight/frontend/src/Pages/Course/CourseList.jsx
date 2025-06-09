import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseAPI } from "../Services/serviceApi";
import {
  FiBook,
  FiUser,
  FiCalendar,
  FiSearch,
  FiArrowRight,
} from "react-icons/fi";
import toast from "react-hot-toast";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 1,
  });
  const [error, setError] = useState(null);

  const fetchCourses = async (page = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const data = await courseAPI.getAllCourses(
        page,
        pagination.limit,
        searchTerm
      );

      // Check if data is valid
      if (data && data.courses) {
        setCourses(data.courses);
        setPagination(
          data.pagination || {
            page,
            limit: pagination.limit,
            total: data.courses.length,
            pages: 1,
          }
        );
      } else {
        // Handle invalid data format
        setError("Invalid data received from server");
        setCourses([]);
      }
    } catch (err) {
      setError("Failed to load courses");
      toast.error("Failed to load courses");
      console.error(err);
      // Set empty array to prevent UI errors
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(pagination.page, search);
  }, [pagination.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses(1, search);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Available Courses</h1>
        <p className="text-gray-600">Browse and enroll in our courses</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Search
          </button>
        </form>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      ) : (
        <>
          {/* Course Grid with responsive cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white overflow-hidden shadow rounded-lg transition transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div className="bg-indigo-100 p-2 rounded-md flex-shrink-0">
                        <FiBook className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 ml-3">
                        <Link
                          to={`/courses/${course._id}`}
                          className="text-base sm:text-lg font-medium text-gray-900 hover:text-indigo-600 line-clamp-2"
                        >
                          {course.title}
                        </Link>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-1">
                          By{" "}
                          {course.instructor?.username || "Unknown Instructor"}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1 h-4 w-4 text-gray-500" />
                        <span className="text-gray-500">
                          {formatDate(course.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiUser className="mr-1 h-4 w-4 text-gray-500" />
                        <span className="text-gray-500">
                          {course.students?.length || 0} enrolled
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {course.level}
                      </span>
                      <Link
                        to={`/courses/${course._id}`}
                        className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View Details
                        <FiArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-white rounded-lg shadow">
                <FiInfo className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No courses found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => fetchCourses(pagination.page - 1, search)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => fetchCourses(i + 1, search)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page === i + 1
                        ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => fetchCourses(pagination.page + 1, search)}
                  disabled={pagination.page === pagination.pages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === pagination.pages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseList;
