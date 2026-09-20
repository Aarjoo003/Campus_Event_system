import React from 'react';
import { Calendar, Heart, Shield, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CampusEventHub</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The centralized campus event management, discovery, and registration platform designed for students, clubs, and university administration.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">Upcoming Events</Link>
              </li>
              <li>
                <Link to="/events?category=1" className="hover:text-white transition-colors">Tech Hackathons</Link>
              </li>
              <li>
                <Link to="/events?category=2" className="hover:text-white transition-colors">Cultural Fests</Link>
              </li>
              <li>
                <Link to="/events?category=3" className="hover:text-white transition-colors">Sports Tournaments</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/student/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link>
              </li>
              <li>
                <Link to="/organizer/dashboard" className="hover:text-white transition-colors">Club & Organizer Hub</Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-white transition-colors">Administrative Office</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Helpdesk */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Student Affairs</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Student Activity Center, University Main Campus</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>events@campus.edu</span>
              </p>
              <p className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Role-Based Access & Encrypted Passwords</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CampusEventHub. Full-Stack Production System.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Built with React, Express, and MySQL
          </p>
        </div>
      </div>
    </footer>
  );
}
