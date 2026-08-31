const Application = require('../models/Application');
const Job = require('../models/Job');

const applyForJob = async (req, res) => {
  try {
    const { jobId, resume } = req.body;

    const job = await Job.findById(jobId);
    if (!job || job.status !== 'Open') {
      return res.status(400).json({ message: 'job is not available' });
    }

    const existingApplication = await Application.findOne({ jobId, candidateId: req.user._id });
    if (existingApplication) {
      return res.status(400).json({ message: 'you have already applied for this job' });
    }

    const application = await Application.create({
      jobId,
      candidateId: req.user._id,
      resume,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'application failed', error: error.message });
  }
};

const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'not authorized to view these applications' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('candidateId', 'name email')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'failed to fetch applications', error: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate({
        path: 'jobId',
        populate: { path: 'recruiterId', select: 'name email' },
      })
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your applications', error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'application not found' });
    }
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: 'failed to update status', error: error.message });
  }
};

module.exports = { applyForJob, getJobApplications, getMyApplications, updateApplicationStatus };