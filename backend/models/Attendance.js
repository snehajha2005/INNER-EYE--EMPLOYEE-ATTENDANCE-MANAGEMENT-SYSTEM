const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  }
});

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    default: null
  },
  workingHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Checked In', 'On Break', 'Present', 'Half Day', 'Absent'],
    default: 'Checked In'
  },
  leaveDeduction: {
    type: Number,
    default: 0
  },
  breaks: [breakSchema],
  totalBreakDuration: {
    type: Number,
    default: 0
  },
  grossWorkingHours: {
    type: Number,
    default: 0
  },
  netWorkingHours: {
    type: Number,
    default: 0
  },
  overtime: {
    type: Number,
    default: 0
  },
  sessionState: {
    type: String,
    enum: ['Checked In', 'On Break', 'Completed'],
    default: 'Checked In'
  },
  arrivalStatus: {
    type: String,
    enum: ['On Time', 'Late'],
    default: 'On Time'
  },
  complianceStatus: {
    type: String,
    enum: ['Compliant', 'Under-Hours', 'Overtime'],
    default: 'Compliant'
  }
}, {
  timestamps: true
});

// Ensure an employee can only have one attendance record per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
