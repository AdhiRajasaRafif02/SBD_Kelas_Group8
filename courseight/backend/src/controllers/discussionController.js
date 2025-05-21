const Discussion = require('../models/Discussion');

exports.createDiscussion = async (req, res) => {
  try {
    const { courseId, content } = req.body;
    const userId = req.user._id; // Get user ID from authenticated user

    const newDiscussion = new Discussion({
      courseId,
      userId,
      content,
      createdAt: new Date(),
    });

    await newDiscussion.save();
    res.status(201).json({
      message: "Discussion created successfully",
      discussion: newDiscussion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating discussion",
      error: error.message,
    });
  }
};

// Update updateDiscussion and deleteDiscussion to check ownership:
exports.updateDiscussion = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user._id;

    const discussion = await Discussion.findById(req.params.discussionId);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Check if user is authorized to update this discussion
    if (
      discussion.userId.toString() !== userId.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "instructor"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this discussion" });
    }

    discussion.content = content;
    discussion.updatedAt = new Date();

    await discussion.save();

    res.status(200).json(discussion);
  } catch (error) {
    res.status(500).json({
      message: "Error updating discussion",
      error: error.message,
    });
  }
};

// Get all discussions for a specific course
exports.getDiscussionsByCourse = async (req, res) => {
    try {
        const discussions = await Discussion.find({ courseId: req.params.courseId }).populate('createdBy', 'username');
        res.status(200).json(discussions);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving discussions', error: error.message });
    }
};

// Get a specific discussion by ID
exports.getDiscussionById = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id).populate('createdBy', 'username');
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }
        res.status(200).json(discussion);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving discussion', error: error.message });
    }
};

// Delete a discussion
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Optional: Check if user is authorized to delete this discussion
    // if (discussion.createdBy.toString() !== req.user.id) {
    //     return res.status(403).json({ message: 'Not authorized to delete this discussion' });
    // }

    await Discussion.findByIdAndDelete(req.params.discussionId);

    res.status(200).json({ message: "Discussion deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting discussion", error: error.message });
  }
};