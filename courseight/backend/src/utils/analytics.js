module.exports = {
  calculateAverageScore: async (userId) => {
    try {
      const User = require("../models/User");

      // Find the user by ID
      const user = await User.findById(userId);

      if (!user || !user.courses || user.courses.length === 0) {
        return 0;
      }

      const totalProgress = user.courses.reduce((sum, course) => {
        return sum + (course.progress || 0);
      }, 0);

      return totalProgress / user.courses.length;
    } catch (error) {
      console.error("Error calculating average score:", error);
      return 0;
    }
  },

  getRanking: async (Assessment) => {
    const rankings = await Assessment.aggregate([
      {
        $group: {
          _id: "$userId",
          averageScore: { $avg: "$score" },
        },
      },
      { $sort: { averageScore: -1 } },
    ]);
    return rankings;
  },

  getProgressStatistics: async (Progress, courseId = null) => {
    let pipeline = [];
    
    // Add courseId filter if provided
    if (courseId) {
      pipeline.push({
        $match: { courseId }
      });
    }
    
    // Add the group stage
    pipeline.push({
      $group: {
        _id: "$courseId",
        totalUsers: { $sum: 1 },
        averageProgress: { $avg: "$progressPercentage" },
        minProgress: { $min: "$progressPercentage" },
        maxProgress: { $max: "$progressPercentage" }
      }
    });
    
    // Add lookup to get course title
    pipeline.push({
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "courseInfo"
      }
    });
    
    // Flatten course info
    pipeline.push({
      $addFields: {
        courseTitle: { $arrayElemAt: ["$courseInfo.title", 0] }
      }
    });
    
    // Project only needed fields
    pipeline.push({
      $project: {
        courseInfo: 0
      }
    });
    
    const stats = await Progress.aggregate(pipeline);
    return stats;
  },

  getActiveParticipants: async (Progress, courseId) => {
    let pipeline = [];

    if (courseId) {
      pipeline.push({
        $match: { courseId: courseId },
      });
    }

    pipeline.push({
      $group: {
        _id: "$courseId",
        activeCount: {
          $sum: { $cond: [{ $gt: ["$progressPercentage", 0] }, 1, 0] },
        },
      },
    });

    const activeParticipants = await Progress.aggregate(pipeline);
    return activeParticipants;
  },
};