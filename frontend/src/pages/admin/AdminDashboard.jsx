import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { 
  Users, 
  Calendar, 
  Ticket, 
  CheckCircle, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
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
        <LoadingSpinner message="Loading university system metrics..." size="lg" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentRegistrations = data?.recentRegistrations || [];
  const upcomingEvents = data?.upcomingEvents || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Campus System Overview
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Signed in as {user?.name} ({user?.email})
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/users"
            className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/events"
            className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Event Moderation
          </Link>
        </div>
      </div>

      {/* Metrics Row (Total Students, Total Organizers, Total Events, Registrations) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Students
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {stats.total_students || 0}
            </div>
          </div>
        </div>

        {/* Total Organizers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Club Organizers
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {stats.total_organizers || 0}
            </div>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Events Created
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {stats.total_events || 0}
            </div>
          </div>
        </div>

        {/* Total Registrations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Registrations
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {stats.total_registrations || 0}
            </div>
          </div>
        </div>

      </div>

      {/* Moderation Alert if Pending Events */}
      {Number(stats.pending_events) > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {stats.pending_events} Event(s) Awaiting Administrative Approval
              </h4>
              <p className="text-xs text-amber-700">
                Review submitted proposals before they are visible to students.
              </p>
            </div>
          </div>
          <Link
            to="/admin/events"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            Review Events
          </Link>
        </div>
      )}

      {/* Two Columns: Recent Registrations & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Registrations */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-indigo-600" />
              <span>Recent Registrations</span>
            </h2>
          </div>

          {recentRegistrations.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No registration records found.</p>
          ) : (
            <div className="space-y-3">
              {recentRegistrations.map((r) => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      {r.student_name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      registered for <strong className="text-slate-700">{r.event_title}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={r.status === 'CONFIRMED' ? 'success' : 'danger'} size="xs">
                      {r.status}
                    </Badge>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {formatDate(r.registered_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Platform Events */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <span>Upcoming Campus Events</span>
            </h2>
            <Link to="/admin/events" className="text-xs font-bold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No upcoming events scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((evt) => (
                <div key={evt.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                      {evt.title}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {formatDate(evt.event_date)} • {evt.venue_name}
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-xs font-bold text-slate-800">
                      {evt.registered_count} / {evt.capacity}
                    </span>
                    <span className="text-[10px] text-slate-400 block">seats booked</span>
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
