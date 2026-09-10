const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const ComplaintHistory = require('../models/ComplaintHistory');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');
const Verification = require('../models/Verification');
const User = require('../models/User');

const { calculatePriority } = require('../services/priorityService');
const { calculateSlaDeadline, getSlaStatus } = require('../services/slaService');
const { detectDuplicates } = require('../services/duplicateService');
const { analyzeIssueEvidence } = require('../services/aiService');

// Helper to auto-assign department based on category
const CATEGORY_DEPARTMENT_MAP = {
  'Potholes & Roads': 'PW-DEPT',
  'Streetlights': 'ELEC-DEPT',
  'Garbage & Sanitation': 'SAN-DEPT',
  'Water Leakage': 'WATER-DEPT',
  'Drainage & Waterlogging': 'WATER-DEPT',
  'Fallen Trees': 'ENV-DEPT',
  'Traffic Signals': 'TRANS-DEPT',
  'Public Infrastructure': 'PW-DEPT',
  'Electrical Hazards': 'ELEC-DEPT',
  'Other': 'PW-DEPT'
};

// @desc    Create a new civic issue report
// @route   POST /api/complaints
// @access  Private (Citizen/Officer/Admin)
const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      severity = 'medium',
      latitude,
      longitude,
      address,
      photos = [],
      video = '',
      additionalNotes = ''
    } = req.body;

    if (!title || !description || !category || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields: title, description, category, coordinates' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // 1. Calculate Priority Score & Breakdown
    const priorityData = calculatePriority({
      severity,
      category,
      supportCount: 1,
      createdAt: new Date(),
      locationRisk: 6
    });

    // 2. SLA Deadline
    const slaDeadline = calculateSlaDeadline(priorityData.label, new Date());

    // 3. Find matching department
    const deptCode = CATEGORY_DEPARTMENT_MAP[category] || 'PW-DEPT';
    const dept = await Department.findOne({ code: deptCode });

    // Generate custom complaint ID
    const count = await Complaint.countDocuments();
    const complaintId = `CP-${new Date().getFullYear()}-${String(count + 101).padStart(5, '0')}`;

    // 4. Duplicate Check against existing open complaints
    const openComplaints = await Complaint.find({
      status: { $nin: ['resolved', 'closed', 'rejected'] }
    });

    const tempComplaint = {
      title,
      description,
      category,
      location: { type: 'Point', coordinates: [lng, lat] }
    };
    const duplicateMatches = detectDuplicates(tempComplaint, openComplaints, 200);

    const complaint = await Complaint.create({
      complaintId,
      title,
      description,
      category,
      severity,
      priorityScore: priorityData.score,
      priority: priorityData.label,
      priorityBreakdown: priorityData.breakdown,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      address: address || `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'],
      video,
      reporter: req.user._id,
      department: dept ? dept._id : null,
      status: 'submitted',
      supportCount: 1,
      supporters: [req.user._id],
      slaDeadline,
      slaStatus: 'within_sla',
      additionalNotes
    });

    // Record History log
    await ComplaintHistory.create({
      complaint: complaint._id,
      previousStatus: 'NEW',
      newStatus: 'submitted',
      changedBy: req.user._id,
      comment: 'Complaint submitted by citizen.'
    });

    // Create Notification
    await Notification.create({
      user: req.user._id,
      complaint: complaint._id,
      type: 'SUBMITTED',
      message: `Report ${complaintId} submitted successfully. Priority Index: ${priorityData.score}/100.`
    });

    // Run AI scan background evaluation
    const aiAnalysis = await analyzeIssueEvidence({ title, description, category });

    res.status(201).json({
      success: true,
      data: complaint,
      aiAnalysis,
      possibleDuplicates: duplicateMatches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints with pagination, filtering, search
// @route   GET /api/complaints
// @access  Public
const getComplaints = async (req, res, next) => {
  try {
    const {
      category,
      status,
      priority,
      department,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.department = department;

    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reporter', 'name email role')
      .populate('assignedWorker', 'name email phone')
      .populate('department', 'name code');

    // Update dynamic SLA statuses on output
    const formatted = complaints.map(c => {
      const slaInfo = getSlaStatus(c.slaDeadline, c.status);
      c.slaStatus = slaInfo.status;
      return c;
    });

    res.json({
      success: true,
      count: formatted.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Public
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reporter', 'name email phone profileImage')
      .populate('assignedWorker', 'name email phone profileImage')
      .populate('department', 'name code description officers')
      .populate('supporters', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const history = await ComplaintHistory.find({ complaint: complaint._id })
      .populate('changedBy', 'name role')
      .sort('timestamp');

    const comments = await Comment.find({ complaint: complaint._id })
      .populate('user', 'name role profileImage')
      .sort('-createdAt');

    const verifications = await Verification.find({ complaint: complaint._id })
      .populate('citizen', 'name')
      .sort('-timestamp');

    const slaInfo = getSlaStatus(complaint.slaDeadline, complaint.status);
    complaint.slaStatus = slaInfo.status;

    res.json({
      success: true,
      data: complaint,
      history,
      comments,
      verifications,
      slaInfo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private (Officer/Worker/Admin)
const updateStatus = async (req, res, next) => {
  try {
    const { status, comment = '' } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const prevStatus = complaint.status;
    complaint.status = status;
    await complaint.save();

    // Log history
    await ComplaintHistory.create({
      complaint: complaint._id,
      previousStatus: prevStatus,
      newStatus: status,
      changedBy: req.user._id,
      comment: comment || `Status updated to ${status}`
    });

    // Send Notification to Reporter
    await Notification.create({
      user: complaint.reporter,
      complaint: complaint._id,
      type: status === 'resolved' ? 'WORKER_RESOLVED' : 'STATUS_CHANGE',
      message: `Complaint ${complaint.complaintId} status changed to ${status.toUpperCase().replace('_', ' ')}.`
    });

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign worker to complaint
// @route   PATCH /api/complaints/:id/assign
// @access  Private (Officer/Admin)
const assignWorker = async (req, res, next) => {
  try {
    const { workerId } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker') {
      return res.status(400).json({ success: false, message: 'Invalid field worker specified' });
    }

    const prevStatus = complaint.status;
    complaint.assignedWorker = worker._id;
    complaint.status = 'assigned';
    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      previousStatus: prevStatus,
      newStatus: 'assigned',
      changedBy: req.user._id,
      comment: `Assigned to worker ${worker.name}`
    });

    // Notify worker
    await Notification.create({
      user: worker._id,
      complaint: complaint._id,
      type: 'ASSIGNED',
      message: `You have been assigned to complaint ${complaint.complaintId}: "${complaint.title}".`
    });

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Support an existing complaint
// @route   POST /api/complaints/:id/support
// @access  Private (Citizen)
const supportComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const userIdStr = req.user._id.toString();
    const alreadySupported = complaint.supporters.some(s => s.toString() === userIdStr);

    if (alreadySupported) {
      return res.status(400).json({ success: false, message: 'You have already supported this complaint' });
    }

    complaint.supporters.push(req.user._id);
    complaint.supportCount += 1;

    // Recalculate Priority Score
    const updatedPriority = calculatePriority({
      severity: complaint.severity,
      category: complaint.category,
      supportCount: complaint.supportCount,
      createdAt: complaint.createdAt
    });

    complaint.priorityScore = updatedPriority.score;
    complaint.priority = updatedPriority.label;
    complaint.priorityBreakdown = updatedPriority.breakdown;

    await complaint.save();

    res.json({
      success: true,
      supportCount: complaint.supportCount,
      priorityScore: complaint.priorityScore,
      priority: complaint.priority,
      message: `Supported complaint ${complaint.complaintId}. Priority index boosted to ${complaint.priorityScore}.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit worker resolution evidence
// @route   POST /api/complaints/:id/resolve
// @access  Private (Worker/Officer)
const resolveComplaint = async (req, res, next) => {
  try {
    const { description, photos = [], workerNotes = '' } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const prevStatus = complaint.status;
    complaint.status = 'resolved';
    complaint.resolution = {
      description: description || 'Work completed as requested.',
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'],
      resolvedAt: new Date(),
      workerNotes
    };

    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      previousStatus: prevStatus,
      newStatus: 'resolved',
      changedBy: req.user._id,
      comment: `Resolution evidence submitted: ${description}`
    });

    // Notify Reporter to verify resolution
    await Notification.create({
      user: complaint.reporter,
      complaint: complaint._id,
      type: 'VERIFICATION_REQUIRED',
      message: `Issue ${complaint.complaintId} has been marked resolved. Please verify the completion evidence.`
    });

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Citizen verification (Approve or Reject)
// @route   POST /api/complaints/:id/verify
// @access  Private (Citizen)
const verifyResolution = async (req, res, next) => {
  try {
    const { result, reason = '' } = req.body; // 'approved' or 'rejected'
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (!['approved', 'rejected'].includes(result)) {
      return res.status(400).json({ success: false, message: 'Result must be "approved" or "rejected"' });
    }

    await Verification.create({
      complaint: complaint._id,
      citizen: req.user._id,
      result,
      reason
    });

    const prevStatus = complaint.status;

    if (result === 'approved') {
      complaint.status = 'closed';
      await complaint.save();

      await ComplaintHistory.create({
        complaint: complaint._id,
        previousStatus: prevStatus,
        newStatus: 'closed',
        changedBy: req.user._id,
        comment: 'Resolution verified and closed by citizen.'
      });

      await Notification.create({
        user: complaint.reporter,
        complaint: complaint._id,
        type: 'CLOSED',
        message: `Complaint ${complaint.complaintId} has been officially closed.`
      });
    } else {
      complaint.status = 'reopened';
      await complaint.save();

      await ComplaintHistory.create({
        complaint: complaint._id,
        previousStatus: prevStatus,
        newStatus: 'reopened',
        changedBy: req.user._id,
        comment: `Resolution rejected by citizen. Reason: ${reason}`
      });

      await Notification.create({
        user: complaint.reporter,
        complaint: complaint._id,
        type: 'REOPENED',
        message: `Complaint ${complaint.complaintId} reopened due to inadequate resolution.`
      });
    }

    res.json({
      success: true,
      status: complaint.status,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby complaints
// @route   GET /api/complaints/nearby
// @access  Public
const getNearbyComplaints = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // radius in meters

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Please provide lat and lng query parameters' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const complaints = await Complaint.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).limit(30);

    res.json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    // Fallback if index not initialized
    const complaints = await Complaint.find().limit(25);
    res.json({ success: true, count: complaints.length, data: complaints });
  }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text is required' });

    const comment = await Comment.create({
      complaint: req.params.id,
      user: req.user._id,
      text
    });

    const populated = await Comment.findById(comment._id).populate('user', 'name role profileImage');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
