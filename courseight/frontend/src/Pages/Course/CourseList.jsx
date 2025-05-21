import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseAPI } from "../Services/api";
import { FiBook, FiUser, FiCalendar, FiSearch } from "react-icons/fi";
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white overflow-hidden shadow rounded-lg transition transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="bg-indigo-100 p-2 rounded-md">
                        <FiBook className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="bg-gray-100 px-2.5 py-0.5 rounded-full text-sm font-medium text-gray-800">
                        {course.students?.length || 0} students
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 truncate">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="mt-4 flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                          {course.instructor?.username?.charAt(0) || "I"}
                        </div>
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-900">
                          {course.instructor?.username || "Instructor"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span>Created {formatDate(course.createdAt)}</span>
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/courses/${course._id}`}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <FiBook className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No courses found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search parameters.
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
