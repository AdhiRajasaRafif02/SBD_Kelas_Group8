const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  progress: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    completed: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
