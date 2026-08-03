const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
    },
    parsedData: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      education: [
        {
          degree: String,
          institution: String,
          year: String,
          gpa: String,
        },
      ],
      skills: [String],
      projects: [
        {
          title: String,
          description: String,
          technologies: [String],
          link: String,
        },
      ],
      experience: [
        {
          company: String,
          role: String,
          duration: String,
          description: String,
        },
      ],
      certifications: [String],
      languages: [String],
    },
    analysisResult: {
      overallScore: { type: Number, min: 0, max: 100 },
      technicalSkills: {
        score: Number,
        strengths: [String],
        weaknesses: [String],
      },
      strengths: [String],
      weaknesses: [String],
      missingSkills: [String],
      suggestions: [String],
      atsCompatibility: {
        score: Number,
        issues: [String],
        recommendations: [String],
      },
      detailedFeedback: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
cvSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CV', cvSchema);