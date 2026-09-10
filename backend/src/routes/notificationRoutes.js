const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markNotificationRead);
router.patch('/read-all', protect, markAllRead);

module.exports = router;
