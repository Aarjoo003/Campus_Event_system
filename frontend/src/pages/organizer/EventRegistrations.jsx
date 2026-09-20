import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Calendar,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { registrationService } from '../../services/registrationService';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function EventRegistrations() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PRESENT' | 'ABSENT' | 'UNMARKED'
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchRegistrations = async () => {
    try {
      const res = await registrationService.getEventRegistrations(id);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load event registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [id]);

  const handleMarkAttendance = async (registrationId, status) => {
    setActionLoading(registrationId);
    setMessage({ text: '', type: '' });

    try {
      const res = await registrationService.markAttendance(registrationId, status);
      if (res.success) {
        setMessage({
          text: `Marked ${status.toLowerCase()} for student.`,
          type: 'success'
        });

        // Update local state directly for snappy UI response
        setData((prev) => {
          if (!prev) return prev;
          const updatedList = prev.registrations.map((r) => {
            if (r.registration_id === registrationId) {
              return {
                ...r,
                attendance_status: status,
                attendance_marked_at: new Date().toISOString()
              };
            }
            return r;
          });
          return { ...prev, registrations: updatedList };
        });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update attendance.',
        type: 'error'
      });
    } finally {
      setActionLoading(null);
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

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner message="Fetching attendees list..." size="lg" />
      </div>
    );
  }

  const eventInfo = data?.event || {};
  const registrations = data?.registrations || [];

  // Filter & Search
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = 
      reg.student_name.toLowerCase().includes(search.toLowerCase()) ||
      reg.student_email.toLowerCase().includes(search.toLowerCase()) ||
      (reg.student_id_number && reg.student_id_number.toLowerCase().includes(search.toLowerCase())) ||
      (reg.department && reg.department.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'PRESENT') return reg.attendance_status === 'PRESENT';
    if (statusFilter === 'ABSENT') return reg.attendance_status === 'ABSENT';
    if (statusFilter === 'UNMARKED') return !reg.attendance_status;

    return true;
  });

  const presentCount = registrations.filter((r) => r.attendance_status === 'PRESENT').length;
  const absentCount = registrations.filter((r) => r.attendance_status === 'ABSENT').length;
  const unmarkedCount = registrations.filter((r) => !r.attendance_status && r.registration_status === 'CONFIRMED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <div>
        <Link
          to="/organizer/events"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events Management</span>
        </Link>
      </div>

      {/* Header with Event Summary */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Attendee Management & Attendance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {eventInfo.title}
          </h1>
          <p className="text-xs text-slate-500">
            Scheduled on {formatDate(eventInfo.event_date)} • Capacity Limit: {eventInfo.capacity} students
          </p>
        </div>

        {/* Quick stats pills */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700">
            Total Registered: {registrations.length}
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            Present: {presentCount}
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            Absent: {absentCount}
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            Unmarked: {unmarkedCount}
          </div>
        </div>
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
            placeholder="Search by student name, roll #, department..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>

        {/* Attendance status filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PRESENT', 'ABSENT', 'UNMARKED'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === f
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All Students' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List Table */}
      {filteredRegistrations.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No attendees found"
          description="There are no student registrations matching your search/filter criteria."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-xs uppercase font-bold text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Student Information</th>
                  <th className="py-3.5 px-6">Roll / Department</th>
                  <th className="py-3.5 px-6">Registered On</th>
                  <th className="py-3.5 px-6">Registration Status</th>
                  <th className="py-3.5 px-6">Attendance</th>
                  <th className="py-3.5 px-6 text-right">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.registration_id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Student details */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{reg.student_name}</div>
                      <div className="text-xs text-slate-500">{reg.student_email}</div>
                      {reg.student_phone && (
                        <div className="text-[11px] text-slate-400">{reg.student_phone}</div>
                      )}
                    </td>

                    {/* Department & Roll */}
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{reg.student_id_number || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">{reg.department || 'Not specified'}</div>
                    </td>

                    {/* Registration Date */}
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      {formatDate(reg.registered_at)}
                    </td>

                    {/* Booking Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Badge variant={reg.registration_status === 'CONFIRMED' ? 'success' : 'danger'} size="xs">
                        {reg.registration_status}
                      </Badge>
                    </td>

                    {/* Current Attendance */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {reg.attendance_status === 'PRESENT' ? (
                        <Badge variant="success" size="sm">Present</Badge>
                      ) : reg.attendance_status === 'ABSENT' ? (
                        <Badge variant="danger" size="sm">Absent</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Unmarked</Badge>
                      )}
                    </td>

                    {/* Attendance Action buttons */}
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                      {reg.registration_status === 'CONFIRMED' ? (
                        <>
                          <button
                            onClick={() => handleMarkAttendance(reg.registration_id, 'PRESENT')}
                            disabled={actionLoading === reg.registration_id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              reg.attendance_status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            ✓ Present
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(reg.registration_id, 'ABSENT')}
                            disabled={actionLoading === reg.registration_id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              reg.attendance_status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            ✗ Absent
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Booking Cancelled</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
