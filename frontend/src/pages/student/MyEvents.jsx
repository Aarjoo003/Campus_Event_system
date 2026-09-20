import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  XCircle, 
  CheckCircle, 
  AlertCircle, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { registrationService } from '../../services/registrationService';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';

export default function MyEvents() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('UPCOMING'); // 'UPCOMING' | 'PAST'
  const [selectedToCancel, setSelectedToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchMyRegistrations = async () => {
    try {
      const res = await registrationService.getMyEvents();
      if (res.success && res.data) {
        setRegistrations(res.data);
      }
    } catch (err) {
      console.error('Failed to load registered events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
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

  const handleCancelRegistration = async () => {
    if (!selectedToCancel) return;
    setCancelLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await registrationService.cancelRegistration(selectedToCancel.event_id);
      if (res.success) {
        setMessage({ text: 'Registration cancelled successfully.', type: 'success' });
        setSelectedToCancel(null);
        await fetchMyRegistrations();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to cancel registration.',
        type: 'error'
      });
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner message="Fetching your registered events..." size="lg" />
      </div>
    );
  }

  // Filter into Upcoming and Past events
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingList = registrations.filter((r) => r.event_date >= todayStr);
  const pastList = registrations.filter((r) => r.event_date < todayStr);
  const displayedList = activeTab === 'UPCOMING' ? upcomingList : pastList;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Registered Events
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep track of your upcoming event bookings, check-in schedules, and attendance history
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors self-start"
        >
          <Compass className="w-4 h-4" />
          <span>Browse More Events</span>
        </Link>
      </div>

      {/* Notifications */}
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

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'UPCOMING'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Upcoming Events ({upcomingList.length})
        </button>
        <button
          onClick={() => setActiveTab('PAST')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'PAST'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Past Events ({pastList.length})
        </button>
      </div>

      {/* Events List */}
      {displayedList.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={activeTab === 'UPCOMING' ? 'No upcoming registered events' : 'No past events found'}
          description={
            activeTab === 'UPCOMING'
              ? 'You have not registered for any upcoming events yet. Explore the campus catalogue!'
              : 'You have not attended any past events yet.'
          }
          actionText={activeTab === 'UPCOMING' ? 'Explore Events' : null}
          actionLink="/events"
        />
      ) : (
        <div className="space-y-4">
          {displayedList.map((item) => (
            <div
              key={item.registration_id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              {/* Event Info Left */}
              <div className="flex items-start space-x-4">
                <img
                  src={item.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80'}
                  alt={item.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brand" size="xs">
                      {item.category_name}
                    </Badge>
                    {item.registration_status === 'CANCELLED' ? (
                      <Badge variant="danger" size="xs">Cancelled</Badge>
                    ) : (
                      <Badge variant="success" size="xs">Confirmed Booking</Badge>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span>{formatDate(item.event_date)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(item.start_time)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[150px]">{item.venue_name}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Host: {item.organizer_name} • Booked on {formatDate(item.registered_at)}
                  </p>
                </div>
              </div>

              {/* Status and Actions Right */}
              <div className="flex flex-col sm:items-end w-full sm:w-auto space-y-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                
                {/* Attendance Badge */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Attendance:
                  </span>
                  {item.attendance_status === 'PRESENT' ? (
                    <Badge variant="success" size="sm">Present (Verified)</Badge>
                  ) : item.attendance_status === 'ABSENT' ? (
                    <Badge variant="danger" size="sm">Absent</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Pending Check-in</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/events/${item.event_id}`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    View Details
                  </Link>

                  {/* Allow cancel only if upcoming and not already cancelled */}
                  {activeTab === 'UPCOMING' && item.registration_status === 'CONFIRMED' && (
                    <button
                      onClick={() => setSelectedToCancel(item)}
                      className="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      <Modal
        isOpen={!!selectedToCancel}
        onClose={() => setSelectedToCancel(null)}
        title="Cancel Event Registration"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel your seat for <strong>{selectedToCancel?.title}</strong>?
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setSelectedToCancel(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Keep Registration
            </button>
            <button
              onClick={handleCancelRegistration}
              disabled={cancelLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
