const express = require('express');
const router = express.Router();
const Forum = require('../models/Forum');

// Get forum posts for a course
router.get('/:courseId', async (req, res) => {
  try {
    const forum = await Forum.findOne({ course: req.params.courseId }).populate('posts.user');
    if (!forum) return res.status(404).json({ message: 'Forum not found' });
    res.json(forum.posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
