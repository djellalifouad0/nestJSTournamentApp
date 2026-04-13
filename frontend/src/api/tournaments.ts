import api from './axios';

interface CreateTournament {
  name: string;
  game: string;
  maxPlayers: number;
  startDate: string;
}

export const tournamentsApi = {
  getAll: (status?: string) =>
    api.get('/tournaments', { params: status ? { status } : {} }),
  getOne: (id: string) => api.get(`/tournaments/${id}`),
  create: (data: CreateTournament) => api.post('/tournaments', data),
  update: (id: string, data: Partial<CreateTournament>) =>
    api.put(`/tournaments/${id}`, data),
  delete: (id: string) => api.delete(`/tournaments/${id}`),
  join: (id: string) => api.post(`/tournaments/${id}/join`),
  getMatches: (id: string) => api.get(`/tournaments/${id}/matches`),
  generateBrackets: (id: string) =>
    api.post(`/tournaments/${id}/generate-brackets`),
  getStandings: (id: string) => api.get(`/tournaments/${id}/standings`),
};
