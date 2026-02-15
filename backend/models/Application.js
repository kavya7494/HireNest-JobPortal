const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['applied', 'shortlisted', 'interview', 'rejected', 'hired'],
        message: 'Invalid application status',
      },
      default: 'applied',
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    interviewDate: {
      type: Date,
    },
    recruiterNotes: {
      type: String,
      maxlength: 1000,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ matchScore: -1 });

applicationSchema.virtual('matchBadge').get(function () {
  if (this.matchScore >= 80) return 'Excellent Match';
  if (this.matchScore >= 60) return 'Good Match';
  if (this.matchScore >= 40) return 'Fair Match';
  return 'Low Match';
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
