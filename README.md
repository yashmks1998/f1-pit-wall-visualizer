# F1 SF90 Pit-Wall Telemetry Visualizer 🏎️📊

A premium, interactive, and data-rich Formula 1 visualizer dashboard. Built around the 2019 Ferrari SF90 chassis, the application combines advanced 3D WebGL rendering with live-sim telemetry dashboards and official F1 championship data.

---

## 🌟 Key Features

### 1. Interactive 3D Configurator
* **Livery Customization**: Dynamic paint presets (e.g. Rosso Corsa, Giallo Modena, Matte Carbon).
* **Alloy Rims**: Toggle alloy alloy styles (Matte Black, Polished Chrome, Accent Matching).
* **Steering & suspension Controls**: Adjust steering angles (-25° to +25°) and ride heights (-30mm to +30mm) in real-time.
* **DRS (Drag Reduction System)**: Manual hydraulic wing flap toggle with dynamic mesh adjustments.
* **Tyre Compounds**: Select between Pirelli Soft, Medium, Hard, Intermediate, and Wet configurations with matching brake caliper color codes.

### 2. Collapsible Pit-Wall Telemetry Dashboard
* **Gear Display**: Massive, high-visibility current gear counter.
* **RPM Tachometer**: Custom LED shift bar redlining at 12,000+ RPM.
* **Speedometer**: Live digital output scaling to over 335 KM/H.
* **Dynamic G-Force Plotter**: Crosshair plotting lateral acceleration and braking loads.
* **Throttle & Brake Feeds**: Real-time slider bars depicting simulated driver inputs.

### 3. Integrated F1 Standings & Modals
* **Standings Tables**: Clickable Driver and Constructor standing boards with custom team-color neon indicators.
* **Official Calendars**: Completed vs. upcoming round schedules, featuring localized date-times and dynamic countdown timers.
* **Wikipedia REST API Integration**: Detailed biographies and circuit details fetched dynamically.
* **Roster grid**: Cards presenting championship points, career titles, and nationality flags.

---

## 🛠️ Technology Stack

* **Framework**: [React 18](https://react.dev/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **3D Renderer**: [Three.js](https://threejs.org/) via [React Three Fiber (R3F)](https://r3.docs.pmnd.rs/getting-started/introduction)
* **3D Utilities**: [@react-three/drei](https://github.com/pmndrs/drei) (OrbitControls, Environment mapping, Shadow maps)
* **Visual Effects**: [@react-three/postprocessing](https://github.com/pmndrs/postprocessing) (Cinematic bloom, vignette, chromatic aberration)
* **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid modals and tab transitions
* **Design & Layout**: [Tailwind CSS](https://tailwindcss.com/) + custom CSS variables
* **Data Sources**: [Jolpica Ergast API](https://api.jolpi.ca/) (standing logs) + [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) (live bios)

---

## 🛠️ Setup & Execution

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Run Local Development Server
Start the Vite development build:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 3. Build for Production
Bundle the assets for high-performance builds:
```bash
npm run build
```

---

## 📦 Deployment to GitHub Pages

The application is pre-configured for publishing to GitHub Pages using relative build paths.

1. **Add Remote GitHub Origin** (replace with your repository details):
```bash
git remote add origin https://github.com/yashmks1998/YOUR_REPO_NAME.git
```

2. **Trigger Deployment**:
```bash
npm run deploy
```
*Note: This will automatically build your project and push the output files to the `gh-pages` branch.*
