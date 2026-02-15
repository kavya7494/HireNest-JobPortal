const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize, requireApproval } = require('../middlewares/auth');
const { applicationStatusRules, mongoIdParam } = require('../middlewares/validate');

router.post(
  '/:jobId',
  authenticate,
  authorize('candidate'),
  applicationController.applyToJob
);

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
  '/job/:jobId',
  authenticate,
  authorize('recruiter', 'admin'),
  applicationController.getJobApplicants
);

router.get(
  '/analytics',
  authenticate,
  authorize('recruiter'),
  applicationController.getRecruiterAnalytics
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
