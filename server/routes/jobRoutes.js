const express = require('express');
const router = express.Router();
const { createJob, getJobs, updateJobStatus, deleteJob } = require('../controller/jobController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public route: browse jobs
router.get('/', getJobs);

// Protected routes: strictly recruiters (companies) only
router.post('/', protect, authorizeRoles('Recruiter'), createJob);
router.patch('/:id/status', protect, authorizeRoles('Recruiter'), updateJobStatus);
router.delete('/:id', protect, authorizeRoles('Recruiter', 'Admin'), deleteJob);

module.exports = router;
