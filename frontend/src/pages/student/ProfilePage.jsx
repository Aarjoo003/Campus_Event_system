import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { User, Lock, Mail, Phone, BookOpen, Building, CheckCircle, AlertCircle } from 'lucide-react';
import Badge from '../../components/Badge';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    student_id_number: user?.student_id_number || ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setProfileLoading(true);

    try {
      const res = await authService.updateProfile(profileData);
      if (res.success && res.data) {
        updateUser(res.data);
        setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || 'Failed to update profile.',
        type: 'error'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      if (res.success) {
        setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to change password.',
        type: 'error'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Account & Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal university credentials and security settings
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-extrabold text-3xl shadow-inner">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <Badge variant="brand">{user?.role}</Badge>
          </div>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <p className="text-xs text-slate-400">
            {user?.department ? `${user.department} • ` : ''} ID: {user?.student_id_number || 'Not Set'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Personal Details</span>
            </h3>
          </div>

          {profileMsg.text && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-sm cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Department</label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                placeholder="e.g. Computer Science"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Student / Club Roll ID</label>
              <input
                type="text"
                value={profileData.student_id_number}
                onChange={(e) => setProfileData({ ...profileData, student_id_number: e.target.value })}
                placeholder="e.g. CS-2024-001"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+1-555-0123"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-brand-600" />
              <span>Security & Password</span>
            </h3>
          </div>

          {passwordMsg.text && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {passwordMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
