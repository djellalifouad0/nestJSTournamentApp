import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { gamesApi } from '../api/games';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Game { id: string; name: string; publisher: string; releaseDate: string; genre: string; }

export function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [publisher, setPublisher] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [genre, setGenre] = useState('');
  const { user } = useAuth();

  const load = async () => { try { const r = await gamesApi.getAll(); setGames(r.data.data); } catch { toast.error('Failed.'); } };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await gamesApi.create({ name, publisher, releaseDate, genre });
      toast.success('Added.'); setShowForm(false); setName(''); setPublisher(''); setReleaseDate(''); setGenre('');
      load();
    } catch { toast.error('Admin required.'); }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="border-b border-ridge bg-slab">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <h1 className="font-display font-extrabold text-6xl md:text-8xl text-chalk tracking-tighter leading-none">
            G<span className="text-ice">a</span>mes
          </h1>
          <p className="text-smoke text-xs font-mono mt-3">Catalog of supported titles</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {user?.isAdmin && (
          <div className="mb-6">
            <button onClick={() => setShowForm(!showForm)} className="btn btn-volt text-[10px]">+ Add Game</button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="card p-6 mb-8 anim-slide-up">
            <h3 className="font-display font-bold text-lg text-chalk mb-4">Add Game</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1 block">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full" required />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1 block">Publisher</label>
                <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)} className="w-full" required />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1 block">Release Date</label>
                <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="w-full" required />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1 block">Genre</label>
                <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full" required />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-volt text-[10px]">Add</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost text-[10px]">Cancel</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((g, i) => (
            <div key={g.id} className="card p-5 anim-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <span className="tag tag-ice">{g.genre}</span>
                <span className="text-[10px] font-mono text-ridge">{new Date(g.releaseDate).getFullYear()}</span>
              </div>
              <h3 className="font-display font-bold text-xl text-chalk leading-tight mb-1">{g.name}</h3>
              <p className="text-xs font-mono text-smoke">{g.publisher}</p>
            </div>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-24">
            <div className="font-display font-extrabold text-6xl text-ridge mb-4">0</div>
            <p className="text-smoke text-xs font-mono">No games in catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
}
