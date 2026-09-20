import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowLeft, 
  AlertCircle, 
  Hourglass,
  Share2
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await eventService.getEventById(id);
      if (res.success && res.data) {
        setEvent(res.data);
      } else {
        setError('Event details not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  // Date & Time formatting
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const formatDeadline = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Handle Event Registration
  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events/${id}`);
      return;
    }

    if (user.role !== 'STUDENT' && user.role !== 'ADMIN') {
      setError('Only student accounts can register for campus events. Organizers can manage their events from the organizer dashboard.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setActionLoading(true);

    try {
      const res = await registrationService.registerForEvent(id);
      if (res.success) {
        setSuccessMessage('Seat secured! You are successfully registered for this event.');
        // Refresh event to get updated seat counts and registration flag
        await fetchEvent();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Registration Cancellation
  const handleCancelRegistration = async () => {
    setError('');
    setSuccessMessage('');
    setActionLoading(true);
    setCancelModalOpen(false);

    try {
      const res = await registrationService.cancelRegistration(id);
      if (res.success) {
        setSuccessMessage('Your registration has been cancelled.');
        await fetchEvent();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Loading event details..." size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Event Not Found</h2>
        <p className="text-slate-500 mb-6">{error || 'The requested event does not exist.'}</p>
        <Link to="/events" className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl">
          Back to Events
        </Link>
      </div>
    );
  }

  const isFull = Number(event.available_seats) <= 0;
  const isRegistered = Boolean(event.is_registered);
  const isDeadlinePassed = new Date(event.registration_deadline) < new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button navigation */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Hero Poster Banner */}
      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] max-h-[460px] w-full bg-slate-900 shadow-xl">
        <img
          src={event.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
          alt={event.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Banner Content Overlay */}
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand" size="md">
              {event.category_name}
            </Badge>
            {event.status !== 'APPROVED' && (
              <Badge variant="warning" size="md">
                Status: {event.status}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Notification Toasts / Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-2 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center space-x-2 text-sm font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Details (Left) + Registration Booking Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details, Rules, Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Event */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              About This Event
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Event Rules & Guidelines */}
          {event.rules && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 border-b border-slate-100 pb-3">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold">Rules & Guidelines</h2>
              </div>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-amber-50/50 p-4 rounded-2xl border border-amber-100/60 font-medium">
                {event.rules}
              </div>
            </div>
          )}

          {/* Contact & Organizer Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              Hosted By & Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Club / Organizer</span>
                <p className="font-bold text-slate-900 text-sm">{event.organizer_name}</p>
                <p className="text-slate-500">{event.organizer_email}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Event Helpdesk</span>
                <p className="font-semibold text-slate-800">{event.contact_information}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Logistics & Registration Action Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 sticky top-24">
            
            <h3 className="text-lg font-extrabold text-slate-900">
              Event Details
            </h3>

            {/* Logistics list */}
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Date</span>
                  <span className="font-semibold text-slate-900">{formatDate(event.event_date)}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Schedule</span>
                  <span className="font-semibold text-slate-900">
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Venue</span>
                  <span className="font-semibold text-slate-900">{event.venue_name}</span>
                  <p className="text-xs text-slate-500">{event.venue_location}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Seat Capacity</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-base font-extrabold text-slate-900">
                      {event.available_seats}
                    </span>
                    <span className="text-xs text-slate-500">
                      available out of {event.capacity} total seats
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((event.capacity - event.available_seats) / event.capacity) * 100)
                        )}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2 border-t border-slate-100">
                <Hourglass className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Registration Deadline</span>
                  <span className={`text-xs font-semibold ${isDeadlinePassed ? 'text-rose-600' : 'text-slate-700'}`}>
                    {formatDeadline(event.registration_deadline)}
                    {isDeadlinePassed && ' (Closed)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              {isRegistered ? (
                <div className="space-y-3">
                  <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-2xl flex items-center justify-center space-x-2 text-sm shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>You are Registered!</span>
                  </div>
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    disabled={actionLoading}
                    className="w-full py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Cancel My Registration
                  </button>
                </div>
              ) : isDeadlinePassed ? (
                <div className="w-full py-3.5 bg-slate-100 text-slate-500 font-bold rounded-2xl text-center text-sm">
                  Registration Has Closed
                </div>
              ) : isFull ? (
                <div className="w-full py-3.5 bg-rose-50 text-rose-600 border border-rose-200 font-bold rounded-2xl text-center text-sm">
                  Event Full (No Seats Available)
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={actionLoading}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 transition-all text-sm flex items-center justify-center space-x-2"
                >
                  <span>{actionLoading ? 'Securing Seat...' : 'Register Now'}</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Registration"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel your seat for <strong>{event.title}</strong>? Your seat will be made available to other students.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Keep My Seat
            </button>
            <button
              onClick={handleCancelRegistration}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
