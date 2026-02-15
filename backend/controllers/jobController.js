const Job = require('../models/Job');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

exports.createJob = async (req, res, next) => {
  try {
    const recruiter = req.user;
    const jobData = {
      ...req.body,
      postedBy: recruiter.id,
      company: req.body.company || recruiter.companyName,
      companySize: req.body.companySize || recruiter.companySize,
    };

    const job = await Job.create(jobData);
    const populatedJob = await Job.findById(job._id).populate('postedBy', 'name email companyName avatar');

    sendSuccess(res, 201, 'Job posted successfully', { job: populatedJob });
  } catch (error) {
    next(error);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      location,
      jobType,
      workMode,
      salaryMin,
      salaryMax,
      experienceMin,
      experienceMax,
      skills,
      companySize,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      const types = jobType.split(',').map((t) => t.trim());
      filter.jobType = { $in: types };
    }

    if (workMode) {
      const modes = workMode.split(',').map((m) => m.trim());
      filter.workMode = { $in: modes };
    }

    if (salaryMin || salaryMax) {
      filter['salary.min'] = {};
      if (salaryMin) filter['salary.min'].$gte = parseInt(salaryMin, 10);
      if (salaryMax) filter['salary.max'] = { $lte: parseInt(salaryMax, 10) };
    }

    if (experienceMin !== undefined || experienceMax !== undefined) {
      if (experienceMin !== undefined) {
        filter['experienceRequired.min'] = { $gte: parseInt(experienceMin, 10) };
      }
      if (experienceMax !== undefined) {
        filter['experienceRequired.max'] = { $lte: parseInt(experienceMax, 10) };
      }
    }

    if (skills) {
      const skillArr = skills.split(',').map((s) => s.trim().toLowerCase());
      filter.skillsRequired = { $in: skillArr };
    }

    if (companySize) {
      filter.companySize = companySize;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'name email companyName avatar companySize')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Job.countDocuments(filter),
    ]);

    sendPaginated(res, 200, 'Jobs retrieved successfully', jobs, page, limit, total);
  } catch (error) {
    next(error);
  }
};

exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email companyName avatar companySize companyWebsite companyDescription');

    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    sendSuccess(res, 200, 'Job retrieved successfully', { job });
  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You are not authorized to update this job.', 403));
    }

    const allowedUpdates = [
      'title', 'description', 'location', 'salary', 'experienceRequired',
      'jobType', 'workMode', 'skillsRequired', 'benefits', 'isActive', 'deadline',
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('postedBy', 'name email companyName avatar');

    sendSuccess(res, 200, 'Job updated successfully', { job: updatedJob });
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You are not authorized to delete this job.', 403));
    }

    await Job.findByIdAndDelete(req.params.id);

    sendSuccess(res, 200, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.getRecruiterJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [jobs, total] = await Promise.all([
      Job.find({ postedBy: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Job.countDocuments({ postedBy: req.user.id }),
    ]);

    sendPaginated(res, 200, 'Recruiter jobs retrieved', jobs, page, limit, total);
  } catch (error) {
    next(error);
  }
};

exports.toggleSaveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    const user = await User.findById(userId);
    const savedIndex = user.savedJobs.indexOf(jobId);

    if (savedIndex > -1) {
      user.savedJobs.splice(savedIndex, 1);
      await user.save({ validateBeforeSave: false });
      sendSuccess(res, 200, 'Job removed from saved', { saved: false });
    } else {
      user.savedJobs.push(jobId);
      await user.save({ validateBeforeSave: false });
      sendSuccess(res, 200, 'Job saved successfully', { saved: true });
    }
  } catch (error) {
    next(error);
  }
};

exports.getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedJobs',
      populate: { path: 'postedBy', select: 'name companyName avatar' },
    });

    sendSuccess(res, 200, 'Saved jobs retrieved', { savedJobs: user.savedJobs });
  } catch (error) {
    next(error);
  }
};
