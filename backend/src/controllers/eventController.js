/**
 * Event Controller
 * Handles CRUD operations, searching, filtering, and role validations for events.
 */

const eventModel = require('../models/eventModel');
const lookupModel = require('../models/lookupModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const eventController = {
  /**
   * List all events with filters (Search, Category, Venue, Date, Upcoming)
   */
  async getAll(req, res, next) {
    try {
      const {
        search,
        categoryId,
        venueId,
        date,
        status,
        organizerId,
        upcomingOnly,
        limit = 50,
        offset = 0
      } = req.query;

      // Regular visitors and students only see APPROVED events
      let effectiveStatus = status || 'APPROVED';
      if (!req.user || req.user.role === 'STUDENT') {
        effectiveStatus = 'APPROVED';
      }

      const events = await eventModel.getAllEvents({
        search,
        categoryId: categoryId ? Number(categoryId) : null,
        venueId: venueId ? Number(venueId) : null,
        date: date || null,
        status: effectiveStatus,
        organizerId: organizerId ? Number(organizerId) : null,
        upcomingOnly: upcomingOnly === 'true' || upcomingOnly === true,
        currentUserId: req.user ? req.user.id : null,
        limit: Number(limit),
        offset: Number(offset)
      });

      return successResponse(res, 200, 'Events fetched successfully.', events);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single event by ID
   */
  async getById(req, res, next) {
    try {
      const eventId = req.params.id;
      const currentUserId = req.user ? req.user.id : null;

      const event = await eventModel.getEventById(eventId, currentUserId);
      if (!event) {
        return errorResponse(res, 404, 'Event not found.');
      }

      return successResponse(res, 200, 'Event retrieved successfully.', event);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get metadata: categories and venues (for forms and filters)
   */
  async getMetadata(req, res, next) {
    try {
      const [categories, venues] = await Promise.all([
        lookupModel.getAllCategories(),
        lookupModel.getAllVenues()
      ]);

      return successResponse(res, 200, 'Metadata retrieved.', {
        categories,
        venues
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create Event (Organizer or Admin)
   */
  async create(req, res, next) {
    try {
      const {
        title,
        description,
        category_id,
        venue_id,
        event_date,
        start_time,
        end_time,
        capacity,
        registration_deadline,
        poster_url,
        rules,
        contact_information
      } = req.body;

      // Business logic validations
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      if (event_date < todayStr) {
        return errorResponse(res, 400, 'Event date cannot be in the past.');
      }

      const deadlineDate = new Date(registration_deadline);
      const eventFullDate = new Date(`${event_date}T${start_time}`);
      if (deadlineDate > eventFullDate) {
        return errorResponse(res, 400, 'Registration deadline cannot be after the event start time.');
      }

      if (Number(capacity) <= 0) {
        return errorResponse(res, 400, 'Capacity must be greater than 0.');
      }

      // Check venue capacity
      const venues = await lookupModel.getAllVenues();
      const selectedVenue = venues.find((v) => v.id === Number(venue_id));
      if (selectedVenue && Number(capacity) > selectedVenue.capacity) {
        return errorResponse(
          res,
          400,
          `Capacity (${capacity}) exceeds the selected venue's maximum physical capacity (${selectedVenue.capacity}).`
        );
      }

      const organizer_id = req.user.role === 'ADMIN' && req.body.organizer_id 
        ? Number(req.body.organizer_id) 
        : req.user.id;

      const eventId = await eventModel.createEvent({
        title,
        description,
        category_id: Number(category_id),
        organizer_id,
        venue_id: Number(venue_id),
        event_date,
        start_time,
        end_time,
        capacity: Number(capacity),
        registration_deadline,
        poster_url: poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        rules,
        contact_information,
        status: req.user.role === 'ADMIN' ? 'APPROVED' : 'APPROVED' // Direct approval or pending
      });

      const createdEvent = await eventModel.getEventById(eventId);
      return successResponse(res, 201, 'Event created successfully!', createdEvent);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Event (Organizer for own events, or Admin)
   */
  async update(req, res, next) {
    try {
      const eventId = req.params.id;
      const existing = await eventModel.getEventById(eventId);

      if (!existing) {
        return errorResponse(res, 404, 'Event not found.');
      }

      // Authorization check: Only organizer who created it or Admin can update
      if (req.user.role !== 'ADMIN' && existing.organizer_id !== req.user.id) {
        return errorResponse(res, 403, 'Forbidden: You are not authorized to edit this event.');
      }

      const {
        title,
        description,
        category_id,
        venue_id,
        event_date,
        start_time,
        end_time,
        capacity,
        registration_deadline,
        poster_url,
        rules,
        contact_information,
        status
      } = req.body;

      if (capacity && Number(capacity) < Number(existing.registered_count)) {
        return errorResponse(
          res,
          400,
          `Cannot reduce capacity below currently registered student count (${existing.registered_count}).`
        );
      }

      await eventModel.updateEvent(eventId, {
        title,
        description,
        category_id: category_id ? Number(category_id) : undefined,
        venue_id: venue_id ? Number(venue_id) : undefined,
        event_date,
        start_time,
        end_time,
        capacity: capacity ? Number(capacity) : undefined,
        registration_deadline,
        poster_url,
        rules,
        contact_information,
        status: req.user.role === 'ADMIN' ? status : undefined
      });

      const updated = await eventModel.getEventById(eventId);
      return successResponse(res, 200, 'Event updated successfully.', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete Event (Organizer for own events, or Admin)
   */
  async delete(req, res, next) {
    try {
      const eventId = req.params.id;
      const existing = await eventModel.getEventById(eventId);

      if (!existing) {
        return errorResponse(res, 404, 'Event not found.');
      }

      if (req.user.role !== 'ADMIN' && existing.organizer_id !== req.user.id) {
        return errorResponse(res, 403, 'Forbidden: You are not authorized to delete this event.');
      }

      await eventModel.deleteEvent(eventId);
      return successResponse(res, 200, 'Event deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Organizer's Own Events
   */
  async getOrganizerEvents(req, res, next) {
    try {
      const events = await eventModel.getAllEvents({
        organizerId: req.user.id,
        status: 'ALL'
      });

      return successResponse(res, 200, 'Organizer events retrieved.', events);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = eventController;
