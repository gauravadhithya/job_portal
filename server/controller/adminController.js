const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const bcrypt = require('bcrypt');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobSeekers = await User.countDocuments({ role: 'Job Seeker' });
    const totalRecruiters = await User.countDocuments({ role: 'Recruiter' });
    const totalCompanies = await Company.countDocuments();
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'Open' });
    const totalApplications = await Application.countDocuments();

    res.status(200).json({
      totalUsers,
      totalJobSeekers,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      openJobs,
      totalApplications,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch platform stats', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

const createRecruiter = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const recruiter = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'Recruiter',
    });

    res.status(201).json({
      message: 'Recruiter account registered successfully',
      user: {
        _id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        role: recruiter.role,
        createdAt: recruiter.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create recruiter account', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admins cannot delete their own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

module.exports = { getDashboardStats, getUsers, createRecruiter, deleteUser };
