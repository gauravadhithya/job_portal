const express = require('express');
const router = express.Router();
const { createJob, getJobs, getMyJobs, updateJobStatus, deleteJob } = require('../controller/jobController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public route: browse jobs
router.get('/', getJobs);

// Protected company routes
router.get('/my-jobs', protect, authorizeRoles('Company', 'Recruiter'), getMyJobs);
router.post('/', protect, authorizeRoles('Company', 'Recruiter'), createJob);
router.patch('/:id/status', protect, authorizeRoles('Company', 'Recruiter'), updateJobStatus);
router.delete('/:id', protect, authorizeRoles('Company', 'Recruiter', 'Admin'), deleteJob);

module.exports = router;
