import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Filter, 
  UserCheck 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // '' | 'STUDENT' | 'ORGANIZER' | 'ADMIN'
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers({
        role: roleFilter || undefined,
        search: search || undefined
      });
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    setMessage({ text: '', type: '' });
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        setMessage({ text: `User role successfully updated to ${newRole}.`, type: 'success' });
        await fetchUsers();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update user role.',
        type: 'error'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedToDelete) return;
    setActionLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await adminService.deleteUser(selectedToDelete.id);
      if (res.success) {
        setMessage({ text: 'User account removed.', type: 'success' });
        setSelectedToDelete(null);
        await fetchUsers();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to delete user.',
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
          User Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage campus student accounts, club organizers, and administration privileges
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
            placeholder="Search by name, email, department, roll #..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {[
            { label: 'All Roles', value: '' },
            { label: 'Students', value: 'STUDENT' },
            { label: 'Organizers', value: 'ORGANIZER' },
            { label: 'Admins', value: 'ADMIN' }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setRoleFilter(item.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === item.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-24">
          <LoadingSpinner message="Loading user directory..." size="lg" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match criteria"
          description="Try broadening your search term or clearing the role filter."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-xs uppercase font-bold text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">User Details</th>
                  <th className="py-3.5 px-6">Roll # / Dept</th>
                  <th className="py-3.5 px-6">Current Role</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6">Change Role</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-brand-50 text-brand-600 font-extrabold px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{u.student_id_number || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400">{u.department || 'General'}</div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <Badge
                          variant={
                            u.role === 'ADMIN'
                              ? 'danger'
                              : u.role === 'ORGANIZER'
                              ? 'purple'
                              : 'brand'
                          }
                          size="xs"
                        >
                          {u.role}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                        {formatDate(u.created_at)}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <select
                          value={u.role}
                          disabled={isCurrent}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-semibold disabled:opacity-50"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="ORGANIZER">ORGANIZER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedToDelete(u)}
                          disabled={isCurrent}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isCurrent ? 'Cannot delete self' : 'Delete user account'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <Modal
        isOpen={!!selectedToDelete}
        onClose={() => setSelectedToDelete(null)}
        title="Delete User Account"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete the account of <strong>{selectedToDelete?.name}</strong> ({selectedToDelete?.email})? All their registrations and associated data will be removed.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setSelectedToDelete(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              {actionLoading ? 'Deleting...' : 'Yes, Delete Account'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
