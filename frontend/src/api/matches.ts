import api from './axios';

export const matchesApi = {
  submitResult: (id: string, data: { winnerId: string; score: string }) =>
    api.post(`/matches/${id}/result`, data),
};
