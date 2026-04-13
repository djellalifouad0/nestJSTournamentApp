import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playersApi } from '../api/players';
import toast from 'react-hot-toast';

interface Stats {
  playerId: string; username: string; wins: number; losses: number;
  winRate: number; tournamentsPlayed: number; tournamentsWon: number;
}
interface Tournament { id: string; name: string; game: string; status: string; }

export function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [sRes, tRes] = await Promise.all([
          playersApi.getStats(id),
          playersApi.getTournaments(id),
        ]);
        setStats(sRes.data.data);
        setTournaments(tRes.data.data);
      } catch {
        toast.error('Failed to load player data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return <div className="text-center py-20 text-gray-500">Player not found.</div>;

  const total = stats.wins + stats.losses;
  const winPct = total > 0 ? Math.round(stats.winRate * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/30 to-transparent">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-12 pb-8 relative">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-purple-500/20">
              {stats.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white glow-text-purple">{stats.username}</h1>
              <p className="text-gray-400 mt-1">
                {stats.tournamentsPlayed} tournaments played
                {stats.tournamentsWon > 0 && (
                  <span className="ml-2 text-yellow-400">&#x1F3C6; {stats.tournamentsWon} won</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-12">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-4 relative z-10 mb-8">
          <div className="glass rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-green-400">{stats.wins}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Victories</div>
          </div>
          <div className="glass rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-red-400">{stats.losses}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Defeats</div>
          </div>
          <div className="glass rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-cyan-400">{winPct}%</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Win Rate</div>
          </div>
          <div className="glass rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-yellow-400">{stats.tournamentsWon}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Trophies</div>
          </div>
        </div>

        {/* Win rate visual */}
        {total > 0 && (
          <div className="glass rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-300">Performance</span>
              <span className="text-sm text-gray-400">{stats.wins}W - {stats.losses}L</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden flex bg-red-500/20">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000 rounded-l-full"
                style={{ width: `${winPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Tournaments */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>&#x1F3C6;</span> Tournament History
          </h2>
          <div className="space-y-2">
            {tournaments.map((t) => {
              const statusColor: Record<string, string> = {
                pending: 'text-yellow-400 bg-yellow-500/10',
                in_progress: 'text-cyan-400 bg-cyan-500/10',
                completed: 'text-green-400 bg-green-500/10',
              };
              return (
                <Link
                  key={t.id}
                  to={`/tournaments/${t.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-light transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center text-xs shrink-0">
                      &#x1F3AE;
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-200 group-hover:text-white truncate">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.game}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${statusColor[t.status] ?? ''}`}>
                    {t.status === 'in_progress' ? 'LIVE' : t.status}
                  </span>
                </Link>
              );
            })}
            {tournaments.length === 0 && (
              <p className="text-center text-gray-500 py-8">No tournament history yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
