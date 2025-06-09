const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    progressPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;