import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Race } from '../types/f1';

interface RaceCalendarProps {
  races: Race[];
  onSelectRace: (round: string) => void;
}

export function RaceCalendar({ races, onSelectRace }: RaceCalendarProps) {
  const currentDate = new Date();

  // Find the first upcoming race to highlight
  const nextUpcomingRace = races.find(race => {
    const raceDateTime = new Date(`${race.date}T${race.time || '12:00:00Z'}`);
    return raceDateTime >= currentDate;
  });

  return (
    <div className="glass-panel p-6 border border-border animate-slide-up relative overflow-hidden flex flex-col gap-6 bg-white/70 dark:bg-black/70 backdrop-blur-md">
      {/* Calendar Decorative Ambient Light */}
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#ff1801]/5 blur-3xl pointer-events-none rounded-full"></div>
      
      <div className="flex items-center gap-2 border-b border-border pb-3 relative z-10">
        <CalendarIcon className="w-5 h-5 text-[#ff1801]" />
        <h3 className="font-extrabold text-sm uppercase tracking-widest text-[#ff1801] font-display">Race Schedule</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-1 relative z-10 lg:max-h-[60vh] overflow-y-auto pr-1">
        {races.map((race) => {
          const raceDateTime = new Date(`${race.date}T${race.time || '12:00:00Z'}`);
          const isCompleted = raceDateTime < currentDate;
          const isNextRace = nextUpcomingRace && race.round === nextUpcomingRace.round;
          
          return (
            <div 
              key={race.round} 
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer group active:scale-[0.99] ${
                isCompleted 
                  ? 'bg-bg-secondary/40 border-border opacity-50 hover:opacity-80 hover:bg-bg-secondary/60' 
                  : isNextRace
                    ? 'bg-white dark:bg-black border-[#ff1801] shadow-[0_0_15px_var(--f1-red-glow)] hover:scale-[1.01]'
                    : 'bg-bg-secondary border-border hover:border-[#ff1801]/40 hover:bg-bg-primary hover:translate-x-1 shadow-sm'
              }`}
              onClick={() => onSelectRace(race.round)}
            >
              <div className="flex items-center gap-3.5">
                <div className={`flex flex-col items-center justify-center font-mono-numbers font-bold text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                  isNextRace 
                    ? 'bg-[#ff1801]/10 border-[#ff1801]/30 text-[#ff1801]' 
                    : 'bg-bg-primary border-border text-text-secondary group-hover:bg-[#ff1801]/5 group-hover:text-[#ff1801] group-hover:border-[#ff1801]/20'
                }`}>
                  <span className="text-[8px] uppercase tracking-widest text-text-secondary font-semibold">Rnd</span>
                  <span className="text-sm">{race.round}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-primary group-hover:text-[#ff1801] transition-all">{race.raceName}</h4>
                  <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                    <span>📍</span>
                    <span>{race.Circuit.Location.locality}, {race.Circuit.Location.country}</span>
                  </p>
                </div>
              </div>
              
              <div className="text-right flex flex-col items-end gap-1.5">
                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                  isCompleted 
                    ? 'bg-bg-primary border-border text-text-secondary' 
                    : isNextRace
                      ? 'bg-[#ff1801] border-[#ff1801] text-white shadow-sm font-black'
                      : 'bg-[#ff1801]/10 border-[#ff1801]/20 text-[#ff1801]'
                }`}>
                  {isCompleted ? 'Completed' : isNextRace ? 'Next Up' : 'Upcoming'}
                </span>
                
                <span className="text-xs font-bold text-text-primary mt-0.5 font-mono-numbers flex items-center gap-1">
                  <Clock className="w-3 h-3 text-text-secondary" />
                  {new Date(race.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          );
        })}
        {races.length === 0 && (
          <div className="text-center py-12 text-text-secondary italic col-span-2">No race schedule logs available for the selected season.</div>
        )}
      </div>
    </div>
  );
}
