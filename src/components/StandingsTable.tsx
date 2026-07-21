import { useState } from 'react';
import { Trophy, Search } from 'lucide-react';
import { DriverStanding, ConstructorStanding } from '../types/f1';
import { CONSTRUCTOR_COLORS, FLAG_MAP } from '../utils/f1Constants';

interface StandingsTableProps {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  getDriverDetails: (code: string, constructorId: string, url?: string) => { headshot: string; color: string };
  onSelectDriver: (driverId: string) => void;
  onSelectConstructor: (constructorId: string) => void;
}

export function StandingsTable({
  driverStandings,
  constructorStandings,
  getDriverDetails,
  onSelectDriver,
  onSelectConstructor,
}: StandingsTableProps) {
  const [standingsType, setStandingsType] = useState<'drivers' | 'constructors'>('drivers');
  const [searchQuery, setSearchQuery] = useState('');

  // Drivers filtered output
  const getFilteredDrivers = () => {
    return driverStandings.filter(item => {
      const fullName = `${item.Driver.givenName} ${item.Driver.familyName}`.toLowerCase();
      const teamName = (item.Constructors[0]?.name || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || teamName.includes(query);
    });
  };

  // Constructors filtered output
  const getFilteredConstructors = () => {
    return constructorStandings.filter(item => {
      const name = item.Constructor.name.toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query);
    });
  };

  return (
    <div className="glass-panel p-6 border border-white/5 animate-slide-up relative overflow-hidden">
      {/* Table Glowing Accent */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#ff1801]/5 blur-3xl pointer-events-none rounded-full"></div>

      <div className="search-filter-bar flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6 relative z-10">
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5 self-start">
          <button 
            className={`px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all flex items-center gap-2 ${
              standingsType === 'drivers' 
                ? 'bg-[#ff1801] text-black shadow-[0_0_12px_rgba(255,24,1,0.35)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => { setStandingsType('drivers'); setSearchQuery(''); }}
          >
            <Trophy className="w-3.5 h-3.5" />
            Drivers Standings
          </button>
          <button 
            className={`px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all flex items-center gap-2 ${
              standingsType === 'constructors' 
                ? 'bg-[#ff1801] text-black shadow-[0_0_12px_rgba(255,24,1,0.35)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => { setStandingsType('constructors'); setSearchQuery(''); }}
          >
            <Trophy className="w-3.5 h-3.5" />
            Constructors Standings
          </button>
        </div>

        <div className="search-wrapper relative w-full md:max-w-xs">
          <Search className="search-icon w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            className="search-input w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#ff1801] focus:ring-1 focus:ring-[#ff1801] transition-all"
            placeholder={standingsType === 'drivers' ? 'Search Drivers...' : 'Search Constructors...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {standingsType === 'drivers' ? (
        <>
        {/* Mobile Standings Cards (screens < 640px) */}
        <div className="flex flex-col gap-3 sm:hidden mt-2">
          {getFilteredDrivers().map(standing => {
            const colorInfo = getDriverDetails(standing.Driver.code, standing.Constructors[0]?.constructorId, standing.Driver.url);
            return (
              <div 
                key={standing.Driver.driverId}
                onClick={() => onSelectDriver(standing.Driver.driverId)}
                className="glass-panel p-4 flex items-center justify-between border border-white/5 hover:border-white/10 active:bg-white/5 pointer-events-auto cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black font-mono-numbers text-gray-400">P{standing.position}</span>
                  <span className="w-1 h-8 block rounded-full" style={{ backgroundColor: colorInfo.color, boxShadow: `0 0 8px ${colorInfo.color}` }}></span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      {standing.Driver.givenName} {standing.Driver.familyName}
                      <span className="text-base select-none">{FLAG_MAP[standing.Driver.nationality] || ''}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{standing.Constructors[0]?.name || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#ff1801] font-mono-numbers">{standing.points} PTS</span>
                  <span className="block text-[8px] text-gray-500 font-extrabold uppercase mt-0.5">{standing.wins} WINS</span>
                </div>
              </div>
            );
          })}
          {getFilteredDrivers().length === 0 && (
            <div className="text-center py-6 text-gray-400 italic">No drivers found</div>
          )}
        </div>

        <div className="table-container lg:max-h-[60vh] overflow-y-auto pr-1 hidden sm:block">
          <table className="f1-table w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="cell-pos py-3 text-left text-xs uppercase text-gray-400 font-extrabold tracking-wider">Pos</th>
                <th colSpan={2} className="py-3 text-left text-xs uppercase text-gray-400 font-extrabold tracking-wider">Driver</th>
                <th className="py-3 text-left text-xs uppercase text-gray-400 font-extrabold tracking-wider hidden sm:table-cell">Constructor</th>
                <th className="cell-wins py-3 text-center text-xs uppercase text-gray-400 font-extrabold tracking-wider hidden sm:table-cell">Wins</th>
                <th className="cell-pts py-3 text-right text-xs uppercase text-gray-400 font-extrabold tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredDrivers().map(standing => {
                const colorInfo = getDriverDetails(standing.Driver.code, standing.Constructors[0]?.constructorId, standing.Driver.url);
                return (
                  <tr 
                    key={standing.Driver.driverId} 
                    className="border-b border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group"
                    onClick={() => onSelectDriver(standing.Driver.driverId)}
                  >
                    <td className="cell-pos text-sm font-bold font-mono-numbers text-gray-200">
                      P{standing.position}
                    </td>
                    <td className="cell-team-accent w-1">
                      <span className="w-1 h-6 block rounded-full" style={{ backgroundColor: colorInfo.color, boxShadow: `0 0 8px ${colorInfo.color}` }}></span>
                    </td>
                    <td className="cell-name py-4 text-sm font-semibold text-white group-hover:text-[#ff1801] transition-all">
                      {standing.Driver.givenName} {standing.Driver.familyName}
                      <span className="ml-2 text-base select-none">{FLAG_MAP[standing.Driver.nationality] || ''}</span>
                    </td>
                    <td className="cell-team py-4 text-gray-300 text-xs font-medium hidden sm:table-cell">
                      {standing.Constructors[0]?.name || 'N/A'}
                    </td>
                    <td className="cell-wins py-4 text-center text-sm font-mono-numbers text-gray-300 hidden sm:table-cell">
                      {standing.wins}
                    </td>
                    <td className="cell-pts py-4 text-right text-sm font-bold font-mono-numbers text-[#ff1801]">
                      {standing.points} PTS
                    </td>
                  </tr>
                );
              })}
              {getFilteredDrivers().length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 italic">No drivers matching "{searchQuery}"</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
      ) : (
        <>
        {/* Mobile Constructors Standings Cards (screens < 640px) */}
        <div className="flex flex-col gap-3 sm:hidden mt-2">
          {getFilteredConstructors().map(standing => {
            const color = CONSTRUCTOR_COLORS[standing.Constructor.constructorId] || '#ffffff';
            return (
              <div 
                key={standing.Constructor.constructorId}
                onClick={() => onSelectConstructor(standing.Constructor.constructorId)}
                className="glass-panel p-4 flex items-center justify-between border border-white/5 hover:border-white/10 active:bg-white/5 pointer-events-auto cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black font-mono-numbers text-gray-400">P{standing.position}</span>
                  <span className="w-1 h-8 block rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      {standing.Constructor.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{standing.Constructor.nationality}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#ff1801] font-mono-numbers">{standing.points} PTS</span>
                  <span className="block text-[8px] text-gray-500 font-extrabold uppercase mt-0.5">{standing.wins} WINS</span>
                </div>
              </div>
            );
          })}
          {getFilteredConstructors().length === 0 && (
            <div className="text-center py-6 text-gray-400 italic">No constructors found</div>
          )}
        </div>

        <div className="table-container lg:max-h-[60vh] overflow-y-auto pr-1 hidden sm:block">
          <table className="f1-table w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="cell-pos py-3 text-left text-xs uppercase text-gray-400 font-extrabold tracking-wider">Pos</th>
                <th colSpan={2} className="py-3 text-left text-xs uppercase text-gray-400 font-extrabold tracking-wider">Constructor</th>
                <th className="py-3 text-left text-xs uppercase text-gray-400 font-extrabold tracking-wider hidden sm:table-cell">Nationality</th>
                <th className="cell-wins py-3 text-center text-xs uppercase text-gray-400 font-extrabold tracking-wider hidden sm:table-cell">Wins</th>
                <th className="cell-pts py-3 text-right text-xs uppercase text-gray-400 font-extrabold tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredConstructors().map(standing => {
                const color = CONSTRUCTOR_COLORS[standing.Constructor.constructorId] || '#ffffff';
                return (
                  <tr 
                    key={standing.Constructor.constructorId} 
                    className="border-b border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group"
                    onClick={() => onSelectConstructor(standing.Constructor.constructorId)}
                  >
                    <td className="cell-pos text-sm font-bold font-mono-numbers text-gray-200">
                      P{standing.position}
                    </td>
                    <td className="cell-team-accent w-1">
                      <span className="w-1 h-6 block rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></span>
                    </td>
                    <td className="cell-name py-4 text-sm font-semibold text-white group-hover:text-[#ff1801] transition-all">
                      {standing.Constructor.name}
                    </td>
                    <td className="py-4 text-gray-300 text-xs font-medium hidden sm:table-cell">
                      {standing.Constructor.nationality}
                    </td>
                    <td className="cell-wins py-4 text-center text-sm font-mono-numbers text-gray-300 hidden sm:table-cell">
                      {standing.wins}
                    </td>
                    <td className="cell-pts py-4 text-right text-sm font-bold font-mono-numbers text-[#ff1801]">
                      {standing.points} PTS
                    </td>
                  </tr>
                );
              })}
              {getFilteredConstructors().length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 italic">No constructors matching "{searchQuery}"</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
