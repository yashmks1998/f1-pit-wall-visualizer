import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Flag, 
  Calendar as CalendarIcon, 
  Trophy, 
  Users, 
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import './App.css';
import { useMediaQuery } from './hooks/useMediaQuery';

// 3D Scene & Telemetry Dashboard
import { F1Scene } from './components/F1Scene';
import { PitWallDashboard } from './components/PitWallDashboard';

// Tab subcomponents
import { StandingsTable } from './components/StandingsTable';
import { RaceCalendar } from './components/RaceCalendar';
import { DriverRoster } from './components/DriverRoster';
import { LastResults } from './components/LastResults';

// Detail Modals
import { DriverProfileModal } from './components/DriverProfileModal';
import { RaceDetailsModal } from './components/RaceDetailsModal';
import { ConstructorDetailsModal } from './components/ConstructorDetailsModal';

// Types & Constants
import { DriverStanding, ConstructorStanding, Race, RaceResult, OpenF1Driver } from './types/f1';
import { CONSTRUCTOR_COLORS, PART_DETAILS } from './utils/f1Constants';

function App() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { theme, toggleTheme } = useTheme();
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'standings' | 'calendar' | 'results' | 'drivers'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3D Configurator state — default White accent match
  const [carColor, setCarColor] = useState('#f5f5f5');
  const [drsActive, setDrsActive] = useState(false);
  const [rimsColor, setRimsColor] = useState<'black' | 'chrome' | 'accent'>('black');
  const [tireCompound, setTireCompound] = useState<'soft' | 'medium' | 'hard' | 'intermediate' | 'wet'>('soft');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  // New realism sliders (suspension and wheel physics)
  const [rideHeight, setRideHeight] = useState<number>(0.0);
  const [steeringAngle, setSteeringAngle] = useState<number>(0);

  // Live Telemetry Simulation state
  const [telemetry, setTelemetry] = useState({
    speed: 250,
    rpm: 12500,
    gear: 6,
    throttle: 100,
    brake: 0,
    gForce: 1.2,
    lapTime: "0:00.000"
  });

  // Raw API States
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [lastRaceResults, setLastRaceResults] = useState<{ raceName: string; round: string; date: string; results: RaceResult[] } | null>(null);
  const [openF1Map, setOpenF1Map] = useState<Record<string, { headshot_url: string; team_colour: string }>>({});

  // Filter states
  const [selectedYear, setSelectedYear] = useState<string>('current');
  const [wikiImageMap, setWikiImageMap] = useState<Record<string, string>>({});

  // Detail Modal states
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedConstructorId, setSelectedConstructorId] = useState<string | null>(null);
  const [selectedRaceRound, setSelectedRaceRound] = useState<string | null>(null);

  // Mobile UI toggle for 3D Dashboard cards
  const [mobilePanel, setMobilePanel] = useState<'none' | 'telemetry' | 'configurator'>('none');

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      setMobilePanel('none');
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedPart) {
      setMobilePanel('configurator');
    }
  }, [selectedPart]);

  // Mobile navigation drawer state & body scroll lock
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    if (mobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, isMobile]);

  // Scroll position listener for header translucent styling
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target) {
        const scrollTop = target.scrollTop || window.scrollY;
        setScrolled(scrollTop > 15);
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  // Fetch F1 Data
  useEffect(() => {
    const fetchF1Data = async () => {
      try {
        setLoading(true);
        setError(null);

        const yearStr = selectedYear;
        const [openf1Res, driverStandingsRes, constructorStandingsRes, calendarRes, lastResultsRes] = await Promise.all([
          selectedYear === 'current' ? fetch('https://api.openf1.org/v1/drivers?session_key=latest').then(r => r.ok ? r.json() : []).catch(() => []) : Promise.resolve([]),
          fetch(`https://api.jolpi.ca/ergast/f1/${yearStr}/driverStandings.json`).then(r => r.ok ? r.json() : null),
          fetch(`https://api.jolpi.ca/ergast/f1/${yearStr}/constructorStandings.json`).then(r => r.ok ? r.json() : null),
          fetch(`https://api.jolpi.ca/ergast/f1/${yearStr}.json`).then(r => r.ok ? r.json() : null),
          fetch(`https://api.jolpi.ca/ergast/f1/${yearStr}/last/results.json`).then(r => r.ok ? r.json() : null)
        ]);

        // Process OpenF1
        const f1Map: Record<string, { headshot_url: string; team_colour: string }> = {};
        if (Array.isArray(openf1Res)) {
          openf1Res.forEach((d: OpenF1Driver) => {
            if (d.name_acronym) {
              const code = d.name_acronym.toUpperCase();
              f1Map[code] = {
                headshot_url: d.headshot_url,
                team_colour: d.team_colour ? `#${d.team_colour}` : ''
              };
            }
          });
        }
        setOpenF1Map(f1Map);

        // Drivers & constructors standings
        const dStandings = driverStandingsRes?.MRData?.StandingsTable?.StandingsLists[0]?.DriverStandings || [];
        const cStandings = constructorStandingsRes?.MRData?.StandingsTable?.StandingsLists[0]?.ConstructorStandings || [];
        setDriverStandings(dStandings);
        setConstructorStandings(cStandings);
        
        // Wikipedia fetch for historical images
        const wikiTitles = dStandings
          .filter((s: any) => !f1Map[(s.Driver.code || '').toUpperCase()])
          .map((s: any) => {
             const parts = s.Driver.url.split('/wiki/');
             return parts.length > 1 ? parts[1] : null;
          })
          .filter(Boolean);

        const wMap: Record<string, string> = {};
        if (wikiTitles.length > 0) {
          const titlesChunk = wikiTitles.slice(0, 45).join('|');
          try {
            const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${titlesChunk}&prop=pageimages&format=json&pithumbsize=400&origin=*`).then(r => r.json());
            const pages = wikiRes?.query?.pages;
            if (pages) {
              Object.values(pages).forEach((page: any) => {
                if (page.title && page.thumbnail?.source) {
                  const safeTitle = page.title.replace(/ /g, '_');
                  wMap[safeTitle] = page.thumbnail.source;
                }
              });
            }
          } catch (e) {
            console.warn("Wiki fetch failed", e);
          }
        }
        setWikiImageMap(wMap);

        // Calendar
        const seasonRaces = calendarRes?.MRData?.RaceTable?.Races || [];
        setRaces(seasonRaces);

        // Last results
        const lastRaceInfo = lastResultsRes?.MRData?.RaceTable?.Races[0];
        if (lastRaceInfo) {
          setLastRaceResults({
            raceName: lastRaceInfo.raceName,
            round: lastRaceInfo.round,
            date: lastRaceInfo.date,
            results: lastRaceInfo.Results || []
          });
        }
      } catch (err: any) {
        console.error(err);
        setError('Pitlane connection failure: Jolpica API could not be reached.');
      } finally {
        setLoading(false);
      }
    };

    fetchF1Data();
  }, [selectedYear]);

  // Telemetry loop simulator (18 seconds total lap simulation)
  useEffect(() => {
    let startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % 18000; // 18 seconds loop
      const sec = elapsed / 1000;

      // Format lap time
      const minutes = Math.floor(sec / 60);
      const seconds = Math.floor(sec % 60);
      const ms = Math.floor((elapsed % 1000));
      const lapTimeStr = `${minutes}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;

      let speed = 270;
      let rpm = 12500;
      let gear = 7;
      let throttle = 100;
      let brake = 0;
      let gForce = 1.1;

      // Ferrari SF90 2019 lap simulation — tuned for Monza/Spa performance
      if (sec < 4.5) {
        // Phase 1: DRS straightline — Ferrari 064 engine brute force (0s-4.5s)
        const progress = sec / 4.5;
        speed = Math.floor(270 + progress * 65);
        gear = progress < 0.25 ? 6 : progress < 0.65 ? 7 : 8;
        throttle = 100;
        brake = 0;
        rpm = Math.floor(12000 + ((progress * 15) % 1) * 3000);
        gForce = 0.9 + Math.sin(sec * 0.8) * 0.2;
        if (progress > 0.35) {
          setDrsActive(true);
          speed += 18;
        } else {
          setDrsActive(false);
        }
      } else if (sec < 6.5) {
        // Phase 2: Late braking into chicane — SF90's 6G deceleration (4.5s-6.5s)
        setDrsActive(false);
        const progress = (sec - 4.5) / 2.0;
        speed = Math.floor(353 - progress * 240);
        gear = progress < 0.18 ? 7 : progress < 0.40 ? 5 : progress < 0.72 ? 3 : 2;
        throttle = 0;
        brake = Math.floor(90 - progress * 22);
        rpm = Math.floor(14800 - progress * 4200);
        gForce = 5.8 - progress * 1.8;
      } else if (sec < 9.5) {
        // Phase 3: Low-speed hairpin corner (6.5s-9.5s)
        const progress = (sec - 6.5) / 3.0;
        speed = Math.floor(113 - Math.sin(progress * Math.PI) * 28 + progress * 45);
        gear = speed < 95 ? 2 : 3;
        throttle = progress < 0.35 ? 10 : 72;
        brake = progress < 0.28 ? 28 : 0;
        rpm = Math.floor(10200 + progress * 3500);
        gForce = 4.2 + Math.sin(progress * Math.PI) * 1.3;
      } else if (sec < 13.5) {
        // Phase 4: High-speed sweepers (9.5s-13.5s)
        const progress = (sec - 9.5) / 4.0;
        speed = Math.floor(158 + progress * 115);
        gear = progress < 0.22 ? 4 : progress < 0.55 ? 5 : 6;
        throttle = 92 + Math.sin(progress * Math.PI) * 8;
        brake = 0;
        rpm = Math.floor(11200 + ((progress * 12) % 1) * 3300);
        gForce = 4.8 - progress * 2.2;
      } else {
        // Phase 5: Back straight DRS (13.5s-18s)
        const progress = (sec - 13.5) / 4.5;
        speed = Math.floor(273 + progress * 62);
        gear = progress < 0.3 ? 7 : 8;
        throttle = 100;
        brake = 0;
        rpm = Math.floor(12500 + ((progress * 15) % 1) * 2500);
        gForce = 0.7 + Math.random() * 0.35;
        if (progress > 0.18) {
          setDrsActive(true);
          speed += 18;
        } else {
          setDrsActive(false);
        }
      }

      setTelemetry({
        speed,
        rpm,
        gear,
        throttle,
        brake,
        gForce: parseFloat(gForce.toFixed(2)),
        lapTime: Math.min(sec, 18) >= 18 ? "0:00.000" : lapTimeStr
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // Helper utility to resolve driver portraits and team colors
  const getDriverDetails = (code: string, constructorId: string, url?: string) => {
    const normalized = (code || '').toUpperCase();
    const openF1Record = openF1Map[normalized];
    
    let headshot = 'https://media.formula1.com/d_driver_fallback_image.png';
    if (openF1Record?.headshot_url) {
      headshot = openF1Record.headshot_url;
    } else if (url) {
      const parts = url.split('/wiki/');
      const title = parts.length > 1 ? parts[1] : '';
      if (title && wikiImageMap[title]) {
        headshot = wikiImageMap[title];
      }
    }
    
    return {
      headshot,
      color: openF1Record?.team_colour || CONSTRUCTOR_COLORS[constructorId] || '#94a3b8'
    };
  };

  // Active Hotspot details
  const activePartInfo = selectedPart ? PART_DETAILS[selectedPart] : null;

  return (
    <div className={`app-container bg-[#060608] text-white flex flex-col relative w-full min-h-dvh ${
      (activeTab === 'dashboard' && !isMobile) ? 'overflow-hidden' : 'overflow-y-auto'
    }`}>
      
      {/* 3D Scene Wrapper - Absolute Background */}
      <div className={`${
        isMobile && activeTab === 'dashboard' ? 'relative w-full h-[40vh] shrink-0 order-2 mt-16' : 'absolute inset-0 w-full h-full'
      } z-0`}>
        <F1Scene
          color={carColor}
          selectedPart={selectedPart}
          onSelectPart={setSelectedPart}
          drsActive={drsActive}
          rimsColor={rimsColor}
          tireCompound={tireCompound}
          rideHeight={rideHeight}
          steeringAngle={steeringAngle}
          speed={telemetry.speed}
          brake={telemetry.brake}
          throttle={telemetry.throttle}
          gForce={telemetry.gForce}
          gear={telemetry.gear}
        />
      </div>

      {/* Cinematic Fog Vignette Shader Overlay */}
      <div className={isMobile ? 'hidden' : 'absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-[#060608]/95 via-transparent to-transparent'}></div>

      {/* Premium Glassmorphic Header */}
      <header className={`f1-header w-full z-50 fixed top-0 left-0 px-4 md:px-6 h-16 flex items-center justify-between transition-all duration-300 ${
        (scrolled || mobileMenuOpen)
          ? 'backdrop-blur-xl bg-white/75 dark:bg-black/75 border-b border-border shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="header-container max-w-[1600px] mx-auto w-full flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="brand-section flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('dashboard'); setSelectedPart(null); setMobileMenuOpen(false); }}>
            <div className="f1-logo text-2xl md:text-3xl font-extrabold italic text-[#ff1801] flex items-center tracking-tighter">
              <span className="text-white font-black font-display">SF</span><span className="text-red-500 font-bold">90</span>
              <span className="text-gray-400 text-xs tracking-normal font-bold pl-3 border-l border-white/10 ml-3 not-italic uppercase font-sans hidden sm:inline-block">
                Pit-Wall Control
              </span>
            </div>
          </div>
          
          {/* Desktop Right Nav (Hidden on Mobile) */}
          <div className="flex items-center gap-4">
            
            <div className="hidden md:flex items-center gap-4">
              {/* Season Selector */}
              <select 
                className="bg-black/60 border border-white/10 text-white text-xs rounded-xl focus:ring-[#ff1801] focus:border-[#ff1801] block w-28 p-2 font-bold cursor-pointer transition-all"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="current">Current</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
                <option value="2015">2015</option>
                <option value="2010">2010</option>
                <option value="2005">2005</option>
                <option value="2000">2000</option>
              </select>

              {/* Navigation Tabs */}
              <nav className="nav-tabs flex gap-2">
                {[
                  { id: 'dashboard', label: '3D Configurator', icon: Compass },
                  { id: 'standings', label: 'Standings', icon: Trophy },
                  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
                  { id: 'results', label: 'Last Results', icon: Flag },
                  { id: 'drivers', label: 'Drivers', icon: Users }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button 
                      key={tab.id}
                      className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all ${
                        isActive 
                          ? 'bg-[#ff1801]/15 text-white border border-[#ff1801]/30 shadow-[0_0_12px_var(--f1-red-glow)]' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        if (tab.id !== 'dashboard') {
                          setSelectedPart(null);
                        }
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all pointer-events-auto shadow-sm"
              aria-label="Toggle dark/light theme"
            >
              <motion.div
                key={theme}
                initial={{ scale: 0.6, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600" />
                )}
              </motion.div>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-11 h-11 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 rounded-xl pointer-events-auto transition-all md:hidden z-50 shadow-sm"
              aria-label="Toggle navigation menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between items-center relative">
                <span className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 origin-left ${mobileMenuOpen ? 'rotate-45 translate-x-1 translate-y-px' : ''}`}></span>
                <span className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 origin-left ${mobileMenuOpen ? '-rotate-45 translate-x-1 -translate-y-px' : ''}`}></span>
              </div>
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Hamburger Dropdown Panel */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 left-0 right-0 bottom-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-2xl px-6 py-8 flex flex-col gap-6 overflow-y-auto pointer-events-auto md:hidden border-t border-border"
          >
            {/* Season Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Championship Season</label>
              <select 
                className="bg-black/60 border border-white/10 text-white text-sm rounded-xl focus:ring-[#ff1801] focus:border-[#ff1801] block w-full p-2.5 font-bold cursor-pointer transition-all"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setMobileMenuOpen(false);
                }}
              >
                <option value="current">Current</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
                <option value="2015">2015</option>
                <option value="2010">2010</option>
                <option value="2005">2005</option>
                <option value="2000">2000</option>
              </select>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-t border-white/5 pt-3">Navigation</label>
              {[
                { id: 'dashboard', label: '3D Configurator', icon: Compass },
                { id: 'standings', label: 'Standings', icon: Trophy },
                { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
                { id: 'results', label: 'Last Results', icon: Flag },
                { id: 'drivers', label: 'Drivers', icon: Users }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id}
                    className={`flex items-center gap-3 w-full px-5 py-4 text-sm font-bold rounded-2xl transition-all border pointer-events-auto ${
                      isActive 
                        ? 'bg-[#ff1801] text-white border-[#ff1801] shadow-[0_0_12px_var(--f1-red-glow)]' 
                        : 'text-text-primary bg-bg-secondary border-border hover:bg-bg-primary'
                    }`}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setMobileMenuOpen(false);
                      if (tab.id !== 'dashboard') {
                        setSelectedPart(null);
                      }
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD Navigation Hints (Only in visualizer mode) */}
      {activeTab === 'dashboard' && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none select-none text-center bg-black/60 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-3 shadow-lg">
          <span>🖱️ Left Click + Drag to Orbit</span>
          <span className="w-1 h-1 rounded-full bg-white/20"></span>
          <span>⚡ Scroll to Zoom</span>
          <span className="w-1 h-1 rounded-full bg-white/20"></span>
          <span>🎯 Target Car Parts to Focus</span>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#060608] z-50 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-white/10 border-t-[#ff1801] rounded-full animate-spin"></div>
          <p className="font-bold text-sm uppercase tracking-widest text-[#ff1801] font-mono-numbers">Connecting Pit Wall Telemetry...</p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-[#060608] z-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel glass-panel-accent p-8 text-center border border-white/10">
            <ShieldAlert className="w-12 h-12 text-[#ff1801] mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-black uppercase tracking-wider mb-2 text-white">Pitlane Data Timeout</h3>
            <p className="text-xs text-gray-400 mb-6">{error}</p>
            <button 
              className="bg-[#ff1801] hover:bg-[#b80500] text-black px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all shadow-[0_4px_15px_var(--f1-red-glow)]"
              onClick={() => window.location.reload()}
            >
              Reconnect Connection
            </button>
          </div>
        </div>
      )}

      {/* HUD & Overlays Layer */}
      <div className={`flex-1 w-full max-w-[1600px] mx-auto z-20 relative flex flex-col justify-between pointer-events-none order-3 ${
        isMobile && activeTab === 'dashboard' ? 'px-4 py-2 h-auto' : 'p-4 pt-20 md:p-6 md:pt-24'
      }`}>

        {/* Dashboard 3D HUD (Interactive Controls overlay) */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <PitWallDashboard
              telemetry={telemetry}
              carColor={carColor}
              setCarColor={setCarColor}
              rimsColor={rimsColor}
              setRimsColor={setRimsColor}
              tireCompound={tireCompound}
              setTireCompound={setTireCompound}
              drsActive={drsActive}
              setDrsActive={setDrsActive}
              rideHeight={rideHeight}
              setRideHeight={setRideHeight}
              steeringAngle={steeringAngle}
              setSteeringAngle={setSteeringAngle}
              selectedPart={selectedPart}
              activePartInfo={activePartInfo}
              setSelectedPart={setSelectedPart}
              mobilePanel={mobilePanel}
              setMobilePanel={setMobilePanel}
            />
          )}
        </AnimatePresence>

        {/* F1 Stats Overlays (Standings, Calendar, etc.) */}
        <AnimatePresence mode="wait">
          {activeTab !== 'dashboard' && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-[1400px] mx-auto pointer-events-auto mt-6 mb-6 lg:max-h-[75vh]"
            >
              {activeTab === 'standings' && (
                <StandingsTable
                  driverStandings={driverStandings}
                  constructorStandings={constructorStandings}
                  getDriverDetails={getDriverDetails}
                  onSelectDriver={setSelectedDriverId}
                  onSelectConstructor={setSelectedConstructorId}
                />
              )}

              {activeTab === 'calendar' && (
                <RaceCalendar
                  races={races}
                  onSelectRace={setSelectedRaceRound}
                />
              )}

              {activeTab === 'results' && (
                <LastResults
                  lastRaceResults={lastRaceResults}
                  getDriverDetails={getDriverDetails}
                  onSelectDriver={setSelectedDriverId}
                />
              )}

              {activeTab === 'drivers' && (
                <DriverRoster
                  driverStandings={driverStandings}
                  getDriverDetails={getDriverDetails}
                  onSelectDriver={setSelectedDriverId}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Detail Modals layer ── */}
      <AnimatePresence>
        {selectedDriverId && (
          <DriverProfileModal
            driverId={selectedDriverId}
            driverStandings={driverStandings}
            getDriverDetails={getDriverDetails}
            onClose={() => setSelectedDriverId(null)}
          />
        )}

        {selectedRaceRound && (
          <RaceDetailsModal
            round={selectedRaceRound}
            year={selectedYear}
            races={races}
            getDriverDetails={getDriverDetails}
            onClose={() => setSelectedRaceRound(null)}
          />
        )}

        {selectedConstructorId && (
          <ConstructorDetailsModal
            constructorId={selectedConstructorId}
            constructorStandings={constructorStandings}
            driverStandings={driverStandings}
            onClose={() => setSelectedConstructorId(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
