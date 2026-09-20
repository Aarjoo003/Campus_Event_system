/**
 * Authentication Controller
 * Handles user registration, login, profile management, and password updates.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'super_secret_jwt_key_campus_events_2026_jwt_token',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const authController = {
  /**
   * Register a new user (Student or Organizer)
   */
  async register(req, res, next) {
    try {
      const { name, email, password, role = 'STUDENT', phone, department, student_id_number } = req.body;

      // Restrict public self-registration to STUDENT or ORGANIZER
      const targetRole = role.toUpperCase() === 'ORGANIZER' ? 'ORGANIZER' : 'STUDENT';

      // Check if email already registered
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return errorResponse(res, 409, 'An account with this email address already exists.');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Create user record
      const userId = await userModel.createUser({
        name,
        email,
        password_hash,
        role: targetRole,
        phone,
        department,
        student_id_number
      });

      const user = await userModel.findById(userId);
      const token = generateToken(user);

      return successResponse(res, 201, 'Registration successful!', {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department: user.department,
          student_id_number: user.student_id_number
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * User Login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return errorResponse(res, 400, 'Please provide both email and password.');
      }

      const user = await userModel.findByEmail(email);
      if (!user) {
        return errorResponse(res, 401, 'Invalid email or password.');
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return errorResponse(res, 401, 'Invalid email or password.');
      }

      const token = generateToken(user);

      return successResponse(res, 200, 'Login successful!', {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department: user.department,
          student_id_number: user.student_id_number
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Current Authenticated User Profile
   */
  async getMe(req, res, next) {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return errorResponse(res, 404, 'User not found.');
      }

      return successResponse(res, 200, 'Current user profile retrieved.', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        student_id_number: user.student_id_number,
        created_at: user.created_at
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Profile Details
   */
  async updateProfile(req, res, next) {
    try {
      const { name, phone, department, student_id_number } = req.body;
      const updatedUser = await userModel.updateProfile(req.user.id, {
        name,
        phone,
        department,
        student_id_number
      });

      return successResponse(res, 200, 'Profile updated successfully.', {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        department: updatedUser.department,
        student_id_number: updatedUser.student_id_number
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change Password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return errorResponse(res, 400, 'Please provide both current and new password.');
      }

      if (newPassword.length < 6) {
        return errorResponse(res, 400, 'New password must be at least 6 characters long.');
      }

      const user = await userModel.findByEmail(req.user.email);
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return errorResponse(res, 400, 'Incorrect current password.');
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      await userModel.updatePassword(req.user.id, newHash);

      return successResponse(res, 200, 'Password changed successfully. Please use your new password next time.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
