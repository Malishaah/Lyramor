// src/controllers/login.js
const argon2 = require('argon2');
const { UserModel } = require('../models/user-model');

exports.getSession = async (req, res) => {
  try {
    res.status(200).json(req.session.user);
  } catch (err) {
    console.error('Session retrieval error:', err);
    res.status(500).json('Server error retrieving session');
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find the user and explicitly include the password hash
    const user = await UserModel.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json('Invalid credentials!');
    }

    // Verify the supplied password against the stored hash
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return res.status(401).json('Invalid credentials!');
    }

    // Store only non-sensitive info in session
    req.session.user = {
      _id: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
    };

    // Send back user info (no token)
    res.status(200).json({
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json('Server error during login');
  }
};
