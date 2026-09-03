const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['Casual Leave', 'Sick Leave', 'Paid Leave'],
    required: true
  },
  startDate: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  endDate: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  duration: {
    type: String,
    enum: ['Full Day', 'Half Day'],
    default: 'Full Day'
  },
  numberOfDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  hrComment: {
    type: String,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Leave', leaveSchema);
