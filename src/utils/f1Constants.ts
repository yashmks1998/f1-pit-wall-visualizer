export const CHAMPIONSHIPS_MAP: Record<string, number> = {
  hamilton: 7,
  verstappen: 3,
  alonso: 2,
  norris: 1
};

export const CONSTRUCTOR_COLORS: Record<string, string> = {
  mercedes: '#27F4D2',
  ferrari: '#E8002D',
  mclaren: '#FF8000',
  red_bull: '#1E41FF',
  alpine: '#FF4B91',
  rb: '#5E81FF',
  haas: '#B6BABD',
  williams: '#00A0DE',
  audi: '#FA003F',
  aston_martin: '#006F62',
  cadillac: '#9B9B9B'
};

export const FLAG_MAP: Record<string, string> = {
  British: '🇬🇧',
  Dutch: '🇳🇱',
  Monegasque: '🇲🇨',
  Spanish: '🇪🇸',
  German: '🇩🇪',
  Italian: '🇮🇹',
  Australian: '🇦🇺',
  French: '🇫🇷',
  Japanese: '🇯🇵',
  Canadian: '🇨🇦',
  Finnish: '🇫🇮',
  Mexican: '🇲🇽',
  Chinese: '🇨🇳',
  Danish: '🇩🇰',
  American: '🇺🇸',
  Austrian: '🇦🇹',
  Swiss: '🇨🇭',
  Argentinian: '🇦🇷',
  Thai: '🇹🇭'
};

export const COLOR_PRESETS = [
  { name: 'Rosso Corsa', value: '#dc0000', desc: 'Ferrari 2019 Race Red' },
  { name: 'Scuderia White', value: '#f5f5f5', desc: 'Ferrari Nose White Accent' },
  { name: 'Giallo Modena', value: '#f4c700', desc: 'Ferrari Heritage Yellow' },
  { name: 'Nero Carbonio', value: '#151517', desc: 'Raw Carbon Weave Matte' },
  { name: 'Argento Corsa', value: '#b0b0b0', desc: 'Ferrari Silver Metallic' },
  { name: 'Championship Blue', value: '#0f1b40', desc: 'Tribute Livery Blue' }
];

export const PART_DETAILS: Record<string, { title: string; subtitle: string; description: string; stats: { label: string; value: string }[] }> = {
  aerodynamics: {
    title: "SF90 Front Aero Package",
    subtitle: "Multi-Element Front Wing + Bargeboards",
    description: "The Ferrari SF90's front wing features a complex multi-element cascade design tuned by Rory Byrne's legacy team. High-rake philosophy maximizes diffuser efficiency, generating a venturi ground effect that creates up to 1,800 kg of total downforce at full speed.",
    stats: [
      { label: "Front Wing Elements", value: "5-Element Carbon Cascade" },
      { label: "Total Downforce (350 km/h)", value: "~1,800 kg" },
      { label: "Wing Span", value: "2,000 mm (FIA Max)" }
    ]
  },
  engine: {
    title: "Ferrari 064 1.6L Power Unit",
    subtitle: "V6 Turbo + ERS Hybrid System",
    description: "The 2019 Ferrari 064 unit was widely regarded as the most powerful F1 engine of that season. Running a very high fuel-flow advantage, the unit delivered extraordinary straightline speed. Its ERS system deploys 160 bhp of additional electrical power for 33 seconds per lap.",
    stats: [
      { label: "Maximum Power Output", value: "~1,000 bhp" },
      { label: "Engine RPM Limit", value: "15,000 RPM" },
      { label: "ERS Deploy", value: "160 bhp / 33 sec" }
    ]
  },
  drs: {
    title: "DRS Rear Wing System",
    subtitle: "T-Wing + Low-Drag Rear Package",
    description: "Ferrari's 2019 low-drag rear wing package was legendary on power circuits. The DRS flap opens hydraulically at 200 km/h+ in designated zones, reducing aerodynamic drag by ~29% and granting a significant top-speed advantage over rivals — a trademark of the SF90 campaign.",
    stats: [
      { label: "Top Speed (DRS open)", value: "335 km/h (Monza)" },
      { label: "Drag Reduction", value: "~29% CD reduction" },
      { label: "DRS Actuation", value: "Hydraulic, 0.2 sec" }
    ]
  },
  cockpit: {
    title: "SF90 Carbon Monocoque",
    subtitle: "Survival Cell + Halo Safety System",
    description: "Built at Maranello from aerospace-grade T800 carbon fiber prepreg. The SF90 monocoque integrates the Halo titanium safety structure and seats drivers Sebastian Vettel and Charles Leclerc. The steering wheel alone costs $85,000 and displays 150+ live telemetry channels.",
    stats: [
      { label: "Chassis Weight", value: "~95 kg (FIA min 743 kg total)" },
      { label: "Halo Strength", value: "Withstands 125 kN load" },
      { label: "Steering Wheel", value: "$85,000 USD Carbon" }
    ]
  },
  tires: {
    title: "Pirelli P Zero Slicks",
    subtitle: "13\" → 18\" (2019 spec 13-inch)",
    description: "In 2019 Ferrari ran 13-inch Pirelli slicks. The SF90's suspension geometry was specifically tuned to make the most of the soft compound in high-speed corners. The car generated over 5G lateral load through Maggotts-Becketts and 6G under maximum braking into turn 1.",
    stats: [
      { label: "Optimal Tyre Window", value: "90°C – 110°C" },
      { label: "Max Lateral G", value: "5.5G (Silverstone S2)" },
      { label: "Tyre Pressure (Dry)", value: "20.5 – 22.0 PSI" }
    ]
  }
};
