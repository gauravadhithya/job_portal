const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  createCompany,
  approveCompany,
  deleteUser,
} = require('../controller/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorizeRoles('Admin'), getDashboardStats);
router.get('/users', protect, authorizeRoles('Admin'), getUsers);
router.post('/companies', protect, authorizeRoles('Admin'), createCompany);
router.post('/recruiters', protect, authorizeRoles('Admin'), createCompany);
router.patch('/users/:id/approve', protect, authorizeRoles('Admin'), approveCompany);
router.patch('/companies/:id/approve', protect, authorizeRoles('Admin'), approveCompany);
router.delete('/users/:id', protect, authorizeRoles('Admin'), deleteUser);

module.exports = router;
