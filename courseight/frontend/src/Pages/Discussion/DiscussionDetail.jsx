import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { discussionAPI, courseAPI } from "../Services/api";
import {
  FiMessageSquare,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

const DiscussionDetail = () => {
  const { id: discussionId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [discussion, setDiscussion] = useState(null);
  const [course, setCourse] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch discussion and related data
  useEffect(() => {
    const fetchDiscussionDetails = async () => {
      try {
        setLoading(true);

        // Fetch discussion details
        const discussionData = await discussionAPI.getDiscussionById(
          discussionId
        );
        setDiscussion(discussionData);
        setEditContent(discussionData.content);

        // Fetch course details if courseId exists
        if (discussionData.courseId) {
          try {
            const courseData = await courseAPI.getCourseById(
              discussionData.courseId
            );
            setCourse(courseData);
          } catch (error) {
            console.error("Error fetching course details:", error);
          }
        }

        // Fetch responses
        if (discussionData.responses) {
          setResponses(discussionData.responses);
        }
      } catch (error) {
        console.error("Error fetching discussion details:", error);
        toast.error("Failed to load discussion");
        navigate("/discussions");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussionDetails();
  }, [discussionId, navigate]);

  // Handle discussion edit
  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Discussion content cannot be empty");
      return;
    }

    try {
      setSubmitting(true);
      // Update the discussion via API
      const updatedDiscussion = await discussionAPI.updateDiscussion(
        discussionId,
        { content: editContent }
      );

      setDiscussion(updatedDiscussion);
      setIsEditing(false);
      toast.success("Discussion updated successfully");
    } catch (error) {
      console.error("Error updating discussion:", error);
      toast.error("Failed to update discussion");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle discussion deletion
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this discussion?")) {
      return;
    }

    try {
      setSubmitting(true);
      await discussionAPI.deleteDiscussion(discussionId);
      toast.success("Discussion deleted successfully");
      navigate("/discussions");
    } catch (error) {
      console.error("Error deleting discussion:", error);
      toast.error("Failed to delete discussion");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle new response submission
  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!newResponse.trim()) {
      toast.error("Response cannot be empty");
      return;
    }

    try {
      setSubmitting(true);
      const response = await discussionAPI.addResponse(
        discussionId,
        newResponse
      );

      // Add the response to the list
      setResponses((prev) => [...prev, response]);
      setNewResponse("");
      toast.success("Response added successfully");
    } catch (error) {
      console.error("Error adding response:", error);
      toast.error("Failed to add response");
    } finally {
      setSubmitting(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if user can edit or delete
  const canEditOrDelete = () => {
    if (!user || !discussion) return false;
    return user.id === discussion.userId || user.role === "admin";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Discussion not found</h2>
        <Link
          to="/discussions"
          className="text-indigo-600 hover:text-indigo-800"
        >
          &larr; Back to discussions
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        to="/discussions"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <FiArrowLeft className="mr-2" /> Back to discussions
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Discussion header */}
        <div className="bg-indigo-50 p-4 border-b border-indigo-100">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-semibold">
                {discussion.user?.username?.charAt(0) || "U"}
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">
                  {discussion.user?.username || "Unknown User"}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <FiCalendar className="mr-1" size={14} />
                  <span>{formatDate(discussion.createdAt)}</span>
                </div>
              </div>
            </div>

            {course && (
              <Link
                to={`/courses/${course._id}`}
                className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full hover:bg-indigo-200"
              >
                {course.title}
              </Link>
            )}
          </div>
        </div>

        {/* Discussion content */}
        <div className="p-6">
          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 min-h-[150px]"
                placeholder="Discussion content"
              />

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={submitting}
                >
                  <FiX className="inline mr-1" /> Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={submitting}
                >
                  <FiSave className="inline mr-1" /> Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-800 whitespace-pre-line text-lg">
                {discussion.content}
              </p>

              {discussion.updatedAt > discussion.createdAt && (
                <p className="text-xs text-gray-500 mt-4 italic">
                  Last updated: {formatDate(discussion.updatedAt)}
                </p>
              )}

              {canEditOrDelete() && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    disabled={submitting}
                  >
                    <FiEdit2 className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
                    disabled={submitting}
                  >
                    <FiTrash2 className="mr-1" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Responses/Comments section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2 flex items-center">
          <FiMessageCircle className="mr-2" /> Responses ({responses.length})
        </h2>

        {responses.length > 0 ? (
          <div className="space-y-6">
            {responses.map((response) => (
              <div
                key={response._id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                    {response.user?.username?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-900">
                        {response.user?.username || "Unknown User"}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDate(response.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-800">{response.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              No responses yet. Be the first to respond!
            </p>
          </div>
        )}
      </div>

      {/* Add response form */}
      {user && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800">
            Add Your Response
          </h3>
          <form onSubmit={handleSubmitResponse}>
            <textarea
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder="Share your thoughts or answer the question..."
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
              required
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiSend className="mr-2" />
                {submitting ? "Posting..." : "Post Response"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DiscussionDetail;
