/**
 * Authentication Routes
 * Mounted at /api/auth
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Register validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Full name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('role').optional().isIn(['STUDENT', 'ORGANIZER']).withMessage('Role must be STUDENT or ORGANIZER.')
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email.'),
  body('password').notEmpty().withMessage('Password is required.')
];

// Profile update validation rules
const profileValidation = [
  body('name').trim().notEmpty().withMessage('Name cannot be empty.')
];

router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, validate(profileValidation), authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
