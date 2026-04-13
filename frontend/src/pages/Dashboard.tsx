import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { tournamentsApi } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Tournament {
  id: string;
  name: string;
  game: string;
  maxPlayers: number;
  status: string;
  startDate: string;
  players: { id: string }[];
}

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  pending: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', dot: 'bg-yellow-400' },
  in_progress: { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', dot: 'bg-cyan-400' },
  completed: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', dot: 'bg-green-400' },
};

export function Dashboard() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [game, setGame] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [startDate, setStartDate] = useState('');
  const { isAuthenticated } = useAuth();

  const loadTournaments = async () => {
    try {
      const res = await tournamentsApi.getAll(statusFilter || undefined);
      setTournaments(res.data.data);
    } catch {
      toast.error('Failed to load tournaments');
    }
  };

  useEffect(() => {
    loadTournaments();
  }, [statusFilter]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await tournamentsApi.create({ name, game, maxPlayers, startDate });
      toast.success('Tournament created!');
      setShowCreate(false);
      setName(''); setGame(''); setMaxPlayers(8); setStartDate('');
      loadTournaments();
    } catch {
      toast.error('Failed to create tournament');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/20 to-transparent pb-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-12 pb-4 relative">
          <h1 className="text-4xl md:text-5xl font-black text-white glow-text-purple mb-3">
            Tournaments
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Compete in epic tournaments. Prove your skills. Rise to the top.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-sm text-gray-400">
                <span className="text-white font-semibold">{tournaments.filter(t => t.status === 'pending').length}</span> Open
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm text-gray-400">
                <span className="text-white font-semibold">{tournaments.filter(t => t.status === 'in_progress').length}</span> Live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-gray-400">
                <span className="text-white font-semibold">{tournaments.filter(t => t.status === 'completed').length}</span> Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            {['', 'pending', 'in_progress', 'completed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-surface text-gray-400 hover:bg-surface-light hover:text-white'
                }`}
              >
                {s === '' ? 'All' : s === 'in_progress' ? 'Live' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {isAuthenticated && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-semibold hover:from-purple-500 hover:to-cyan-500 transition-all shadow-lg shadow-purple-500/20"
            >
              + New Tournament
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="glass rounded-2xl p-6 mb-8 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-4">Create Tournament</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-bg border border-purple-500/20 text-white text-sm" placeholder="Tournament name" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Game</label>
                <input type="text" value={game} onChange={(e) => setGame(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-bg border border-purple-500/20 text-white text-sm" placeholder="e.g. League of Legends" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Max Players</label>
                <input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-bg border border-purple-500/20 text-white text-sm" min={2} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Start Date</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-bg border border-purple-500/20 text-white text-sm" required />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-semibold">
                Create
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2 rounded-lg bg-surface-light text-gray-400 text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Tournament grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tournaments.map((t, i) => {
            const cfg = statusConfig[t.status] ?? statusConfig.pending;
            const fill = t.players?.length ?? 0;
            const pct = Math.round((fill / t.maxPlayers) * 100);
            return (
              <Link
                key={t.id}
                to={`/tournaments/${t.id}`}
                className="glass rounded-xl p-5 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Status badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span className={cfg.color}>{t.status === 'in_progress' ? 'LIVE' : t.status.toUpperCase()}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(t.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors mb-1">
                  {t.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4">{t.game}</p>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Players</span>
                    <span className="text-white font-medium">{fill}/{t.maxPlayers}</span>
                  </div>
                  <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-30">&#x1F3C6;</div>
            <p className="text-gray-500 text-lg">No tournaments found</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to create one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
