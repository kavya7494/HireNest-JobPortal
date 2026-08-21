const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize, requireApproval } = require('../middlewares/auth');
const { applicationStatusRules, mongoIdParam } = require('../middlewares/validate');

// ⚠️ IMPORTANT: Specific named routes MUST come before wildcard /:id routes
// Otherwise Express will match /my, /stats, /analytics as /:jobId

router.get(
  '/my',
  authenticate,
  authorize('candidate'),
  applicationController.getMyApplications
);

router.get(
  '/stats',
  authenticate,
  authorize('candidate'),
  applicationController.getApplicationStats
);

router.get(
  '/analytics',
  authenticate,
  authorize('recruiter'),
  applicationController.getRecruiterAnalytics
);

router.get(
  '/job/:jobId',
  authenticate,
  authorize('recruiter', 'admin'),
  applicationController.getJobApplicants
);

router.post(
  '/:jobId',
  authenticate,
  authorize('candidate'),
  applicationController.applyToJob
);

router.put(
  '/:id/status',
  authenticate,
  authorize('recruiter', 'admin'),
  mongoIdParam,
  applicationStatusRules,
  applicationController.updateApplicationStatus
);

router.get(
  '/:id/resume',
  authenticate,
  authorize('recruiter', 'admin'),
  mongoIdParam,
  applicationController.downloadResume
);

module.exports = router;
