import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Award, Calendar, Hash, Globe, User } from 'lucide-react';
import { DriverStanding } from '../types/f1';
import { FLAG_MAP } from '../utils/f1Constants';
import { useMediaQuery } from '../hooks/useMediaQuery';

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
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <motion.div
        initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
        animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
        exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="w-full max-h-[90dvh] md:max-h-none md:h-auto md:max-w-2xl bg-bg-secondary rounded-t-[32px] md:rounded-3xl border-t md:border-t-0 md:border border-border shadow-lg overflow-y-auto md:overflow-hidden relative z-10 p-0"
      >
        {/* Glow Accent by Team Color */}
        <div 
          className="absolute -top-32 -left-32 w-64 h-64 blur-3xl pointer-events-none rounded-full opacity-10"
          style={{ backgroundColor: colorInfo.color }}
        ></div>

        {/* Drag handle for mobile */}
        {isMobile && (
          <div className="w-12 h-1 bg-border rounded-full mx-auto mt-3 mb-1 cursor-pointer" onClick={onClose}></div>
        )}

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-bg-primary hover:bg-border/30 text-text-secondary hover:text-text-primary rounded-full border border-border transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col md:flex-row relative">
          
          {/* Driver Portrait Section */}
          <div className="md:w-2/5 bg-bg-primary p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-border min-h-[250px]">
            <div className="w-36 h-36 rounded-2xl overflow-hidden border border-border bg-bg-secondary p-1 relative z-10 flex items-center justify-center shadow-sm">
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
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black px-3.5 py-1 rounded-full text-white uppercase tracking-widest shadow-sm font-sans"
              style={{ backgroundColor: colorInfo.color }}
            >
              {constructor?.name || 'F1 Team'}
            </span>
          </div>

          {/* Details Section */}
          <div className="md:w-3/5 p-8 flex flex-col justify-between max-h-[60vh] md:max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-4">
              
              {/* Profile Header */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-numbers font-black text-lg text-text-primary">#{Driver.permanentNumber}</span>
                  <span className="text-lg leading-none select-none">{flag}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-text-primary mt-1 font-display tracking-tight leading-tight">
                  {Driver.givenName} {Driver.familyName}
                </h3>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1.5" style={{ color: colorInfo.color }}>
                  {wikiSummary?.description || `${Driver.nationality} Racing Driver`}
                </p>
              </div>

              {/* Biography Extract */}
              <div className="border-t border-border pt-3">
                <h4 className="text-[10px] font-black uppercase text-text-primary tracking-widest mb-2">Biography</h4>
                {loadingBio ? (
                  <div className="h-16 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-border/20 border-t-[#ff1801] rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <p className="text-[11px] md:text-xs text-text-primary leading-relaxed max-h-[140px] overflow-y-auto pr-1 text-justify opacity-90">
                    {wikiSummary?.extract || 'No biographical records loaded in telemetry logs.'}
                  </p>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-2 md:gap-2.5 border-t border-border pt-4">
                <div className="bg-white/5 dark:bg-white/10 border border-border/50 rounded-xl p-2.5 md:p-3 text-center shadow-sm backdrop-blur-sm">
                  <User className="w-4 h-4 text-text-primary mx-auto mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-text-primary font-bold">Standing</span>
                  <p className="text-sm md:text-base font-black text-[#ff1801] font-mono-numbers mt-1.5">P{position}</p>
                </div>
                <div className="bg-white/5 dark:bg-white/10 border border-border/50 rounded-xl p-2.5 md:p-3 text-center shadow-sm backdrop-blur-sm">
                  <Trophy className="w-4 h-4 text-text-primary mx-auto mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-text-primary font-bold">Wins</span>
                  <p className="text-sm md:text-base font-black text-text-primary font-mono-numbers mt-1.5">{wins}</p>
                </div>
                <div className="bg-white/5 dark:bg-white/10 border border-border/50 rounded-xl p-2.5 md:p-3 text-center shadow-sm backdrop-blur-sm">
                  <Award className="w-4 h-4 text-text-primary mx-auto mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-text-primary font-bold">Points</span>
                  <p className="text-sm md:text-base font-black text-text-primary font-mono-numbers mt-1.5">{points}</p>
                </div>
              </div>

            </div>

            {/* Profile Footer Metrics */}
            <div className="border-t border-border pt-4 mt-6 grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-border-hover" />
                <span>Born: {new Date(Driver.dateOfBirth).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-border-hover" />
                <span>Nation: {Driver.nationality}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 mt-1">
                <Hash className="w-3.5 h-3.5 text-border-hover" />
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
