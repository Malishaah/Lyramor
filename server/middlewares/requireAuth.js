// src/middlewares/requireAuth.js
const session = require('express-session');

// Check that the user is authenticated
exports.requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json('Unauthorized');
  }
  next();
};

// Check that the authenticated user is an admin
exports.requireAdmin = (req, res, next) => {
  if (!req.session.user?.isAdmin) {
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
};
