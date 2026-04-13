import api from './axios';

interface CreateGame {
  name: string;
  publisher: string;
  releaseDate: string;
  genre: string;
}

export const gamesApi = {
  getAll: () => api.get('/games'),
  create: (data: CreateGame) => api.post('/games', data),
};
