const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Grade = require('../models/Grade');

// Get grades for a course
router.get('/:courseId', async (req, res) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId }).populate('user');
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get average grade per student
router.get('/average/:courseId', async (req, res) => {
  try {
    const averages = await Grade.aggregate([
      { $match: { course: mongoose.Types.ObjectId(req.params.courseId) } },
      { $group: { _id: "$user", averageScore: { $avg: "$score" } } },
      { $sort: { averageScore: -1 } },
    ]);
    res.json(averages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
