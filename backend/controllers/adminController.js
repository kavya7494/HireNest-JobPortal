const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const { sendApprovalEmail } = require('../services/emailService');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, blocked } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const filter = {};
    if (role) filter.role = role;
    if (blocked !== undefined) filter.isBlocked = blocked === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      User.countDocuments(filter),
    ]);

    sendPaginated(res, 200, 'Users retrieved', users, page, limit, total);
  } catch (error) {
    next(error);
  }
};

exports.approveRecruiter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (user.role !== 'recruiter') {
      return next(new AppError('This user is not a recruiter.', 400));
    }

    if (user.isApproved) {
      return next(new AppError('Recruiter is already approved.', 400));
    }

    user.isApproved = true;
    await user.save({ validateBeforeSave: false });

    const notification = await Notification.create({
      user: user._id,
      type: 'recruiter_approved',
      title: 'Account Approved',
      message: 'Your recruiter account has been approved. You can now post jobs and manage applications.',
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${user._id.toString()}`).emit('notification', notification);
    }

    sendApprovalEmail(user.email, {
      recruiterName: user.name,
      companyName: user.companyName,
    }).catch(() => {});

    sendSuccess(res, 200, 'Recruiter approved successfully', { user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

exports.toggleBlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (user.role === 'admin') {
      return next(new AppError('Cannot block an admin user.', 400));
    }

    user.isBlocked = !user.isBlocked;
    if (user.isBlocked) {
      user.refreshToken = '';
    }
    await user.save({ validateBeforeSave: false });

    const action = user.isBlocked ? 'blocked' : 'unblocked';
    sendSuccess(res, 200, `User ${action} successfully`, {
      user: user.toSafeObject(),
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      activeRecruiters,
      pendingRecruiters,
      totalJobs,
      activeJobs,
      totalApplications,
      blockedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'recruiter', isApproved: true, isBlocked: false }),
      User.countDocuments({ role: 'recruiter', isApproved: false }),
      Job.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Application.countDocuments(),
      User.countDocuments({ isBlocked: true }),
    ]);

    const topCompanies = await Job.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$company',
          jobCount: { $sum: 1 },
          totalApplications: { $sum: '$applicationsCount' },
        },
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 },
    ]);

    sendSuccess(res, 200, 'Platform statistics retrieved', {
      overview: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        activeRecruiters,
        pendingRecruiters,
        totalJobs,
        activeJobs,
        totalApplications,
        blockedUsers,
      },
      topCompanies,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const platformGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          users: { $sum: 1 },
          candidates: {
            $sum: { $cond: [{ $eq: ['$role', 'candidate'] }, 1, 0] },
          },
          recruiters: {
            $sum: { $cond: [{ $eq: ['$role', 'recruiter'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const topIndustries = await Job.aggregate([
      { $unwind: '$skillsRequired' },
      {
        $group: {
          _id: '$skillsRequired',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    const mostAppliedRoles = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobDetails',
        },
      },
      { $unwind: '$jobDetails' },
      {
        $group: {
          _id: '$jobDetails.title',
          applicationCount: { $sum: 1 },
          company: { $first: '$jobDetails.company' },
        },
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 10 },
    ]);

    const applicationTrends = await Application.aggregate([
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

    sendSuccess(res, 200, 'Platform analytics retrieved', {
      platformGrowth,
      topIndustries,
      mostAppliedRoles,
      applicationTrends,
    });
  } catch (error) {
    next(error);
  }
};
