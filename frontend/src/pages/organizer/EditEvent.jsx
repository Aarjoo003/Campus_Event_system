import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Save } from 'lucide-react';
import { eventService } from '../../services/eventService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    venue_id: '',
    event_date: '',
    start_time: '',
    end_time: '',
    capacity: 100,
    registration_deadline: '',
    poster_url: '',
    rules: '',
    contact_information: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metaRes, eventRes] = await Promise.all([
          eventService.getMetadata(),
          eventService.getEventById(id)
        ]);

        if (metaRes.success && metaRes.data) {
          setCategories(metaRes.data.categories || []);
          setVenues(metaRes.data.venues || []);
        }

        if (eventRes.success && eventRes.data) {
          const evt = eventRes.data;
          // Format deadline to local datetime-local string
          const deadlineLocal = evt.registration_deadline
            ? new Date(evt.registration_deadline).toISOString().slice(0, 16)
            : '';

          setFormData({
            title: evt.title,
            description: evt.description,
            category_id: evt.category_id,
            venue_id: evt.venue_id,
            event_date: evt.event_date ? evt.event_date.split('T')[0] : '',
            start_time: evt.start_time?.slice(0, 5) || '10:00',
            end_time: evt.end_time?.slice(0, 5) || '17:00',
            capacity: evt.capacity,
            registration_deadline: deadlineLocal,
            poster_url: evt.poster_url || '',
            rules: evt.rules || '',
            contact_information: evt.contact_information || ''
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

    if (Number(formData.capacity) <= 0) {
      setError('Capacity must be greater than 0.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await eventService.updateEvent(id, formData);
      if (res.success) {
        navigate('/organizer/events');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner message="Loading event for editing..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
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
            Edit Event Details
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Update scheduling, venue, or ticketing capacity for this event
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-2xl flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

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
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white leading-relaxed"
            />
          </div>

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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Poster URL
            </label>
            <input
              type="url"
              name="poster_url"
              value={formData.poster_url}
              onChange={handleChange}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Rules & Guidelines
            </label>
            <textarea
              name="rules"
              rows={3}
              value={formData.rules}
              onChange={handleChange}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Contact Information *
            </label>
            <input
              type="text"
              name="contact_information"
              required
              value={formData.contact_information}
              onChange={handleChange}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

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
              <Save className="w-4 h-4" />
              <span>{submitLoading ? 'Updating Event...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
