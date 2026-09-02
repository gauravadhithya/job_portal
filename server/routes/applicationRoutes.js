const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
} = require('../controller/applicationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('Job Seeker'), applyForJob);
router.get('/my', protect, authorizeRoles('Job Seeker'), getMyApplications);
router.get('/job/:jobId', protect, authorizeRoles('Company', 'Recruiter', 'Admin'), getJobApplications);
router.patch('/:id/status', protect, authorizeRoles('Company', 'Recruiter', 'Admin'), updateApplicationStatus);

module.exports = router;