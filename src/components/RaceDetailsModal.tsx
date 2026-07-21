import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Navigation, MapPin, Calendar, List, Info } from 'lucide-react';
import { Race, RaceResult } from '../types/f1';
import { FLAG_MAP } from '../utils/f1Constants';

interface RaceDetailsModalProps {
  round: string;
  year: string;
  races: Race[];
  getDriverDetails: (code: string, constructorId: string, url?: string) => { headshot: string; color: string };
  onClose: () => void;
}

interface CircuitDetails {
  length: string;
  laps: string;
  lapRecord: string;
  turns: string;
  description: string;
}

const CIRCUIT_SPECS: Record<string, CircuitDetails> = {
  monza: { length: '5.793 km', laps: '53', lapRecord: '1:21.046 (Barrichello, 2004)', turns: '11', description: 'Known as the Temple of Speed, Monza features long straights and fast corners with very low downforce levels.' },
  monaco: { length: '3.337 km', laps: '78', lapRecord: '1:12.909 (Hamilton, 2021)', turns: '19', description: 'A tight street circuit winding through Monte Carlo, requiring maximum downforce, precise steering, and absolute concentration.' },
  spa: { length: '7.004 km', laps: '44', lapRecord: '1:46.286 (Bottas, 2018)', turns: '19', description: 'The longest circuit on the calendar, Spa-Francorchamps is a driver favorite featuring the legendary Eau Rouge-Raidillon section.' },
  silverstone: { length: '5.891 km', laps: '52', lapRecord: '1:27.097 (Verstappen, 2020)', turns: '18', description: 'A historic ultra-fast track requiring extreme aerodynamic efficiency through iconic turns Copse, Maggotts, and Becketts.' },
  red_bull_ring: { length: '4.318 km', laps: '71', lapRecord: '1:05.619 (Sainz, 2020)', turns: '10', description: 'A roller-coaster track in the Styrian mountains, featuring heavy braking zones and short, high-speed straights.' },
  marina_bay: { length: '4.940 km', laps: '62', lapRecord: '1:35.867 (Hamilton, 2018)', turns: '19', description: 'A demanding physical street circuit under the lights in Singapore, featuring high humidity and bumpy asphalt.' }
};

export function RaceDetailsModal({
  round,
  year,
  races,
  getDriverDetails,
  onClose,
}: RaceDetailsModalProps) {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [wikiDesc, setWikiDesc] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const race = races.find(r => r.round === round);
  const currentDate = new Date();
  const raceDateTime = race ? new Date(`${race.date}T${race.time || '12:00:00Z'}`) : null;
  const isCompleted = raceDateTime ? raceDateTime < currentDate : true;

  // 1. Fetch results if race is completed
  useEffect(() => {
    if (!race || !isCompleted) return;

    const fetchRaceResults = async () => {
      setLoading(true);
      try {
        const yearStr = year === 'current' ? 'current' : year;
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${yearStr}/${round}/results.json`);
        if (res.ok) {
          const data = await res.json();
          const resultsList = data?.MRData?.RaceTable?.Races[0]?.Results || [];
          setResults(resultsList);
        }
      } catch (err) {
        console.error('Error fetching race results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRaceResults();
  }, [race, round, year, isCompleted]);

  // 2. Fetch Wikipedia info for the circuit
  useEffect(() => {
    if (!race) return;

    const fetchCircuitWiki = async () => {
      try {
        const urlParts = race.Circuit.url.split('/wiki/');
        const title = urlParts.length > 1 ? urlParts[1] : '';
        if (title) {
          const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
          if (res.ok) {
            const data = await res.json();
            setWikiDesc(data.extract || '');
          }
        }
      } catch (err) {
        console.error('Error fetching circuit bio:', err);
      }
    };

    fetchCircuitWiki();
  }, [race]);

  // 3. Countdown timer for upcoming races
  useEffect(() => {
    if (isCompleted || !raceDateTime) return;

    const updateTimer = () => {
      const difference = raceDateTime.getTime() - new Date().getTime();
      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [isCompleted, raceDateTime]);

  if (!race) return null;

  const specKey = Object.keys(CIRCUIT_SPECS).find(k => race.Circuit.circuitId.toLowerCase().includes(k)) || '';
  const spec = CIRCUIT_SPECS[specKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/75 backdrop-blur-sm">
      {/* Overlay click */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="w-full h-full md:h-auto max-w-none md:max-w-4xl bg-[#0d0d14] rounded-none md:rounded-3xl border-0 md:border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-y-auto md:overflow-hidden relative z-10"
      >
        {/* Decorative Top Accent Banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-[#ff1801] to-blue-600"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full border border-white/5 hover:border-white/10 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-white/10 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-numbers font-black text-sm bg-white/5 px-2.5 py-1 rounded-md text-gray-400 border border-white/5">
                  Round {race.round}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider border ${
                  isCompleted ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-[#ff1801]/10 border-[#ff1801]/20 text-[#ff1801]'
                }`}>
                  {isCompleted ? 'Completed' : 'Upcoming Event'}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-2 font-display tracking-tight leading-tight uppercase">
                {race.raceName}
              </h3>
              <p className="text-xs md:text-sm text-gray-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#ff1801]" />
                <span>{race.Circuit.circuitName} — {race.Circuit.Location.locality}, {race.Circuit.Location.country}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl self-start md:self-auto font-mono-numbers">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Race Weekend Date</span>
                <span className="text-xs font-bold text-white">
                  {new Date(race.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
            
            {/* Left/Middle: Results or Track Maps */}
            <div className="col-span-1 md:col-span-8 flex flex-col gap-4">
              
              {isCompleted ? (
                <>
                  <div className="flex items-center gap-2 pb-1">
                    <List className="w-4 h-4 text-[#ff1801]" />
                    <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400">Official Race Results</h4>
                  </div>

                  {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-white/10 border-t-[#ff1801] rounded-full animate-spin"></div>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-gray-500 font-mono-numbers">Loading Classification...</span>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="table-container max-h-[380px] overflow-y-auto border border-white/5 rounded-2xl pr-1">
                      <table className="f1-table w-full">
                        <thead>
                          <tr className="border-b border-white/10 text-gray-400 bg-white/[0.01]">
                            <th className="cell-pos py-2.5 pl-4 text-xs font-bold uppercase tracking-wider">Pos</th>
                            <th colSpan={2} className="py-2.5 text-xs font-bold uppercase tracking-wider">Driver</th>
                            <th className="py-2.5 text-xs font-bold uppercase tracking-wider">Constructor</th>
                            <th className="py-2.5 text-center text-xs font-bold uppercase tracking-wider">Start</th>
                            <th className="py-2.5 text-center text-xs font-bold uppercase tracking-wider">Time/Status</th>
                            <th className="cell-pts py-2.5 pr-4 text-xs font-bold uppercase tracking-wider">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map(item => {
                            const colorInfo = getDriverDetails(item.Driver.code, item.Constructor.constructorId, item.Driver.url);
                            const isFastestLap = item.FastestLap?.rank === '1';
                            return (
                              <tr 
                                key={item.Driver.driverId} 
                                className={`border-b border-white/5 hover:bg-white/[0.03] transition-all ${
                                  isFastestLap ? 'bg-purple-950/15' : ''
                                }`}
                              >
                                <td className="cell-pos py-3 pl-4 text-sm font-bold font-mono-numbers text-white">
                                  P{item.position}
                                </td>
                                <td className="cell-team-accent w-1">
                                  <span className="w-1 h-5 block rounded-full" style={{ backgroundColor: colorInfo.color }}></span>
                                </td>
                                <td className="py-3 text-xs font-semibold text-white">
                                  {item.Driver.givenName} {item.Driver.familyName}
                                  <span className="ml-1.5 text-xs">{FLAG_MAP[item.Driver.nationality] || ''}</span>
                                  {isFastestLap && (
                                    <span className="ml-2 text-[8px] font-black bg-[#ff1801]/25 text-[#ff1801] px-1.5 py-0.5 rounded italic uppercase tracking-wider border border-[#ff1801]/30">⏱️ Fastest</span>
                                  )}
                                </td>
                                <td className="py-3 text-gray-300 text-xs font-medium">{item.Constructor.name}</td>
                                <td className="py-3 text-center text-xs font-mono-numbers text-gray-300">P{item.grid}</td>
                                <td className="py-3 text-center text-xs font-mono-numbers text-gray-400">{item.Time?.time || item.status}</td>
                                <td className="cell-pts py-3 pr-4 text-right text-xs font-bold font-mono-numbers text-[#ff1801]">{item.points} PTS</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 bg-white/[0.01] border border-white/5 rounded-2xl">
                      Telemetry logs did not return results for this round.
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Upcoming Race Details: Countdown Timer */}
                  <div className="flex items-center gap-2 pb-1">
                    <Clock className="w-4 h-4 text-[#ff1801]" />
                    <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400">Green Flag Countdown</h4>
                  </div>

                  <div className="grid grid-cols-4 gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center shadow-inner">
                    {[
                      { val: countdown.days, lbl: 'Days' },
                      { val: countdown.hours, lbl: 'Hours' },
                      { val: countdown.minutes, lbl: 'Minutes' },
                      { val: countdown.seconds, lbl: 'Seconds' }
                    ].map(t => (
                      <div key={t.lbl} className="flex flex-col gap-1.5">
                        <span className="text-3xl md:text-4xl font-extrabold text-white font-mono-numbers tracking-tight">{String(t.val).padStart(2, '0')}</span>
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{t.lbl}</span>
                      </div>
                    ))}
                  </div>

                  {/* Circuit Wiki Summary */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mt-2 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#ff1801]" />
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Circuit Overview</span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-300 text-justify">
                      {wikiDesc || spec?.description || 'Circuit records are being updated by telemetry teams.'}
                    </p>
                  </div>
                </>
              )}

            </div>

            {/* Right: Circuit Spec Card */}
            <div className="col-span-1 md:col-span-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-1">
                <Navigation className="w-4 h-4 text-[#ff1801]" />
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400">Circuit Layout</h4>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                
                {/* Circuit specifications details list */}
                <div className="flex flex-col gap-3 font-semibold text-xs text-gray-400">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Track Length</span>
                    <span className="text-white font-mono-numbers">{spec?.length || '5.303 km'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Total Laps</span>
                    <span className="text-white font-mono-numbers">{spec?.laps || '58'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Total Turns</span>
                    <span className="text-white font-mono-numbers">{spec?.turns || '16'}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span>Lap Record</span>
                    <span className="text-white font-mono-numbers text-right">{spec?.lapRecord || '1:24.125 (Hamilton, 2020)'}</span>
                  </div>
                </div>

                {/* Technical Map Image */}
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center p-4 relative group">
                  <span className="text-[10px] text-gray-400 text-center font-bold absolute bottom-2 tracking-wide uppercase select-none">SF90 Track Layout Telemetry</span>
                  <div className="text-4xl filter grayscale contrast-125 opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300 select-none">
                    🏁
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
