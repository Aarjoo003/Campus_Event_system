import api from './api';

export const registrationService = {
  async registerForEvent(eventId) {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  },

  async cancelRegistration(eventId) {
    const response = await api.delete(`/events/${eventId}/register`);
    return response.data;
  },

  async getMyEvents() {
    const response = await api.get('/my-events');
    return response.data;
  },

  async getEventRegistrations(eventId) {
    const response = await api.get(`/events/${eventId}/registrations`);
    return response.data;
  },

  async markAttendance(registrationId, status) {
    const response = await api.put(`/registrations/${registrationId}/attendance`, { status });
    return response.data;
  }
};
