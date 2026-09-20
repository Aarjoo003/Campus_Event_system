import api from './api';

export const eventService = {
  async getAllEvents(params = {}) {
    const response = await api.get('/events', { params });
    return response.data;
  },

  async getMetadata() {
    const response = await api.get('/events/metadata');
    return response.data;
  },

  async getEventById(id) {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  async createEvent(eventData) {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  async updateEvent(id, eventData) {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  async deleteEvent(id) {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  async getOrganizerEvents() {
    const response = await api.get('/events/organizer/my-events');
    return response.data;
  }
};
