// src/controllers/user-controller.js
const mongoose = require('mongoose');
const { UserModel } = require('../models/user-model');

exports.listUsers = async (_req, res) => {
  try {
    const users = await UserModel.find({}, '-password');
    return res.status(200).json(users);
  } catch (err) {
    console.error('Error listing users:', err);
    return res.status(500).json('Server error retrieving users');
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;

  // Validate body
  if (typeof isAdmin !== 'boolean') {
    return res.status(400).json('isAdmin must be boolean');
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json(`${id} not found`);
  }

  try {
    // Find and update
    const user = await UserModel.findByIdAndUpdate(
      id,
      { isAdmin },
      { new: true, select: '-password' }
    );
    if (!user) {
      return res.status(404).json(`${id} not found`);
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json('Server error updating user');
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json(`${id} not found`);
  }

  try {
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json(`${id} not found`);
    }
    return res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json('Server error deleting user');
  }
};
