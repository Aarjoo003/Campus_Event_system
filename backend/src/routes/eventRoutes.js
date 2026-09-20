/**
 * Event Routes
 * Mounted at /api/events
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const eventController = require('../controllers/eventController');
const registrationController = require('../controllers/registrationController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Validation rules for Event creation and updates
const eventValidation = [
  body('title').trim().notEmpty().withMessage('Event title is required.'),
  body('description').trim().notEmpty().withMessage('Event description is required.'),
  body('category_id').isInt({ min: 1 }).withMessage('A valid category must be selected.'),
  body('venue_id').isInt({ min: 1 }).withMessage('A valid venue must be selected.'),
  body('event_date').isISO8601().withMessage('Event date must be a valid date format (YYYY-MM-DD).'),
  body('start_time').matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('Start time must be in HH:MM format.'),
  body('end_time').matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('End time must be in HH:MM format.'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer.'),
  body('registration_deadline').notEmpty().withMessage('Registration deadline is required.'),
  body('contact_information').trim().notEmpty().withMessage('Contact information is required.')
];

// Public / Filterable routes
router.get('/', optionalAuth, eventController.getAll);
router.get('/metadata', eventController.getMetadata);

// Organizer specific event listing
router.get(
  '/organizer/my-events',
  authenticateToken,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  eventController.getOrganizerEvents
);

// Specific event details
router.get('/:id', optionalAuth, eventController.getById);

// Create event (Organizer or Admin)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  validate(eventValidation),
  eventController.create
);

// Update event (Organizer or Admin)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  eventController.update
);

// Delete event (Organizer or Admin)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  eventController.delete
);

// Student registration for an event
router.post(
  '/:id/register',
  authenticateToken,
  authorizeRoles('STUDENT', 'ADMIN'),
  registrationController.register
);

// Student cancel registration
router.delete(
  '/:id/register',
  authenticateToken,
  authorizeRoles('STUDENT', 'ADMIN'),
  registrationController.cancel
);

// Get student registrations for an event (Organizer or Admin)
router.get(
  '/:id/registrations',
  authenticateToken,
  authorizeRoles('ORGANIZER', 'ADMIN'),
  registrationController.getEventRegistrations
);

module.exports = router;
