import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Race } from '../types/f1';

interface RaceCalendarProps {
  races: Race[];
  onSelectRace: (round: string) => void;
}

export function RaceCalendar({ races, onSelectRace }: RaceCalendarProps) {
  const currentDate = new Date();

  return (
    <div className="glass-panel p-6 border border-white/5 animate-slide-up relative overflow-hidden flex flex-col gap-6">
      {/* Calendar Decorative Ambient Light */}
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#ff1801]/5 blur-3xl pointer-events-none rounded-full"></div>
      
      <div className="flex items-center gap-3 border-b border-white/10 pb-3 relative z-10">
        <CalendarIcon className="w-5 h-5 text-[#ff1801]" />
        <h3 className="font-extrabold text-sm uppercase tracking-widest text-[#ff1801] font-display">F1 Official Race Schedule</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-1 relative z-10 lg:max-h-[60vh] overflow-y-auto pr-1">
        {races.map((race) => {
          const raceDateTime = new Date(`${race.date}T${race.time || '12:00:00Z'}`);
          const isCompleted = raceDateTime < currentDate;
          
          return (
            <div 
              key={race.round} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                isCompleted 
                  ? 'bg-white/[0.01] border-white/5 opacity-60 hover:opacity-90 hover:bg-white/[0.03]' 
                  : 'bg-white/[0.04] border-white/10 hover:border-[#ff1801]/40 hover:bg-white/[0.07] hover:translate-x-1 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
              }`}
              onClick={() => onSelectRace(race.round)}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex flex-col items-center justify-center font-mono-numbers font-bold text-xs bg-white/5 group-hover:bg-[#ff1801]/10 group-hover:text-[#ff1801] text-gray-400 px-2.5 py-1.5 rounded-lg border border-white/5 transition-all">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">Rnd</span>
                  <span className="text-sm">{race.round}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-[#ff1801] transition-all">{race.raceName}</h4>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <span>📍</span>
                    <span>{race.Circuit.Location.locality}, {race.Circuit.Location.country}</span>
                  </p>
                </div>
              </div>
              
              <div className="text-right flex flex-col items-end gap-1.5">
                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                  isCompleted 
                    ? 'bg-white/5 border-white/5 text-gray-400' 
                    : 'bg-[#ff1801]/10 border-[#ff1801]/20 text-[#ff1801] animate-pulse'
                }`}>
                  {isCompleted ? 'Completed' : 'Upcoming'}
                </span>
                
                <span className="text-xs font-bold text-gray-200 mt-0.5 font-mono-numbers flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  {new Date(race.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          );
        })}
        {races.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic col-span-2">No race schedule logs available for the selected season.</div>
        )}
      </div>
    </div>
  );
}
