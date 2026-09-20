import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  PlusCircle, 
  Ticket, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Sparkles,
  BarChart3
} from 'lucide-react';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getOrganizerDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load organizer dashboard:', err);
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

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner message="Loading organizer dashboard..." size="lg" />
      </div>
    );
  }

  const counts = data?.counts || { total_events: 0, total_registrations: 0, total_attended: 0 };
  const myEvents = data?.myEvents || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-brand-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-purple-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Club & Organizer Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {user?.name}
          </h1>
          <p className="text-white/80 text-xs sm:text-sm font-medium">
            Campus Organization Portal • {user?.email}
          </p>
        </div>

        <Link
          to="/organizer/events/create"
          className="inline-flex items-center space-x-2 px-6 py-3.5 bg-white hover:bg-slate-100 text-purple-900 font-extrabold text-sm rounded-2xl shadow-lg transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <span>+ Create New Event</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Events Hosted
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {counts.total_events}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Student Registrations
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {counts.total_registrations}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Attendance
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {counts.total_attended}
            </div>
          </div>
        </div>

      </div>

      {/* My Hosted Events Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Your Managed Events
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage capacities, view attendees, and mark live attendance
            </p>
          </div>
          <Link
            to="/organizer/events"
            className="text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            Manage All Events →
          </Link>
        </div>

        {myEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            You have not hosted any events yet. Click "Create New Event" above to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-xs uppercase font-bold text-slate-400 bg-slate-50 border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Registrations</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 max-w-[220px] truncate">
                      {evt.title}
                    </td>
                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      {formatDate(evt.event_date)}
                    </td>
                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      {evt.venue_name}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{evt.registered_count}</span>
                      <span className="text-slate-400"> / {evt.capacity}</span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge variant={evt.status === 'APPROVED' ? 'success' : 'warning'} size="xs">
                        {evt.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                      <Link
                        to={`/organizer/events/${evt.id}/registrations`}
                        className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Attendees</span>
                      </Link>
                      <Link
                        to={`/organizer/events/${evt.id}/edit`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
