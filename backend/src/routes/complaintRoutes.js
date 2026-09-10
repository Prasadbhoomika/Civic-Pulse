const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignWorker,
  supportComplaint,
  resolveComplaint,
  verifyResolution,
  getNearbyComplaints,
  addComment
} = require('../controllers/complaintController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/nearby', getNearbyComplaints);

router.route('/')
  .post(protect, createComplaint)
  .get(getComplaints);

router.route('/:id')
  .get(getComplaintById);

router.patch('/:id/status', protect, authorize('officer', 'worker', 'admin'), updateStatus);
router.patch('/:id/assign', protect, authorize('officer', 'admin'), assignWorker);
router.post('/:id/support', protect, supportComplaint);
router.post('/:id/resolve', protect, authorize('worker', 'officer', 'admin'), resolveComplaint);
router.post('/:id/verify', protect, authorize('citizen', 'admin'), verifyResolution);
router.post('/:id/comments', protect, addComment);

// Upload endpoint
router.post('/upload', protect, upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, filename: req.file.filename });
});

module.exports = router;
