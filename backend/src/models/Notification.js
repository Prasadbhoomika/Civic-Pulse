const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    default: null
  },
  type: {
    type: String,
    enum: [
      'SUBMITTED',
      'VERIFIED',
      'REJECTED',
      'ASSIGNED',
      'STATUS_CHANGE',
      'WORKER_RESOLVED',
      'VERIFICATION_REQUIRED',
      'REOPENED',
      'SLA_WARNING',
      'CLOSED'
    ],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
