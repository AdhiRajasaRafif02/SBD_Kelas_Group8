const express = require("express");
const router = express.Router();
const discussionController = require("../controllers/discussionController");
const authMiddleware = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Route to get all discussions (with filters)
router.get("/", discussionController.getDiscussions);

// Route to create a new discussion
router.post("/", discussionController.createDiscussion);

// Route to get all discussions for a specific course
router.get("/course/:courseId", discussionController.getDiscussionsByCourse);

// Route to get a specific discussion by ID
router.get("/:discussionId", discussionController.getDiscussionById);

// Route to update a discussion by ID - only allow authors and admins
router.put("/:discussionId", discussionController.updateDiscussion);

// Route to delete a discussion by ID - only allow authors and admins
router.delete("/:discussionId", discussionController.deleteDiscussion);

// Route to add a reply to a discussion
router.post("/:discussionId/replies", discussionController.addReply);

// Route to like/unlike a discussion
router.post("/:discussionId/like", discussionController.toggleLike);

// Route to delete a reply
router.delete("/:discussionId/replies/:replyId", discussionController.deleteReply);

module.exports = router;
