/**
 * Centralized Attendance Configuration Settings
 */
module.exports = {
  // Check-in threshold time for Late arrival (24-hour HH:mm format)
  LATE_THRESHOLD: '09:30',

  // Standard full-day working hours requirement
  FULL_DAY_HOURS: 8,

  // Net working hours after which overtime starts accumulating
  OVERTIME_THRESHOLD_HOURS: 8
};
