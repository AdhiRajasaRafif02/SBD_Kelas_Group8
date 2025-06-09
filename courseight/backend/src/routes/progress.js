const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const authMiddleware = require("../middleware/auth");

// Get user progress for a course
router.get(
  "/user/:userId/course/:courseId",
  authMiddleware,
  progressController.getUserProgress
);

// Update user progress for a course
router.put(
  "/user/:userId/course/:courseId",
  authMiddleware,
  progressController.updateUserProgress
);

// Get user average score
router.get(
  "/user/:userId/average-score",
  authMiddleware,
  progressController.getUserAverageScore
);

// Get course ranking
router.get(
  "/course/:courseId/ranking",
  authMiddleware,
  progressController.getCourseRanking
);

// Get course progress statistics
router.get(
  "/course/statistics",
  authMiddleware,
  progressController.getCourseProgressStatistics
);

module.exports = router;
