/**
 * Admin and Dashboard Controller
 * Handles administrative dashboards, user management, and event approval workflows.
 */

const userModel = require('../models/userModel');
const eventModel = require('../models/eventModel');
const lookupModel = require('../models/lookupModel');
const { query } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const adminController = {
  /**
   * Admin Dashboard Metrics and Overview
   */
  async getDashboardStats(req, res, next) {
    try {
      const stats = await lookupModel.getAdminDashboardStats();
      return successResponse(res, 200, 'Admin dashboard metrics retrieved.', stats);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get All Users (with optional search and role filter)
   */
  async getAllUsers(req, res, next) {
    try {
      const { role, search } = req.query;
      const users = await userModel.getAllUsers(role || null, search || null);
      return successResponse(res, 200, 'Users retrieved successfully.', users);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update User Role or Status
   */
  async updateUserRole(req, res, next) {
    try {
      const targetUserId = Number(req.params.id);
      const { role } = req.body;

      if (!role || !['STUDENT', 'ORGANIZER', 'ADMIN'].includes(role.toUpperCase())) {
        return errorResponse(res, 400, 'Invalid role. Must be STUDENT, ORGANIZER, or ADMIN.');
      }

      const user = await userModel.findById(targetUserId);
      if (!user) {
        return errorResponse(res, 404, 'User not found.');
      }

      await query('UPDATE users SET role = ? WHERE id = ?', [role.toUpperCase(), targetUserId]);

      return successResponse(res, 200, `User role updated to ${role.toUpperCase()}.`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete User (Admin only)
   */
  async deleteUser(req, res, next) {
    try {
      const targetUserId = Number(req.params.id);

      if (targetUserId === req.user.id) {
        return errorResponse(res, 400, 'You cannot delete your own administrative account.');
      }

      const user = await userModel.findById(targetUserId);
      if (!user) {
        return errorResponse(res, 404, 'User not found.');
      }

      await userModel.deleteUser(targetUserId);
      return successResponse(res, 200, 'User deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Event Status (Approve / Reject / Cancel)
   */
  async updateEventStatus(req, res, next) {
    try {
      const eventId = Number(req.params.id);
      const { status } = req.body;

      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
      if (!status || !validStatuses.includes(status.toUpperCase())) {
        return errorResponse(res, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const event = await eventModel.getEventById(eventId);
      if (!event) {
        return errorResponse(res, 404, 'Event not found.');
      }

      await eventModel.updateStatus(eventId, status.toUpperCase());

      return successResponse(res, 200, `Event status updated to ${status.toUpperCase()}.`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Student Dashboard Statistics
   */
  async getStudentDashboard(req, res, next) {
    try {
      const data = await lookupModel.getStudentDashboardStats(req.user.id);
      return successResponse(res, 200, 'Student dashboard data retrieved.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Organizer Dashboard Statistics
   */
  async getOrganizerDashboard(req, res, next) {
    try {
      const data = await lookupModel.getOrganizerDashboardStats(req.user.id);
      return successResponse(res, 200, 'Organizer dashboard data retrieved.', data);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;
