const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'civicpulse_cyberpunk_secret_key_2045_smart_city');
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        // Fallback for mock environment if DB record not persisted
        req.user = {
          _id: decoded.id,
          role: decoded.role || 'citizen',
          email: decoded.email || 'user@civicpulse.city',
          name: decoded.name || 'Civic User'
        };
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
