import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { discussionAPI } from "../Services/serviceApi";
import {
  FiMessageSquare,
  FiThumbsUp,
  FiShare2,
  FiFlag,
  FiClock,
  FiUser,
} from "react-icons/fi";
import toast from "react-hot-toast";

const DiscussionDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDiscussion = async () => {
      try {
        setLoading(true);
        const response = await discussionAPI.getDiscussion(id);
        setDiscussion(response.discussion);
      } catch (error) {
        console.error("Error fetching discussion:", error);
        toast.error("Failed to load discussion");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussion();
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      const response = await discussionAPI.addReply(id, {
        content: replyContent,
      });
      setDiscussion({
        ...discussion,
        replies: [...discussion.replies, response.reply],
      });
      setReplyContent("");
      toast.success("Reply added successfully");
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await discussionAPI.likeDiscussion(id);
      setDiscussion({
        ...discussion,
        likes: response.likes,
      });
    } catch (error) {
      console.error("Error liking discussion:", error);
      toast.error("Failed to like discussion");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">
          Discussion not found
        </h2>
        <Link
          to="/discussions"
          className="mt-4 text-indigo-600 hover:text-indigo-700"
        >
          Back to discussions
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Discussion Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-4">
            <img
              src={
                discussion.userId.avatar ||
                `https://ui-avatars.com/api/?name=${discussion.userId.name}`
              }
              alt={discussion.userId.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {discussion.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <FiUser className="mr-1" />
                  {discussion.userId.name}
                </span>
                <span className="flex items-center">
                  <FiClock className="mr-1" />
                  {formatDate(discussion.createdAt)}
                </span>
                <div className="flex items-center space-x-2">
                  {discussion.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {discussion.content}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-6 mt-6 pt-4 border-t">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 text-sm ${
                    discussion.likes.includes(user._id)
                      ? "text-indigo-600"
                      : "text-gray-500 hover:text-indigo-600"
                  }`}
                >
                  <FiThumbsUp />
                  <span>{discussion.likes.length} Likes</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-indigo-600">
                  <FiShare2 />
                  <span>Share</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-600">
                  <FiFlag />
                  <span>Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Replies ({discussion.replies.length})
          </h2>

          {/* Reply Form */}
          <form onSubmit={handleReply} className="mb-8">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Add your reply..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows="4"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className={`px-6 py-2 rounded-lg text-white ${
                  submitting || !replyContent.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } transition-colors duration-200`}
              >
                {submitting ? "Posting..." : "Post Reply"}
              </button>
            </div>
          </form>

          {/* Replies List */}
          <div className="space-y-6">
            {discussion.replies.map((reply) => (
              <div key={reply._id} className="flex space-x-4 animate-fadeIn">
                <img
                  src={
                    reply.userId.avatar ||
                    `https://ui-avatars.com/api/?name=${reply.userId.name}`
                  }
                  alt={reply.userId.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {reply.userId.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                  <div className="flex items-center space-x-6 mt-2 ml-4">
                    <button className="text-sm text-gray-500 hover:text-indigo-600">
                      Like
                    </button>
                    <button className="text-sm text-gray-500 hover:text-indigo-600">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;
