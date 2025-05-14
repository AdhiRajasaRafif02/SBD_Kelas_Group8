const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// Get progress for a user
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('progress.course');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get progress statistics for a course
router.get('/statistics/:courseId', async (req, res) => {
  try {
    const statistics = await User.aggregate([
      { $unwind: "$progress" },
      { $match: { "progress.course": mongoose.Types.ObjectId(req.params.courseId) } },
      { $group: {
          _id: null,
          totalParticipants: { $sum: 1 },
          completed: { $sum: { $cond: ["$progress.completed", 1, 0] } },
        },
      },
    ]);
    res.json(statistics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
