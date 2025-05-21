const Course = require('../models/Course');
const User = require("../models/User");
const Joi = require("joi");
const { validateInput } = require("../utils/helpers");

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    // Define validation schema
    const schema = Joi.object({
      title: Joi.string().required().min(3).max(100),
      description: Joi.string().required().min(10),
      // Add other fields as needed
    });

    // Validate input
    const validationError = validateInput(req.body, schema);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Use the authenticated user's ID as the instructor
    const courseData = {
      ...req.body,
      instructor: req.user._id,
    };

    const course = new Course(courseData);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Add search functionality
    const search = req.query.search || "";
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Execute query with pagination
    const courses = await Course.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("instructor", "username email");

    // Get total count for pagination info
    const total = await Course.countDocuments(query);

    res.status(200).json({
      courses,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a course by ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a course
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is already enrolled
    const alreadyEnrolled = course.students.includes(userId);
    if (alreadyEnrolled) {
      return res
        .status(400)
        .json({ message: "User already enrolled in this course" });
    }

    // Add user to course students
    course.students.push(userId);
    await course.save();

    // Add course to user's enrolled courses
    const user = await User.findById(userId);
    user.courses.push({ courseId });
    await user.save();

    // Create initial progress record
    const Progress = require("../models/Progress");
    const progress = new Progress({
      userId,
      courseId,
      progressPercentage: 0,
    });
    await progress.save();

    res.status(200).json({ message: "Successfully enrolled in course" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};