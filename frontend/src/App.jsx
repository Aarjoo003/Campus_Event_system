import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventDiscoveryPage from './pages/EventDiscoveryPage';
import EventDetailsPage from './pages/EventDetailsPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyEvents from './pages/student/MyEvents';
import ProfilePage from './pages/student/ProfilePage';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import ManageEvents from './pages/organizer/ManageEvents';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import EventRegistrations from './pages/organizer/EventRegistrations';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-extrabold text-brand-600 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 mb-6">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm">
        Return to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<EventDiscoveryPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student Protected Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-events"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <MyEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'ORGANIZER']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Organizer Protected Routes */}
        <Route
          path="/organizer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <ManageEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/create"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id/registrations"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <EventRegistrations />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminEvents />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
