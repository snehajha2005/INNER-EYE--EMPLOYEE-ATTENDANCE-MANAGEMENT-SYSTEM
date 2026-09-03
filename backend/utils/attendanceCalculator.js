const { LATE_THRESHOLD, FULL_DAY_HOURS, OVERTIME_THRESHOLD_HOURS } = require('../config/attendanceConfig');

/**
 * Determine if check-in time is Late vs On Time based on LATE_THRESHOLD ('09:30')
 */
const determineArrivalStatus = (checkInDate) => {
  if (!checkInDate) return 'On Time';
  const inDate = new Date(checkInDate);
  if (isNaN(inDate.getTime())) return 'On Time';

  const [thresholdHour, thresholdMinute] = LATE_THRESHOLD.split(':').map(Number);
  
  const checkInHour = inDate.getHours();
  const checkInMinute = inDate.getMinutes();

  if (checkInHour > thresholdHour || (checkInHour === thresholdHour && checkInMinute > thresholdMinute)) {
    return 'Late';
  }
  return 'On Time';
};

/**
 * Calculate working hours, break hours, net working hours, overtime, and attendance status.
 * @param {Date|String} checkIn - Check-in Date
 * @param {Date|String} checkOut - Check-out Date
 * @param {Array} breaks - Array of { startTime, endTime, duration }
 * @param {Date} [now] - Current reference time for active sessions
 * @returns {Object} Calculated metrics
 */
const calculateAttendance = (checkIn, checkOut, breaks = [], now = new Date()) => {
  if (!checkIn) {
    return {
      grossWorkingHours: 0,
      totalBreakDuration: 0,
      netWorkingHours: 0,
      workingHours: 0,
      overtime: 0,
      sessionState: 'Checked In',
      arrivalStatus: 'On Time',
      status: 'Checked In',
      leaveDeduction: 0,
      complianceStatus: 'Compliant'
    };
  }

  const inTime = new Date(checkIn);
  const outTime = checkOut ? new Date(checkOut) : new Date(now);

  if (isNaN(inTime.getTime())) {
    return {
      grossWorkingHours: 0,
      totalBreakDuration: 0,
      netWorkingHours: 0,
      workingHours: 0,
      overtime: 0,
      sessionState: 'Checked In',
      arrivalStatus: 'On Time',
      status: 'Checked In',
      leaveDeduction: 0,
      complianceStatus: 'Compliant'
    };
  }

  // Arrival status based on check-in timestamp
  const arrivalStatus = determineArrivalStatus(inTime);

  // Calculate gross working hours in milliseconds & convert to hours rounded to 2 decimal places
  const grossDiffMs = Math.max(0, outTime - inTime);
  const grossWorkingHours = parseFloat((grossDiffMs / (1000 * 60 * 60)).toFixed(2));

  // Calculate total break duration (in hours)
  let totalBreakMs = 0;
  let hasActiveBreak = false;

  if (Array.isArray(breaks)) {
    breaks.forEach(b => {
      if (b.startTime) {
        const bStart = new Date(b.startTime);
        const bEnd = b.endTime ? new Date(b.endTime) : new Date(now);
        if (!isNaN(bStart.getTime()) && !isNaN(bEnd.getTime())) {
          totalBreakMs += Math.max(0, bEnd - bStart);
        }
        if (!b.endTime) {
          hasActiveBreak = true;
        }
      }
    });
  }

  const totalBreakDuration = parseFloat((totalBreakMs / (1000 * 60 * 60)).toFixed(2));

  // Net working hours
  const netWorkingHours = Math.max(0, parseFloat((grossWorkingHours - totalBreakDuration).toFixed(2)));

  // Overtime
  const overtime = netWorkingHours > OVERTIME_THRESHOLD_HOURS 
    ? parseFloat((netWorkingHours - OVERTIME_THRESHOLD_HOURS).toFixed(2)) 
    : 0;

  // Session state
  let sessionState = 'Checked In';
  if (checkOut) {
    sessionState = 'Completed';
  } else if (hasActiveBreak) {
    sessionState = 'On Break';
  }

  // Status & Leave Deduction (Backward Compatible)
  let status = 'Checked In';
  let leaveDeduction = 0;

  if (checkOut) {
    if (netWorkingHours >= FULL_DAY_HOURS) {
      status = 'Present';
      leaveDeduction = 0;
    } else {
      status = 'Half Day';
      leaveDeduction = 0.5;
    }
  } else {
    status = hasActiveBreak ? 'On Break' : 'Checked In';
    leaveDeduction = 0;
  }

  // Compliance status
  let complianceStatus = 'Compliant';
  if (checkOut) {
    if (netWorkingHours < FULL_DAY_HOURS) {
      complianceStatus = 'Under-Hours';
    } else if (overtime > 0) {
      complianceStatus = 'Overtime';
    }
  }

  return {
    grossWorkingHours,
    totalBreakDuration,
    netWorkingHours,
    workingHours: netWorkingHours,
    overtime,
    sessionState,
    arrivalStatus,
    status,
    leaveDeduction,
    complianceStatus
  };
};

module.exports = { calculateAttendance, determineArrivalStatus };
