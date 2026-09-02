const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile, getPublicProfile } = require('../controller/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.patch('/profile', protect, updateProfile);
router.get('/users/:username', getPublicProfile);

module.exports = router;