const express = require('express');
const router = express.Router();
const { getDepartments, getFieldWorkers } = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getDepartments);
router.get('/workers', protect, getFieldWorkers);

module.exports = router;
