const express = require('express');
const router = express.Router();
const { createCompany, getCompanies, deleteCompany } = require('../controller/companyController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getCompanies);
router.post('/', protect, authorizeRoles('Recruiter', 'Admin'), createCompany);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteCompany);

module.exports = router;
