const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 200,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: 200,
    },
    salary: {
      min: {
        type: Number,
        default: 0,
        min: 0,
      },
      max: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
      },
    },
    experienceRequired: {
      min: {
        type: Number,
        default: 0,
        min: 0,
      },
      max: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    jobType: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'contract', 'internship'],
        message: 'Invalid job type',
      },
      default: 'full-time',
    },
    workMode: {
      type: String,
      enum: {
        values: ['remote', 'onsite', 'hybrid'],
        message: 'Invalid work mode',
      },
      default: 'onsite',
    },
    skillsRequired: {
      type: [String],
      required: [true, 'At least one skill is required'],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one skill is required',
      },
      set: (skills) => skills.map((s) => s.trim().toLowerCase()),
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', ''],
      default: '',
    },
    benefits: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Posted by is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicationsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobSchema.index({ location: 1 });
jobSchema.index({ skillsRequired: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ 'experienceRequired.min': 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ isActive: 1, createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

jobSchema.virtual('salaryDisplay').get(function () {
  if (!this.salary || (!this.salary.min && !this.salary.max)) return 'Not specified';
  const currency = this.salary.currency || 'USD';
  if (this.salary.min && this.salary.max) {
    return `${currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()}`;
  }
  if (this.salary.min) return `${currency} ${this.salary.min.toLocaleString()}+`;
  return `Up to ${currency} ${this.salary.max.toLocaleString()}`;
});

jobSchema.virtual('isExpired').get(function () {
  if (!this.deadline) return false;
  return new Date() > this.deadline;
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
