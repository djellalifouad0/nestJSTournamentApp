import { useState, useEffect } from 'react';
import { statsApi } from '../api/stats';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  playerId: string; username: string; wins: number; losses: number; winRate: number;
}

const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const res = await statsApi.getLeaderboard(); setLeaderboard(res.data.data); }
      catch { toast.error('Failed to load leaderboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative overflow-hidden bg-gradient-to-b from-yellow-900/10 to-transparent pb-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-600/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-12 pb-4 relative">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          <p className="text-gray-400 text-lg">The top players ranked by victories</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-12">
        {/* Top 3 podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[1, 0, 2].map((idx) => {
              const p = leaderboard[idx];
              const isFirst = idx === 0;
              return (
                <Link key={p.playerId} to={`/players/${p.playerId}`}
                  className={`glass rounded-xl p-5 text-center transition-all hover:shadow-lg ${
                    isFirst ? 'glow-purple -mt-4 border-yellow-500/20 hover:shadow-yellow-500/10' : 'hover:shadow-purple-500/10'
                  }`}>
                  <div className="text-3xl mb-2">{medals[idx]}</div>
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-black text-white mb-3 ${
                    isFirst
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30'
                      : 'bg-gradient-to-br from-purple-600 to-cyan-500'
                  }`}>
                    {p.username[0].toUpperCase()}
                  </div>
                  <div className="font-bold text-white text-lg">{p.username}</div>
                  <div className="text-sm text-gray-400 mt-1">{p.wins}W - {p.losses}L</div>
                  <div className={`text-lg font-bold mt-2 ${isFirst ? 'text-yellow-400' : 'text-purple-400'}`}>
                    {Math.round(p.winRate * 100)}%
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/10">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Rank</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Player</th>
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Wins</th>
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Losses</th>
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Win Rate</th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Record</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                const total = entry.wins + entry.losses;
                const pct = total > 0 ? Math.round(entry.winRate * 100) : 0;
                return (
                  <tr key={entry.playerId}
                    className="border-b border-purple-500/5 hover:bg-purple-500/5 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}>
                    <td className="px-5 py-4">
                      {index < 3 ? (
                        <span className="text-lg">{medals[index]}</span>
                      ) : (
                        <span className="text-sm font-bold text-gray-500 w-6 inline-block text-center">
                          {index + 1}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/players/${entry.playerId}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {entry.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-200 group-hover:text-purple-400 transition-colors">
                          {entry.username}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-bold text-green-400">{entry.wins}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-bold text-red-400">{entry.losses}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-sm font-bold ${pct >= 60 ? 'text-green-400' : pct >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {pct}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <div className="w-24 h-2 rounded-full overflow-hidden bg-red-500/20">
                          <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {leaderboard.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 opacity-20">&#x1F4CA;</div>
              <p className="text-gray-500">No players ranked yet. Start competing!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
