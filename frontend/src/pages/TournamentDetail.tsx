import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tournamentsApi } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import { BracketView } from '../components/BracketView';
import toast from 'react-hot-toast';

interface Player { id: string; username: string; }
interface Match { id: string; round: number; bracketPosition: number; player1?: Player; player2?: Player; winner?: Player | null; score: string; status: string; }
interface Tournament { id: string; name: string; game: string; maxPlayers: number; status: string; startDate: string; players: Player[]; matches: Match[]; }

export function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const [t, setT] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const load = async () => {
    if (!id) return;
    try {
      const [tR, mR] = await Promise.all([tournamentsApi.getOne(id), tournamentsApi.getMatches(id)]);
      setT(tR.data.data); setMatches(mR.data.data);
    } catch { toast.error('Failed.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleJoin = async () => { if (!id) return; try { await tournamentsApi.join(id); toast.success('Joined.'); load(); } catch { toast.error('Cannot join.'); } };
  const handleBrackets = async () => { if (!id) return; try { await tournamentsApi.generateBrackets(id); toast.success('Brackets generated.'); load(); } catch { toast.error('Failed.'); } };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-smoke text-xs font-mono">Loading...</div>;
  if (!t) return <div className="text-center py-24 text-smoke text-xs font-mono">Not found.</div>;

  const fill = t.players?.length ?? 0;
  const pct = Math.round((fill / t.maxPlayers) * 100);
  const isJoined = t.players?.some((p) => p.id === user?.id);
  const canJoin = isAuthenticated && !isJoined && t.status === 'pending' && fill < t.maxPlayers;
  const canGen = isAuthenticated && t.status === 'pending' && fill >= 2 && matches.length === 0;
  const completed = matches.filter(m => m.status === 'completed').length;

  const statusTag = () => {
    if (t.status === 'in_progress') return <span className="tag tag-hot">Live</span>;
    if (t.status === 'completed') return <span className="tag tag-ice">Done</span>;
    return <span className="tag tag-volt">Open</span>;
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="border-b border-ridge bg-slab">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {statusTag()}
                <span className="text-[10px] font-mono text-ridge uppercase">{t.game}</span>
              </div>
              <h1 className="font-display font-extrabold text-4xl md:text-5xl text-chalk tracking-tight leading-none">
                {t.name}
              </h1>
              <p className="text-smoke text-xs font-mono mt-2">
                {new Date(t.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2">
              {canJoin && <button onClick={handleJoin} className="btn btn-volt text-[10px]">Join</button>}
              {canGen && <button onClick={handleBrackets} className="btn btn-ghost text-[10px] border-ice text-ice hover:bg-ice hover:text-ink">Generate Brackets</button>}
              {isJoined && <span className="tag tag-volt">Registered</span>}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Players', val: `${fill}/${t.maxPlayers}` },
              { label: 'Matches', val: String(matches.length) },
              { label: 'Completed', val: String(completed) },
              { label: 'Remaining', val: String(matches.length - completed) },
            ].map((s) => (
              <div key={s.label} className="border border-ridge p-4 bg-ink">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-smoke">{s.label}</div>
                <div className="stat-number text-3xl text-chalk mt-1">{s.val}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 bar-track">
            <div className={`bar-fill ${t.status === 'in_progress' ? 'bar-fill-hot' : ''}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Players */}
          <div className="lg:col-span-1">
            <div className="border border-ridge p-5 bg-slab sticky top-16">
              <h2 className="font-display font-bold text-sm text-chalk mb-4 flex items-center justify-between">
                Players <span className="text-[10px] font-mono text-ridge">{fill}</span>
              </h2>
              <div className="space-y-1">
                {t.players?.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-pit transition-colors">
                    <span className="w-6 h-6 bg-volt text-ink flex items-center justify-center text-[10px] font-bold shrink-0">
                      {p.username[0].toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-chalk truncate">{p.username}</span>
                    {i === 0 && <span className="text-[10px] text-volt ml-auto font-bold">#1</span>}
                  </div>
                ))}
                {fill === 0 && <p className="text-xs font-mono text-ridge py-4 text-center">No players yet.</p>}
              </div>
            </div>
          </div>

          {/* Brackets */}
          <div className="lg:col-span-3">
            <div className="border border-ridge p-6 bg-slab">
              <h2 className="font-display font-bold text-sm text-chalk mb-4">Brackets</h2>
              <BracketView matches={matches} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
