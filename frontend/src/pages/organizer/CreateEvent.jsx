import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Image, 
  Phone, 
  ShieldAlert, 
  ArrowLeft, 
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { eventService } from '../../services/eventService';

export default function CreateEvent() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    venue_id: '',
    event_date: '',
    start_time: '10:00',
    end_time: '17:00',
    capacity: 100,
    registration_deadline: '',
    poster_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    rules: '1. Valid College ID is mandatory.\n2. Please arrive 15 minutes before event commencement.',
    contact_information: ''
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await eventService.getMetadata();
        if (res.success && res.data) {
          setCategories(res.data.categories || []);
          setVenues(res.data.venues || []);
          if (res.data.categories?.length > 0) {
            setFormData((prev) => ({ ...prev, category_id: res.data.categories[0].id }));
          }
          if (res.data.venues?.length > 0) {
            setFormData((prev) => ({ 
              ...prev, 
              venue_id: res.data.venues[0].id,
              capacity: Math.min(prev.capacity, res.data.venues[0].capacity)
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      } finally {
        setLoadingMeta(false);
      }
    };
    fetchMetadata();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Business Logic Validations
    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.event_date < todayStr) {
      setError('Event date cannot be in the past.');
      return;
    }

    if (Number(formData.capacity) <= 0) {
      setError('Capacity must be a positive number greater than 0.');
      return;
    }

    const selectedVenue = venues.find((v) => v.id === Number(formData.venue_id));
    if (selectedVenue && Number(formData.capacity) > selectedVenue.capacity) {
      setError(`Capacity (${formData.capacity}) exceeds venue maximum capacity (${selectedVenue.capacity}).`);
      return;
    }

    if (formData.start_time >= formData.end_time) {
      setError('Event end time must be after the start time.');
      return;
    }

    const deadlineDate = new Date(formData.registration_deadline);
    const eventStartFull = new Date(`${formData.event_date}T${formData.start_time}`);
    if (deadlineDate > eventStartFull) {
      setError('Registration deadline cannot be after the event start time.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await eventService.createEvent(formData);
      if (res.success) {
        navigate('/organizer/events');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Please verify all inputs.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <div>
        <Link
          to="/organizer/events"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Manage Events</span>
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Host a New Campus Event
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Fill out event logistics, ticketing limit, and rules. It will immediately appear in the campus event catalogue.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-2xl flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. CodeStorm 2026: 24-Hour National Hackathon"
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          {/* Category & Venue Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Campus Venue *
              </label>
              <select
                name="venue_id"
                required
                value={formData.venue_id}
                onChange={handleChange}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (Max Capacity: {v.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Event Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detail what attendees will experience, schedule breakdown, and why they should participate..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white leading-relaxed"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Event Date *
              </label>
              <input
                type="date"
                name="event_date"
                required
                value={formData.event_date}
                onChange={handleChange}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                name="start_time"
                required
                value={formData.start_time}
                onChange={handleChange}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                name="end_time"
                required
                value={formData.end_time}
                onChange={handleChange}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Capacity and Registration Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Seat Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                required
                min={1}
                value={formData.capacity}
                onChange={handleChange}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Registration Deadline *
              </label>
              <input
                type="datetime-local"
                name="registration_deadline"
                required
                value={formData.registration_deadline}
                onChange={handleChange}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Poster URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Event Poster Image URL
            </label>
            <input
              type="url"
              name="poster_url"
              value={formData.poster_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          {/* Rules & Guidelines */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Event Rules & Instructions
            </label>
            <textarea
              name="rules"
              rows={3}
              value={formData.rules}
              onChange={handleChange}
              placeholder="1. Bring college ID card&#10;2. Dress code or equipment required..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Contact Information & Support *
            </label>
            <input
              type="text"
              name="contact_information"
              required
              value={formData.contact_information}
              onChange={handleChange}
              placeholder="club@campus.edu | +1-555-0199"
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <Link
              to="/organizer/events"
              className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitLoading ? 'Creating Event...' : 'Publish Event'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
