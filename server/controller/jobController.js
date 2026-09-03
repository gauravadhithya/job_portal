const Job = require('../models/Job');

const createJob = async (req, res) => {
  try {
    const { title, description, skills, salary, location, deadline, companyId } = req.body;

    const job = await Job.create({
      recruiterId: req.user._id,
      companyId: companyId || req.user._id,
      title,
      description,
      skills,
      salary,
      location,
      deadline,
      status: 'Open',
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'failed to create job', error: error.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const { location, skills, keyword, status } = { ...req.query, ...req.body };

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (skills) {
      query.skills = { $in: skills.split(',').map((s) => s.trim()) };
    }
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }
    const jobs = await Job.find(query)
      .populate('recruiterId', 'name email')
      .populate('companyId', 'name location website')
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'failed to fetch jobs', error: error.message });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Open', 'Closed'].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'Open' or 'Closed'" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to modify this job' });
    }

    job.status = status;
    await job.save();

    res.status(200).json({ message: `Job status updated to ${status}`, job });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update job status', error: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job', error: error.message });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [
        { recruiterId: req.user._id },
        { companyId: req.user._id },
      ],
    })
      .populate('recruiterId', 'name email')
      .populate('companyId', 'name location website')
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'failed to fetch your jobs', error: error.message });
  }
};

module.exports = { createJob, getJobs, getMyJobs, updateJobStatus, deleteJob };
