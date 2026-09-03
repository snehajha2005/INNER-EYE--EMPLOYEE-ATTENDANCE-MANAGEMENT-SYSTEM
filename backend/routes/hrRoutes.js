const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getEmployees,
  getAllAttendance
} = require('../controllers/hrController');
const { protect, hrOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(hrOnly);

router.route('/dashboard').get(getDashboardSummary);
router.route('/employees').get(getEmployees);
router.route('/attendance').get(getAllAttendance);

module.exports = router;
