import { useEffect } from 'react';
import { Gauge, Settings, ShieldAlert, Zap, X } from 'lucide-react';
import { COLOR_PRESETS } from '../utils/f1Constants';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';

interface Telemetry {
  speed: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
  gForce: number;
  lapTime: string;
}

interface PitWallDashboardProps {
  // Telemetry
  telemetry: Telemetry;
  // Car config states
  carColor: string;
  setCarColor: (val: string) => void;
  rimsColor: 'black' | 'chrome' | 'accent';
  setRimsColor: (val: 'black' | 'chrome' | 'accent') => void;
  tireCompound: 'soft' | 'medium' | 'hard' | 'intermediate' | 'wet';
  setTireCompound: (val: 'soft' | 'medium' | 'hard' | 'intermediate' | 'wet') => void;
  drsActive: boolean;
  setDrsActive: (val: boolean) => void;
  // New configurator sliders
  rideHeight: number;
  setRideHeight: (val: number) => void;
  steeringAngle: number;
  setSteeringAngle: (val: number) => void;
  // Parts info
  selectedPart: string | null;
  activePartInfo: {
    title: string;
    subtitle: string;
    description: string;
    stats: { label: string; value: string }[];
  } | null;
  setSelectedPart: (val: string | null) => void;
  // Mobile drawer controls
  mobilePanel: 'none' | 'telemetry' | 'configurator';
  setMobilePanel: (val: 'none' | 'telemetry' | 'configurator') => void;
}

export function PitWallDashboard({
  telemetry,
  carColor,
  setCarColor,
  rimsColor,
  setRimsColor,
  tireCompound,
  setTireCompound,
  drsActive,
  setDrsActive,
  rideHeight,
  setRideHeight,
  steeringAngle,
  setSteeringAngle,
  selectedPart,
  activePartInfo,
  setSelectedPart,
  mobilePanel,
  setMobilePanel,
}: PitWallDashboardProps) {

  const isMobile = useMediaQuery('(max-width: 768px)');

  // Auto-open configurator drawer on mobile when a hotspot is tapped
  useEffect(() => {
    if (selectedPart && isMobile) {
      setMobilePanel('configurator');
    }
  }, [selectedPart, isMobile, setMobilePanel]);

  // Calculate RPM LED lights count
  const maxRpm = 15000;
  const rpmPercent = Math.min(telemetry.rpm / maxRpm, 1);
  const ledCount = 10;
  const activeLeds = Math.round(rpmPercent * ledCount);

  // G-Force Coordinate Mapping
  const gMax = 6.0;
  const gX = Math.sin(performance.now() * 0.003) * (telemetry.gForce / gMax) * 20;
  const gY = Math.cos(performance.now() * 0.003) * (telemetry.gForce / gMax) * 20;

  // 1. Engine Tachometer Card
  const renderRpmCard = () => (
    <div className="glass-panel border border-border p-5 rounded-2xl bg-white/70 dark:bg-black/70 shadow-sm backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-[150px]">
      <div className="flex justify-between items-center text-[10px] font-black uppercase text-text-secondary tracking-widest border-b border-border pb-1.5">
        <span>Engine RPM</span>
        <span className="font-mono-numbers text-text-primary">{telemetry.rpm.toLocaleString()}</span>
      </div>
      <div className="flex gap-1 bg-bg-primary p-2 rounded-full border border-border my-1">
        {Array.from({ length: ledCount }).map((_, index) => {
          const isActive = index < activeLeds;
          let ledColor = 'bg-border/30 dark:bg-border/20';
          if (isActive) {
            ledColor = index < 6 ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]'
                     : index < 8 ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.4)]'
                     : 'bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse';
          }
          return (
            <div key={index} className={`flex-1 h-1.5 rounded-full transition-all duration-75 ${ledColor}`}></div>
          );
        })}
      </div>
      <div className="text-[10px] text-text-secondary flex justify-between items-center mt-1 border-t border-border/40 pt-1.5">
        <span>Limit</span>
        <span className="font-semibold font-mono-numbers">15,000 RPM</span>
      </div>
    </div>
  );

  // 2. Speed & Gear Card
  const renderSpeedGearCard = () => (
    <div className="glass-panel border border-border p-5 rounded-2xl bg-white/70 dark:bg-black/70 shadow-sm backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-[150px]">
      <div className="flex justify-between items-center text-[10px] font-black uppercase text-text-secondary tracking-widest border-b border-border pb-1.5">
        <span>Gear & Speed</span>
        <span className="font-mono-numbers text-[#ff1801] font-extrabold uppercase text-[8px]">Live</span>
      </div>
      <div className="flex justify-around items-center py-1">
        {/* Gear */}
        <div className="flex flex-col items-center justify-center">
          <span className="font-black text-text-primary tracking-tighter font-mono-numbers leading-none" style={{ fontSize: 'clamp(2rem, 5vw, 2.6rem)' }}>
            {telemetry.gear}
          </span>
          <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest mt-0.5">Gear</span>
        </div>
        <div className="h-8 w-px bg-border"></div>
        {/* Speed */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            <span className="font-black text-text-primary font-mono-numbers leading-none" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}>
              {telemetry.speed}
            </span>
            <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest">KM/H</span>
          </div>
          <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest mt-0.5">Speed</span>
        </div>
      </div>
      <div className="text-[10px] text-text-secondary border-t border-border pt-1.5 flex justify-between items-center">
        <span>Lap Time</span>
        <span className="font-mono-numbers text-text-primary font-bold">{telemetry.lapTime}</span>
      </div>
    </div>
  );

  // 3. Throttle & Brake Card
  const renderPedalsCard = () => (
    <div className="glass-panel border border-border p-5 rounded-2xl bg-white/70 dark:bg-black/70 shadow-sm backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-[150px]">
      <div className="flex justify-between items-center text-[10px] font-black uppercase text-text-secondary tracking-widest border-b border-border pb-1.5">
        <span>Pedal Inputs</span>
        <span className="font-mono-numbers text-text-secondary text-[8px]">Controls</span>
      </div>
      <div className="flex flex-col gap-2.5 py-1">
        {/* Throttle */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-text-secondary">
            <span className="text-emerald-500 flex items-center gap-0.5"><Zap className="w-3 h-3" /> THR</span>
            <span className="font-mono-numbers text-text-primary">{telemetry.throttle}%</span>
          </div>
          <div className="h-1.5 bg-bg-primary border border-border rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-75" style={{ width: `${telemetry.throttle}%` }}></div>
          </div>
        </div>
        {/* Brake */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-text-secondary">
            <span className="text-red-500 flex items-center gap-0.5"><ShieldAlert className="w-3 h-3" /> BRK</span>
            <span className="font-mono-numbers text-text-primary">{telemetry.brake}%</span>
          </div>
          <div className="h-1.5 bg-bg-primary border border-border rounded-full overflow-hidden">
            <div className="h-full bg-red-600 rounded-full transition-all duration-75" style={{ width: `${telemetry.brake}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. G-Force Card
  const renderGForceCard = () => (
    <div className="glass-panel border border-border p-5 rounded-2xl bg-white/70 dark:bg-black/70 shadow-sm backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-[150px]">
      <div className="flex justify-between items-center text-[10px] font-black uppercase text-text-secondary tracking-widest border-b border-border pb-1.5">
        <span>G-Force Vector</span>
        <span className="font-mono-numbers text-text-primary">{telemetry.gForce}G</span>
      </div>
      <div className="flex items-center gap-4 py-1">
        <div className="w-12 h-12 rounded-full border border-border relative bg-bg-primary flex items-center justify-center shrink-0">
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border"></div>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-border"></div>
          <div className="w-6 h-6 rounded-full border border-border absolute"></div>
          <span 
            className="absolute w-2 h-2 rounded-full bg-[#ff1801] shadow-[0_0_6px_#ff1801] transition-all duration-75"
            style={{ transform: `translate(${gX}px, ${gY}px)` }}
          ></span>
        </div>
        <div className="flex flex-col text-left font-sans">
          <span className="text-[8px] font-bold text-text-secondary uppercase tracking-widest">Lateral Peak</span>
          <span className="text-xs font-extrabold text-text-primary mt-0.5">5.8G Limit</span>
        </div>
      </div>
      <div className="text-[8px] text-text-secondary border-t border-border pt-1.5">
        SF90 Stradale active lateral telemetry
      </div>
    </div>
  );

  // Render Telemetry Module
  const renderTelemetry = () => (
    <div className="flex flex-col gap-4 w-full">
      {renderRpmCard()}
      {renderSpeedGearCard()}
      {renderPedalsCard()}
      {renderGForceCard()}
    </div>
  );

  // Render Configurator Module
  const renderConfigurator = () => (
    <div className="glass-panel border border-border p-6 flex flex-col gap-5 bg-white/70 dark:bg-black/70 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Settings className="w-4 h-4 text-[#ff1801]" />
        <span className="font-extrabold text-xs uppercase tracking-widest text-text-primary">Configurator Panel</span>
      </div>

      {/* 1. Paint Colors */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-extrabold text-text-secondary uppercase tracking-widest">Livery Color</label>
        <div className="flex gap-2.5 mt-1">
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              className={`w-8 h-8 rounded-full relative flex items-center justify-center transition-all border border-border hover:scale-105 active:scale-95 ${
                carColor === preset.value ? 'ring-2 ring-[#ff1801] ring-offset-2 dark:ring-offset-black scale-105 shadow-sm' : ''
              }`}
              style={{ backgroundColor: preset.value }}
              onClick={() => setCarColor(preset.value)}
              title={`${preset.name}: ${preset.desc}`}
            >
              {carColor === preset.value && (
                <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm"></span>
              )}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-[#ff1801] font-semibold italic mt-0.5">
          {COLOR_PRESETS.find(p => p.value === carColor)?.name || 'Custom'} — {COLOR_PRESETS.find(p => p.value === carColor)?.desc || 'Tuned Color'}
        </span>
      </div>

      {/* 2. Rims & Alloys */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-extrabold text-text-secondary uppercase tracking-widest">Wheel Alloy Design</label>
        <div className="bg-bg-primary border border-border p-1 rounded-full flex gap-1 w-full">
          {[
            { id: 'black', label: 'Matte Black' },
            { id: 'chrome', label: 'Chrome' },
            { id: 'accent', label: 'Livery Match' }
          ].map(rim => (
            <button
              key={rim.id}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
                rimsColor === rim.id 
                  ? 'bg-[#ff1801] text-white shadow-sm font-bold' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setRimsColor(rim.id as any)}
            >
              {rim.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tire Compounds */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-extrabold text-text-secondary uppercase tracking-widest">Pirelli Compound Specs</label>
        <div className="bg-bg-primary border border-border p-1 rounded-2xl flex flex-wrap gap-1 w-full">
          {[
            { id: 'soft', label: '🔴 Soft' },
            { id: 'medium', label: '🟡 Med' },
            { id: 'hard', label: '⚪ Hard' },
            { id: 'intermediate', label: '🟢 Inter' },
            { id: 'wet', label: '🔵 Wet' }
          ].map(comp => (
            <button
              key={comp.id}
              className={`flex-1 text-center py-2 px-1 text-xs font-semibold rounded-xl transition-all duration-200 min-w-[55px] ${
                tireCompound === comp.id 
                  ? 'bg-[#ff1801] text-white shadow-sm font-bold' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setTireCompound(comp.id as any)}
            >
              {comp.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. DRAG REDUCTION SYSTEM (DRS) */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex flex-col">
          <span className="text-[9px] font-extrabold text-text-secondary uppercase tracking-widest">DRS Rear Wing Flap</span>
          <span className="text-[10px] text-text-secondary italic mt-0.5">Hydraulic wing override</span>
        </div>
        <button
          className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-black border transition-all ${
            drsActive 
              ? 'bg-[#ff1801] border-[#ff1801] text-white shadow-sm' 
              : 'bg-bg-primary border-border text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setDrsActive(!drsActive)}
        >
          {drsActive ? 'DRS: Open' : 'DRS: Closed'}
        </button>
      </div>

      {/* 5. Ride Height Slider */}
      <div className="flex flex-col gap-1 border-t border-border pt-3">
        <div className="flex justify-between items-center text-[9px] font-extrabold text-text-secondary uppercase tracking-widest">
          <span>Suspension Ride Height</span>
          <span className="font-mono-numbers text-text-primary">{rideHeight > 0 ? `+${(rideHeight * 1000).toFixed(0)}` : (rideHeight * 1000).toFixed(0)} mm</span>
        </div>
        <input 
          type="range" 
          min="-0.03" 
          max="0.03" 
          step="0.005"
          value={rideHeight}
          onChange={(e) => setRideHeight(parseFloat(e.target.value))}
          className="w-full accent-[#ff1801] bg-bg-primary h-2 rounded-full cursor-pointer border border-border"
        />
      </div>

      {/* 6. Steering Angle Slider */}
      <div className="flex flex-col gap-1 border-t border-border pt-3">
        <div className="flex justify-between items-center text-[9px] font-extrabold text-text-secondary uppercase tracking-widest">
          <span>Front Wheel Steering</span>
          <span className="font-mono-numbers text-text-primary">{steeringAngle > 0 ? `+${steeringAngle}` : steeringAngle}°</span>
        </div>
        <input 
          type="range" 
          min="-25" 
          max="25" 
          step="2"
          value={steeringAngle}
          onChange={(e) => setSteeringAngle(parseInt(e.target.value))}
          className="w-full accent-[#ff1801] bg-bg-primary h-2 rounded-full cursor-pointer border border-border"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Dashboard Grid (Screens >= 768px) */}
      {!isMobile && (
        <div className="grid grid-cols-12 gap-6 w-full h-full flex-1 items-end pointer-events-none mt-10">
          {/* Left/Bottom Column: Live Telemetry Instrument Cluster */}
          <div className="col-span-12 xl:col-span-8 self-end pointer-events-auto mb-4 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {renderRpmCard()}
              {renderSpeedGearCard()}
              {renderPedalsCard()}
              {renderGForceCard()}
            </div>
          </div>

          {/* Right Column: Configurator Panel */}
          <div className="col-span-12 xl:col-span-4 self-end pointer-events-auto flex flex-col gap-4 mb-4 animate-slide-up">
            {/* Component focused card */}
            {selectedPart && activePartInfo && (
              <div className="glass-panel p-5 border border-border flex flex-col gap-3 relative overflow-hidden bg-white/70 dark:bg-black/70 shadow-sm backdrop-blur-md">
                <div className="absolute top-0 right-0 p-3 z-10">
                  <button 
                    onClick={() => setSelectedPart(null)}
                    className="text-text-secondary hover:text-text-primary font-bold text-[9px] bg-bg-primary border border-border px-2 py-0.5 rounded-md uppercase tracking-wider transition-all"
                  >
                    Deselect
                  </button>
                </div>

                <div className="flex flex-col font-sans">
                  <span className="text-[9px] font-extrabold text-[#ff1801] uppercase tracking-widest">Active Component Focus</span>
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-tight mt-0.5">{activePartInfo.title}</h4>
                  <span className="text-[10px] font-semibold text-text-secondary italic mt-0.5">{activePartInfo.subtitle}</span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed border-t border-border pt-2 text-justify">
                  {activePartInfo.description}
                </p>

                <div className="flex flex-col gap-1.5 mt-1 bg-bg-primary p-2.5 rounded-xl border border-border font-semibold text-xs text-text-primary">
                  {activePartInfo.stats.map(stat => (
                    <div key={stat.label} className="flex justify-between items-center">
                      <span className="text-text-secondary">{stat.label}</span>
                      <span className="font-mono-numbers">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {renderConfigurator()}
          </div>
        </div>
      )}

      {/* Mobile Floating Action Controls Trigger (Screens < 768px) */}
      {isMobile && (
        <>
          {/* Active Car Component hotspot card floating at the top of the canvas */}
          {selectedPart && activePartInfo && (
            <div className="fixed top-28 left-4 right-4 z-40 bg-white/95 dark:bg-black/95 border border-border p-4 rounded-2xl shadow-lg backdrop-blur-md pointer-events-auto flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[9px] font-extrabold text-[#ff1801] uppercase tracking-widest">Component Focus</span>
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-tight mt-0.5">{activePartInfo.title}</h4>
                </div>
                <button 
                  onClick={() => setSelectedPart(null)}
                  className="p-1 hover:bg-bg-primary border border-border rounded-full transition-all"
                  aria-label="Dismiss component details"
                >
                  <X className="w-3.5 h-3.5 text-text-secondary" />
                </button>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed border-t border-border pt-2 text-justify">
                {activePartInfo.description}
              </p>
            </div>
          )}

          {/* Floating Pill Buttons */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-40 pointer-events-auto select-none animate-slide-up">
            <button
              onClick={() => setMobilePanel(mobilePanel === 'telemetry' ? 'none' : 'telemetry')}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs uppercase tracking-widest font-black border transition-all ${
                mobilePanel === 'telemetry'
                  ? 'bg-[#ff1801] border-[#ff1801] text-white shadow-lg'
                  : 'bg-white/95 dark:bg-black/95 text-text-primary border-border shadow-md backdrop-blur-md hover:bg-bg-primary'
              }`}
            >
              <Gauge className="w-4 h-4 animate-pulse" />
              <span>Telemetry</span>
            </button>
            <button
              onClick={() => setMobilePanel(mobilePanel === 'configurator' ? 'none' : 'configurator')}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs uppercase tracking-widest font-black border transition-all ${
                mobilePanel === 'configurator'
                  ? 'bg-[#ff1801] border-[#ff1801] text-white shadow-lg'
                  : 'bg-white/95 dark:bg-black/95 text-text-primary border-border shadow-md backdrop-blur-md hover:bg-bg-primary'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configure</span>
            </button>
          </div>

          {/* Mobile Telemetry Drawer */}
          <AnimatePresence>
            {mobilePanel === 'telemetry' && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#000000]/95 border-t border-border rounded-t-3xl p-5 pb-20 shadow-2xl backdrop-blur-2xl max-h-[75dvh] overflow-y-auto pointer-events-auto"
              >
                <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setMobilePanel('none')}></div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-extrabold text-sm uppercase tracking-widest text-[#ff1801]">Telemetry Link</span>
                  <button onClick={() => setMobilePanel('none')} className="p-1 bg-bg-primary border border-border rounded-full transition-all">
                    <X className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>
                {renderTelemetry()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Configurator Drawer */}
          <AnimatePresence>
            {mobilePanel === 'configurator' && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#000000]/95 border-t border-border rounded-t-3xl p-5 pb-20 shadow-2xl backdrop-blur-2xl max-h-[80dvh] overflow-y-auto pointer-events-auto"
              >
                <div className="w-12 h-1 bg-border rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setMobilePanel('none')}></div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-extrabold text-sm uppercase tracking-widest text-[#ff1801]">SF90 Control Panel</span>
                  <button onClick={() => setMobilePanel('none')} className="p-1 bg-bg-primary border border-border rounded-full transition-all">
                    <X className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>
                {renderConfigurator()}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}
