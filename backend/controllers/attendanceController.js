const Attendance = require('../models/Attendance');
const { calculateAttendance, determineArrivalStatus } = require('../utils/attendanceCalculator');

// Helper to get today's date string YYYY-MM-DD in local time
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to format attendance document with backward compatibility defaults
const formatAttendanceDoc = (doc, now = new Date()) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;

  const stats = calculateAttendance(obj.checkIn, obj.checkOut, obj.breaks || [], now);

  return {
    ...obj,
    breaks: obj.breaks || [],
    totalBreakDuration: obj.totalBreakDuration !== undefined ? obj.totalBreakDuration : stats.totalBreakDuration,
    grossWorkingHours: obj.grossWorkingHours !== undefined && obj.grossWorkingHours !== 0 ? obj.grossWorkingHours : stats.grossWorkingHours,
    netWorkingHours: obj.netWorkingHours !== undefined && obj.netWorkingHours !== 0 ? obj.netWorkingHours : stats.netWorkingHours,
    workingHours: obj.workingHours !== undefined && obj.workingHours !== 0 ? obj.workingHours : stats.workingHours,
    overtime: obj.overtime !== undefined ? obj.overtime : stats.overtime,
    sessionState: obj.sessionState || (obj.checkOut ? 'Completed' : (obj.status === 'On Break' ? 'On Break' : 'Checked In')),
    arrivalStatus: obj.arrivalStatus || stats.arrivalStatus,
    complianceStatus: obj.complianceStatus || stats.complianceStatus
  };
};

// @desc    Check-in employee
// @route   POST /api/attendance/check-in
// @access  Private (Employee)
const checkIn = async (req, res) => {
  try {
    const dateStr = getTodayDateString();

    // Check if attendance already exists for today
    const existingAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: dateStr
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }

    const checkInTime = new Date();
    const stats = calculateAttendance(checkInTime, null, []);

    const attendance = await Attendance.create({
      employee: req.user._id,
      date: dateStr,
      checkIn: checkInTime,
      status: 'Checked In',
      workingHours: 0,
      leaveDeduction: 0,
      breaks: [],
      totalBreakDuration: 0,
      grossWorkingHours: 0,
      netWorkingHours: 0,
      overtime: 0,
      sessionState: 'Checked In',
      arrivalStatus: stats.arrivalStatus,
      complianceStatus: 'Compliant'
    });

    res.status(201).json(formatAttendanceDoc(attendance));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start Break
// @route   POST /api/attendance/start-break
// @access  Private (Employee)
const startBreak = async (req, res) => {
  try {
    const dateStr = getTodayDateString();

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: dateStr
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Cannot start break after checking out' });
    }

    // Check if already on break
    const activeBreak = attendance.breaks.find(b => !b.endTime);
    if (activeBreak) {
      return res.status(400).json({ message: 'Already on break' });
    }

    const now = new Date();
    attendance.breaks.push({
      startTime: now,
      endTime: null,
      duration: 0
    });

    attendance.sessionState = 'On Break';
    attendance.status = 'On Break';

    await attendance.save();
    res.json(formatAttendanceDoc(attendance));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resume Work from Break
// @route   PUT /api/attendance/resume-work
// @access  Private (Employee)
const resumeWork = async (req, res) => {
  try {
    const dateStr = getTodayDateString();

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: dateStr
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Shift is already completed' });
    }

    const activeBreak = attendance.breaks.find(b => !b.endTime);
    if (!activeBreak) {
      return res.status(400).json({ message: 'No active break found to resume from' });
    }

    const now = new Date();
    activeBreak.endTime = now;
    activeBreak.duration = parseFloat((Math.max(0, now - activeBreak.startTime) / (1000 * 60 * 60)).toFixed(2));

    // Recalculate stats
    const stats = calculateAttendance(attendance.checkIn, null, attendance.breaks, now);
    attendance.totalBreakDuration = stats.totalBreakDuration;
    attendance.sessionState = 'Checked In';
    attendance.status = 'Checked In';

    await attendance.save();
    res.json(formatAttendanceDoc(attendance));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check-out employee
// @route   PUT /api/attendance/check-out
// @access  Private (Employee)
const checkOut = async (req, res) => {
  try {
    const dateStr = getTodayDateString();

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: dateStr
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out for today' });
    }

    const checkOutTime = new Date();

    // Safely auto-close any active break if user checks out while on break
    const activeBreak = attendance.breaks.find(b => !b.endTime);
    if (activeBreak) {
      activeBreak.endTime = checkOutTime;
      activeBreak.duration = parseFloat((Math.max(0, checkOutTime - activeBreak.startTime) / (1000 * 60 * 60)).toFixed(2));
    }
    
    // Calculate stats
    const stats = calculateAttendance(attendance.checkIn, checkOutTime, attendance.breaks);

    attendance.checkOut = checkOutTime;
    attendance.grossWorkingHours = stats.grossWorkingHours;
    attendance.totalBreakDuration = stats.totalBreakDuration;
    attendance.netWorkingHours = stats.netWorkingHours;
    attendance.workingHours = stats.netWorkingHours;
    attendance.overtime = stats.overtime;
    attendance.sessionState = 'Completed';
    attendance.arrivalStatus = stats.arrivalStatus;
    attendance.status = stats.status;
    attendance.leaveDeduction = stats.leaveDeduction;
    attendance.complianceStatus = stats.complianceStatus;

    const updatedAttendance = await attendance.save();
    res.json(formatAttendanceDoc(updatedAttendance));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's attendance for current user
// @route   GET /api/attendance/today
// @access  Private (Employee)
const getTodayAttendance = async (req, res) => {
  try {
    const dateStr = getTodayDateString();
    
    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: dateStr
    });

    res.json(formatAttendanceDoc(attendance));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance history for current user
// @route   GET /api/attendance/history
// @access  Private (Employee)
const getAttendanceHistory = async (req, res) => {
  try {
    const history = await Attendance.find({ employee: req.user._id }).sort({ date: -1 });
    const formattedHistory = history.map(h => formatAttendanceDoc(h));
    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance summary for current user
// @route   GET /api/attendance/summary
// @access  Private (Employee)
const getAttendanceSummary = async (req, res) => {
  try {
    const history = await Attendance.find({ employee: req.user._id });
    
    const summary = {
      presentDays: 0,
      halfDays: 0,
      absentDays: 0,
      totalWorkingHours: 0,
      totalLeaveDeduction: 0,
      totalGrossWorkingHours: 0,
      totalBreakDuration: 0,
      totalNetWorkingHours: 0,
      totalOvertime: 0,
      lateArrivalsCount: 0
    };

    history.forEach(record => {
      const doc = formatAttendanceDoc(record);

      if (doc.status === 'Present') summary.presentDays++;
      else if (doc.status === 'Half Day') summary.halfDays++;
      else if (doc.status === 'Absent') summary.absentDays++;

      if (doc.arrivalStatus === 'Late') summary.lateArrivalsCount++;
      
      summary.totalWorkingHours += doc.workingHours || 0;
      summary.totalGrossWorkingHours += doc.grossWorkingHours || 0;
      summary.totalBreakDuration += doc.totalBreakDuration || 0;
      summary.totalNetWorkingHours += doc.netWorkingHours || 0;
      summary.totalOvertime += doc.overtime || 0;
      summary.totalLeaveDeduction += doc.leaveDeduction || 0;
    });

    summary.totalWorkingHours = parseFloat(summary.totalWorkingHours.toFixed(2));
    summary.totalGrossWorkingHours = parseFloat(summary.totalGrossWorkingHours.toFixed(2));
    summary.totalBreakDuration = parseFloat(summary.totalBreakDuration.toFixed(2));
    summary.totalNetWorkingHours = parseFloat(summary.totalNetWorkingHours.toFixed(2));
    summary.totalOvertime = parseFloat(summary.totalOvertime.toFixed(2));

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkIn,
  startBreak,
  resumeWork,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAttendanceSummary
};
