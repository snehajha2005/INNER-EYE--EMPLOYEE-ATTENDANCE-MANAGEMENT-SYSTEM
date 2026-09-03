const express = require('express');
const router = express.Router();
const {
  checkIn,
  startBreak,
  resumeWork,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAttendanceSummary
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/check-in').post(protect, checkIn);
router.route('/start-break').post(protect, startBreak);
router.route('/resume-work').put(protect, resumeWork);
router.route('/check-out').put(protect, checkOut);
router.route('/today').get(protect, getTodayAttendance);
router.route('/history').get(protect, getAttendanceHistory);
router.route('/summary').get(protect, getAttendanceSummary);

module.exports = router;
