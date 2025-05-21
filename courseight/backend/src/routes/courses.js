const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const roleAuth = require("../middleware/roleAuth");
const authMiddleware = require("../middleware/auth");

// Route to create a new course
router.post(
  "/",
  authMiddleware,
  roleAuth(["instructor", "admin"]),
  courseController.createCourse
);

// Route to get all courses
router.get('/', courseController.getAllCourses);

// Route to get a specific course by ID
router.get('/:id', courseController.getCourseById);

// Route to update a course by ID
router.put('/:id', courseController.updateCourse);

// Route to delete a course by ID
router.delete('/:id', courseController.deleteCourse);

// Route to enroll a user in a course
router.post("/:courseId/enroll", authMiddleware, courseController.enrollInCourse);

module.exports = router;