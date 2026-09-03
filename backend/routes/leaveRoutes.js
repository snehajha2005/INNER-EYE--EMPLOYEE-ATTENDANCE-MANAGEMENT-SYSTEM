const express = require('express');
const router = express.Router();
const {
  submitLeaveRequest,
  getMyLeaves,
  getAllLeaveRequests,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, submitLeaveRequest);

router.route('/my-leaves')
  .get(protect, getMyLeaves);

router.route('/hr/all')
  .get(protect, getAllLeaveRequests);

router.route('/hr/:id/status')
  .put(protect, updateLeaveStatus);

module.exports = router;
