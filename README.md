# LADAKH-SHIELD 🏔️⚡
### High-Altitude Electronic System Monitoring & Protection Cockpit

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.1-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.16-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Universal Smart Protection & Monitoring Cockpit for Extreme High-Altitude Systems**  
> **Core Pipeline:** Sense (BME280 + INA219) → Analyze (Deterministic Rule Engine) → Protect (Closed-Loop Actuators) → Alert (Piezo + LoRa) → Record (MicroSD Blackbox)

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher

### Installation & Launch

1. **Extract the ZIP file** to your preferred folder:
   ```bash
   cd ladakh-shield
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/` to view the cockpit application.

4. **Production Build & Preview (Optional)**:
   ```bash
   # Build optimized production bundle
   npm run build

   # Preview the production build locally
   npm run preview
   ```

---

## 🎨 Dual Theme System (Dark & Light)

LADAKH-SHIELD features a fully responsive, high-contrast dual theme system:

- **Dark Theme (High-Altitude Military-Tech - Default)**:
  - Background: `#07111F` (Deep Navy)
  - Secondary: `#0D1B2A` | Cards: `#12263A`
  - Accents: `#00D9FF` (Ice Cyan) + `#00FF9C` (Safety Green)
  - Text: `#F5F7FA` | Muted: `#8FA3B8` | Borders: `#1E4055`
  - Warning: `#FFB020` | Critical: `#FF4D4D`

- **Light Theme (Arctic Snow & Daylight Operations)**:
  - Background: `#F1F5F9` (Arctic Snow)
  - Secondary: `#E2E8F0` | Cards: `#FFFFFF` (Pure White)
  - Accents: `#0284C7` (Sky Cyan) + `#059669` (Signal Green)
  - Text: `#0F172A` | Muted: `#64748B` | Borders: `#CBD5E1`
  - Warning: `#D97706` | Critical: `#DC2626`

**Toggle Options**:
1. **1-Click Sun ☀️ / Moon 🌙 Toggle** in the top header bar.
2. **Palette Button Modal** with segmented switch and side-by-side preview cards.
3. **Settings > Appearance** tab with detailed palette swatches.

---

## 🎛️ Navigation & Views

1. **Dashboard (`DashboardView.tsx`)**:
   - Live BME280 telemetry (Temperature, Barometric Pressure, Relative Humidity) with sparklines.
   - INA219 power telemetry (Bus Voltage, Load Current, Dissipated Power `V × A = 32.24W`, Battery SOC & Autonomy).
   - Equipment Health Matrix for 5 defense platforms (**Drone, Radar, Radio, Computer, Battery**).
   - Autonomous Rule Engine evaluating real-time risk scores and recommended actions.

2. **Sensors (`SensorsView.tsx`)**:
   - 6 high-frequency dynamic charts (Temperature, Pressure, Humidity, Voltage, Current, Power).
   - Time filters (`1H`, `6H`, `24H`, `7D`).
   - Recharts charts dynamically styled using theme CSS variables.

3. **Equipment (`EquipmentView.tsx`)**:
   - Centralized status monitoring for:
     - 🚁 **UAV Recon Quadcopter**: Motor load, airfoil icing risk, ESC temperature.
     - 📡 **Surveillance Radar**: Radome heater status, RF output power, convective derating.
     - 📻 **Tactical Radio / Repeater**: LoRa link, RSSI (-88 dBm), SNR (+7.5 dB).
     - 💻 **Tactical Edge Compute Unit**: CPU clock, thermal throttling percent, cold boot heater state.
     - 🔋 **Cold-Barrier Battery Power Bank**: State of charge (SOC), cell balance spread.

4. **Communication (`CommunicationView.tsx`)**:
   - Semtech SX1278 LoRa 433MHz telemetry link monitoring.
   - Real-time packet inspector with hex payload and CRC verification.
   - Interactive system communication topology visualization.

5. **Adaptive Protection (`ProtectionView.tsx`)**:
   - Closed-loop actuators with `AUTO` / `MANUAL` switching:
     - 🔥 **PTC Silicone Heater Pad**: Anti-freeze warming with hysteresis.
     - ❄️ **Brushless Maglev Cooling Fan**: Convective cooling assist in thin air (58 kPa).
     - ⚡ **Solid-State MOSFET Breaker**: Overcurrent cutoff trip (3.5A limit) with manual reset.
     - 🚨 **Emergency System Isolation**: Armed safety interlock.
   - **System Test / Scenario Evaluation Bench**:
     - Pre-configured evaluation tests: Extreme Cold, High Temperature, Low Pressure, Low Battery, Overcurrent, Communication Failure.

6. **Data Logs (`DataLogsView.tsx`)**:
   - Tabular real-time event logs with search, pagination, and multi-filter criteria.
   - MicroSD 32GB Blackbox storage capacity monitor and write speed indicator.
   - Direct CSV and JSON telemetry export buttons.

7. **Alerts Center (`AlertsView.tsx`)**:
   - Prioritized notification stream (CRITICAL, WARNING, INFO) with acknowledge & clear actions.
   - Synthesized Web Audio API piezo buzzer sound with mute/unmute control.

8. **Settings (`SettingsView.tsx`)**:
   - Appearance theme customization.
   - Autonomous rule engine threshold calibration (EEPROM persistence simulation).
   - ESP32 REST API endpoint and MySQL backend configuration.

---

## 📁 Project Structure

```
ladakh-shield/
├── package.json                   # Project dependencies and npm scripts
├── package-lock.json              # Exact dependency lockfile
├── index.html                     # Application HTML entry point
├── vite.config.ts                 # Vite bundler configuration
├── tsconfig.json                  # TypeScript compiler configuration
├── tailwind.config.js             # Tailwind CSS design system configuration
├── postcss.config.js              # PostCSS plugins configuration
├── LADAKH_SHIELD_DIAGNOSTIC.json  # Comprehensive diagnostic telemetry dataset
├── README.md                      # Project documentation and setup guide
├── public/                        # Static assets served at root
│   ├── vite.svg                   # Ladakh Shield high-altitude crest icon
│   └── assets/
│       ├── shield-logo.svg        # Scalable vector logo
│       └── LADAKH_SHIELD_DIAGNOSTIC.json
├── src/
│   ├── main.tsx                   # React root entry point
│   ├── App.tsx                    # Main layout, router & navigation tabs
│   ├── components/
│   │   ├── common/                # Header, Navigation, Modals, Footer
│   │   └── views/                 # 8 primary application views
│   ├── context/
│   │   ├── TelemetryContext.tsx   # Real-time state, sensors, logs, tests
│   │   └── ThemeContext.tsx       # Dark & Light theme state & toggles
│   ├── services/
│   │   ├── simulationEngine.ts    # High-altitude telemetry simulation
│   │   ├── scenarioTester.ts      # Scenario evaluation bench engine
│   │   ├── ruleEngine.ts          # Deterministic risk evaluation rules
│   │   ├── audioService.ts        # Web Audio piezo buzzer synthesizer
│   │   └── apiService.ts          # ESP32 REST API service layer
│   ├── styles/
│   │   └── index.css              # Theme CSS variables & HUD styles
│   └── types/
│       ├── telemetry.ts           # Sensor, equipment, log type definitions
│       ├── protection.ts          # Actuators and scenario types
│       └── theme.ts               # Theme definitions and color tokens
└── firmware/                      # ESP32 C++ firmware prototype reference
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
