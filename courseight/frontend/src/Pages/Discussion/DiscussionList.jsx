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
  FiThumbsUp,
  FiClock,
  FiTag,
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
  const [sortOrder, setSortOrder] = useState("latest");
  const [expandedDiscussion, setExpandedDiscussion] = useState(null);

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

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // Fetch discussions based on selected course
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        let response;
        
        if (selectedCourseId) {
          response = await discussionAPI.getDiscussionsByCourse(selectedCourseId);
        } else {
          response = await discussionAPI.getDiscussions();
        }
        
        if (response && response.discussions) {
          let filteredDiscussions = response.discussions;
          
          // Apply search filter if search term exists
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredDiscussions = filteredDiscussions.filter(discussion =>
              discussion.title?.toLowerCase().includes(searchLower) ||
              discussion.content?.toLowerCase().includes(searchLower) ||
              discussion.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
          }
          
          // Apply sorting
          filteredDiscussions.sort((a, b) => {
            switch (sortOrder) {
              case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
              case 'mostReplies':
                return (b.replies?.length || 0) - (a.replies?.length || 0);
              case 'mostLikes':
                return (b.likes?.length || 0) - (a.likes?.length || 0);
              default: // 'latest'
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
          });
          
          setDiscussions(filteredDiscussions);
        } else {
          setDiscussions([]);
        }
      } catch (error) {
        console.error("Error fetching discussions:", error);
        toast.error("Failed to fetch discussions");
        setDiscussions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [selectedCourseId, searchTerm, sortOrder]);
  // Handle creating a new discussion
  const handleNewDiscussionSubmit = async (e) => {
    e.preventDefault();

    if (!newDiscussionData.title || !newDiscussionData.content || !newDiscussionData.courseId) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await discussionAPI.createDiscussion({
        ...newDiscussionData,
        tags: newDiscussionData.tags || []
      });

      // Add the new discussion to the list
      if (response.discussion) {
        setDiscussions(prev => [response.discussion, ...prev]);
      }

      // Reset form and close modal
      setNewDiscussionData({
        title: "",
        content: "",
        courseId: "",
        tags: []
      });
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
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Course Discussions
        </h1>
        <button
          onClick={() => setShowNewDiscussion(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          <FiPlus className="mr-2" />
          New Discussion
        </button>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostReplies">Most Replies</option>
            <option value="mostLikes">Most Likes</option>
          </select>
        </div>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-8">
            <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No discussions found</p>
          </div>
        ) : (
          discussions.map((discussion) => (
            <div
              key={discussion._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={
                        discussion.userId.avatar ||
                        `https://ui-avatars.com/api/?name=${discussion.userId.name}`
                      }
                      alt={discussion.userId.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {discussion.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{discussion.userId.name}</span>
                        <span>•</span>
                        <span>{formatDate(discussion.createdAt)}</span>
                        {discussion.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-500">
                    <span className="flex items-center">
                      <FiMessageSquare className="mr-1" />
                      {discussion.replies.length}
                    </span>
                    <span className="flex items-center">
                      <FiThumbsUp className="mr-1" />
                      {discussion.likes.length}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-600 line-clamp-2">
                    {discussion.content}
                  </p>
                </div>

                {/* Replies Preview */}
                {discussion.replies.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>Latest replies</span>
                      <button
                        onClick={() =>
                          setExpandedDiscussion(
                            expandedDiscussion === discussion._id
                              ? null
                              : discussion._id
                          )
                        }
                        className="flex items-center text-indigo-600 hover:text-indigo-700"
                      >
                        {expandedDiscussion === discussion._id
                          ? "Show less"
                          : "Show more"}
                        {expandedDiscussion === discussion._id ? (
                          <FiChevronUp className="ml-1" />
                        ) : (
                          <FiChevronDown className="ml-1" />
                        )}
                      </button>
                    </div>

                    <div
                      className={`space-y-3 ${
                        expandedDiscussion === discussion._id
                          ? ""
                          : "max-h-20 overflow-hidden"
                      }`}
                    >
                      {discussion.replies.map((reply) => (
                        <div key={reply._id} className="flex items-start space-x-3">
                          <img
                            src={
                              reply.userId.avatar ||
                              `https://ui-avatars.com/api/?name=${reply.userId.name}`
                            }
                            alt={reply.userId.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <div className="flex-1 bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {reply.userId.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/discussions/${discussion._id}`}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    View full discussion
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {user && (
        <>
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
