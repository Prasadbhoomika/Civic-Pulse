const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    default: ''
  },
  responsibleCategories: [{
    type: String
  }],
  officers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  activeWorkersCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
