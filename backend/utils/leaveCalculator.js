const LEAVE_QUOTAS = {
  'Casual Leave': 12,
  'Sick Leave': 10,
  'Paid Leave': 15
};

/**
 * Calculate requested leave days based on start date, end date, and duration.
 */
const calculateLeaveDays = (startDateStr, endDateStr, duration) => {
  if (duration === 'Half Day') {
    return 0.5;
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 1;
  }

  // Calculate calendar day difference inclusive of start & end date
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24)) + 1;

  return Math.max(1, diffDays);
};

/**
 * Calculate dynamic leave balances and Loss of Pay (LOP) from approved leave records.
 * @param {Array} approvedLeaves - Array of approved Leave documents
 */
const calculateLeaveBalances = (approvedLeaves = []) => {
  const balances = {
    'Casual Leave': { total: LEAVE_QUOTAS['Casual Leave'], used: 0, remaining: LEAVE_QUOTAS['Casual Leave'], lop: 0 },
    'Sick Leave': { total: LEAVE_QUOTAS['Sick Leave'], used: 0, remaining: LEAVE_QUOTAS['Sick Leave'], lop: 0 },
    'Paid Leave': { total: LEAVE_QUOTAS['Paid Leave'], used: 0, remaining: LEAVE_QUOTAS['Paid Leave'], lop: 0 }
  };

  // Group approved days per leave type
  const typeTotals = {
    'Casual Leave': 0,
    'Sick Leave': 0,
    'Paid Leave': 0
  };

  approvedLeaves.forEach(leave => {
    if (typeTotals[leave.leaveType] !== undefined) {
      typeTotals[leave.leaveType] += leave.numberOfDays || 0;
    }
  });

  let totalLopDays = 0;

  Object.keys(LEAVE_QUOTAS).forEach(type => {
    const quota = LEAVE_QUOTAS[type];
    const approvedDays = typeTotals[type];

    const used = Math.min(quota, approvedDays);
    const remaining = Math.max(0, quota - approvedDays);
    const lop = Math.max(0, approvedDays - quota);

    balances[type] = {
      total: quota,
      used,
      remaining,
      lop
    };

    totalLopDays += lop;
  });

  return {
    quotas: LEAVE_QUOTAS,
    balances,
    totalLopDays
  };
};

module.exports = {
  LEAVE_QUOTAS,
  calculateLeaveDays,
  calculateLeaveBalances
};
