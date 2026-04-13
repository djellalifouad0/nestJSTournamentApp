import api from './axios';

export const playersApi = {
  getAll: () => api.get('/players'),
  getOne: (id: string) => api.get(`/players/${id}`),
  getTournaments: (id: string) => api.get(`/players/${id}/tournaments`),
  getStats: (id: string) => api.get(`/players/${id}/stats`),
};
