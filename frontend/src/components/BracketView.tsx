interface Match {
  id: string; round: number; bracketPosition: number;
  player1?: { username: string }; player2?: { username: string };
  winner?: { username: string } | null; score: string; status: string;
}

export function BracketView({ matches }: { matches: Match[] }) {
  if (!matches.length) {
    return (
      <div className="py-16 text-center">
        <div className="font-display font-extrabold text-5xl text-ridge mb-2">—</div>
        <p className="text-smoke text-xs font-mono">No brackets yet. Generate when ready.</p>
      </div>
    );
  }

  const maxRound = Math.max(...matches.map((m) => m.round));
  const rounds: Match[][] = [];
  for (let r = 1; r <= maxRound; r++) {
    rounds.push(matches.filter((m) => m.round === r).sort((a, b) => a.bracketPosition - b.bracketPosition));
  }

  const roundLabel = (idx: number, total: number) => {
    if (idx === total - 1) return 'FINAL';
    if (idx === total - 2) return 'SEMI';
    if (idx === total - 3) return 'QUARTER';
    return `R${idx + 1}`;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {rounds.map((roundMatches, ri) => (
        <div key={ri} className="flex flex-col min-w-[200px]" style={{ justifyContent: 'space-around' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-volt mb-3 text-center font-mono">
            {roundLabel(ri, rounds.length)}
          </div>
          <div className="flex flex-col justify-around flex-1 gap-3">
            {roundMatches.map((m) => {
              const done = m.status === 'completed';
              const bye = m.score === 'BYE';
              const p1w = m.winner?.username === m.player1?.username;
              const p2w = m.winner?.username === m.player2?.username;

              return (
                <div key={m.id} className={`border ${done ? 'border-volt/30' : 'border-ridge'} ${bye ? 'opacity-40' : ''}`}>
                  {/* P1 */}
                  <div className={`flex items-center justify-between px-3 py-2 ${p1w ? 'bg-volt/5' : 'bg-slab'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold ${
                        p1w ? 'bg-volt text-ink' : 'bg-ridge text-smoke'
                      }`}>
                        {m.player1?.username?.[0]?.toUpperCase() ?? '?'}
                      </span>
                      <span className={`text-xs font-mono ${p1w ? 'text-volt font-bold' : 'text-chalk'}`}>
                        {m.player1?.username || 'TBD'}
                      </span>
                    </div>
                    {p1w && <span className="text-volt text-[10px] font-bold">W</span>}
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-center border-y border-ridge py-1 bg-ink">
                    <span className={`text-[10px] font-mono font-bold ${done ? 'text-volt' : 'text-ridge'}`}>
                      {m.score || (m.status === 'pending' ? '—' : 'LIVE')}
                    </span>
                  </div>

                  {/* P2 */}
                  <div className={`flex items-center justify-between px-3 py-2 ${p2w ? 'bg-volt/5' : 'bg-slab'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold ${
                        p2w ? 'bg-volt text-ink' : 'bg-ridge text-smoke'
                      }`}>
                        {m.player2?.username?.[0]?.toUpperCase() ?? '?'}
                      </span>
                      <span className={`text-xs font-mono ${p2w ? 'text-volt font-bold' : 'text-chalk'}`}>
                        {m.player2?.username || 'TBD'}
                      </span>
                    </div>
                    {p2w && <span className="text-volt text-[10px] font-bold">W</span>}
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
