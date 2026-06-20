const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation configurations
const registerValidation = [
  check('name', 'Name is required').notEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check(
    'password',
    'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 }),
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists(),
];

// @route   POST /api/auth/register
router.post('/register', registerValidation, registerUser);

// @route   POST /api/auth/login
router.post('/login', loginValidation, loginUser);

// @route   GET /api/auth/me
router.get('/me', protect, getCurrentUser);

module.exports = router;
