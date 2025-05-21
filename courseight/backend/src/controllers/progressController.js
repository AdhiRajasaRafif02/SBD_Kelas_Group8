const Progress = require("../models/Progress");

// Get user progress for a specific course
exports.getUserProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateUserProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const { percentage } = req.body;

    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      progress = new Progress({
        userId: userId,
        courseId: courseId,
        progressPercentage: percentage || 0, // Changed from percentage to progressPercentage
      });
    } else {
      progress.progressPercentage = percentage; // Changed from percentage to progressPercentage
      progress.lastUpdated = Date.now();
    }

    await progress.save();

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user average score
exports.getUserAverageScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const analyticsUtils = require("../utils/analytics");
    const averageScore = await analyticsUtils.calculateAverageScore(userId);

    res.status(200).json({
      userId,
      averageScore,
      message:
        "This is the average progress percentage across all courses the user is enrolled in",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get course ranking
exports.getCourseRanking = async (req, res) => {
  try {
    const { courseId } = req.params;
    const Progress = require("../models/Progress");

    // Find all progress records for this course and sort by progressPercentage
    const rankings = await Progress.find({ courseId })
      .sort({ progressPercentage: -1 })
      .populate("userId", "username email")
      .select("userId progressPercentage lastUpdated");

    if (rankings.length === 0) {
      return res
        .status(404)
        .json({ message: "No progress data found for this course" });
    }

    res.status(200).json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course progress statistics
exports.getCourseProgressStatistics = async (req, res) => {
  try {
    // const { courseId } = req.params;
    const Progress = require("../models/Progress");
    const analyticsUtils = require("../utils/analytics");

    const statistics = await analyticsUtils.getProgressStatistics(Progress);

    res.status(200).json(statistics);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
