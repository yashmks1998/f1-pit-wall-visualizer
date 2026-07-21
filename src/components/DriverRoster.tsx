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
    <div className="glass-panel p-6 border border-border animate-slide-up relative overflow-hidden flex flex-col gap-6 bg-white/70 dark:bg-black/70 backdrop-blur-md">
      {/* Decorative gradient glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ff1801]/5 blur-3xl pointer-events-none rounded-full"></div>

      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 relative z-10">
        <div className="flex items-center gap-2 border-b border-transparent pb-1">
          <Users className="w-5 h-5 text-[#ff1801]" />
          <h3 className="font-extrabold text-sm uppercase tracking-widest text-[#ff1801] font-display">Active Driver Roster</h3>
        </div>
        <div className="search-wrapper relative w-full md:max-w-xs">
          <Search className="search-icon w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input 
            type="text" 
            className="search-input w-full bg-bg-primary border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-[#ff1801] focus:ring-1 focus:ring-[#ff1801] transition-all"
            placeholder="Search Roster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 lg:max-h-[60vh] overflow-y-auto pr-1">
        {getFilteredDrivers().map(item => {
          const colorInfo = getDriverDetails(item.Driver.code, item.Constructors[0]?.constructorId, item.Driver.url);
          const championships = CHAMPIONSHIPS_MAP[item.Driver.driverId] || 0;
          return (
            <div 
              key={item.Driver.driverId} 
              className="bg-bg-secondary border border-border hover:border-border-hover rounded-3xl p-6 flex flex-col items-center gap-4 relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 hover:shadow-md active:scale-[0.98] cursor-pointer"
              onClick={() => onSelectDriver(item.Driver.driverId)}
            >
              {/* Driver team accent line */}
              <div className="absolute left-0 right-0 top-0 h-1.5 transition-all duration-300" style={{ backgroundColor: colorInfo.color, boxShadow: `0 0 10px ${colorInfo.color}` }}></div>
              
              {/* Titles badge */}
              {championships > 0 && (
                <span className="absolute top-4 right-4 text-[9px] bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 px-2.5 py-0.5 rounded-full font-bold border border-yellow-500/20 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Trophy className="w-3 h-3" />
                  {championships} {championships === 1 ? 'Title' : 'Titles'}
                </span>
              )}

              {/* Number Badge Left */}
              <span className="absolute top-4 left-4 font-mono-numbers font-extrabold text-text-secondary text-sm">
                #{item.Driver.permanentNumber}
              </span>

              {/* Large Portrait-style Avatar */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-bg-primary border border-border flex items-center justify-center relative shadow-sm mt-4">
                <img 
                  src={colorInfo.headshot} 
                  alt={item.Driver.familyName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://media.formula1.com/d_driver_fallback_image.png';
                  }}
                />
              </div>

              {/* Minimal Text Hierarchy */}
              <div className="flex flex-col items-center text-center w-full">
                <h4 className="font-bold text-lg text-text-primary group-hover:text-[#ff1801] transition-all">
                  {item.Driver.givenName} {item.Driver.familyName}
                </h4>
                <p className="text-xs text-text-secondary mt-1 font-semibold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                  <span>{item.Constructors[0]?.name || 'N/A'}</span>
                  <span className="text-sm leading-none select-none">{FLAG_MAP[item.Driver.nationality] || ''}</span>
                </p>
              </div>

              {/* Stats Footer Block */}
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-center text-xs font-semibold w-full">
                <div className="flex flex-col bg-bg-primary p-2.5 rounded-xl border border-border hover:bg-bg-primary/80 transition-all">
                  <span className="text-text-secondary uppercase tracking-widest text-[9px] font-bold">Championship</span>
                  <span className="text-[#ff1801] text-sm font-bold font-mono-numbers mt-1">{item.points} PTS</span>
                </div>
                <div className="flex flex-col bg-bg-primary p-2.5 rounded-xl border border-border hover:bg-bg-primary/80 transition-all">
                  <span className="text-text-secondary uppercase tracking-widest text-[9px] font-bold">Wins</span>
                  <span className="text-text-primary text-sm font-bold font-mono-numbers mt-1">{item.wins}</span>
                </div>
              </div>
            </div>
          );
        })}
        {getFilteredDrivers().length === 0 && (
          <div className="text-center py-12 text-text-secondary italic col-span-3">No drivers found matching "{searchQuery}"</div>
        )}
      </div>
    </div>
  );
}
