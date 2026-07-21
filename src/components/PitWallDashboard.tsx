import { Gauge, Settings, ShieldAlert, Zap } from 'lucide-react';
import { COLOR_PRESETS } from '../utils/f1Constants';

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
}: PitWallDashboardProps) {

  // Calculate RPM LED lights count
  const maxRpm = 15000;
  const rpmPercent = Math.min(telemetry.rpm / maxRpm, 1);
  const ledCount = 10;
  const activeLeds = Math.round(rpmPercent * ledCount);

  // G-Force Coordinate Mapping (visualizing lateral g-force on a target crosshair)
  // G-Force usually peaks around 5.8G. We scale it to center (0,0) with offset.
  const gMax = 6.0;
  // Simulate lateral coordinate shifts based on g-force wave/simulation
  const gX = Math.sin(performance.now() * 0.003) * (telemetry.gForce / gMax) * 40;
  const gY = Math.cos(performance.now() * 0.003) * (telemetry.gForce / gMax) * 40;

  return (
    <div className="grid grid-cols-12 gap-6 w-full h-full flex-1 items-end pointer-events-none mt-10">
      
      {/* ── Left Column: Telemetry Console ── */}
      <div className="col-span-12 lg:col-span-4 self-end pointer-events-auto mb-4">
        <div className="glass-panel glass-panel-accent p-5 flex flex-col gap-4 border border-white/10 relative overflow-hidden">
          
          {/* Ambient red light effect */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff1801]/5 rounded-bl-full pointer-events-none"></div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-[#ff1801] animate-pulse" />
              <span className="font-bold text-xs uppercase tracking-widest text-white/70">SF90 Live Telemetry Console</span>
            </div>
            <span className="text-[9px] font-extrabold text-[#ff1801] bg-[#ff1801]/10 px-2 py-0.5 rounded border border-[#ff1801]/20 uppercase tracking-wider font-mono-numbers">
              Live Feed
            </span>
          </div>

          {/* RPM LED Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[8px] font-black uppercase text-gray-500 tracking-wider">
              <span>Engine RPM Tachometer</span>
              <span className="font-mono-numbers text-white">{telemetry.rpm.toLocaleString()} / 15,000</span>
            </div>
            <div className="flex gap-1 bg-black/40 p-1.5 rounded-lg border border-white/5">
              {Array.from({ length: ledCount }).map((_, index) => {
                const isActive = index < activeLeds;
                let ledColor = 'bg-gray-800';
                if (isActive) {
                  ledColor = index < 6 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                           : index < 8 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                           : 'bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse';
                }
                return (
                  <div key={index} className={`flex-1 h-2.5 rounded-sm transition-all duration-75 ${ledColor}`}></div>
                );
              })}
            </div>
          </div>

          {/* Gear & Speed Dashboard Layout */}
          <div className="grid grid-cols-12 gap-3 items-center border-t border-white/5 pt-3">
            {/* Big Gear Counter */}
            <div className="col-span-4 flex flex-col items-center justify-center border-r border-white/10 pr-3">
              <span className="text-5xl font-black text-white tracking-tighter font-mono-numbers leading-none drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
                {telemetry.gear}
              </span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Gear</span>
            </div>

            {/* Speed & RPM Stats */}
            <div className="col-span-8 flex flex-col gap-1 pl-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white font-mono-numbers leading-none">
                  {telemetry.speed}
                </span>
                <span className="text-[10px] font-black text-[#ff1801] uppercase tracking-widest ml-1">KM/H</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-white/5 pt-1.5">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Lap Time</span>
                <span className="text-sm font-bold text-white font-mono-numbers">{telemetry.lapTime}</span>
              </div>
            </div>
          </div>

          {/* Throttle & Brake visualizer bars */}
          <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
            <div className="grid grid-cols-12 gap-2 items-center text-[9px] font-bold uppercase tracking-wider text-gray-400">
              <span className="col-span-3 text-emerald-400 flex items-center gap-0.5">
                <Zap className="w-3 h-3" />
                THR
              </span>
              <div className="col-span-7 telemetry-bar bg-black/40 border border-white/5">
                <div className="telemetry-bar-fill-throttle" style={{ width: `${telemetry.throttle}%` }}></div>
              </div>
              <span className="col-span-2 text-right font-mono-numbers text-white">{telemetry.throttle}%</span>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center text-[9px] font-bold uppercase tracking-wider text-gray-400">
              <span className="col-span-3 text-red-500 flex items-center gap-0.5">
                <ShieldAlert className="w-3 h-3" />
                BRK
              </span>
              <div className="col-span-7 telemetry-bar bg-black/40 border border-white/5">
                <div className="telemetry-bar-fill-brake" style={{ width: `${telemetry.brake}%` }}></div>
              </div>
              <span className="col-span-2 text-right font-mono-numbers text-white">{telemetry.brake}%</span>
            </div>
          </div>

          {/* G-Force crosshair & Lateral Force Feed */}
          <div className="grid grid-cols-12 gap-3 border-t border-white/5 pt-3 items-center">
            
            {/* G-Force Crosshair bubble chart */}
            <div className="col-span-4 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-white/10 relative bg-black/40 flex items-center justify-center">
                {/* Axes */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5"></div>
                <div className="absolute left-0 right-0 top-1/2 h-px bg-white/5"></div>
                <div className="w-8 h-8 rounded-full border border-white/5 absolute"></div>
                
                {/* G-Force bubble indicator */}
                <span 
                  className="absolute w-2 h-2 rounded-full bg-[#ff1801] shadow-[0_0_8px_#ff1801] transition-all duration-75"
                  style={{ transform: `translate(${gX}px, ${gY}px)` }}
                ></span>
              </div>
            </div>

            <div className="col-span-8 flex flex-col gap-1.5 pl-2 text-left">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Lateral G-Force</span>
              <span className="text-base font-extrabold text-white font-mono-numbers">
                {telemetry.gForce} <span className="text-xs text-[#ff1801]">G</span>
              </span>
              <span className="text-[8px] text-gray-400 italic">SF90 Peak decel: 5.8G</span>
            </div>

          </div>

        </div>
      </div>

      {/* Center Spacer: empty for 3D model */}
      <div className="col-span-12 lg:col-span-4 h-1 pointer-events-none"></div>

      {/* ── Right Column: Configurator & Parts Focus ── */}
      <div className="col-span-12 lg:col-span-4 self-end pointer-events-auto flex flex-col gap-4 mb-4">
        
        {/* Active Car Component hotspot card */}
        {selectedPart && activePartInfo && (
          <div className="glass-panel p-5 border border-white/10 flex flex-col gap-3 relative overflow-hidden animate-slide-up">
            <div className="absolute top-0 right-0 p-3 z-10">
              <button 
                onClick={() => setSelectedPart(null)}
                className="text-gray-400 hover:text-white font-bold text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-2 py-0.5 rounded-md uppercase tracking-wider transition-all"
              >
                Deselect
              </button>
            </div>

            <div className="flex flex-col font-sans">
              <span className="text-[9px] font-extrabold text-[#ff1801] uppercase tracking-widest">Active Component Focus</span>
              <h4 className="text-base font-black text-white uppercase tracking-tight mt-0.5">{activePartInfo.title}</h4>
              <span className="text-[10px] font-semibold text-gray-400 italic mt-0.5">{activePartInfo.subtitle}</span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-2 text-justify">
              {activePartInfo.description}
            </p>

            <div className="flex flex-col gap-1.5 mt-1 bg-black/30 p-2.5 rounded-xl border border-white/5 font-semibold text-xs">
              {activePartInfo.stats.map(stat => (
                <div key={stat.label} className="flex justify-between items-center">
                  <span className="text-gray-400">{stat.label}</span>
                  <span className="text-white font-mono-numbers">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3D Configurator Tools */}
        <div className="glass-panel p-5 flex flex-col gap-4 border border-white/10">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <Settings className="w-5 h-5 text-[#ff1801]" />
            <span className="font-bold text-xs uppercase tracking-widest text-white/70">SF90 Configurator Panel</span>
          </div>

          {/* 1. Paint Colors */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">Livery Palette Color</label>
            <div className="flex gap-2.5 mt-1">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  className={`color-dot relative flex items-center justify-center ${carColor === preset.value ? 'active' : ''}`}
                  style={{ backgroundColor: preset.value }}
                  onClick={() => setCarColor(preset.value)}
                  title={`${preset.name}: ${preset.desc}`}
                >
                  {carColor === preset.value && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
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
            <label className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">Wheel Alloy Design</label>
            <div className="flex gap-2 mt-1">
              {[
                { id: 'black', label: 'Matte Black' },
                { id: 'chrome', label: 'Polished Chrome' },
                { id: 'accent', label: 'Livery Match' }
              ].map(rim => (
                <button
                  key={rim.id}
                  className={`visualizer-btn py-1 px-2.5 rounded-md ${rimsColor === rim.id ? 'active' : ''}`}
                  onClick={() => setRimsColor(rim.id as any)}
                >
                  {rim.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tire Compounds */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">Pirelli Compound Specs</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                { id: 'soft', label: '🔴 Soft' },
                { id: 'medium', label: '🟡 Medium' },
                { id: 'hard', label: '⚪ Hard' },
                { id: 'intermediate', label: '🟢 Inter' },
                { id: 'wet', label: '🔵 Wet' }
              ].map(comp => (
                <button
                  key={comp.id}
                  className={`visualizer-btn py-1 px-2 rounded-md ${tireCompound === comp.id ? 'active' : ''}`}
                  onClick={() => setTireCompound(comp.id as any)}
                >
                  {comp.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. DRAG REDUCTION SYSTEM (DRS) */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">DRS Rear Wing Flap</span>
              <span className="text-[10px] text-gray-500 italic mt-0.5">Hydraulic wing override</span>
            </div>
            <button
              className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-widest font-black border transition-all ${
                drsActive 
                  ? 'bg-[#ff1801] border-[#ff1801] text-black shadow-[0_0_12px_var(--f1-red-glow)]' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
              }`}
              onClick={() => setDrsActive(!drsActive)}
            >
              {drsActive ? 'DRS: Open' : 'DRS: Closed'}
            </button>
          </div>

          {/* 5. NEW: Ride Height Slider */}
          <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
            <div className="flex justify-between items-center text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
              <span>Suspension Ride Height</span>
              <span className="font-mono-numbers text-white">{rideHeight > 0 ? `+${(rideHeight * 1000).toFixed(0)}` : (rideHeight * 1000).toFixed(0)} mm</span>
            </div>
            <input 
              type="range" 
              min="-0.03" 
              max="0.03" 
              step="0.005"
              value={rideHeight}
              onChange={(e) => setRideHeight(parseFloat(e.target.value))}
              className="w-full accent-[#ff1801] bg-black/40 h-1.5 rounded-lg cursor-pointer border border-white/5"
            />
          </div>

          {/* 6. NEW: Steering Angle Slider */}
          <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
            <div className="flex justify-between items-center text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
              <span>Front Wheel Steering</span>
              <span className="font-mono-numbers text-white">{steeringAngle > 0 ? `+${steeringAngle}` : steeringAngle}°</span>
            </div>
            <input 
              type="range" 
              min="-25" 
              max="25" 
              step="2"
              value={steeringAngle}
              onChange={(e) => setSteeringAngle(parseInt(e.target.value))}
              className="w-full accent-[#ff1801] bg-black/40 h-1.5 rounded-lg cursor-pointer border border-white/5"
            />
          </div>

        </div>

      </div>
    </div>
  );
}
