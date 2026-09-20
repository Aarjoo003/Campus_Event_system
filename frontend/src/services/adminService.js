import api from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateUserRole(userId, role) {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async updateEventStatus(eventId, status) {
    const response = await api.put(`/admin/events/${eventId}/status`, { status });
    return response.data;
  },

  async getStudentDashboard() {
    const response = await api.get('/admin/student/dashboard');
    return response.data;
  },

  async getOrganizerDashboard() {
    const response = await api.get('/admin/organizer/dashboard');
    return response.data;
  }
};
