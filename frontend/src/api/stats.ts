import api from './axios';

export const statsApi = {
  getLeaderboard: () => api.get('/stats/leaderboard'),
};
