const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passingMarks: {
        type: Number,
        required: true
    },
    questions: [{
        questionText: {
            type: String,
            required: true
        },
        options: [{
            optionText: {
                type: String,
                required: true
            },
            isCorrect: {
                type: Boolean,
                required: true
            }
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Method to calculate average score for an assessment
AssessmentSchema.statics.calculateAverageScore = async function(assessmentId) {
    const results = await this.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(assessmentId) } },
        { $unwind: "$results" },
        { $group: { _id: null, averageScore: { $avg: "$results.score" } } }
    ]);
    return results.length > 0 ? results[0].averageScore : 0;
};

module.exports = mongoose.model('Assessment', AssessmentSchema);