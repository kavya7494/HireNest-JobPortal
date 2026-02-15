const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token expired. Please refresh your session.', 401));
      }
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }

    if (user.isBlocked) {
      return next(new AppError('Your account has been blocked. Contact support.', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Authentication failed.', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Access denied. Required role: ${roles.join(' or ')}`, 403)
      );
    }

    next();
  };
};

const requireApproval = (req, res, next) => {
  if (req.user.role === 'recruiter' && !req.user.isApproved) {
    return next(
      new AppError('Your recruiter account is pending admin approval.', 403)
    );
  }
  next();
};

module.exports = { authenticate, authorize, requireApproval };
