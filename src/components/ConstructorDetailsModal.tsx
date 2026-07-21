import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Award, Users, Trophy, Flag, Globe } from 'lucide-react';
import { ConstructorStanding, DriverStanding } from '../types/f1';
import { CONSTRUCTOR_COLORS, FLAG_MAP } from '../utils/f1Constants';

interface ConstructorDetailsModalProps {
  constructorId: string;
  constructorStandings: ConstructorStanding[];
  driverStandings: DriverStanding[];
  onClose: () => void;
}

interface WikiSummary {
  extract?: string;
  description?: string;
}

export function ConstructorDetailsModal({
  constructorId,
  constructorStandings,
  driverStandings,
  onClose,
}: ConstructorDetailsModalProps) {
  const [wikiSummary, setWikiSummary] = useState<WikiSummary | null>(null);
  const [loadingBio, setLoadingBio] = useState(false);

  const standing = constructorStandings.find(s => s.Constructor.constructorId === constructorId);

  // Find drivers who currently drive for this constructor
  const teamDrivers = driverStandings.filter(s => 
    s.Constructors.some(c => c.constructorId === constructorId)
  );

  useEffect(() => {
    if (!standing) return;

    const fetchWikiBio = async () => {
      setLoadingBio(true);
      try {
        const urlParts = standing.Constructor.url.split('/wiki/');
        const title = urlParts.length > 1 ? urlParts[1] : '';
        if (title) {
          const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
          if (res.ok) {
            const data = await res.json();
            setWikiSummary(data);
          }
        }
      } catch (err) {
        console.error('Error fetching constructor biography:', err);
      } finally {
        setLoadingBio(false);
      }
    };

    fetchWikiBio();
  }, [standing]);

  if (!standing) return null;

  const { Constructor, points, wins, position } = standing;
  const color = CONSTRUCTOR_COLORS[constructorId] || '#ffffff';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="w-full max-w-2xl bg-[#0d0d14] rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden relative z-10 p-6 md:p-8"
      >
        {/* Glow Accent by Team Color */}
        <div 
          className="absolute -top-32 -left-32 w-64 h-64 blur-3xl pointer-events-none rounded-full opacity-20"
          style={{ backgroundColor: color }}
        ></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full border border-white/5 hover:border-white/10 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-6 relative z-10">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <span className="font-mono-numbers font-black text-sm bg-white/5 px-2.5 py-1 rounded-md text-gray-400 border border-white/5">
                Championship Standing
              </span>
              <h3 className="text-3xl font-black text-white mt-2 font-display tracking-tight leading-none uppercase flex items-center gap-3">
                <span className="w-2.5 h-8 block rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></span>
                {Constructor.name}
              </h3>
              <p className="text-xs uppercase tracking-widest mt-2 font-bold text-gray-400">
                {wikiSummary?.description || `${Constructor.nationality} F1 Constructor`}
              </p>
            </div>
          </div>

          {/* Biography */}
          <div>
            <h4 className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider mb-2">Constructor Biography</h4>
            {loadingBio ? (
              <div className="h-16 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/10 border-t-[#ff1801] rounded-full animate-spin"></div>
              </div>
            ) : (
              <p className="text-sm text-gray-300 leading-relaxed max-h-[160px] overflow-y-auto pr-1 text-justify">
                {wikiSummary?.extract || 'No technical team profile records available in telemetry database.'}
              </p>
            )}
          </div>

          {/* Current Driver Pairings */}
          {teamDrivers.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Active Driver Pairings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamDrivers.map(item => (
                  <div key={item.Driver.driverId} className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono-numbers bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        #{item.Driver.permanentNumber}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {item.Driver.givenName} {item.Driver.familyName}
                      </span>
                    </div>
                    <span className="text-base leading-none select-none">{FLAG_MAP[item.Driver.nationality] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <Trophy className="w-4 h-4 text-gray-500 mx-auto mb-1" />
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Pos</span>
              <p className="text-base font-extrabold text-[#ff1801] font-mono-numbers mt-1">P{position}</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <Award className="w-4 h-4 text-gray-500 mx-auto mb-1" />
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Wins</span>
              <p className="text-base font-extrabold text-white font-mono-numbers mt-1">{wins}</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <Award className="w-4 h-4 text-gray-500 mx-auto mb-1" />
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Points</span>
              <p className="text-base font-extrabold text-white font-mono-numbers mt-1">{points}</p>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-gray-400">
            <div className="flex items-center gap-2">
              <Flag className="w-3.5 h-3.5 text-gray-600" />
              <span>Base Nation: {Constructor.nationality}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-gray-600" />
              <a 
                href={Constructor.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#ff1801] hover:underline"
              >
                Team Wiki Reference &rarr;
              </a>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
