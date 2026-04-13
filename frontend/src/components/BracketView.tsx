interface Match {
  id: string;
  round: number;
  bracketPosition: number;
  player1?: { username: string };
  player2?: { username: string };
  winner?: { username: string } | null;
  score: string;
  status: string;
}

interface BracketViewProps {
  matches: Match[];
}

export function BracketView({ matches }: BracketViewProps) {
  if (!matches.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <div className="text-5xl mb-4 opacity-20">&#x1F3AF;</div>
        <p className="text-lg">No brackets generated yet</p>
        <p className="text-sm text-gray-600 mt-1">Generate brackets when enough players have joined</p>
      </div>
    );
  }

  const maxRound = Math.max(...matches.map((m) => m.round));
  const rounds: Match[][] = [];
  for (let r = 1; r <= maxRound; r++) {
    rounds.push(
      matches.filter((m) => m.round === r).sort((a, b) => a.bracketPosition - b.bracketPosition),
    );
  }

  const roundLabel = (idx: number, total: number) => {
    if (idx === total - 1) return 'Final';
    if (idx === total - 2) return 'Semi-Finals';
    if (idx === total - 3) return 'Quarter-Finals';
    return `Round ${idx + 1}`;
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 pt-2">
      {rounds.map((roundMatches, roundIndex) => (
        <div key={roundIndex} className="flex flex-col min-w-[220px]" style={{ justifyContent: 'space-around' }}>
          {/* Round header */}
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              {roundLabel(roundIndex, rounds.length)}
            </span>
          </div>

          {/* Matches */}
          <div className="flex flex-col justify-around flex-1 gap-4">
            {roundMatches.map((match) => {
              const isCompleted = match.status === 'completed';
              const isBye = match.score === 'BYE';
              const p1Won = match.winner?.username === match.player1?.username;
              const p2Won = match.winner?.username === match.player2?.username;

              return (
                <div
                  key={match.id}
                  className={`rounded-xl overflow-hidden border transition-all ${
                    isCompleted
                      ? 'border-purple-500/30 shadow-lg shadow-purple-500/5'
                      : 'border-surface-lighter'
                  } ${isBye ? 'opacity-50' : ''}`}
                >
                  {/* Player 1 */}
                  <div className={`flex items-center justify-between px-3 py-2.5 ${
                    p1Won ? 'bg-green-500/10' : 'bg-surface'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        p1Won
                          ? 'bg-green-500 text-white'
                          : 'bg-surface-lighter text-gray-400'
                      }`}>
                        {match.player1?.username?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className={`text-sm truncate ${p1Won ? 'text-green-400 font-semibold' : 'text-gray-300'}`}>
                        {match.player1?.username || 'TBD'}
                      </span>
                    </div>
                    {p1Won && <span className="text-green-400 text-xs">&#x2713;</span>}
                  </div>

                  {/* Divider with score */}
                  <div className="flex items-center justify-center bg-surface-light/50 border-y border-surface-lighter py-1">
                    <span className={`text-xs font-mono ${isCompleted ? 'text-purple-300' : 'text-gray-600'}`}>
                      {match.score || (match.status === 'pending' ? 'Upcoming' : 'In Progress')}
                    </span>
                  </div>

                  {/* Player 2 */}
                  <div className={`flex items-center justify-between px-3 py-2.5 ${
                    p2Won ? 'bg-green-500/10' : 'bg-surface'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        p2Won
                          ? 'bg-green-500 text-white'
                          : 'bg-surface-lighter text-gray-400'
                      }`}>
                        {match.player2?.username?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className={`text-sm truncate ${p2Won ? 'text-green-400 font-semibold' : 'text-gray-300'}`}>
                        {match.player2?.username || 'TBD'}
                      </span>
                    </div>
                    {p2Won && <span className="text-green-400 text-xs">&#x2713;</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
