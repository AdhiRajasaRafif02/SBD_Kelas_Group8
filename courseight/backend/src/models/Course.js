const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    assessments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
    }],
    discussions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
    }],
});

courseSchema.methods.getAverageScore = function() {
    // Logic for calculating average score can be implemented here
};

courseSchema.methods.getActiveParticipants = function() {
    // Logic for retrieving active participants can be implemented here
};
// Add this to improve query performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ instructor: 1 });
courseSchema.index({ createdAt: -1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;