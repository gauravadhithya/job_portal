const Company = require('../models/Company');

const createCompany = async (req, res) => {
  try {
    const { name, location, description, website } = req.body;

    const existing = await Company.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Company with this name already exists' });
    }

    const company = await Company.create({
      name,
      location,
      description,
      website,
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create company', error: error.message });
  }
};

const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch companies', error: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete company', error: error.message });
  }
};

module.exports = { createCompany, getCompanies, deleteCompany };
