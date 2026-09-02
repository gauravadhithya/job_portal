const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: "not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "not authorized, no token" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "not authenticated" });
    }

    const userRole = req.user.role;
    
    // Check direct match or Company/Recruiter compatibility
    if (roles.includes(userRole) || ((roles.includes('Company') || roles.includes('Recruiter')) && (userRole === 'Company' || userRole === 'Recruiter'))) {
      return next();
    }

    return res.status(403).json({ message: `User role "${userRole}" is not authorized to access this route` });
  };
};

module.exports = { protect, authorizeRoles };
