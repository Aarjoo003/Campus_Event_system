import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import Badge from './Badge';

export default function EventCard({ event }) {
  // Format Date cleanly
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format 24hr Time to 12hr AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const isFull = Number(event.available_seats) <= 0;
  const isRegistered = Boolean(event.is_registered);

  const getCategoryVariant = (color) => {
    switch (color) {
      case 'blue': return 'brand';
      case 'purple': return 'purple';
      case 'emerald': return 'success';
      case 'amber': return 'warning';
      case 'rose': return 'danger';
      case 'teal': return 'teal';
      default: return 'brand';
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Poster image banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={event.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
        
        {/* Category Tag */}
        <div className="absolute top-3 left-3">
          <Badge variant={getCategoryVariant(event.category_color)}>
            {event.category_name}
          </Badge>
        </div>

        {/* Registered Status Banner if logged in */}
        {isRegistered && (
          <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Registered</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
          {event.title}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 mb-4">
          {event.description}
        </p>

        {/* Event Meta Details */}
        <div className="space-y-2 mt-auto text-xs text-slate-600 border-t border-slate-100 pt-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <span className="font-semibold text-slate-700">{formatDate(event.event_date)}</span>
            <span className="text-slate-300">•</span>
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{formatTime(event.start_time)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{event.venue_name}</span>
          </div>

          {/* Seat Capacity Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {isFull ? (
                <span className="text-rose-600 font-bold">Housefull</span>
              ) : (
                <span className="text-slate-600">
                  <strong className="text-emerald-700">{event.available_seats}</strong> / {event.capacity} seats left
                </span>
              )}
            </div>

            {event.organizer_name && (
              <span className="text-[11px] text-slate-400 truncate max-w-[120px]" title={event.organizer_name}>
                by {event.organizer_name}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <Link
            to={`/events/${event.id}`}
            className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 group-hover:shadow-md"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
