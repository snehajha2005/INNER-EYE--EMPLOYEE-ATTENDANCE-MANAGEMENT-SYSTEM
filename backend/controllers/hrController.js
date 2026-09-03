const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { calculateAttendance } = require('../utils/attendanceCalculator');

// Helper to get today's date string YYYY-MM-DD in local time
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to format HR attendance document with backward compatibility defaults
const formatHrAttendanceDoc = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const stats = calculateAttendance(obj.checkIn, obj.checkOut, obj.breaks || []);

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

// @desc    Get HR Dashboard Summary
// @route   GET /api/hr/dashboard
// @access  Private (HR)
const getDashboardSummary = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const dateStr = getTodayDateString();

    const todaysAttendance = await Attendance.find({ date: dateStr });
    const Leave = require('../models/Leave');

    // Query approved leave records for today
    const approvedLeavesToday = await Leave.find({
      status: 'Approved',
      startDate: { $lte: dateStr },
      endDate: { $gte: dateStr }
    });

    const approvedLeaveEmployeeIds = new Set(approvedLeavesToday.map(l => l.employee.toString()));
    const attendanceEmployeeIds = new Set(todaysAttendance.map(a => a.employee.toString()));
    
    let presentToday = 0;
    let halfDayToday = 0;
    let absentRecordsToday = 0;
    let checkedInCurrently = 0;
    let onBreakCurrently = 0;
    let lateArrivalsToday = 0;

    todaysAttendance.forEach(record => {
      const doc = formatHrAttendanceDoc(record);
      if (doc.status === 'Present') presentToday++;
      if (doc.status === 'Half Day') halfDayToday++;
      if (doc.status === 'Absent') absentRecordsToday++;
      if (doc.sessionState === 'Checked In') checkedInCurrently++;
      if (doc.sessionState === 'On Break') onBreakCurrently++;
      if (doc.arrivalStatus === 'Late') lateArrivalsToday++;
    });

    // Employees who haven't checked in AND are NOT on approved leave
    const allEmployees = await User.find({ role: 'employee' }).select('_id');
    let unexplainedAbsentCount = 0;
    allEmployees.forEach(emp => {
      const idStr = emp._id.toString();
      if (!attendanceEmployeeIds.has(idStr) && !approvedLeaveEmployeeIds.has(idStr)) {
        unexplainedAbsentCount++;
      }
    });

    const absentToday = absentRecordsToday + unexplainedAbsentCount;

    res.json({
      totalEmployees,
      presentToday,
      halfDayToday,
      absentToday,
      checkedInCurrently,
      onBreakCurrently,
      lateArrivalsToday,
      onLeaveToday: approvedLeaveEmployeeIds.size
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all employees
// @route   GET /api/hr/employees
// @access  Private (HR)
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance records
// @route   GET /api/hr/attendance
// @access  Private (HR)
const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate('employee', 'name employeeId email')
      .sort({ date: -1, createdAt: -1 });

    const formattedRecords = records.map(r => formatHrAttendanceDoc(r));
    res.json(formattedRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  getEmployees,
  getAllAttendance
};
