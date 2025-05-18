// src/controllers/signup.js
const { UserModel } = require('../models/user-model');

exports.signup = async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password.trim()
  ) {
    console.log('⚠️ Missing or invalid input');
    return res.status(400).json('Username and password are required');
  }

  const usernameClean = username.trim().toLowerCase();

  try {
    const existingUser = await UserModel.findOne({ username: usernameClean });
    if (existingUser) {
      console.log('⚠️ Username already exists:', usernameClean);
      return res.status(409).json('Username already taken');
    }

    // Create user; password will be hashed by schema pre-save hook
    const newUser = new UserModel({
      username: usernameClean,
      password: password,
      isAdmin: false,
    });
    await newUser.save();

    return res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json('Username already taken');
    }
    console.error('Signup error:', error);
    return res.status(500).json('Server error during signup');
  }
};
