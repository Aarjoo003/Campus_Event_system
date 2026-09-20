import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Tag, X, RefreshCw } from 'lucide-react';
import { eventService } from '../services/eventService';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function EventDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State initialized from URL query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedVenue, setSelectedVenue] = useState(searchParams.get('venue') || '');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [upcomingOnly, setUpcomingOnly] = useState(searchParams.get('upcoming') !== 'false');

  // Fetch metadata once (categories and venues)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const metaRes = await eventService.getMetadata();
        if (metaRes.success && metaRes.data) {
          setCategories(metaRes.data.categories || []);
          setVenues(metaRes.data.venues || []);
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch events whenever filters change
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = {
          search: search || undefined,
          categoryId: selectedCategory || undefined,
          venueId: selectedVenue || undefined,
          date: selectedDate || undefined,
          upcomingOnly: upcomingOnly ? 'true' : undefined
        };

        const res = await eventService.getAllEvents(params);
        if (res.success && res.data) {
          setEvents(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input slightly
    const timer = setTimeout(() => {
      fetchEvents();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedVenue, selectedDate, upcomingOnly]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedVenue('');
    setSelectedDate('');
    setUpcomingOnly(true);
    setSearchParams({});
  };

  const hasActiveFilters = search || selectedCategory || selectedVenue || selectedDate || !upcomingOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Campus Events
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse, filter, and register for university workshops, sports matches, hackathons, and cultural fests
        </p>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Top Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, keyword, or topic..."
            className="w-full pl-12 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          
          {/* Category Dropdown */}
          <div className="relative">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Venue Dropdown */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-medium"
            >
              <option value="">All Venues</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-medium"
            />
          </div>

          {/* Upcoming Toggle & Reset */}
          <div className="flex items-center justify-between space-x-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={upcomingOnly}
                onChange={(e) => setUpcomingOnly(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <span>Upcoming Only</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1 py-1 px-2.5 rounded-lg hover:bg-brand-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {events.length} {events.length === 1 ? 'Event' : 'Events'} Found
          </p>
        </div>

        {loading ? (
          <div className="py-20">
            <LoadingSpinner message="Searching events..." size="lg" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No events match your criteria"
            description="Try changing your search terms or resetting filters to see other campus events."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
