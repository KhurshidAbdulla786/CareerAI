const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requiredSkills: [String],
    matchResult: {
      matchPercentage: { type: Number, min: 0, max: 100 },
      matchingSkills: [String],
      missingSkills: [String],
      explanation: String,
      suggestions: [String],
      detailedAnalysis: String,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);