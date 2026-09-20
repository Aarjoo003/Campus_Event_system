import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { 
  Calendar, 
  CheckCircle, 
  Ticket, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Compass, 
  User, 
  Sparkles 
} from 'lucide-react';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getStudentDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
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

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner message="Loading your dashboard..." size="lg" />
      </div>
    );
  }

  const counts = data?.counts || { registered_events_count: 0, attended_events_count: 0 };
  const upcomingEvents = data?.upcomingEvents || [];
  const recentRegistrations = data?.recentRegistrations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-brand-500/15">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-white/80 text-xs sm:text-sm font-medium">
            {user?.department ? `${user.department} • ` : ''} Roll #{user?.student_id_number || 'N/A'} • {user?.email}
          </p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Registered */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registered Events
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {counts.registered_events_count}
            </div>
          </div>
        </div>

        {/* Attended */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Attended Events
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {counts.attended_events_count}
            </div>
          </div>
        </div>

        {/* Upcoming Count */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Upcoming Schedule
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {upcomingEvents.length}
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/events"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          <Compass className="w-4 h-4" />
          <span>Discover More Events</span>
        </Link>
        <Link
          to="/student/my-events"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          <Ticket className="w-4 h-4" />
          <span>My Registrations & Tickets</span>
        </Link>
        <Link
          to="/student/profile"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          <User className="w-4 h-4" />
          <span>Manage Profile</span>
        </Link>
      </div>

      {/* Two Column Section: Upcoming Registered Events + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Your Upcoming Scheduled Events */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <span>Upcoming Registered Events</span>
            </h2>
            <Link to="/student/my-events" className="text-xs font-bold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              You have no upcoming registered events. Check out the event catalogue!
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((evt) => (
                <div 
                  key={evt.registration_id}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/20 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1 pr-4">
                    <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                      {evt.category_name}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {evt.title}
                    </h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(evt.event_date)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatTime(evt.start_time)}</span>
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/events/${evt.event_id}`}
                    className="p-2 bg-slate-100 hover:bg-brand-600 hover:text-white rounded-xl text-slate-600 transition-colors flex-shrink-0"
                    title="View Event Details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Registrations Activity */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-indigo-600" />
              <span>Recent Registrations</span>
            </h2>
            <Link to="/student/my-events" className="text-xs font-bold text-brand-600 hover:underline">
              View History
            </Link>
          </div>

          {recentRegistrations.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              No registration records yet.
            </div>
          ) : (
            <div className="space-y-4">
              {recentRegistrations.map((reg) => (
                <div
                  key={reg.registration_id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                      {reg.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Registered on {formatDate(reg.registered_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {reg.attendance_status === 'PRESENT' ? (
                      <Badge variant="success" size="xs">Attended</Badge>
                    ) : reg.attendance_status === 'ABSENT' ? (
                      <Badge variant="danger" size="xs">Absent</Badge>
                    ) : reg.status === 'CANCELLED' ? (
                      <Badge variant="default" size="xs">Cancelled</Badge>
                    ) : (
                      <Badge variant="brand" size="xs">Confirmed</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
