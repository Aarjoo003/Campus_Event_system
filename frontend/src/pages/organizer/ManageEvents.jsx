import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  PlusCircle, 
  Users, 
  Edit3, 
  Trash2, 
  Eye, 
  AlertCircle, 
  CheckCircle,
  MapPin,
  Clock
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchEvents = async () => {
    try {
      const res = await eventService.getOrganizerEvents();
      if (res.success && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to load organizer events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [h, m] = timeString.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const handleDeleteEvent = async () => {
    if (!selectedToDelete) return;
    setDeleteLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await eventService.deleteEvent(selectedToDelete.id);
      if (res.success) {
        setMessage({ text: 'Event deleted successfully.', type: 'success' });
        setSelectedToDelete(null);
        await fetchEvents();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to delete event.',
        type: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner message="Fetching your events..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Hosted Events
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View attendee lists, update details, monitor live capacities, and record attendance
          </p>
        </div>

        <Link
          to="/organizer/events/create"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Host New Event</span>
        </Link>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Events Table / Card Layout */}
      {events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events created yet"
          description="Create your first college event to start accepting student registrations."
          actionText="Create New Event"
          actionLink="/organizer/events/create"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-xs uppercase font-bold text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Event Details</th>
                  <th className="py-3.5 px-6">Date & Schedule</th>
                  <th className="py-3.5 px-6">Venue</th>
                  <th className="py-3.5 px-6">Registrations</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={evt.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=150&q=80'}
                          alt={evt.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                        />
                        <div>
                          <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                            {evt.category_name}
                          </span>
                          <h4 className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                            {evt.title}
                          </h4>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{formatDate(evt.event_date)}</div>
                      <div className="text-[11px] text-slate-400">{formatTime(evt.start_time)} - {formatTime(evt.end_time)}</div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{evt.venue_name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{evt.venue_location}</div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{evt.registered_count}</span>
                        <span className="text-slate-400">/ {evt.capacity}</span>
                      </div>
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round((evt.registered_count / evt.capacity) * 100))}%`
                          }}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <Badge variant={evt.status === 'APPROVED' ? 'success' : 'warning'} size="xs">
                        {evt.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-1">
                      {/* Attendees / Attendance action */}
                      <Link
                        to={`/organizer/events/${evt.id}/registrations`}
                        className="p-2 inline-flex items-center space-x-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-bold transition-colors"
                        title="View Registrations & Attendance"
                      >
                        <Users className="w-4 h-4" />
                        <span className="hidden lg:inline">Attendees</span>
                      </Link>

                      {/* Public view */}
                      <Link
                        to={`/events/${evt.id}`}
                        className="p-2 inline-flex text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Event Public Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Edit action */}
                      <Link
                        to={`/organizer/events/${evt.id}/edit`}
                        className="p-2 inline-flex text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Event"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>

                      {/* Delete action */}
                      <button
                        onClick={() => setSelectedToDelete(evt)}
                        className="p-2 inline-flex text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedToDelete}
        onClose={() => setSelectedToDelete(null)}
        title="Delete Event"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{selectedToDelete?.title}</strong>? This action cannot be undone and will cancel all student registrations.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setSelectedToDelete(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteEvent}
              disabled={deleteLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete Event'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
