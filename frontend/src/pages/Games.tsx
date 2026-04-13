import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { gamesApi } from '../api/games';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Game { id: string; name: string; publisher: string; releaseDate: string; genre: string; }

const genreIcons: Record<string, string> = {
  MOBA: '\u{1F5E1}\u{FE0F}', FPS: '\u{1F3AF}', RPG: '\u{1F9D9}', 'Battle Royale': '\u{1F4A5}',
  Sports: '\u26BD', Racing: '\u{1F3CE}\u{FE0F}', Strategy: '\u265F\u{FE0F}', Fighting: '\u{1F94A}',
};

export function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [publisher, setPublisher] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [genre, setGenre] = useState('');
  const { user } = useAuth();

  const loadGames = async () => {
    try { const res = await gamesApi.getAll(); setGames(res.data.data); }
    catch { toast.error('Failed to load games'); }
  };

  useEffect(() => { loadGames(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await gamesApi.create({ name, publisher, releaseDate, genre });
      toast.success('Game added!');
      setShowForm(false); setName(''); setPublisher(''); setReleaseDate(''); setGenre('');
      loadGames();
    } catch { toast.error('Admin access required'); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative overflow-hidden bg-gradient-to-b from-cyan-900/20 to-transparent pb-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-12 pb-4 relative">
          <h1 className="text-4xl md:text-5xl font-black text-white glow-text-cyan mb-3">Game Catalog</h1>
          <p className="text-gray-400 text-lg">Browse the games available for tournaments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12">
        {user?.isAdmin && (
          <div className="mb-8">
            <button onClick={() => setShowForm(!showForm)}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20">
              + Add Game
            </button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="glass rounded-2xl p-6 mb-8 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-4">Add New Game</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-bg border border-cyan-500/20 text-white text-sm" placeholder="Game name" required />
              <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-bg border border-cyan-500/20 text-white text-sm" placeholder="Publisher" required />
              <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-bg border border-cyan-500/20 text-white text-sm" required />
              <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-bg border border-cyan-500/20 text-white text-sm" placeholder="Genre (e.g. MOBA, FPS)" required />
            </div>
            <div className="flex gap-3 mt-5">
              <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-sm font-semibold">Add</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-lg bg-surface-light text-gray-400 text-sm">Cancel</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map((game, i) => (
            <div key={game.id} className="glass rounded-xl p-5 hover:border-cyan-500/30 transition-all group animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border border-cyan-500/10 flex items-center justify-center text-2xl shrink-0">
                  {genreIcons[game.genre] ?? '\u{1F3AE}'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{game.name}</h3>
                  <p className="text-sm text-gray-400">{game.publisher}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium">
                      {game.genre}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(game.releaseDate).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-20">&#x1F3AE;</div>
            <p className="text-gray-500 text-lg">No games in catalog</p>
          </div>
        )}
      </div>
    </div>
  );
}
