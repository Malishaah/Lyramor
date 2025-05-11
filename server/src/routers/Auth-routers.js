// src/routes/auth.js
const express = require('express');
const { requireAdmin, requireAuth } = require('../../middlewares/requireAuth');
const { getSession, login } = require('../controllers/login');
const { logout } = require('../controllers/logout');
const { signup } = require('../controllers/signup');
const {
  deleteUser,
  listUsers,
  updateUser,
} = require('../controllers/user-controller');

const router = express.Router();

// Public endpoints
router.get('/session', getSession);
router.post('/register', signup); // for your frontend
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// All routes below require authenticated admin
router.use(requireAuth, requireAdmin);

// GET all users
router.get('/', listUsers);

// PUT update role
router.put('/:id', updateUser);

// DELETE user
router.delete('/:id', deleteUser);

module.exports = { authRouter: router };
