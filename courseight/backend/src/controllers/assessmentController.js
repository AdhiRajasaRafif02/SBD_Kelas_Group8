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
    const assessments = await Assessment.find().populate("courseId", "title");
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
    const assessmentId = req.params.id;
    const { answers } = req.body;
    const userId = req.user._id;

    console.log(`Processing submission for assessment ${assessmentId}`);

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Set default courseId if missing
    if (!assessment.courseId) {
      // Find a course and set it
      const Course = require("../models/Course");
      const course = await Course.findOne({ assessments: assessmentId });

      if (course) {
        assessment.courseId = course._id;
        await assessment.save();
        console.log(`Fixed courseId for assessment ${assessmentId}`);
      }
    }

    // Add this check before processing answers
    const alreadySubmitted = assessment.results.some(
      (result) => result.userId.toString() === userId.toString()
    );

    if (alreadySubmitted) {
      return res.status(400).json({
        message: "You have already submitted this assessment",
      });
    }

    // Calculate score by comparing answers with correct options
    let score = 0;
    const questionResults = [];

    assessment.questions.forEach((question, index) => {
      const userAnswer = answers[index] || "";

      // Find the correct option index
      const correctOptionIndex = question.options.findIndex(
        (opt) => opt.isCorrect
      );
      const correctAnswer = correctOptionIndex.toString();

      // Check if the answer is correct
      const isCorrect = userAnswer === correctAnswer;
      if (isCorrect) {
        score++;
      }

      questionResults.push({
        id: question._id,
        question: question.questionText,
        userAnswer,
        correctAnswer,
        isCorrect,
        explanation: question.explanation || null,
      });
    });

    // Calculate score percentage
    const maxScore = assessment.questions.length;
    const scorePercentage = Math.round((score / maxScore) * 100);

    // Record the assessment result
    assessment.results = assessment.results || [];
    assessment.results.push({
      userId,
      score: scorePercentage,
      answers,
      submittedAt: new Date(),
    });

    await assessment.save();

    // Update user progress for the course
    try {
      const Progress = require("../models/Progress");
      const Course = require("../models/Course");

      // Look up the course using either the assessment's courseId or by finding in assessments array
      const courseId = assessment.courseId;
      let course;

      if (courseId) {
        // First try to find by the assessment's courseId
        course = await Course.findById(courseId);
      }

      if (!course) {
        // Fallback: find by assessments array
        course = await Course.findOne({ assessments: assessmentId });
      }

      if (!course) {
        console.error(`No course found for assessment ${assessmentId}`);
        throw new Error("Course not found for this assessment");
      }

      console.log(
        `Found course: ${course.title} (${course._id}) for assessment ${assessmentId}`
      );

      // Find or create user's progress for this course
      let progress = await Progress.findOne({ userId, courseId: course._id });

      if (progress) {
        // Calculate how much this assessment contributes to the overall course
        const assessmentWeight = (1 / (course.assessments.length || 1)) * 100;

        // Calculate the pass threshold
        const passed = scorePercentage >= (assessment.passingMarks || 60);

        console.log(
          `User score: ${scorePercentage}%, pass threshold: ${
            assessment.passingMarks || 60
          }%`
        );
        console.log(`Assessment passed: ${passed}`);

        // Only increase progress if user passed the assessment
        if (passed) {
          // Calculate new progress
          const currentProgress = progress.progressPercentage || 0;
          let newProgress = Math.min(100, currentProgress + assessmentWeight);

          console.log(
            `Updating progress from ${currentProgress}% to ${newProgress}%`
          );

          // Update progress percentage
          progress.progressPercentage = newProgress;
        }

        // Update the timestamp
        progress.lastUpdated = new Date();
        await progress.save();

        console.log(
          `Updated progress for user ${userId} to ${progress.progressPercentage}%`
        );
      } else {
        // Create new progress record if none exists
        console.log(
          `Creating new progress record for user ${userId}, course ${course._id}`
        );
        const newProgress = new Progress({
          userId,
          courseId: course._id,
          progressPercentage:
            scorePercentage >= (assessment.passingMarks || 60)
              ? (1 / (course.assessments.length || 1)) * 100
              : 0,
          lastUpdated: new Date(),
        });
        await newProgress.save();
        console.log(
          `Created new progress record: ${newProgress.progressPercentage}%`
        );
      }
    } catch (progressError) {
      console.error("Error updating progress:", progressError);
      // Continue with result return even if progress update fails
    }

    // Return results to frontend
    const result = {
      assessmentId,
      title: assessment.title,
      // Include the actual course information
      courseId: course ? course._id : null,
      courseName: course ? course.title : "Course Assessment",
      score: scorePercentage,
      maxScore: 100,
      passingScore: assessment.passingMarks || 60,
      completedAt: new Date(),
      timeSpent: Math.floor(Math.random() * 30) + 5, // Placeholder
      questionResults,
      feedback: "Thank you for completing this assessment.",
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Assessment submission error:", error);
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
    const activeParticipants = await analyticsUtils.getActiveParticipants(
      Progress
    );
    res.status(200).json(activeParticipants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssessmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assessments = await Assessment.find({ courseId });
    res.status(200).json(assessments);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}