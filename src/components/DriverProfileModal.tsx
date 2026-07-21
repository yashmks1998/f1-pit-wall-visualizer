import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Award, Calendar, Hash, Globe, User } from 'lucide-react';
import { DriverStanding } from '../types/f1';
import { FLAG_MAP } from '../utils/f1Constants';

interface DriverProfileModalProps {
  driverId: string;
  driverStandings: DriverStanding[];
  getDriverDetails: (code: string, constructorId: string, url?: string) => { headshot: string; color: string };
  onClose: () => void;
}

interface WikiSummary {
  extract?: string;
  thumbnail?: {
    source: string;
  };
  description?: string;
}

export function DriverProfileModal({
  driverId,
  driverStandings,
  getDriverDetails,
  onClose,
}: DriverProfileModalProps) {
  const [wikiSummary, setWikiSummary] = useState<WikiSummary | null>(null);
  const [loadingBio, setLoadingBio] = useState(false);

  const standing = driverStandings.find(s => s.Driver.driverId === driverId);

  useEffect(() => {
    if (!standing) return;

    const fetchWikiBio = async () => {
      setLoadingBio(true);
      try {
        const urlParts = standing.Driver.url.split('/wiki/');
        const title = urlParts.length > 1 ? urlParts[1] : '';
        if (title) {
          const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
          if (res.ok) {
            const data = await res.json();
            setWikiSummary(data);
          }
        }
      } catch (err) {
        console.error('Error fetching driver biography:', err);
      } finally {
        setLoadingBio(false);
      }
    };

    fetchWikiBio();
  }, [standing]);

  if (!standing) return null;

  const { Driver, Constructors, points, wins, position } = standing;
  const constructor = Constructors[0];
  const colorInfo = getDriverDetails(Driver.code, constructor?.constructorId, Driver.url);
  const flag = FLAG_MAP[Driver.nationality] || '';

  // Use Wikipedia image if available, fallback to headshot URL
  const heroImage = wikiSummary?.thumbnail?.source || colorInfo.headshot;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/75 backdrop-blur-sm">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="w-full h-full md:h-auto max-w-none md:max-w-2xl bg-[#0d0d14] rounded-none md:rounded-3xl border-0 md:border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-y-auto md:overflow-hidden relative z-10"
      >
        {/* Glow Accent by Team Color */}
        <div 
          className="absolute -top-32 -left-32 w-64 h-64 blur-3xl pointer-events-none rounded-full opacity-20"
          style={{ backgroundColor: colorInfo.color }}
        ></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full border border-white/5 hover:border-white/10 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row relative">
          
          {/* Driver Portrait Section */}
          <div className="md:w-2/5 bg-gradient-to-b from-[#181824] to-[#0d0d14] p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/5 min-h-[280px]">
            <div className="w-40 h-40 rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-1 relative z-10 flex items-center justify-center">
              <img 
                src={heroImage} 
                alt={Driver.familyName} 
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = colorInfo.headshot;
                }}
              />
            </div>
            
            <span 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-extrabold px-3 py-1 rounded-full text-black uppercase tracking-wider font-display font-black shadow-lg"
              style={{ backgroundColor: colorInfo.color }}
            >
              {constructor?.name || 'F1 Team'}
            </span>
          </div>

          {/* Details Section */}
          <div className="md:w-3/5 p-8 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-4">
              
              {/* Profile Header */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-numbers font-black text-xl text-gray-400">#{Driver.permanentNumber}</span>
                  <span className="text-xl leading-none">{flag}</span>
                </div>
                <h3 className="text-3xl font-black text-white mt-1 font-display tracking-tight leading-tight">
                  {Driver.givenName} {Driver.familyName}
                </h3>
                <p className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: colorInfo.color }}>
                  {wikiSummary?.description || `${Driver.nationality} Racing Driver`}
                </p>
              </div>

              {/* Biography Extract */}
              <div className="border-t border-white/5 pt-3">
                <h4 className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider mb-2">Driver Biography</h4>
                {loadingBio ? (
                  <div className="h-16 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/10 border-t-[#ff1801] rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 leading-relaxed max-h-[150px] overflow-y-auto pr-1 text-justify">
                    {wikiSummary?.extract || 'No biographical records loaded in telemetry logs.'}
                  </p>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                  <User className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Standing</span>
                  <p className="text-base font-extrabold text-[#ff1801] font-mono-numbers mt-1">P{position}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                  <Trophy className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Wins</span>
                  <p className="text-base font-extrabold text-white font-mono-numbers mt-1">{wins}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                  <Award className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Points</span>
                  <p className="text-base font-extrabold text-white font-mono-numbers mt-1">{points}</p>
                </div>
              </div>

            </div>

            {/* Profile Footer Metrics */}
            <div className="border-t border-white/5 pt-4 mt-6 grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-600" />
                <span>Born: {new Date(Driver.dateOfBirth).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-gray-600" />
                <span>Nation: {Driver.nationality}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Hash className="w-3.5 h-3.5 text-gray-600" />
                <a 
                  href={Driver.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#ff1801] hover:underline"
                >
                  Wiki Reference Log &rarr;
                </a>
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
