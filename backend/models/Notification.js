const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    type: {
      type: String,
      enum: {
        values: [
          'application_submitted',
          'status_updated',
          'interview_scheduled',
          'recruiter_approved',
          'recruiter_rejected',
          'job_posted',
        ],
        message: 'Invalid notification type',
      },
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      maxlength: 500,
    },
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
