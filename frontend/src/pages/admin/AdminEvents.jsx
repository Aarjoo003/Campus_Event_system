import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye, 
  AlertCircle,
  Filter
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { adminService } from '../../services/adminService';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchEvents = async () => {
    try {
      const res = await eventService.getAllEvents({
        status: statusFilter,
        search: search || undefined
      });
      if (res.success && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to load campus events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleUpdateStatus = async (eventId, newStatus) => {
    setMessage({ text: '', type: '' });
    try {
      const res = await adminService.updateEventStatus(eventId, newStatus);
      if (res.success) {
        setMessage({ text: `Event status updated to ${newStatus}.`, type: 'success' });
        await fetchEvents();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update event status.',
        type: 'error'
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedToDelete) return;
    setActionLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await eventService.deleteEvent(selectedToDelete.id);
      if (res.success) {
        setMessage({ text: 'Event permanently deleted from system.', type: 'success' });
        setSelectedToDelete(null);
        await fetchEvents();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to delete event.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Event Moderation & Control
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review, approve, reject, or moderate all university club events
        </p>
      </div>

      {/* Notification */}
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title or organizer..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === s
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="py-24">
          <LoadingSpinner message="Loading all campus events..." size="lg" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="There are no events matching the selected moderation filter."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-xs uppercase font-bold text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Event Title</th>
                  <th className="py-3.5 px-6">Organizer</th>
                  <th className="py-3.5 px-6">Date & Venue</th>
                  <th className="py-3.5 px-6">Capacity</th>
                  <th className="py-3.5 px-6">Current Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 max-w-xs truncate">{evt.title}</div>
                      <div className="text-xs text-brand-600 font-semibold">{evt.category_name}</div>
                    </td>

                    <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                      <div className="font-semibold">{evt.organizer_name}</div>
                      <div className="text-[11px] text-slate-400">{evt.organizer_email}</div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{formatDate(evt.event_date)}</div>
                      <div className="text-[11px] text-slate-400">{evt.venue_name}</div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{evt.registered_count}</span>
                      <span className="text-slate-400"> / {evt.capacity}</span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <Badge
                        variant={
                          evt.status === 'APPROVED'
                            ? 'success'
                            : evt.status === 'REJECTED'
                            ? 'danger'
                            : evt.status === 'PENDING'
                            ? 'warning'
                            : 'default'
                        }
                        size="xs"
                      >
                        {evt.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-1">
                      {/* Public view */}
                      <Link
                        to={`/events/${evt.id}`}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg inline-flex items-center"
                        title="View Public Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Status select */}
                      <select
                        value={evt.status}
                        onChange={(e) => handleUpdateStatus(evt.id, e.target.value)}
                        className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-700"
                      >
                        <option value="APPROVED">APPROVED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>

                      {/* Delete */}
                      <button
                        onClick={() => setSelectedToDelete(evt)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg inline-flex items-center"
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

      {/* Delete Event Modal */}
      <Modal
        isOpen={!!selectedToDelete}
        onClose={() => setSelectedToDelete(null)}
        title="Delete Event (Admin Override)"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{selectedToDelete?.title}</strong>? This will cancel all bookings and remove this event completely from the database.
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
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              {actionLoading ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
