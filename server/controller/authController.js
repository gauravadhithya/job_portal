const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      degree,
      batch,
      college,
      phone,
      companyName,
      industry,
      website,
      location,
    } = req.body;

    // Public registration allowed for Job Seeker and Company
    const userRole = role === 'Company' || role === 'Recruiter' ? 'Company' : 'Job Seeker';

    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Recruiters / Companies require admin approval before they can log in
    const isApproved = userRole === 'Job Seeker';

    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: userRole,
      isApproved,
    };

    if (userRole === 'Job Seeker') {
      if (degree) userData.degree = degree.trim();
      if (batch) userData.batch = batch.trim();
      if (college) userData.college = college.trim();
      if (phone) userData.phone = phone.trim();
    } else {
      if (companyName) userData.companyName = companyName.trim();
      if (industry) userData.industry = industry.trim();
      if (website) userData.website = website.trim();
      if (location) userData.location = location.trim();
    }

    const user = await User.create(userData);

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || '',
      isApproved: user.isApproved,
      degree: user.degree,
      batch: user.batch,
      college: user.college,
      companyName: user.companyName,
      industry: user.industry,
      website: user.website,
      location: user.location,
      message: isApproved
        ? 'Account registered successfully!'
        : 'Registration submitted! Your recruiter/company account is pending approval by the Platform Administrator.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check recruiter / company approval status
    if ((user.role === 'Company' || user.role === 'Recruiter') && user.isApproved === false) {
      return res.status(403).json({
        message: 'Your company/recruiter account is currently pending administrator approval. Please wait for the admin to approve your account before signing in.',
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || '',
      isApproved: user.isApproved,
      degree: user.degree,
      batch: user.batch,
      college: user.college,
      phone: user.phone,
      companyName: user.companyName,
      industry: user.industry,
      website: user.website,
      location: user.location,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      profileImage,
      degree,
      batch,
      college,
      phone,
      companyName,
      industry,
      website,
      location,
    } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (profileImage !== undefined) user.profileImage = profileImage.trim();
    if (degree !== undefined) user.degree = degree.trim();
    if (batch !== undefined) user.batch = batch.trim();
    if (college !== undefined) user.college = college.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (companyName !== undefined) user.companyName = companyName.trim();
    if (industry !== undefined) user.industry = industry.trim();
    if (website !== undefined) user.website = website.trim();
    if (location !== undefined) user.location = location.trim();

    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || '',
      isApproved: user.isApproved,
      degree: user.degree,
      batch: user.batch,
      college: user.college,
      phone: user.phone,
      companyName: user.companyName,
      industry: user.industry,
      website: user.website,
      location: user.location,
      message: 'Profile updated successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: 'Username parameter required' });
    }

    // Try finding by exact name or regex case-insensitive, replacing dashes with spaces
    const cleanName = decodeURIComponent(username).replace(/-/g, ' ').trim();
    
    let user = await User.findOne({
      $or: [
        { name: new RegExp(`^${cleanName}$`, 'i') },
        { email: cleanName.toLowerCase() },
      ],
    }).select('-password');

    // If not found and username looks like a MongoDB ObjectId
    if (!user && username.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(username).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || '',
      isApproved: user.isApproved,
      degree: user.degree,
      batch: user.batch,
      college: user.college,
      phone: user.phone,
      companyName: user.companyName,
      industry: user.industry,
      website: user.website,
      location: user.location,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile', error: error.message });
  }
};

module.exports = { registerUser, loginUser, updateProfile, getPublicProfile };