const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateTokenPair, verifyRefreshToken } = require('../utils/tokenUtils');
const { sendSuccess } = require('../utils/apiResponse');
const { sendOtpEmail } = require('../services/emailService');

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const setCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, companySize, companyWebsite, companyDescription } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const userData = { name, email, password, role: role || 'candidate' };

    if (role === 'recruiter') {
      if (!companyName) {
        return next(new AppError('Company name is required for recruiter registration.', 400));
      }
      userData.companyName = companyName;
      userData.companySize = companySize || '';
      userData.companyWebsite = companyWebsite || '';
      userData.companyDescription = companyDescription || '';
      userData.isApproved = false;
    }

    const otp = generateOtp();
    userData.otp = otp;
    userData.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    userData.otpAttempts = 0;
    userData.isVerified = false;

    const user = await User.create(userData);

    sendOtpEmail(user.email, {
      userName: user.name,
      otp,
    }).catch((err) => console.error('[AUTH] OTP email failed:', err.message));

    sendSuccess(res, 201, 'OTP sent to your email. Please verify to complete registration.', {
      email: user.email,
      requiresVerification: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError('Email and OTP are required.', 400));
    }

    const user = await User.findOne({ email }).select('+otp +otpExpires +otpAttempts +password');
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (user.isVerified) {
      return next(new AppError('Account is already verified.', 400));
    }

    if (user.otpAttempts >= 5) {
      return next(new AppError('Too many failed attempts. Please request a new OTP.', 429));
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return next(new AppError('OTP has expired. Please request a new one.', 400));
    }

    if (user.otp !== otp) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return next(new AppError(`Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`, 400));
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;

    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, setCookieOptions());

    sendSuccess(res, 200, 'Email verified successfully!', {
      user: user.toSafeObject(),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Email is required.', 400));
    }

    const user = await User.findOne({ email }).select('+otp +otpExpires +otpAttempts');
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (user.isVerified) {
      return next(new AppError('Account is already verified.', 400));
    }

    if (user.otpExpires) {
      const timeSinceLastOtp = Date.now() - (user.otpExpires.getTime() - 5 * 60 * 1000);
      if (timeSinceLastOtp < 60 * 1000) {
        return next(new AppError('Please wait before requesting a new OTP.', 429));
      }
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    sendOtpEmail(user.email, {
      userName: user.name,
      otp,
    }).catch((err) => console.error('[AUTH] Resend OTP email failed:', err.message));

    sendSuccess(res, 200, 'New OTP sent to your email.', { email: user.email });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (user.isBlocked) {
      return next(new AppError('Your account has been blocked. Contact support.', 403));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (!user.isVerified) {
      const otp = generateOtp();
      await User.updateOne(
        { _id: user._id },
        { otp, otpExpires: new Date(Date.now() + 5 * 60 * 1000), otpAttempts: 0 }
      );

      sendOtpEmail(user.email, {
        userName: user.name,
        otp,
      }).catch(() => {});

      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new OTP has been sent to your email.',
        data: { email: user.email, requiresVerification: true },
      });
    }

    const { accessToken, refreshToken } = generateTokenPair(user);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, setCookieOptions());

    sendSuccess(res, 200, 'Login successful', {
      user: user.toSafeObject(),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(new AppError('No refresh token provided.', 401));
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return next(new AppError('Invalid or expired refresh token.', 401));
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      if (user) {
        user.refreshToken = '';
        await user.save({ validateBeforeSave: false });
      }
      return next(new AppError('Token reuse detected. Please log in again.', 401));
    }

    if (user.isBlocked) {
      return next(new AppError('Your account has been blocked.', 403));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, setCookieOptions());

    sendSuccess(res, 200, 'Token refreshed', { accessToken });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token }).select('+refreshToken');
      if (user) {
        user.refreshToken = '';
        await user.save({ validateBeforeSave: false });
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedJobs');
    if (!user) {
      return next(new AppError('User not found.', 404));
    }
    sendSuccess(res, 200, 'User profile retrieved', { user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'phone', 'bio', 'location', 'skills', 'experience',
      'education', 'companyName', 'companySize', 'companyWebsite', 'companyDescription',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    sendSuccess(res, 200, 'Profile updated successfully', { user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded.', 400));
    }

    const resumeUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumeUrl },
      { new: true }
    );

    sendSuccess(res, 200, 'Resume uploaded successfully', {
      user: user.toSafeObject(),
      resumeUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded.', 400));
    }

    const avatar = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    );

    sendSuccess(res, 200, 'Avatar uploaded successfully', {
      user: user.toSafeObject(),
      avatar,
    });
  } catch (error) {
    next(error);
  }
};
