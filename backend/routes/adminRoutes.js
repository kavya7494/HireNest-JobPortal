const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');
const { mongoIdParam } = require('../middlewares/validate');

router.use(authenticate, authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.put('/users/:id/approve', mongoIdParam, adminController.approveRecruiter);
router.put('/users/:id/block', mongoIdParam, adminController.toggleBlockUser);
router.get('/stats', adminController.getPlatformStats);
router.get('/analytics', adminController.getPlatformAnalytics);

module.exports = router;
