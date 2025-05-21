import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { discussionAPI, courseAPI } from "../Services/serviceApi";
import {
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
} from "react-icons/fi";
import toast from "react-hot-toast";

const DiscussionList = () => {
  const { user } = useContext(AuthContext);
  const [discussions, setDiscussions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newDiscussionData, setNewDiscussionData] = useState({
    content: "",
    courseId: "",
  });

  // Fetch courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await courseAPI.getAllCourses(1, 100);
        setCourses(coursesData.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses");
        setCourses([]);
      }
    };

    fetchCourses();
  }, []);

  // Fetch discussions based on filters
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        let discussionsData = [];

        if (filter === "course" && selectedCourseId) {
          // Fetch discussions for a specific course
          discussionsData = await discussionAPI.getDiscussionsByCourse(
            selectedCourseId
          );
        } else {
          // Fetch all discussions
          discussionsData = await discussionAPI.getAllDiscussions();

          // Filter by user if needed
          if (filter === "my" && user) {
            discussionsData = discussionsData.filter(
              (d) => d.userId === user.id
            );
          }
        }

        // Apply search filter if provided
        if (searchTerm) {
          discussionsData = discussionsData.filter((d) =>
            d.content.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setDiscussions(discussionsData);
      } catch (error) {
        console.error("Error fetching discussions:", error);
        toast.error("Failed to fetch discussions");
        setDiscussions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [searchTerm, filter, selectedCourseId, user?.id]);

  // Handle creating a new discussion
  const handleNewDiscussionSubmit = async (e) => {
    e.preventDefault();

    if (!newDiscussionData.content || !newDiscussionData.courseId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await discussionAPI.createDiscussion(newDiscussionData);

      // Reset form and refresh discussions
      setNewDiscussionData({ content: "", courseId: "" });
      setShowNewDiscussion(false);

      // Refresh discussions list
      if (filter === "course" && selectedCourseId) {
        const updatedDiscussions = await discussionAPI.getDiscussionsByCourse(
          selectedCourseId
        );
        setDiscussions(updatedDiscussions);
      } else {
        const allDiscussions = await discussionAPI.getAllDiscussions();
        setDiscussions(allDiscussions);
      }

      toast.success("Discussion created successfully");
    } catch (error) {
      console.error("Error creating discussion:", error);
      toast.error("Failed to create discussion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        <FiMessageSquare className="inline-block mr-2 text-indigo-600" />
        Course Discussions
      </h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <FiSearch className="absolute top-3 left-3 text-gray-500" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            <FiFilter className="mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {showFilters ? (
              <FiChevronDown className="ml-2" />
            ) : (
              <FiChevronUp className="ml-2" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <h2 className="font-medium text-gray-700 mb-3">Filter Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter By
                </label>
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    if (e.target.value !== "course") {
                      setSelectedCourseId("");
                    }
                  }}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Discussions</option>
                  {user && <option value="my">My Discussions</option>}
                  <option value="course">By Course</option>
                </select>
              </div>

              {filter === "course" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a course...</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-10">
            <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No discussions found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === "my"
                ? "You haven't created any discussions yet."
                : filter === "course" && selectedCourseId
                ? `No discussions for ${getCourseTitle(selectedCourseId)}.`
                : "No discussions match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div
                key={discussion._id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="mb-2">
                  <Link
                    to={`/discussions/${discussion._id}`}
                    className="text-lg font-medium text-indigo-600 hover:text-indigo-800 line-clamp-1 mb-2"
                  >
                    {discussion.content.substring(0, 60)}...
                  </Link>
                  <p className="text-gray-600 line-clamp-2">
                    {discussion.content}
                  </p>
                </div>

                <div className="flex flex-wrap items-center text-gray-500 text-sm mt-3">
                  <div className="flex items-center mr-4">
                    <FiUser className="mr-1" />
                    <span>{discussion.user?.username || "Unknown User"}</span>
                  </div>

                  <div className="flex items-center mr-4">
                    <FiCalendar className="mr-1" />
                    <span>
                      {new Date(discussion.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mr-4 px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {getCourseTitle(discussion.courseId)}
                  </div>

                  <div className="ml-auto flex space-x-2">
                    {user &&
                      (discussion.userId === user._id ||
                        user.role === "admin" ||
                        user.role === "instructor") && (
                        <>
                          <Link to={`/discussions/edit/${discussion._id}`}>
                            <button className="text-blue-500 hover:text-blue-700">
                              <FiEdit size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteDiscussion(discussion._id)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash size={16} />
                          </button>
                        </>
                      )}
                    <Link
                      to={`/discussions/${discussion._id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {user && (
        <>
          <button
            onClick={() => setShowNewDiscussion(true)}
            className="fixed bottom-8 right-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition"
          >
            <FiPlus className="text-xl" />
          </button>

          {showNewDiscussion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Start a New Discussion
                  </h2>
                  <button
                    onClick={() => setShowNewDiscussion(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleNewDiscussionSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <select
                      name="courseId"
                      value={newDiscussionData.courseId}
                      onChange={(e) =>
                        setNewDiscussionData({
                          ...newDiscussionData,
                          courseId: e.target.value,
                        })
                      }
                      required
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a course...</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discussion
                    </label>
                    <textarea
                      name="content"
                      value={newDiscussionData.content}
                      onChange={(e) =>
                        setNewDiscussionData({
                          ...newDiscussionData,
                          content: e.target.value,
                        })
                      }
                      required
                      rows={5}
                      placeholder="What would you like to discuss?"
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowNewDiscussion(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Post Discussion
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DiscussionList;
