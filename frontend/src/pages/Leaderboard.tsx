import { useState, useEffect } from 'react';
import { statsApi } from '../api/stats';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Entry { playerId: string; username: string; wins: number; losses: number; winRate: number; }

export function Leaderboard() {
  const [lb, setLb] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const res = await statsApi.getLeaderboard(); setLb(res.data.data); }
      catch { toast.error('Failed.'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-smoke text-xs font-mono">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <div className="border-b border-ridge bg-slab">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <h1 className="font-display font-extrabold text-6xl md:text-8xl text-chalk tracking-tighter leading-none">
            R<span className="text-volt">a</span>nkings
          </h1>
          <p className="text-smoke text-xs font-mono mt-3">Global leaderboard — sorted by victories</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Top 3 podium */}
        {lb.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[1, 0, 2].map((idx) => {
              const p = lb[idx];
              const isFirst = idx === 0;
              const pct = Math.round(p.winRate * 100);
              return (
                <Link key={p.playerId} to={`/players/${p.playerId}`}
                  className={`card p-6 text-center ${isFirst ? 'border-volt bg-volt/[0.03] -mt-4' : ''}`}>
                  <div className={`w-14 h-14 mx-auto flex items-center justify-center font-display font-extrabold text-2xl mb-3 ${
                    isFirst ? 'bg-volt text-ink' : idx === 1 ? 'bg-chalk text-ink' : 'bg-ridge text-chalk'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="font-display font-bold text-lg text-chalk">{p.username}</div>
                  <div className="text-xs font-mono text-smoke mt-1">{p.wins}W — {p.losses}L</div>
                  <div className={`stat-number text-2xl mt-3 ${isFirst ? 'text-volt' : 'text-chalk'}`}>{pct}%</div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="border border-ridge overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ridge bg-slab">
                {['#', 'Player', 'W', 'L', 'Rate', ''].map((h) => (
                  <th key={h} className="text-[10px] font-bold uppercase tracking-widest text-smoke px-4 py-3 text-left font-mono">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lb.map((e, i) => {
                const pct = Math.round(e.winRate * 100);
                return (
                  <tr key={e.playerId} className="border-b border-ridge/50 hover:bg-slab transition-colors anim-slide-up"
                    style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono font-bold ${i === 0 ? 'text-volt' : i < 3 ? 'text-chalk' : 'text-ridge'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/players/${e.playerId}`} className="flex items-center gap-3 group">
                        <span className="w-6 h-6 bg-volt text-ink flex items-center justify-center text-[10px] font-bold shrink-0">
                          {e.username[0].toUpperCase()}
                        </span>
                        <span className="text-xs font-mono text-chalk group-hover:text-volt transition-colors">
                          {e.username}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-bold text-volt">{e.wins}</td>
                    <td className="px-4 py-3 text-xs font-mono font-bold text-hot">{e.losses}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono font-bold ${pct >= 60 ? 'text-volt' : pct >= 40 ? 'text-chalk' : 'text-hot'}`}>
                        {pct}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-20 bar-track">
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {lb.length === 0 && (
            <div className="text-center py-16">
              <div className="font-display font-extrabold text-5xl text-ridge mb-2">0</div>
              <p className="text-smoke text-xs font-mono">No players ranked yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
