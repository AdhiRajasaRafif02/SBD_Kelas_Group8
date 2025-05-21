const Assessment = require("../models/Assessment");
const analyticsUtils = require("../utils/analytics");

// Create a new assessment
exports.createAssessment = async (req, res) => {
  try {
    const assessment = new Assessment(req.body);
    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all assessments
exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find();
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assessment by ID
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an assessment
exports.updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Auto-grade an assessment
exports.autoGradeAssessment = async (req, res) => {
  try {
    const { assessmentId, studentAnswers } = req.body;
    const userId = req.user._id; // Assuming user is authenticated
    
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Calculate score
    const correctAnswers = assessment.correctAnswers;
    const score = studentAnswers.reduce((total, answer, index) => {
      return total + (answer === correctAnswers[index] ? 1 : 0);
    }, 0);
    
    // Update progress
    const Progress = require("../models/Progress");
    const Course = require("../models/Course");
    
    // Find the course this assessment belongs to
    const course = await Course.findOne({ assessments: assessmentId });
    
    if (course) {
      // Find user's progress for this course
      let progress = await Progress.findOne({ userId, courseId: course._id });
      
      if (progress) {
        // Calculate new progress (this is just an example - you'd need your own logic)
        const totalAssessments = course.assessments.length;
        const progressIncrement = (100 / totalAssessments);
        
        // Update progress, but don't exceed 100%
        progress.progressPercentage = Math.min(100, progress.progressPercentage + progressIncrement);
        progress.lastUpdated = Date.now();
        await progress.save();
      }
    }

    res.status(200).json({ score, updatedProgress: progress?.progressPercentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get average score per student
exports.getAverageScore = async (req, res) => {
  try {
    const { studentId } = req.params;
    const averageScore = await analyticsUtils.calculateAverageScore(
      studentId,
      Assessment
    );
    res.status(200).json({ studentId, averageScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ranking of assessments
exports.getRanking = async (req, res) => {
  try {
    const rankings = await analyticsUtils.getRanking(Assessment);
    res.status(200).json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get progress statistics
exports.getProgressStatistics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const Progress = require("../models/Progress");
    const statistics = await analyticsUtils.getProgressStatistics(Progress);
    res.status(200).json(statistics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active participants count per class
exports.getActiveParticipantsCount = async (req, res) => {
  try {
    const { courseId } = req.params;
    const Progress = require("../models/Progress");
    const mongoose = require("mongoose");

    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(courseId);

    // Pass courseId to the function
    const activeParticipants = await analyticsUtils.getActiveParticipants(
      Progress,
      objectId
    );

    res.status(200).json(activeParticipants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active participants count for all courses
exports.getAllActiveParticipants = async (req, res) => {
  try {
    const Progress = require("../models/Progress");
    const activeParticipants = await analyticsUtils.getActiveParticipants(Progress);
    res.status(200).json(activeParticipants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};