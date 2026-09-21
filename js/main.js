/**
 * LADAKH-SHIELD — Main Application Script
 * Handles navigation, mobile menu, scrollspy, interactive CAD enclosure inspector,
 * protection logic tabs, and copy utilities.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.innerHTML = isOpen ? 
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>` : 
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
      });
    });
  }

  // 2. ScrollSpy for Navigation Highlighting
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  function updateScrollSpy() {
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(item => {
          item.classList.toggle('active', item.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
  updateScrollSpy();

  // 3. Section 7 — Protection Logic Tabs Switcher
  const logicTabs = document.querySelectorAll('.logic-tab-btn');
  const logicViews = document.querySelectorAll('.logic-flow-view');

  logicTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.logic;

      logicTabs.forEach(t => t.classList.toggle('active', t === tab));
      logicViews.forEach(v => {
        v.classList.toggle('active', v.id === `logic-view-${target}`);
      });
    });
  });

  // 4. Section 10 — Interactive CAD / Enclosure Views
  const cadTabs = document.querySelectorAll('.cad-tab');
  const cadCanvasArea = document.getElementById('cad-svg-container');
  const cadDescText = document.getElementById('cad-view-description');

  const CAD_VIEWS = {
    isometric: {
      desc: 'Isometric 3D perspective showing sealed IP65 chassis, external silicone cable gland entry, and dual ventilation port baffles.',
      svg: `
        <svg viewBox="0 0 600 360" width="100%" height="100%" class="cad-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#162548" />
              <stop offset="100%" stop-color="#0a1224" />
            </linearGradient>
            <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#243b6e" />
              <stop offset="100%" stop-color="#121e3a" />
            </linearGradient>
            <linearGradient id="glowG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.2" />
            </linearGradient>
          </defs>
          <!-- Isometric Box Body -->
          <!-- Top Face -->
          <polygon points="300,50 480,130 300,210 120,130" fill="url(#topGrad)" stroke="#38bdf8" stroke-width="2" />
          <!-- Left Face -->
          <polygon points="120,130 300,210 300,310 120,230" fill="url(#boxGrad)" stroke="#38bdf8" stroke-width="2" />
          <!-- Right Face -->
          <polygon points="300,210 480,130 480,230 300,310" fill="#091122" stroke="#38bdf8" stroke-width="2" />
          
          <!-- Top Cover Seal Groove -->
          <polygon points="300,68 455,137 300,202 145,137" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="4 3" />
          
          <!-- OLED Window Cutout on Top -->
          <polygon points="275,115 325,137 300,148 250,126" fill="#040812" stroke="#00f0ff" stroke-width="1.5" />
          <text x="287" y="133" fill="#00f0ff" font-family="monospace" font-size="8" text-anchor="middle">OLED 0.96"</text>
          
          <!-- Exhaust Fan Grill on Right Face -->
          <circle cx="390" cy="220" r="32" fill="#050a16" stroke="#00f0ff" stroke-width="1.5" />
          <line x1="390" y1="188" x2="390" y2="252" stroke="#38bdf8" stroke-width="1.2" />
          <line x1="358" y1="220" x2="422" y2="220" stroke="#38bdf8" stroke-width="1.2" />
          <circle cx="390" cy="220" r="14" fill="#0c1830" stroke="#00f0ff" stroke-width="1" />
          <text x="390" y="268" fill="#94a3b8" font-family="monospace" font-size="9" text-anchor="middle">FAN GRILL 40mm</text>
          
          <!-- Gland Ports on Left Face -->
          <circle cx="180" cy="210" r="12" fill="#02050b" stroke="#38bdf8" stroke-width="1.5" />
          <circle cx="230" cy="235" r="12" fill="#02050b" stroke="#38bdf8" stroke-width="1.5" />
          <text x="180" y="235" fill="#64748b" font-family="monospace" font-size="8" text-anchor="middle">PG-7 GLAND</text>
          <text x="230" y="260" fill="#64748b" font-family="monospace" font-size="8" text-anchor="middle">ANTENNA</text>
          
          <!-- Dimension Annotations -->
          <line x1="120" y1="240" x2="300" y2="320" stroke="#00f0ff" stroke-width="1" stroke-dasharray="2 2" />
          <text x="205" y="295" fill="#00f0ff" font-family="monospace" font-size="11" transform="rotate(24 205 295)">120 mm (Length)</text>

          <line x1="300" y1="320" x2="480" y2="240" stroke="#00f0ff" stroke-width="1" stroke-dasharray="2 2" />
          <text x="385" y="295" fill="#00f0ff" font-family="monospace" font-size="11" transform="rotate(-24 385 295)">80 mm (Width)</text>

          <line x1="490" y1="130" x2="490" y2="230" stroke="#00f0ff" stroke-width="1" />
          <text x="500" y="185" fill="#00f0ff" font-family="monospace" font-size="11">50 mm (Height)</text>
          
          <!-- Title Badge -->
          <rect x="20" y="20" width="170" height="28" rx="4" fill="rgba(0, 240, 255, 0.08)" stroke="#00f0ff" stroke-width="1"/>
          <text x="105" y="38" fill="#00f0ff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">ISOMETRIC ENCLOSURE</text>
        </svg>
      `
    },
    exploded: {
      desc: 'Exploded view illustrating stackable modular internal assembly: Top shell, silicone gasket, PCB core, and thermal base.',
      svg: `
        <svg viewBox="0 0 600 360" width="100%" height="100%" class="cad-svg" xmlns="http://www.w3.org/2000/svg">
          <!-- Top Shell -->
          <g transform="translate(0, -30)">
            <polygon points="300,50 460,110 300,170 140,110" fill="#1e325c" stroke="#00f0ff" stroke-width="1.5" />
            <polygon points="140,110 300,170 300,195 140,135" fill="#142240" stroke="#00f0ff" stroke-width="1.5" />
            <polygon points="300,170 460,110 460,135 300,195" fill="#0d1830" stroke="#00f0ff" stroke-width="1.5" />
            <text x="475" y="125" fill="#38bdf8" font-family="monospace" font-size="10">1. Top IP65 Shell (ABS/PC)</text>
          </g>

          <!-- Silicone Gasket -->
          <g transform="translate(0, 15)">
            <polygon points="300,90 440,140 300,190 160,140" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="6 3" />
            <text x="455" y="150" fill="#f59e0b" font-family="monospace" font-size="10">2. Silicone Sealing O-Ring</text>
          </g>

          <!-- Main Circuit Carrier & Sub-Modules -->
          <g transform="translate(0, 55)">
            <polygon points="300,105 430,150 300,195 170,150" fill="#08281a" stroke="#10b981" stroke-width="2" />
            <!-- Component Blocks on PCB -->
            <rect x="250" y="130" width="30" height="20" fill="#111827" stroke="#00f0ff" stroke-width="1" />
            <text x="265" y="143" fill="#00f0ff" font-family="monospace" font-size="7" text-anchor="middle">ESP32</text>

            <rect x="300" y="138" width="22" height="15" fill="#111827" stroke="#38bdf8" stroke-width="1" />
            <text x="311" y="149" fill="#38bdf8" font-family="monospace" font-size="6" text-anchor="middle">LoRa</text>

            <rect x="230" y="145" width="16" height="12" fill="#111827" stroke="#fbbf24" stroke-width="1" />
            <text x="238" y="154" fill="#fbbf24" font-family="monospace" font-size="5" text-anchor="middle">BME</text>
            <text x="445" y="175" fill="#10b981" font-family="monospace" font-size="10">3. Mainboard & Sensor Array</text>
          </g>

          <!-- PTC Heating Layer -->
          <g transform="translate(0, 95)">
            <polygon points="300,120 420,160 300,200 180,160" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" stroke-width="1.8" />
            <text x="435" y="195" fill="#ef4444" font-family="monospace" font-size="10">4. 12V PTC Silicone Heating Pad</text>
          </g>

          <!-- Bottom Enclosure Base -->
          <g transform="translate(0, 130)">
            <polygon points="300,125 460,185 300,245 140,185" fill="#0f1a33" stroke="#00f0ff" stroke-width="1.5" />
            <polygon points="140,185 300,245 300,270 140,210" fill="#091122" stroke="#00f0ff" stroke-width="1.5" />
            <polygon points="300,245 460,185 460,210 300,270" fill="#040914" stroke="#00f0ff" stroke-width="1.5" />
            <text x="475" y="235" fill="#38bdf8" font-family="monospace" font-size="10">5. Bottom Mounting Enclosure</text>
          </g>

          <!-- Title Badge -->
          <rect x="20" y="20" width="160" height="28" rx="4" fill="rgba(0, 240, 255, 0.08)" stroke="#00f0ff" stroke-width="1"/>
          <text x="100" y="38" fill="#00f0ff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">EXPLODED VIEW</text>
        </svg>
      `
    },
    internal: {
      desc: 'Internal layout arrangement: Precision placement of ESP32, BME280 sensor chamber, INA219, LoRa SX1278, and dual MOSFETs.',
      svg: `
        <svg viewBox="0 0 600 360" width="100%" height="100%" class="cad-svg" xmlns="http://www.w3.org/2000/svg">
          <!-- Outer Chassis Boundary -->
          <rect x="80" y="40" width="440" height="280" rx="12" fill="#0a1224" stroke="#00f0ff" stroke-width="2" />
          <rect x="90" y="50" width="420" height="260" rx="8" fill="#050a16" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1" stroke-dasharray="5 3" />
          
          <!-- Mounting Screw Bosses -->
          <circle cx="105" cy="65" r="7" fill="#1e3a8a" stroke="#00f0ff" stroke-width="1" />
          <circle cx="495" cy="65" r="7" fill="#1e3a8a" stroke="#00f0ff" stroke-width="1" />
          <circle cx="105" cy="295" r="7" fill="#1e3a8a" stroke="#00f0ff" stroke-width="1" />
          <circle cx="495" cy="295" r="7" fill="#1e3a8a" stroke="#00f0ff" stroke-width="1" />

          <!-- ESP32 NodeMCU Module -->
          <rect x="120" y="80" width="110" height="150" rx="4" fill="#0d1f3d" stroke="#00f0ff" stroke-width="1.5" />
          <text x="175" y="110" fill="#00f0ff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">ESP32</text>
          <text x="175" y="128" fill="#64748b" font-family="monospace" font-size="8" text-anchor="middle">Dual Core 240MHz</text>
          <rect x="135" y="145" width="80" height="50" fill="#050b18" stroke="#38bdf8" stroke-width="1" />
          <text x="175" y="174" fill="#38bdf8" font-family="monospace" font-size="9" text-anchor="middle">WROOM-32</text>

          <!-- LoRa SX1278 Module -->
          <rect x="255" y="80" width="110" height="90" rx="4" fill="#122547" stroke="#38bdf8" stroke-width="1.5" />
          <text x="310" y="110" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">LoRa SX1278</text>
          <text x="310" y="128" fill="#94a3b8" font-family="monospace" font-size="8" text-anchor="middle">SPI Transceiver</text>
          <circle cx="350" cy="95" r="5" fill="#f59e0b" />

          <!-- BME280 Isolated Sensing Cell -->
          <rect x="255" y="185" width="110" height="65" rx="4" fill="#0f2b23" stroke="#10b981" stroke-width="1.5" />
          <text x="310" y="210" fill="#10b981" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">BME280</text>
          <text x="310" y="226" fill="#a7f3d0" font-family="monospace" font-size="8" text-anchor="middle">Temp/Press/Hum</text>

          <!-- INA219 / INA226 Module -->
          <rect x="385" y="80" width="105" height="70" rx="4" fill="#2d1e0d" stroke="#f59e0b" stroke-width="1.5" />
          <text x="437" y="110" fill="#f59e0b" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">INA219/226</text>
          <text x="437" y="126" fill="#fde68a" font-family="monospace" font-size="8" text-anchor="middle">Power / Shunt</text>

          <!-- MOSFET Switch Module & Heating Pad connection -->
          <rect x="385" y="165" width="105" height="85" rx="4" fill="#2e1414" stroke="#ef4444" stroke-width="1.5" />
          <text x="437" y="195" fill="#ef4444" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">MOSFET HUB</text>
          <text x="437" y="212" fill="#fca5a5" font-family="monospace" font-size="8" text-anchor="middle">PWM Heat/Fan Ctrl</text>

          <!-- SD Card Module & Power Terminal Bus -->
          <rect x="120" y="245" width="245" height="50" rx="4" fill="#162238" stroke="#38bdf8" stroke-width="1.2" />
          <text x="242" y="275" fill="#38bdf8" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">MICRO-SD SPI MODULE &amp; 12V BUCK REGULATOR</text>

          <!-- Title Badge -->
          <rect x="20" y="15" width="170" height="24" rx="4" fill="rgba(0, 240, 255, 0.08)" stroke="#00f0ff" stroke-width="1"/>
          <text x="105" y="31" fill="#00f0ff" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">INTERNAL LAYOUT 1:1</text>
        </svg>
      `
    },
    orthographic: {
      desc: 'Orthographic standard projections: Front, Top, and Side views confirming 120 x 80 x 50 mm physical envelope.',
      svg: `
        <svg viewBox="0 0 600 360" width="100%" height="100%" class="cad-svg" xmlns="http://www.w3.org/2000/svg">
          <!-- TOP VIEW -->
          <rect x="70" y="60" width="220" height="140" rx="8" fill="#0d1830" stroke="#00f0ff" stroke-width="1.5" />
          <text x="180" y="50" fill="#00f0ff" font-family="monospace" font-size="10" text-anchor="middle">TOP VIEW (120 x 80 mm)</text>
          <!-- OLED Window -->
          <rect x="150" y="105" width="60" height="40" rx="3" fill="#040812" stroke="#38bdf8" stroke-width="1" />
          <text x="180" y="130" fill="#38bdf8" font-family="monospace" font-size="8" text-anchor="middle">OLED 0.96"</text>
          <!-- Gland Entrances -->
          <circle cx="85" cy="110" r="8" fill="#030712" stroke="#00f0ff" stroke-width="1" />
          <circle cx="85" cy="150" r="8" fill="#030712" stroke="#00f0ff" stroke-width="1" />

          <!-- FRONT VIEW -->
          <rect x="70" y="240" width="220" height="80" rx="6" fill="#0a1224" stroke="#38bdf8" stroke-width="1.5" />
          <text x="180" y="230" fill="#38bdf8" font-family="monospace" font-size="10" text-anchor="middle">FRONT VIEW (120 x 50 mm)</text>
          <!-- Status LEDs & USB Slot -->
          <circle cx="100" cy="275" r="4" fill="#10b981" />
          <circle cx="115" cy="275" r="4" fill="#ef4444" />
          <rect x="160" y="270" width="24" height="10" rx="2" fill="#020610" stroke="#64748b" stroke-width="1" />

          <!-- SIDE VIEW -->
          <rect x="360" y="60" width="150" height="140" rx="8" fill="#0a1224" stroke="#00f0ff" stroke-width="1.5" />
          <text x="435" y="50" fill="#00f0ff" font-family="monospace" font-size="10" text-anchor="middle">SIDE VIEW (80 x 50 mm)</text>
          <!-- Fan Exhaust Grill -->
          <circle cx="435" cy="130" r="35" fill="#040812" stroke="#00f0ff" stroke-width="1.5" />
          <line x1="435" y1="95" x2="435" y2="165" stroke="#38bdf8" stroke-width="1" />
          <line x1="400" y1="130" x2="470" y2="130" stroke="#38bdf8" stroke-width="1" />
          <circle cx="435" cy="130" r="14" fill="#0e1f3d" stroke="#00f0ff" stroke-width="1" />

          <!-- Title Badge -->
          <rect x="20" y="15" width="180" height="24" rx="4" fill="rgba(0, 240, 255, 0.08)" stroke="#00f0ff" stroke-width="1"/>
          <text x="110" y="31" fill="#00f0ff" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">ORTHOGRAPHIC PROJECTION</text>
        </svg>
      `
    }
  };

  function renderCadView(viewKey) {
    if (!CAD_VIEWS[viewKey] || !cadCanvasArea) return;

    cadCanvasArea.innerHTML = CAD_VIEWS[viewKey].svg;
    if (cadDescText) {
      cadDescText.textContent = CAD_VIEWS[viewKey].desc;
    }

    cadTabs.forEach(t => t.classList.toggle('active', t.dataset.view === viewKey));
  }

  cadTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      renderCadView(tab.dataset.view);
    });
  });

  // Render initial default CAD view
  renderCadView('isometric');

  // 5. Copy Git Clone Command
  const copyBtn = document.getElementById('btn-copy-clone');
  const cloneCmd = document.getElementById('clone-cmd-text');

  if (copyBtn && cloneCmd) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(cloneCmd.textContent.trim()).then(() => {
        const orig = copyBtn.textContent;
        copyBtn.textContent = 'COPIED!';
        copyBtn.style.color = '#00f0ff';
        setTimeout(() => {
          copyBtn.textContent = orig;
          copyBtn.style.color = '';
        }, 2000);
      }).catch(err => {
        console.warn('Clipboard copy failed:', err);
      });
    });
  }
});
