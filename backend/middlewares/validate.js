const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new AppError('Validation failed', 400, messages));
  }
  next();
};

const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
  body('role')
    .optional()
    .isIn(['candidate', 'recruiter'])
    .withMessage('Role must be candidate or recruiter'),
  handleValidation,
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone cannot exceed 20 characters'),
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('experience')
    .optional()
    .isIn(['', '0-1', '1-3', '3-5', '5-8', '8+'])
    .withMessage('Invalid experience level'),
  body('education')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Education cannot exceed 200 characters'),
  handleValidation,
];

const createJobRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('skillsRequired')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship'])
    .withMessage('Invalid job type'),
  body('workMode')
    .optional()
    .isIn(['remote', 'onsite', 'hybrid'])
    .withMessage('Invalid work mode'),
  body('salary.min')
    .optional()
    .isNumeric()
    .withMessage('Salary min must be a number'),
  body('salary.max')
    .optional()
    .isNumeric()
    .withMessage('Salary max must be a number'),
  body('experienceRequired.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience min must be a positive integer'),
  body('experienceRequired.max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience max must be a positive integer'),
  handleValidation,
];

const applicationStatusRules = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['applied', 'shortlisted', 'interview', 'rejected', 'hired'])
    .withMessage('Invalid status value'),
  body('interviewDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid interview date format'),
  body('recruiterNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  handleValidation,
];

const mongoIdParam = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidation,
];

module.exports = {
  registerRules,
  loginRules,
  updateProfileRules,
  createJobRules,
  applicationStatusRules,
  mongoIdParam,
  handleValidation,
};
