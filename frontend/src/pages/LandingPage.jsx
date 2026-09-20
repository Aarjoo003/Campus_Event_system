import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Compass, 
  Calendar, 
  Users, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle,
  Building,
  TrendingUp
} from 'lucide-react';
import { eventService } from '../services/eventService';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LandingPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await eventService.getAllEvents({ upcomingOnly: true, limit: 6 });
        if (res.success && res.data) {
          setEvents(res.data);
        }
      } catch (err) {
        console.error('Failed to load upcoming events on landing page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-brand-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 text-brand-700 text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Official University Campus Events Portal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Discover. Register.{' '}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Participate.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              Experience the pulse of university life. From high-stakes hackathons and sports leagues to cultural fests and expert workshops—all in one place.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/events"
                className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 group"
              >
                <span>Explore All Events</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Micro badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Instant Seat Confirmation</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Real-Time Attendance</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Club & Organizer Hub</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              What's Happening
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Upcoming Events
            </h2>
          </div>
          <Link
            to="/events"
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1 text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            <span>View all campus events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching campus events..." />
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            No upcoming events found. Be the first to host one!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Simple & Transparent
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How CampusEventHub Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center font-extrabold text-lg mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Explore & Discover</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Filter through categorized technical hackathons, cultural festivals, athletic leagues, and guest lectures hosted across university departments.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-extrabold text-lg mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">One-Click Registration</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Reserve your seat instantly with transaction-safe capacity validation. Track your registrations, schedules, and reminders in your student portal.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-extrabold text-lg mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Attend & Earn Credit</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Check in seamlessly at the venue. Organizers verify attendance on the spot, recording participation on your campus profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            <div className="p-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-400">100%</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Digital Campus Process</div>
            </div>
            <div className="p-2 pt-6 sm:pt-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-400">3 Roles</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Student, Organizer, Admin</div>
            </div>
            <div className="p-2 pt-6 sm:pt-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-400">ACID Safe</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Atomic Seat Booking</div>
            </div>
            <div className="p-2 pt-6 sm:pt-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-400">Live</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Real-Time Attendance</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
