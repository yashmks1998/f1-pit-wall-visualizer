import { Flag } from 'lucide-react';
import { RaceResult } from '../types/f1';
import { FLAG_MAP } from '../utils/f1Constants';

interface LastResultsProps {
  lastRaceResults: {
    raceName: string;
    round: string;
    date: string;
    results: RaceResult[];
  } | null;
  getDriverDetails: (code: string, constructorId: string, url?: string) => { headshot: string; color: string };
  onSelectDriver: (driverId: string) => void;
}

export function LastResults({ lastRaceResults, getDriverDetails, onSelectDriver }: LastResultsProps) {
  if (!lastRaceResults) {
    return (
      <div className="glass-panel p-8 text-center text-gray-400 border border-white/5 animate-slide-up">
        <Flag className="w-12 h-12 text-[#ff1801] mx-auto mb-3 opacity-60" />
        <h4 className="font-extrabold uppercase text-sm tracking-widest text-white mb-1">No Race Logs Available</h4>
        <p className="text-xs text-gray-500">Pit wall telemetry database has no records for the current round.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 border border-white/5 animate-slide-up relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#ff1801]/5 blur-3xl pointer-events-none rounded-full"></div>

      <div className="flex flex-col border-b border-white/10 pb-4 mb-5 relative z-10">
        <span className="text-[9px] font-extrabold text-[#ff1801] uppercase tracking-widest flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5" />
          Last Round Completed Telemetry
        </span>
        <h3 className="text-xl font-black text-white mt-1 uppercase tracking-tight font-display">{lastRaceResults.raceName}</h3>
        <p className="text-xs text-gray-400 mt-1 font-mono-numbers">
          Round {lastRaceResults.round} • {new Date(lastRaceResults.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="table-container max-h-[60vh] overflow-y-auto pr-1 relative z-10">
        <table className="f1-table w-full">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 bg-white/[0.01]">
              <th className="cell-pos py-3 pl-4 text-xs font-bold uppercase tracking-wider">Pos</th>
              <th colSpan={2} className="py-3 text-xs font-bold uppercase tracking-wider">Driver</th>
              <th className="py-3 text-xs font-bold uppercase tracking-wider">Constructor</th>
              <th className="py-3 text-center text-xs font-bold uppercase tracking-wider">Grid Start</th>
              <th className="py-3 text-center text-xs font-bold uppercase tracking-wider">Laps</th>
              <th className="py-3 text-center text-xs font-bold uppercase tracking-wider">Time/Status</th>
              <th className="py-3 text-center text-xs font-bold uppercase tracking-wider">Fastest Lap</th>
              <th className="cell-pts py-3 pr-4 text-right text-xs font-bold uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody>
            {lastRaceResults.results.map(item => {
              const colorInfo = getDriverDetails(item.Driver.code, item.Constructor.constructorId, item.Driver.url);
              const isFastestLap = item.FastestLap?.rank === '1';
              return (
                <tr 
                  key={item.Driver.driverId} 
                  className={`border-b border-white/5 hover:bg-white/[0.03] transition-all cursor-pointer group ${
                    isFastestLap ? 'bg-purple-950/15' : ''
                  }`}
                  onClick={() => onSelectDriver(item.Driver.driverId)}
                >
                  <td className="cell-pos py-4 pl-4 text-sm font-bold font-mono-numbers text-white">P{item.position}</td>
                  <td className="cell-team-accent w-1">
                    <span className="w-1 h-6 block rounded-full" style={{ backgroundColor: colorInfo.color, boxShadow: `0 0 8px ${colorInfo.color}` }}></span>
                  </td>
                  <td className="cell-name py-4 text-sm font-semibold text-white group-hover:text-[#ff1801] transition-all">
                    {item.Driver.givenName} {item.Driver.familyName}
                    <span className="ml-2 text-base select-none">{FLAG_MAP[item.Driver.nationality] || ''}</span>
                    {isFastestLap && (
                      <span className="ml-2.5 text-[8px] font-black bg-[#ff1801]/25 text-[#ff1801] px-1.5 py-0.5 rounded italic uppercase tracking-wider border border-[#ff1801]/30">⏱️ FASTEST</span>
                    )}
                  </td>
                  <td className="cell-team py-4 text-gray-300 text-xs font-medium">{item.Constructor.name}</td>
                  <td className="py-4 text-center text-xs font-mono-numbers text-gray-300">P{item.grid}</td>
                  <td className="py-4 text-center text-xs font-mono-numbers text-gray-300">{item.laps}</td>
                  <td className="py-4 text-center text-xs font-mono-numbers text-gray-400">{item.Time?.time || item.status}</td>
                  <td className="py-4 text-center text-xs font-mono-numbers text-gray-400">{item.FastestLap?.Time?.time || '-'}</td>
                  <td className="cell-pts py-4 pr-4 text-right font-mono-numbers text-sm font-bold text-[#ff1801]">{item.points} PTS</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
