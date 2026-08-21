const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const { calculateMatchScore, getMatchedSkills } = require('../services/matchingService');
const { sendApplicationEmail, sendStatusUpdateEmail, sendInterviewEmail } = require('../services/emailService');

exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const candidateId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    if (!job.isActive) {
      return next(new AppError('This job is no longer accepting applications.', 400));
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: candidateId,
    });
    if (existingApplication) {
      return next(new AppError('You have already applied to this job.', 409));
    }

    const candidate = await User.findById(candidateId);
    const matchScore = calculateMatchScore(candidate.skills, job.skillsRequired);
    const { matched, missing } = getMatchedSkills(candidate.skills, job.skillsRequired);

    const application = await Application.create({
      job: jobId,
      candidate: candidateId,
      matchScore,
      coverLetter: req.body.coverLetter || '',
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    const recruiterNotification = await Notification.create({
      user: job.postedBy,
      type: 'application_submitted',
      title: 'New Application Received',
      message: `${candidate.name} applied for ${job.title} with a ${matchScore}% match score.`,
      relatedJob: jobId,
      relatedApplication: application._id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${job.postedBy.toString()}`).emit('notification', recruiterNotification);
    }

    sendApplicationEmail(candidate.email, {
      candidateName: candidate.name,
      jobTitle: job.title,
      company: job.company,
      matchScore,
    }).catch(() => {});

    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title company location salary jobType')
      .populate('candidate', 'name email skills');

    sendSuccess(res, 201, 'Application submitted successfully', {
      application: populatedApplication,
      matchDetails: { score: matchScore, matched, missing },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const filter = { candidate: req.user.id };
    console.log("MY APPLICATIONS USER ID:", req.user.id);
    console.log("MY APPLICATIONS FILTER:", filter);
    if (status) filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'job',
          select: 'title company location salary jobType workMode skillsRequired isActive',
          populate: { path: 'postedBy', select: 'name companyName avatar' },
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Application.countDocuments(filter),
    ]);
    console.log("MY APPLICATIONS FOUND:", applications.length);
    console.log("MY APPLICATIONS TOTAL:", total);

    sendPaginated(res, 200, 'Applications retrieved', applications, page, limit, total);
  } catch (error) {
    next(error);
  }
};

exports.getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 20, status, sortBy = 'matchScore', sortOrder = 'desc' } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to view applicants for this job.', 403));
    }

    const filter = { job: jobId };
    if (status) filter.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('candidate', 'name email skills experience education resumeUrl location avatar phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Application.countDocuments(filter),
    ]);

    sendPaginated(res, 200, 'Applicants retrieved', applications, page, limit, total);
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, interviewDate, recruiterNotes } = req.body;

    const application = await Application.findById(id)
      .populate('job', 'title company postedBy')
      .populate('candidate', 'name email');

    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this application.', 403));
    }

    application.status = status;
    if (recruiterNotes) application.recruiterNotes = recruiterNotes;
    if (interviewDate && status === 'interview') {
      application.interviewDate = new Date(interviewDate);
    }

    await application.save();

    const notification = await Notification.create({
      user: application.candidate._id,
      type: status === 'interview' ? 'interview_scheduled' : 'status_updated',
      title: status === 'interview' ? 'Interview Scheduled' : 'Application Status Updated',
      message:
        status === 'interview'
          ? `Your interview for ${application.job.title} at ${application.job.company} has been scheduled.`
          : `Your application for ${application.job.title} at ${application.job.company} has been ${status}.`,
      relatedJob: application.job._id,
      relatedApplication: application._id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${application.candidate._id.toString()}`).emit('notification', notification);
    }

    if (status === 'interview' && interviewDate) {
      sendInterviewEmail(application.candidate.email, {
        candidateName: application.candidate.name,
        jobTitle: application.job.title,
        company: application.job.company,
        interviewDate,
      }).catch(() => {});
    } else {
      sendStatusUpdateEmail(application.candidate.email, {
        candidateName: application.candidate.name,
        jobTitle: application.job.title,
        company: application.job.company,
        status,
      }).catch(() => {});
    }

    sendSuccess(res, 200, `Application status updated to ${status}`, { application });
  } catch (error) {
    next(error);
  }
};

exports.getApplicationStats = async (req, res, next) => {
  try {
    const candidateId = new mongoose.Types.ObjectId(req.user.id);

    const stats = await Application.aggregate([
      { $match: { candidate: candidateId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalApplications = await Application.countDocuments({ candidate: candidateId });

    const statusBreakdown = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      rejected: 0,
      hired: 0,
    };

    stats.forEach((s) => {
      statusBreakdown[s._id] = s.count;
    });

    sendSuccess(res, 200, 'Application stats retrieved', {
      totalApplications,
      statusBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecruiterAnalytics = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;

    const recruiterJobs = await Job.find({ postedBy: recruiterId }).select('_id title');
    const jobIds = recruiterJobs.map((j) => j._id);

    const applicationsPerJob = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobDetails',
        },
      },
      { $unwind: '$jobDetails' },
      {
        $project: {
          jobTitle: '$jobDetails.title',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const hiringFunnel = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyHiring = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: {
            year: { $year: '$appliedAt' },
            month: { $month: '$appliedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const totalApplicants = await Application.countDocuments({ job: { $in: jobIds } });
    const totalJobs = recruiterJobs.length;
    const activeJobs = await Job.countDocuments({ postedBy: recruiterId, isActive: true });

    sendSuccess(res, 200, 'Recruiter analytics retrieved', {
      overview: { totalJobs, activeJobs, totalApplicants },
      applicationsPerJob,
      hiringFunnel,
      monthlyHiring,
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id).populate('candidate', 'resumeUrl name');

    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    const job = await Job.findById(application.job);
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to download this resume.', 403));
    }

    if (!application.candidate.resumeUrl) {
      return next(new AppError('Candidate has not uploaded a resume.', 404));
    }

    const path = require('path');
    const filePath = path.join(__dirname, '..', application.candidate.resumeUrl);
    const fs = require('fs');

    if (!fs.existsSync(filePath)) {
      return next(new AppError('Resume file not found on server.', 404));
    }

    res.download(filePath, `resume-${application.candidate.name.replace(/\s/g, '_')}.pdf`);
  } catch (error) {
    next(error);
  }
};
