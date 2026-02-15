const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate, authorize, requireApproval } = require('../middlewares/auth');
const { createJobRules, mongoIdParam } = require('../middlewares/validate');

router.get('/', jobController.getJobs);
router.get('/saved', authenticate, authorize('candidate'), jobController.getSavedJobs);
router.get('/recruiter', authenticate, authorize('recruiter'), jobController.getRecruiterJobs);
router.get('/:id', mongoIdParam, jobController.getJobById);

router.post(
  '/',
  authenticate,
  authorize('recruiter'),
  requireApproval,
  createJobRules,
  jobController.createJob
);

router.put(
  '/:id',
  authenticate,
  authorize('recruiter', 'admin'),
  mongoIdParam,
  jobController.updateJob
);

router.delete(
  '/:id',
  authenticate,
  authorize('recruiter', 'admin'),
  mongoIdParam,
  jobController.deleteJob
);

router.post(
  '/:id/save',
  authenticate,
  authorize('candidate'),
  mongoIdParam,
  jobController.toggleSaveJob
);

module.exports = router;
