import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { tournamentsApi } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Tournament {
  id: string; name: string; game: string; maxPlayers: number;
  status: string; startDate: string; players: { id: string }[];
}

export function Dashboard() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [game, setGame] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [startDate, setStartDate] = useState('');
  const { isAuthenticated } = useAuth();

  const load = async () => {
    try { const res = await tournamentsApi.getAll(statusFilter || undefined); setTournaments(res.data.data); }
    catch { toast.error('Failed to load.'); }
  };
  useEffect(() => { load(); }, [statusFilter]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await tournamentsApi.create({ name, game, maxPlayers, startDate });
      toast.success('Tournament created.');
      setShowCreate(false); setName(''); setGame(''); setMaxPlayers(8); setStartDate('');
      load();
    } catch { toast.error('Failed.'); }
  };

  const filters = [
    { val: '', label: 'All' },
    { val: 'pending', label: 'Open' },
    { val: 'in_progress', label: 'Live' },
    { val: 'completed', label: 'Done' },
  ];

  const statusTag = (s: string) => {
    if (s === 'in_progress') return <span className="tag tag-hot">Live</span>;
    if (s === 'completed') return <span className="tag tag-ice">Done</span>;
    return <span className="tag tag-volt">Open</span>;
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <div className="border-b border-ridge bg-slab">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <h1 className="font-display font-extrabold text-6xl md:text-8xl text-chalk tracking-tighter leading-none">
            Tourn<span className="text-volt">a</span>ments
          </h1>
          <div className="mt-4 flex items-center gap-6 text-xs font-mono">
            <span className="text-volt font-bold">{tournaments.filter(t => t.status === 'pending').length} Open</span>
            <span className="text-hot font-bold">{tournaments.filter(t => t.status === 'in_progress').length} Live</span>
            <span className="text-ice font-bold">{tournaments.filter(t => t.status === 'completed').length} Done</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f.val}
                onClick={() => setStatusFilter(f.val)}
                className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 border transition-colors ${
                  statusFilter === f.val
                    ? 'border-volt text-volt bg-volt/5'
                    : 'border-ridge text-smoke hover:border-chalk hover:text-chalk'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {isAuthenticated && (
            <button onClick={() => setShowCreate(!showCreate)} className="btn btn-volt text-[10px]">
              + New
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="card p-6 mb-8 anim-slide-up">
            <h3 className="font-display font-bold text-lg text-chalk mb-4">New Tournament</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1 block">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full" placeholder="Tournament name" required />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1 block">Game</label>
                <input type="text" value={game} onChange={(e) => setGame(e.target.value)} className="w-full" placeholder="Game title" required />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1 block">Max Players</label>
                <input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} className="w-full" min={2} required />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1 block">Start Date</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full" required />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-volt text-[10px]">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost text-[10px]">Cancel</button>
            </div>
          </form>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((t, i) => {
            const fill = t.players?.length ?? 0;
            const pct = Math.round((fill / t.maxPlayers) * 100);
            return (
              <Link
                key={t.id}
                to={`/tournaments/${t.id}`}
                className="card p-5 block anim-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  {statusTag(t.status)}
                  <span className="text-[10px] font-mono text-ridge">
                    {new Date(t.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-chalk leading-tight mb-1">{t.name}</h3>
                <p className="text-xs font-mono text-smoke mb-5">{t.game}</p>

                <div className="flex items-center justify-between text-[10px] font-mono text-smoke mb-1.5">
                  <span>Players</span>
                  <span className="text-chalk font-bold">{fill}<span className="text-ridge">/{t.maxPlayers}</span></span>
                </div>
                <div className="bar-track">
                  <div className={`bar-fill ${t.status === 'in_progress' ? 'bar-fill-hot' : ''}`} style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-24">
            <div className="font-display font-extrabold text-6xl text-ridge mb-4">0</div>
            <p className="text-smoke text-xs font-mono">No tournaments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
