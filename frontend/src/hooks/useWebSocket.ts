import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://nestjstournamentapp-production.up.railway.app';

export function useWebSocket() {
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('tournamentStatusChanged', (tournament: { name: string; status: string }) => {
      toast(`Tournament "${tournament.name}" is now ${tournament.status}`);
    });

    socket.on('playerJoined', (data: { player: { username: string } }) => {
      toast(`${data.player.username} joined the tournament!`);
    });

    socket.on('matchResultSubmitted', (match: { score: string }) => {
      toast(`Match completed! Score: ${match.score}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
