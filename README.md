# LADAKH-SHIELD 🏔️⚡
### Universal Smart Protection & Monitoring System for High-Altitude Equipment

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Prototype](https://img.shields.io/badge/Status-Prototype%20v1.0-cyan.svg)](#)
[![Simulation: Ready](https://img.shields.io/badge/Simulation-Bench%20Ready-emerald.svg)](#)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-brightgreen.svg)](#how-to-deploy-on-github-pages)

> **Tagline:** Universal Smart Protection & Monitoring System for High-Altitude Equipment  
> **Core Pipeline:** Sense → Analyze → Protect → Alert → Record

---

## ⚠️ Prototype & Ethics Disclaimer
**LADAKH-SHIELD** is an undergraduate student innovation and research prototype.
* **No Real-World Deployment Claims**: This system is **not** currently deployed in Ladakh, DRDO facilities, military installations, or active defense zones.
* **Simulated Demo Data**: The live dashboard on the public website runs an interactive **Simulated Demo Stream** with realistic high-altitude parameters, designed for bench testing, algorithmic validation, and presentation demonstrations.
* **Clear Distinction**: All documentation strictly differentiates between laboratory bench prototypes, simulated testbed data, proposed production capabilities, and chamber testing.

---

## 📖 Project Overview
High-altitude mountainous environments (such as the Ladakh plateau at 3,000m to 5,500m MSL) present extreme physical stresses to critical electrical and electronic systems:
- Sub-zero freezing temperatures down to **-40°C**
- Depressed atmospheric pressure (**50 to 70 kPa**), which reduces convective cooling efficiency
- Severe Li-ion battery capacity loss and cold-charging hazards
- Diurnal thermal cycling inducing solder joint and PCB stress
- RF communication attenuation and antenna icing
- Drone motor strain and lift reduction in thin air

**LADAKH-SHIELD** is a unified, modular protection and monitoring platform that continuously evaluates environmental and electrical parameters, making autonomous decisions via an on-board ESP32 controller to actuate heating pads, cooling fans, and multi-tier alerts to extend equipment operational life.

---

## 🚀 Key Features

1. **Sense (High-Frequency Multi-Sensor Acquisition)**:
   - Bosch BME280: Ambient temperature, barometric pressure, relative humidity.
   - TI INA219 / INA226: High-side bus voltage, current draw, power dissipation.
2. **Analyze (Edge Logic & Hysteresis Engine)**:
   - ESP32 Dual-Core Xtensa MCU running FreeRTOS.
   - Dynamic safety envelopes with hysteresis to eliminate rapid switching oscillations.
3. **Protect (Closed-Loop Actuation)**:
   - Logic-level N-channel MOSFET switching stages.
   - PTC Silicone Heating Pad for sub-zero anti-freeze warming.
   - High-RPM brushless cooling fan for forced convective heat removal in thin air.
4. **Alert (Defense-in-Depth Redundancy)**:
   - 0.96" OLED display for local metrics.
   - High-visibility status LEDs (Green/Red) and 85dB active piezo buzzer.
   - Long-range Semtech SX1278 LoRa telemetry beacon (433/868 MHz).
5. **Record (Blackbox Persistence)**:
   - High-speed SPI MicroSD card module saving timestamped CSV records and fault snapshots.

---

## 🎛️ Equipment Support Matrix
LADAKH-SHIELD is designed with a universal sensing core that interfaces with:
* 🚁 **UAV / Drones**: Flight battery thermal conditioning, ESC current surge protection, thin-air lift stress logging.
* 📡 **Radar Enclosures**: Convective cooling assistance, radome frost prevention, power stability.
* 📻 **Communication Stations**: Remote repeater health, RF amplifier thermal stability, solar-battery conditioning.
* 💻 **Field Computers / Servers**: Tactical edge AI units, condensation mitigation during startup cycles.
* 🔋 **Battery Storage & Power Banks**: Pre-charge thermal barrier management, over-current cutoff.

---

## 🛠️ Hardware Bill of Materials (BOM)

| Component | Function / Role | Interface | Operating Specs |
| :--- | :--- | :--- | :--- |
| **ESP32 NodeMCU** | Central Controller & Decision Logic | GPIO / I2C / SPI | Dual-Core 240MHz, 520KB SRAM |
| **BME280** | Temperature, Pressure, Humidity | I2C (0x76) | -40°C to +85°C, 300 to 1100 hPa |
| **INA219 / INA226** | Voltage, Current & Power Sensing | I2C (0x40) | 0–26V bus, up to 3.2A (extendable via shunt) |
| **MOSFET Module** | Power Actuator Switching | PWM / Digital Out | 30V / 10A Logic-Level N-Channel |
| **PTC Heating Pad** | Cold-Condition Thermal Barrier | 12V DC Rail | 12V 15W–30W Flexible Silicone |
| **Cooling Fan** | Forced Air Convection | 5V / 12V DC Rail | 40mm brushless maglev fan |
| **0.96" OLED** | Real-Time Local Telemetry HUD | I2C (0x3C) | 128×64 SSD1306, low power |
| **LoRa SX1278** | Long-Range RF Telemetry Link | SPI Bus | 433 / 868 / 915 MHz, Chirp Spread Spectrum |
| **MicroSD Module** | Offline Event & Blackbox Logging | SPI Bus | FAT32 format, CSV telemetry storage |
| **LED + Buzzer** | Local Audiovisual Alarms | GPIO Pins | Dual-color LED + 85dB Piezo sounder |
| **Power Conditioning** | System Power Distribution | Input Rail | 12V Input, Buck Regulators (5V & 3.3V rails) |

---

## 📐 Mechanical Enclosure Concept
- **Target Dimensions**: `120 mm (L) × 80 mm (W) × 50 mm (H)`
- **Rating**: Weather-resistant IP65 concept
- **Materials**: UV-stabilized ABS / Polycarbonate with silicone perimeter gasket
- **Features**: PG-7 cable glands, isolated internal sensor chamber, exhaust fan grill with dust/snow baffles.

---

## 💻 Software & Website Architecture
This repository contains the complete public web portal and interactive demonstration testbed:
- **Zero Backend Dependencies**: Built with modern semantic HTML5, custom CSS3 design system, and vanilla ES6 JavaScript.
- **Interactive Telemetry HUD**: Live strip chart canvas, serial console stream, scenario presets (*Normal, Extreme Cold, High Temp, Low Battery, Over Current, Comm Failure*), and manual override controls with synthesized Web Audio piezo sound.
- **Interactive CAD Inspector**: Multi-view vector inspector displaying Isometric, Exploded, Internal Component Layout, and Orthographic 2D projections.

### Directory Structure
```
ladakh-shield/
├── index.html                 # Main website with all 13 core sections
├── README.md                  # Project documentation & deployment guide
├── LICENSE                    # MIT open-source license
├── src/                       # Production ESP32 embedded firmware
│   ├── main.cpp               # Core Sense → Analyze → Protect → Alert → Record loop
│   ├── config.h               # Hardware pin assignments & safety thresholds
│   ├── telemetry.h            # Data structures & packet serializers
│   └── README.md              # Firmware compilation & flashing guide
├── css/
│   ├── style.css              # Defence-tech theme, typography, responsive layout
│   └── dashboard.css          # Telemetry HUD, gauge bars, terminal styling
├── js/
│   ├── main.js                # Navigation, scrollspy, CAD switcher, clipboard
│   └── dashboard.js           # Simulation engine, scenario triggers, audio beeps
└── assets/                    # Project assets and media
```

---

## 🏃 How to Run Locally

### Method 1: Direct File Open
Simply double-click `index.html` in your file explorer or open it in any modern browser (Chrome, Firefox, Edge, Safari). No web server is strictly required!

### Method 2: Python HTTP Server (Recommended)
Open a terminal in the `ladakh-shield` folder:
```bash
# Python 3
python -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## 🚀 How to Deploy on GitHub Pages

This project is 100% static and requires zero build steps, making it ideal for free hosting on GitHub Pages:

### Step 1: Initialize Git and Push to GitHub
Open PowerShell or your terminal inside the project directory:

```bash
# 1. Initialize local repository
git init

# 2. Add all files to staging
git add .

# 3. Create initial commit
git commit -m "Initial LADAKH-SHIELD website"

# 4. Set main branch
git branch -M main

# 5. Link to your GitHub repository
git remote add origin https://github.com/Keexii/Ladakh-Shield.git

# 6. Push code to GitHub
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Open your repository on GitHub in your browser.
2. Click on **Settings** (gear icon at the top).
3. In the left sidebar under *Code and automation*, click **Pages**.
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`
   - **Branch**: Select `main`
   - **Folder**: Select `/ (root)`
5. Click **Save**.
6. Wait 1 to 2 minutes. GitHub will provide you with your live URL:
   `https://keexii.github.io/Ladakh-Shield/`

---

## ⚠️ Project Limitations
1. **Atmospheric Modeling**: The simulation simulates standard atmospheric lapse rate and pressure curves; physical non-linear turbulence is not modeled.
2. **Current Limits**: Prototype MOSFET switching lines are rated for bench demonstrations (< 10A). Industrial deployments would require automotive-grade solid-state relays.
3. **Chamber vs. Real-World**: Laboratory freeze chamber testing validates thermal pre-heating, but does not replicate sub-zero high-velocity blizzard winds.

---

## 👥 Team Information
- **Team Name**: LADAKH-SHIELD Innovation Group
- **Hardware Lead**: [Team Member Name] — Embedded Systems & PCB Design
- **Software Lead**: [Team Member Name] — ESP32 Firmware & Web Telemetry
- **Mechanical Lead**: [Team Member Name] — CAD Modeling & IP65 Chassis
- **Department**: Department of Electronics & Computer Engineering
- **Institution**: [Your College / University Name]
- **Faculty Mentor**: [Mentor Name], Assistant Professor / Professor

---

## 📄 License
This project is open-source and released under the [MIT License](LICENSE).
Feel free to fork, adapt, and build upon this platform for academic, research, and non-commercial innovation.
