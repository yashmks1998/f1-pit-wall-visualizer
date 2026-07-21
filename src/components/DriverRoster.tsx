import { useState } from 'react';
import { Users, Search, Trophy } from 'lucide-react';
import { DriverStanding } from '../types/f1';
import { CHAMPIONSHIPS_MAP, FLAG_MAP } from '../utils/f1Constants';

interface DriverRosterProps {
  driverStandings: DriverStanding[];
  getDriverDetails: (code: string, constructorId: string, url?: string) => { headshot: string; color: string };
  onSelectDriver: (driverId: string) => void;
}

export function DriverRoster({ driverStandings, getDriverDetails, onSelectDriver }: DriverRosterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getFilteredDrivers = () => {
    return driverStandings.filter(item => {
      const fullName = `${item.Driver.givenName} ${item.Driver.familyName}`.toLowerCase();
      const teamName = (item.Constructors[0]?.name || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || teamName.includes(query);
    });
  };

  return (
    <div className="glass-panel p-6 border border-white/5 animate-slide-up relative overflow-hidden flex flex-col gap-6">
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ff1801]/5 blur-3xl pointer-events-none rounded-full"></div>

      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 relative z-10">
        <div className="flex items-center gap-3 border-b border-transparent pb-1">
          <Users className="w-5 h-5 text-[#ff1801]" />
          <h3 className="font-extrabold text-sm uppercase tracking-widest text-[#ff1801] font-display">F1 Active Driver Roster</h3>
        </div>
        <div className="search-wrapper relative w-full md:max-w-xs">
          <Search className="search-icon w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            className="search-input w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#ff1801] focus:ring-1 focus:ring-[#ff1801] transition-all"
            placeholder="Search Roster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 max-h-[60vh] overflow-y-auto pr-1">
        {getFilteredDrivers().map(item => {
          const colorInfo = getDriverDetails(item.Driver.code, item.Constructors[0]?.constructorId, item.Driver.url);
          const championships = CHAMPIONSHIPS_MAP[item.Driver.driverId] || 0;
          return (
            <div 
              key={item.Driver.driverId} 
              className="bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] cursor-pointer"
              onClick={() => onSelectDriver(item.Driver.driverId)}
            >
              {/* Driver team accent line */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300" style={{ backgroundColor: colorInfo.color, boxShadow: `0 0 10px ${colorInfo.color}` }}></div>
              
              {championships > 0 && (
                <span className="absolute top-4 right-4 text-[10px] bg-yellow-500/10 text-yellow-400 px-2.5 py-0.5 rounded-full font-bold border border-yellow-500/20 uppercase tracking-wider flex items-center gap-1 shadow-[0_2px_10px_rgba(234,179,8,0.15)]">
                  <Trophy className="w-3 h-3" />
                  {championships} {championships === 1 ? 'Title' : 'Titles'}
                </span>
              )}

              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center relative shadow-inner">
                  <img 
                    src={colorInfo.headshot} 
                    alt={item.Driver.familyName} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://media.formula1.com/d_driver_fallback_image.png';
                    }}
                  />
                </div>

                <div>
                  <span className="font-mono-numbers font-extrabold text-[#ff1801] text-lg">#{item.Driver.permanentNumber}</span>
                  <h4 className="font-bold text-base text-white mt-0.5 group-hover:text-[#ff1801] transition-all">{item.Driver.givenName} {item.Driver.familyName}</h4>
                  <p className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <span>{item.Constructors[0]?.name || 'N/A'}</span>
                    <span className="text-sm leading-none select-none">{FLAG_MAP[item.Driver.nationality] || ''}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-center text-xs font-semibold">
                <div className="flex flex-col bg-white/[0.02] p-2.5 rounded-xl border border-white/5 hover:bg-white/[0.04] transition-all">
                  <span className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Championship</span>
                  <span className="text-white text-sm font-bold font-mono-numbers mt-1.5 text-[#ff1801]">{item.points} PTS</span>
                </div>
                <div className="flex flex-col bg-white/[0.02] p-2.5 rounded-xl border border-white/5 hover:bg-white/[0.04] transition-all">
                  <span className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Wins</span>
                  <span className="text-white text-sm font-bold font-mono-numbers mt-1.5">{item.wins}</span>
                </div>
              </div>
            </div>
          );
        })}
        {getFilteredDrivers().length === 0 && (
          <div className="text-center py-12 text-gray-400 italic col-span-3">No drivers found matching "{searchQuery}"</div>
        )}
      </div>
    </div>
  );
}
