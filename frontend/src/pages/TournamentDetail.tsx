import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tournamentsApi } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import { BracketView } from '../components/BracketView';
import toast from 'react-hot-toast';

interface Player { id: string; username: string; }
interface Match {
  id: string; round: number; bracketPosition: number;
  player1?: Player; player2?: Player; winner?: Player | null;
  score: string; status: string;
}
interface Tournament {
  id: string; name: string; game: string; maxPlayers: number;
  status: string; startDate: string; players: Player[]; matches: Match[];
}

export function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const load = async () => {
    if (!id) return;
    try {
      const [tRes, mRes] = await Promise.all([
        tournamentsApi.getOne(id),
        tournamentsApi.getMatches(id),
      ]);
      setTournament(tRes.data.data);
      setMatches(mRes.data.data);
    } catch {
      toast.error('Failed to load tournament');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleJoin = async () => {
    if (!id) return;
    try { await tournamentsApi.join(id); toast.success('You joined the tournament!'); load(); }
    catch { toast.error('Failed to join'); }
  };

  const handleBrackets = async () => {
    if (!id) return;
    try { await tournamentsApi.generateBrackets(id); toast.success('Brackets generated!'); load(); }
    catch { toast.error('Need at least 2 players'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!tournament) return <div className="text-center py-20 text-gray-500">Tournament not found.</div>;

  const isJoined = tournament.players?.some((p) => p.id === user?.id);
  const canJoin = isAuthenticated && !isJoined && tournament.status === 'pending' && (tournament.players?.length ?? 0) < tournament.maxPlayers;
  const canGenerate = isAuthenticated && tournament.status === 'pending' && (tournament.players?.length ?? 0) >= 2 && matches.length === 0;
  const fill = tournament.players?.length ?? 0;
  const pct = Math.round((fill / tournament.maxPlayers) * 100);

  const statusColors: Record<string, string> = {
    pending: 'from-yellow-500 to-orange-500',
    in_progress: 'from-cyan-500 to-blue-500',
    completed: 'from-green-500 to-emerald-500',
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/30 to-transparent">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[200px] bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-10 pb-8 relative">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${statusColors[tournament.status] ?? statusColors.pending} text-white uppercase tracking-wide`}>
                  {tournament.status === 'in_progress' ? 'LIVE' : tournament.status}
                </span>
                <span className="text-sm text-gray-400">{tournament.game}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white glow-text-purple mb-2">{tournament.name}</h1>
              <p className="text-gray-400">
                {new Date(tournament.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="flex gap-3">
              {canJoin && (
                <button onClick={handleJoin} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold hover:from-green-500 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/25 animate-pulse-glow">
                  Join Tournament
                </button>
              )}
              {canGenerate && (
                <button onClick={handleBrackets} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 transition-all shadow-lg shadow-purple-500/25">
                  Generate Brackets
                </button>
              )}
              {isJoined && (
                <span className="px-4 py-2.5 rounded-xl border border-green-500/30 text-green-400 text-sm font-medium">
                  &#x2713; Registered
                </span>
              )}
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Players', value: `${fill}/${tournament.maxPlayers}`, accent: 'purple' },
              { label: 'Matches', value: matches.length.toString(), accent: 'cyan' },
              { label: 'Completed', value: matches.filter(m => m.status === 'completed').length.toString(), accent: 'green' },
              { label: 'Remaining', value: matches.filter(m => m.status !== 'completed').length.toString(), accent: 'yellow' },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Player capacity bar */}
          <div className="mt-6">
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Players list */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-5 sticky top-20">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>&#x1F465;</span> Players
                <span className="text-xs font-normal text-gray-400 ml-auto">{fill}</span>
              </h2>
              <div className="space-y-2">
                {tournament.players?.map((player, i) => (
                  <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-light transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {player.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-200 truncate">{player.username}</span>
                    {i === 0 && <span className="text-xs text-yellow-400 ml-auto">&#x1F451;</span>}
                  </div>
                ))}
                {fill === 0 && <p className="text-sm text-gray-500 text-center py-4">No players yet</p>}
              </div>
            </div>
          </div>

          {/* Brackets */}
          <div className="lg:col-span-3">
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>&#x1F3AF;</span> Brackets
              </h2>
              <BracketView matches={matches} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
