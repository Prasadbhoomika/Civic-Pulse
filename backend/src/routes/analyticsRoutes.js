const express = require('express');
const router = express.Router();
const { getAdminAnalytics, getDepartmentAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/admin', protect, authorize('admin', 'officer'), getAdminAnalytics);
router.get('/department', protect, authorize('officer', 'admin'), getDepartmentAnalytics);

module.exports = router;
