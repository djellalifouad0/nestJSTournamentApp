import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playersApi } from '../api/players';
import toast from 'react-hot-toast';

interface Stats { playerId: string; username: string; wins: number; losses: number; winRate: number; tournamentsPlayed: number; tournamentsWon: number; }
interface Tournament { id: string; name: string; game: string; status: string; }

export function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [sR, tR] = await Promise.all([playersApi.getStats(id), playersApi.getTournaments(id)]);
        setStats(sR.data.data); setTournaments(tR.data.data);
      } catch { toast.error('Failed.'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-smoke text-xs font-mono">Loading...</div>;
  if (!stats) return <div className="text-center py-24 text-smoke text-xs font-mono">Not found.</div>;

  const total = stats.wins + stats.losses;
  const pct = total > 0 ? Math.round(stats.winRate * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="border-b border-ridge bg-slab">
        <div className="max-w-[1000px] mx-auto px-6 py-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-volt text-ink flex items-center justify-center font-display font-extrabold text-4xl shrink-0">
              {stats.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display font-extrabold text-4xl text-chalk tracking-tight">{stats.username}</h1>
              <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                <span className="text-smoke">{stats.tournamentsPlayed} tournaments</span>
                {stats.tournamentsWon > 0 && (
                  <span className="tag tag-volt">{stats.tournamentsWon} won</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Wins', val: String(stats.wins), color: 'text-volt' },
            { label: 'Losses', val: String(stats.losses), color: 'text-hot' },
            { label: 'Win Rate', val: `${pct}%`, color: 'text-ice' },
            { label: 'Trophies', val: String(stats.tournamentsWon), color: 'text-volt' },
          ].map((s) => (
            <div key={s.label} className="border border-ridge p-5 bg-slab text-center">
              <div className={`stat-number text-4xl ${s.color}`}>{s.val}</div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-smoke mt-2">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Win rate bar */}
        {total > 0 && (
          <div className="border border-ridge p-5 bg-slab mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-smoke">Performance</span>
              <span className="text-xs font-mono text-chalk">{stats.wins}W — {stats.losses}L</span>
            </div>
            <div className="h-2 bg-hot/20 overflow-hidden">
              <div className="h-full bg-volt transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* Tournament history */}
        <div className="border border-ridge bg-slab">
          <div className="px-5 py-4 border-b border-ridge">
            <h2 className="font-display font-bold text-sm text-chalk">Tournament History</h2>
          </div>
          {tournaments.map((t) => {
            const stag = t.status === 'in_progress' ? 'tag-hot' : t.status === 'completed' ? 'tag-ice' : 'tag-volt';
            const slabel = t.status === 'in_progress' ? 'Live' : t.status === 'completed' ? 'Done' : 'Open';
            return (
              <Link key={t.id} to={`/tournaments/${t.id}`}
                className="flex items-center justify-between px-5 py-3 border-b border-ridge/50 hover:bg-pit transition-colors group">
                <div>
                  <span className="text-sm font-mono text-chalk group-hover:text-volt transition-colors">{t.name}</span>
                  <span className="text-[10px] font-mono text-ridge ml-3">{t.game}</span>
                </div>
                <span className={`tag ${stag}`}>{slabel}</span>
              </Link>
            );
          })}
          {tournaments.length === 0 && (
            <div className="px-5 py-8 text-center text-xs font-mono text-ridge">No history yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
