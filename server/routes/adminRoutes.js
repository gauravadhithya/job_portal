const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, createRecruiter, deleteUser } = require('../controller/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorizeRoles('Admin'), getDashboardStats);
router.get('/users', protect, authorizeRoles('Admin'), getUsers);
router.post('/recruiters', protect, authorizeRoles('Admin'), createRecruiter);
router.delete('/users/:id', protect, authorizeRoles('Admin'), deleteUser);

module.exports = router;
