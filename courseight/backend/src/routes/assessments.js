const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");
const authMiddleware = require("../middleware/auth");

// Route to create a new assessment
router.post("/", assessmentController.createAssessment);

// Route to get all assessments
router.get("/", assessmentController.getAllAssessments);

// Route to get a specific assessment by ID
router.get("/:id", assessmentController.getAssessmentById);

// Route to update an assessment by ID
router.put("/:id", assessmentController.updateAssessment);

// Route to delete an assessment by ID
router.delete("/:id", assessmentController.deleteAssessment);

// Route to get average score per student
router.get("/average/:studentId", assessmentController.getAverageScore);

// Route to get ranking of assessments
router.get("/ranking", assessmentController.getRanking);

// Route to get progress statistics
router.get("/statistics/:courseId", assessmentController.getProgressStatistics);

// Route to get active participants for all courses
router.get("/participants", assessmentController.getAllActiveParticipants);

// Route to get active participants for a specific course
router.get(
  "/participants/:courseId",
  assessmentController.getActiveParticipantsCount
);

// Route to submit an assessment
router.post(
  "/:id/submit",
  authMiddleware,
  assessmentController.autoGradeAssessment
);

// Route to get assessments by course
router.get("/course/:courseId", assessmentController.getAssessmentsByCourse);

module.exports = router;
