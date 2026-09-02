const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Job Seeker', 'Company', 'Recruiter', 'Admin'],
      required: true,
    },

    // Profile Image / Avatar
    profileImage: {
      type: String,
      default: '',
    },

    // Approval status for Companies / Recruiters
    isApproved: {
      type: Boolean,
      default: true,
    },

    // Candidate / Job Seeker Profile Details
    degree: {
      type: String,
      default: '',
    },
    batch: {
      type: String,
      default: '',
    },
    college: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },

    // Company / Recruiter Profile Details
    companyName: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
