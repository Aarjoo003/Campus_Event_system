/**
 * Registration Controller
 * Handles student event registration, cancellations, registration listings, and student history.
 */

const registrationModel = require('../models/registrationModel');
const eventModel = require('../models/eventModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const registrationController = {
  /**
   * Register authenticated student for an event
   */
  async register(req, res, next) {
    try {
      const eventId = Number(req.params.id);
      const studentId = req.user.id;

      const result = await registrationModel.registerStudent(studentId, eventId);

      if (result.error) {
        let statusCode = 400;
        if (result.error === 'EVENT_NOT_FOUND') statusCode = 404;
        if (result.error === 'ALREADY_REGISTERED') statusCode = 409;
        return errorResponse(res, statusCode, result.message);
      }

      // Fetch fresh event details to return updated available seat counts
      const updatedEvent = await eventModel.getEventById(eventId, studentId);

      return successResponse(res, 201, 'Registration successful! You have secured your seat for this event.', {
        registrationId: result.registrationId,
        availableSeats: updatedEvent.available_seats,
        isRegistered: true
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cancel authenticated student's registration
   */
  async cancel(req, res, next) {
    try {
      const eventId = Number(req.params.id);
      const studentId = req.user.id;

      const result = await registrationModel.cancelRegistration(studentId, eventId);

      if (result.error) {
        let statusCode = 400;
        if (result.error === 'NOT_FOUND') statusCode = 404;
        return errorResponse(res, statusCode, result.message);
      }

      const updatedEvent = await eventModel.getEventById(eventId, studentId);

      return successResponse(res, 200, 'Your registration for this event has been cancelled.', {
        availableSeats: updatedEvent.available_seats,
        isRegistered: false
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all registered events for current logged-in student (My Events)
   */
  async getMyEvents(req, res, next) {
    try {
      const registrations = await registrationModel.getStudentRegistrations(req.user.id);
      return successResponse(res, 200, 'Registered events retrieved.', registrations);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all student registrations for a specific event (Organizer/Admin only)
   */
  async getEventRegistrations(req, res, next) {
    try {
      const eventId = Number(req.params.id);
      const event = await eventModel.getEventById(eventId);

      if (!event) {
        return errorResponse(res, 404, 'Event not found.');
      }

      // Authorization check: Event organizer or Admin
      if (req.user.role !== 'ADMIN' && event.organizer_id !== req.user.id) {
        return errorResponse(res, 403, 'Forbidden: You are not authorized to view registrations for this event.');
      }

      const registrations = await registrationModel.getEventRegistrations(eventId);
      return successResponse(res, 200, 'Event registrations retrieved.', {
        event: {
          id: event.id,
          title: event.title,
          capacity: event.capacity,
          event_date: event.event_date,
          start_time: event.start_time
        },
        registrations
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = registrationController;
