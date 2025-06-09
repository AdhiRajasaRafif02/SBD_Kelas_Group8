const Progress = require("../models/Progress");
const Assessment = require("../models/Assessment");
const mongoose = require("mongoose");

// Get user progress for a specific course
exports.getUserProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    console.log(`Fetching progress for user ${userId} and course ${courseId}`);

    const progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    console.log(`Found progress: ${progress.progressPercentage}%`);
    res.status(200).json(progress);
  } catch (error) {
    console.error("Progress fetch error:", error);
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
    const Assessment = require("../models/Assessment");

    // First, get the basic progress data
    const progressData = await Progress.find({ courseId })
      .sort({ progressPercentage: -1 })
      .populate("userId", "username email")
      .select("userId progressPercentage lastUpdated");

    // Get all assessments for this course with their results
    const assessments = await Assessment.find({ courseId }).lean();

    // Create a map to store user scores
    const userScores = {};

    // Process all assessment results
    assessments.forEach((assessment) => {
      if (assessment.results && Array.isArray(assessment.results)) {
        assessment.results.forEach((result) => {
          if (result.userId && result.score) {
            const userId = result.userId.toString();
            if (!userScores[userId]) {
              userScores[userId] = {
                totalScore: 0,
                count: 0,
              };
            }
            userScores[userId].totalScore += result.score;
            userScores[userId].count += 1;
          }
        });
      }
    });

    // Add average scores to progress data
    const enhancedRankings = progressData.map((progress) => {
      const userId = progress.userId._id.toString();
      const userScore = userScores[userId];
      const averageScore = userScore
        ? userScore.totalScore / userScore.count
        : 0;

      return {
        ...progress.toObject(),
        averageScore: averageScore,
      };
    });

    res.status(200).json(enhancedRankings);
  } catch (error) {
    console.error("Error in getCourseRanking:", error);
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
