import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  ShieldCheck, 
  Compass, 
  ChevronDown 
} from 'lucide-react';
import Badge from './Badge';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'ORGANIZER') return '/organizer/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  const getRoleBadgeVariant = (role) => {
    if (role === 'ADMIN') return 'danger';
    if (role === 'ORGANIZER') return 'purple';
    return 'brand';
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Main Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-800 bg-clip-text text-transparent">
                  CampusEventHub
                </span>
                <span className="hidden sm:block text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
                  University Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Compass className="w-4 h-4" />
                <span>Explore Events</span>
              </NavLink>

              {/* Role-specific Nav Links for Logged-In Users */}
              {isAuthenticated && user?.role === 'STUDENT' && (
                <>
                  <NavLink
                    to="/student/dashboard"
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/student/my-events"
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Ticket className="w-4 h-4" />
                    <span>My Events</span>
                  </NavLink>
                </>
              )}

              {isAuthenticated && user?.role === 'ORGANIZER' && (
                <>
                  <NavLink
                    to="/organizer/dashboard"
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/organizer/events"
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Manage Events</span>
                  </NavLink>
                  <NavLink
                    to="/organizer/events/create"
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>Host Event</span>
                  </NavLink>
                </>
              )}

              {isAuthenticated && user?.role === 'ADMIN' && (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>Admin Overview</span>
                  </NavLink>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    Users
                  </NavLink>
                  <NavLink
                    to="/admin/events"
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    Moderation
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Desktop Right Side / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {user.name}
                    </div>
                    <Badge variant={getRoleBadgeVariant(user.role)} size="xs">
                      {user.role}
                    </Badge>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-700 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span>Dashboard</span>
                    </Link>

                    {user.role === 'STUDENT' && (
                      <Link
                        to="/student/profile"
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-medium text-left border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Explore Events
          </Link>

          {isAuthenticated ? (
            <>
              <div className="pt-2 pb-1 border-t border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3">
                  Account ({user.role})
                </p>
              </div>

              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>

              {user.role === 'STUDENT' && (
                <>
                  <Link
                    to="/student/my-events"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Events
                  </Link>
                  <Link
                    to="/student/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Profile
                  </Link>
                </>
              )}

              {user.role === 'ORGANIZER' && (
                <>
                  <Link
                    to="/organizer/events"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manage Events
                  </Link>
                  <Link
                    to="/organizer/events/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-600 hover:bg-emerald-50"
                  >
                    + Host Event
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/admin/events"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Event Moderation
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
