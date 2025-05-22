const Discussion = require('../models/Discussion');
const Course = require('../models/Course');
const User = require('../models/User');
const { errorHandler } = require('../middleware/error');

// Custom error classes
class DiscussionError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'DiscussionError';
    this.statusCode = statusCode;
  }
}

// Get all discussions with filters
exports.getDiscussions = async (req, res) => {
  try {
    const { courseId, search, filter, sort = 'latest' } = req.query;
    let query = {};

    // Apply filters
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new DiscussionError('Course not found', 404);
      }
      query.courseId = courseId;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Determine sort order
    let sortQuery = {};
    switch (sort) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'mostReplies':
        sortQuery = { 'replies.length': -1 };
        break;
      case 'mostLikes':
        sortQuery = { 'likes.length': -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }    const discussions = await Discussion.find(query)
      .sort(sortQuery)
      .populate('userId', 'name avatar')
      .populate('courseId', 'title')
      .populate('replies.userId', 'name avatar')
      .exec();

    if (!discussions) {
      throw new DiscussionError('Error fetching discussions', 500);
    }

    // Transform the data to include total counts
    const response = {
      discussions,
      total: discussions.length,
      hasMore: false, // You can implement pagination later
      metadata: {
        totalReplies: discussions.reduce((sum, disc) => sum + (disc.replies?.length || 0), 0),
        totalLikes: discussions.reduce((sum, disc) => sum + (disc.likes?.length || 0), 0),
      }
    };

    res.json(response);
  } catch (error) {
    if (error instanceof DiscussionError) {
      res.status(error.statusCode).json({
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      errorHandler(error, req, res);
    }
  }
};

// Get discussions by course
exports.getDiscussionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const discussions = await Discussion.find({ courseId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar');

    res.json({ discussions });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Get single discussion by ID
exports.getDiscussionById = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const discussion = await Discussion.findById(discussionId)
      .populate('userId', 'name avatar')
      .populate('courseId', 'title')
      .populate('replies.userId', 'name avatar')
      .populate('likes', 'name avatar');

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    res.json({ discussion });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Create new discussion
exports.createDiscussion = async (req, res) => {
  try {
    const { courseId, title, content, tags } = req.body;
    const userId = req.user._id;

    // Validate if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const discussion = new Discussion({
      courseId,
      userId,
      title,
      content,
      tags: tags || []
    });

    await discussion.save();

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('userId', 'name avatar')
      .populate('courseId', 'title');

    res.status(201).json({ discussion: populatedDiscussion });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Update discussion
exports.updateDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user._id;

    const discussion = await Discussion.findOne({ _id: discussionId, userId });
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found or you don't have permission to update it" });
    }

    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    discussion.tags = tags || discussion.tags;

    await discussion.save();

    const updatedDiscussion = await Discussion.findById(discussionId)
      .populate('userId', 'name avatar')
      .populate('courseId', 'title')
      .populate('replies.userId', 'name avatar');

    res.json({ discussion: updatedDiscussion });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Delete discussion
exports.deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user._id;

    const discussion = await Discussion.findOne({ _id: discussionId, userId });
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found or you don't have permission to delete it" });
    }

    await discussion.deleteOne();
    res.json({ message: "Discussion deleted successfully" });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Add reply to discussion
exports.addReply = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) {
      return res.status(400).json({ message: "Reply content is required" });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const reply = {
      userId,
      content,
      createdAt: Date.now()
    };

    discussion.replies.push(reply);
    await discussion.save();

    const populatedDiscussion = await Discussion.findById(discussionId)
      .populate('userId', 'name avatar')
      .populate('replies.userId', 'name avatar');

    const newReply = populatedDiscussion.replies[populatedDiscussion.replies.length - 1];

    res.status(201).json({ reply: newReply });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Toggle like on discussion
exports.toggleLike = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user._id;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const userLikeIndex = discussion.likes.indexOf(userId);
    
    if (userLikeIndex === -1) {
      // User hasn't liked the discussion yet, add like
      discussion.likes.push(userId);
    } else {
      // User already liked the discussion, remove like
      discussion.likes.splice(userLikeIndex, 1);
    }

    await discussion.save();
    
    const updatedDiscussion = await Discussion.findById(discussionId)
      .populate('likes', 'name avatar');
    
    res.json({ likes: updatedDiscussion.likes });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Delete reply from discussion
exports.deleteReply = async (req, res) => {
  try {
    const { discussionId, replyId } = req.params;
    const userId = req.user._id;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Find the reply
    const replyIndex = discussion.replies.findIndex(reply => 
      reply._id.toString() === replyId && reply.userId.toString() === userId.toString()
    );

    if (replyIndex === -1) {
      return res.status(404).json({ message: "Reply not found or you don't have permission to delete it" });
    }

    // Remove the reply
    discussion.replies.splice(replyIndex, 1);
    await discussion.save();

    res.json({ message: "Reply deleted successfully" });
  } catch (error) {
    errorHandler(error, req, res);
  }
};