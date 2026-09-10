const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Potholes & Roads',
      'Streetlights',
      'Garbage & Sanitation',
      'Water Leakage',
      'Drainage & Waterlogging',
      'Fallen Trees',
      'Traffic Signals',
      'Public Infrastructure',
      'Electrical Hazards',
      'Other'
    ]
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  priorityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  priorityBreakdown: {
    severityWeight: { type: Number, default: 0 },
    supportBonus: { type: Number, default: 0 },
    timePending: { type: Number, default: 0 },
    categoryUrgency: { type: Number, default: 0 },
    locationRisk: { type: Number, default: 0 }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  photos: [{
    type: String
  }],
  video: {
    type: String,
    default: ''
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  assignedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: [
      'submitted',
      'under_review',
      'verified',
      'assigned',
      'in_progress',
      'resolved',
      'citizen_verification',
      'closed',
      'rejected',
      'reopened'
    ],
    default: 'submitted'
  },
  supportCount: {
    type: Number,
    default: 1
  },
  supporters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  slaDeadline: {
    type: Date,
    required: true
  },
  slaStatus: {
    type: String,
    enum: ['within_sla', 'due_soon', 'breached'],
    default: 'within_sla'
  },
  resolution: {
    description: { type: String, default: '' },
    photos: [{ type: String }],
    resolvedAt: { type: Date, default: null },
    workerNotes: { type: String, default: '' }
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    default: null
  },
  additionalNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ status: 1, category: 1, priority: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
