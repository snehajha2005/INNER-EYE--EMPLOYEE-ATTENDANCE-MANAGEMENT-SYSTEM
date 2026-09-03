const Leave = require('../models/Leave');
const { calculateLeaveDays, calculateLeaveBalances } = require('../utils/leaveCalculator');

// Helper to get today's date string YYYY-MM-DD in local time
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Submit a new leave request
// @route   POST /api/leaves
// @access  Private (Employee)
const submitLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, duration, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Please provide leave type, start date, end date, and reason' });
    }

    const validTypes = ['Casual Leave', 'Sick Leave', 'Paid Leave'];
    if (!validTypes.includes(leaveType)) {
      return res.status(400).json({ message: 'Invalid leave type selected' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid start or end date format' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be earlier than start date' });
    }

    const numberOfDays = calculateLeaveDays(startDate, endDate, duration || 'Full Day');

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      duration: duration || 'Full Day',
      numberOfDays,
      reason,
      status: 'Pending'
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leave requests & balances for current employee
// @route   GET /api/leaves/my-leaves
// @access  Private (Employee)
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
    const approvedLeaves = leaves.filter(l => l.status === 'Approved');

    const balanceSummary = calculateLeaveBalances(approvedLeaves);

    res.json({
      leaves,
      balanceSummary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all employee leave requests & stats for HR
// @route   GET /api/leaves/hr/all
// @access  Private (HR)
const getAllLeaveRequests = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(430).json({ message: 'Access denied: HR privilege required' });
    }

    const rawRequests = await Leave.find()
      .populate('employee', 'name employeeId email')
      .sort({ createdAt: -1 });

    // Filter out orphaned leaves where the referenced employee was deleted
    const requests = rawRequests.filter(r => r.employee && r.employee.name);

    const todayStr = getTodayDateString();

    let totalRequests = requests.length;
    let pendingRequests = 0;
    let approvedRequests = 0;
    let rejectedRequests = 0;
    let onLeaveTodayCount = 0;

    const onLeaveEmployeesSet = new Set();

    requests.forEach(reqDoc => {
      if (reqDoc.status === 'Pending') pendingRequests++;
      if (reqDoc.status === 'Approved') {
        approvedRequests++;
        if (todayStr >= reqDoc.startDate && todayStr <= reqDoc.endDate) {
          if (reqDoc.employee?._id) {
            onLeaveEmployeesSet.add(reqDoc.employee._id.toString());
          }
        }
      }
      if (reqDoc.status === 'Rejected') rejectedRequests++;
    });

    onLeaveTodayCount = onLeaveEmployeesSet.size;

    res.json({
      requests,
      summary: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        onLeaveToday: onLeaveTodayCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or Reject leave request
// @route   PUT /api/leaves/hr/:id/status
// @access  Private (HR)
const updateLeaveStatus = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied: HR privilege required' });
    }

    const { status, hrComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'This leave request has already been processed' });
    }

    leave.status = status;
    leave.hrComment = hrComment || '';
    leave.processedBy = req.user._id;
    leave.reviewedAt = new Date();

    const updatedLeave = await leave.save();
    const populatedLeave = await Leave.findById(updatedLeave._id).populate('employee', 'name employeeId email');

    res.json(populatedLeave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitLeaveRequest,
  getMyLeaves,
  getAllLeaveRequests,
  updateLeaveStatus
};
