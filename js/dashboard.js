/**
 * LADAKH-SHIELD — Interactive Simulation & Telemetry HUD Engine
 * Provides realistic high-altitude telemetry simulation, scenario switching,
 * real-time strip-chart canvas plotting, serial log streaming, and buzzer audio.
 */

(function() {
  'use strict';

  // Preset Scenarios
  const SCENARIOS = {
    normal: {
      name: 'Normal Altitude Operation',
      status: 'NORMAL',
      statusClass: 'normal',
      temp: -8.4,
      pressure: 68.2,
      humidity: 35.0,
      voltage: 12.10,
      current: 1.82,
      power: 22.02,
      battery: 82,
      heater: false,
      fan: false,
      lora: true,
      sd: true,
      log: 'Nominal high-altitude operational parameters. Passive thermal equilibrium maintained.'
    },
    cold: {
      name: 'Extreme Cold (-28.6°C)',
      status: 'WARNING',
      statusClass: 'warning',
      temp: -28.6,
      pressure: 62.1,
      humidity: 22.4,
      voltage: 11.20,
      current: 3.90,
      power: 43.68,
      battery: 68,
      heater: true,
      fan: false,
      lora: true,
      sd: true,
      log: 'AUTO-TRIGGER: Core temperature below -15°C threshold. MOSFET Stage 1 activated PTC Heater.'
    },
    hot: {
      name: 'High Stagnation Temp (+46.5°C)',
      status: 'WARNING',
      statusClass: 'warning',
      temp: 46.5,
      pressure: 69.1,
      humidity: 18.2,
      voltage: 11.90,
      current: 3.20,
      power: 38.08,
      battery: 74,
      heater: false,
      fan: true,
      lora: true,
      sd: true,
      log: 'AUTO-TRIGGER: Internal enclosure temperature exceeded +45°C limit. Brushless cooling fan engaged.'
    },
    battery: {
      name: 'Low Battery Depletion',
      status: 'CRITICAL',
      statusClass: 'critical',
      temp: -12.2,
      pressure: 67.5,
      humidity: 30.1,
      voltage: 9.75,
      current: 0.85,
      power: 8.29,
      battery: 14,
      heater: false,
      fan: false,
      lora: true,
      sd: true,
      log: 'CRITICAL ALERT: Pack voltage < 10.0V. Non-essential heating loads shed. Power conserve mode.'
    },
    current: {
      name: 'Over-Current Surge (5.82A)',
      status: 'CRITICAL',
      statusClass: 'critical',
      temp: 18.4,
      pressure: 68.0,
      humidity: 33.8,
      voltage: 11.35,
      current: 5.82,
      power: 66.06,
      battery: 69,
      heater: false,
      fan: true,
      lora: true,
      sd: true,
      log: 'CURRENT TRIP: Current spiked to 5.82A (Limit 4.5A). Fast-acting interrupt logged fault packet.'
    },
    lora: {
      name: 'Communication Link Failure',
      status: 'WARNING',
      statusClass: 'warning',
      temp: -9.2,
      pressure: 67.8,
      humidity: 36.1,
      voltage: 12.05,
      current: 1.62,
      power: 19.52,
      battery: 81,
      heater: false,
      fan: false,
      lora: false,
      sd: true,
      log: 'RF DROPOUT: LoRa ACK timeout on 868MHz. Telemetry rerouted to local FAT32 MicroSD buffer.'
    }
  };

  // State Variables
  let currentScenarioKey = 'normal';
  let activeState = Object.assign({}, SCENARIOS.normal);
  let isSimRunning = true;
  let simTimer = null;
  let telemetryHistory = {
    temp: [],
    power: []
  };
  const MAX_HISTORY = 30;

  // Initialize history
  for (let i = 0; i < MAX_HISTORY; i++) {
    telemetryHistory.temp.push(activeState.temp);
    telemetryHistory.power.push(activeState.power);
  }

  // DOM Elements
  const elTemp = document.getElementById('val-temp');
  const elPress = document.getElementById('val-press');
  const elHum = document.getElementById('val-hum');
  const elVolt = document.getElementById('val-volt');
  const elCurr = document.getElementById('val-curr');
  const elPower = document.getElementById('val-power');
  const elBatt = document.getElementById('val-batt');

  const barTemp = document.getElementById('bar-temp');
  const barVolt = document.getElementById('bar-volt');
  const barCurr = document.getElementById('bar-curr');
  const barBatt = document.getElementById('bar-batt');

  const elStatus = document.getElementById('hud-system-status');
  const elStatusText = document.getElementById('hud-status-text');
  const indHeater = document.getElementById('ind-heater');
  const indFan = document.getElementById('ind-fan');
  const indLora = document.getElementById('ind-lora');
  const indSd = document.getElementById('ind-sd');

  const elClock = document.getElementById('hud-sim-time');
  const terminalOut = document.getElementById('terminal-log-output');
  const toggleSimBtn = document.getElementById('btn-toggle-sim');
  const scenarioBtns = document.querySelectorAll('.scenario-btn');

  // Manual Controls
  const btnManualHeater = document.getElementById('manual-heater-btn');
  const btnManualFan = document.getElementById('manual-fan-btn');
  const btnManualBuzzer = document.getElementById('manual-buzzer-btn');

  // Audio Context for Piezo Buzzer Simulator
  let audioCtx = null;
  function playPiezoBuzzerTone(freq = 2400, duration = 0.15) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio feedback blocked or not supported on this browser context', e);
    }
  }

  // Format Time Helper
  function getTimestamp() {
    const now = new Date();
    return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
  }

  // Append Log Message
  function appendTerminalLog(msg, type = 'info') {
    if (!terminalOut) return;
    const p = document.createElement('p');
    let colorClass = '';
    if (type === 'warn') colorClass = 'log-warn';
    if (type === 'crit') colorClass = 'log-crit';
    
    p.innerHTML = `<span class="log-time">[${getTimestamp()}]</span> <span class="log-prefix">SHIELD-LOG:</span> <span class="${colorClass}">${msg}</span>`;
    terminalOut.insertBefore(p, terminalOut.firstChild);

    // Limit log rows to 40
    while (terminalOut.children.length > 40) {
      terminalOut.removeChild(terminalOut.lastChild);
    }
  }

  // Update UI Function
  function renderHUD() {
    if (!elTemp) return;

    elTemp.textContent = (activeState.temp >= 0 ? '+' : '') + activeState.temp.toFixed(1);
    elPress.textContent = activeState.pressure.toFixed(1);
    elHum.textContent = activeState.humidity.toFixed(1);
    elVolt.textContent = activeState.voltage.toFixed(2);
    elCurr.textContent = activeState.current.toFixed(2);
    elPower.textContent = activeState.power.toFixed(1);
    elBatt.textContent = Math.round(activeState.battery);

    // Bar fills
    if (barTemp) {
      // Map -40 to +60
      const pctTemp = Math.min(Math.max(((activeState.temp + 40) / 100) * 100, 5), 100);
      barTemp.style.width = pctTemp + '%';
      barTemp.className = 'telemetry-bar-fill' + (activeState.temp < -20 ? ' warning' : (activeState.temp > 40 ? ' critical' : ''));
    }

    if (barVolt) {
      // 9V to 13V
      const pctVolt = Math.min(Math.max(((activeState.voltage - 9) / 4) * 100, 5), 100);
      barVolt.style.width = pctVolt + '%';
      barVolt.className = 'telemetry-bar-fill' + (activeState.voltage < 10.5 ? ' critical' : '');
    }

    if (barCurr) {
      // 0 to 6A
      const pctCurr = Math.min(Math.max((activeState.current / 6) * 100, 5), 100);
      barCurr.style.width = pctCurr + '%';
      barCurr.className = 'telemetry-bar-fill' + (activeState.current > 4.5 ? ' critical' : '');
    }

    if (barBatt) {
      barBatt.style.width = activeState.battery + '%';
      barBatt.className = 'telemetry-bar-fill' + (activeState.battery < 20 ? ' critical' : (activeState.battery < 40 ? ' warning' : ''));
    }

    // System Status
    if (elStatus && elStatusText) {
      elStatus.className = 'system-status-indicator ' + activeState.statusClass;
      elStatusText.textContent = activeState.status;
    }

    // Actuators
    updateIndicator(indHeater, activeState.heater, 'ACTIVE', 'STANDBY');
    updateIndicator(indFan, activeState.fan, 'ACTIVE', 'STANDBY');
    updateIndicator(indLora, activeState.lora, 'CONNECTED', 'OFFLINE');
    updateIndicator(indSd, activeState.sd, 'LOGGING', 'HALTED');

    // Manual buttons reflect state
    if (btnManualHeater) {
      btnManualHeater.classList.toggle('active', activeState.heater);
      btnManualHeater.textContent = `Heater: ${activeState.heater ? 'FORCE ON' : 'STANDBY'}`;
    }
    if (btnManualFan) {
      btnManualFan.classList.toggle('active', activeState.fan);
      btnManualFan.textContent = `Fan: ${activeState.fan ? 'FORCE ON' : 'STANDBY'}`;
    }

    // Time
    if (elClock) {
      elClock.textContent = new Date().toLocaleTimeString();
    }

    drawSparklines();
  }

  function updateIndicator(elem, isActive, activeLabel, inactiveLabel) {
    if (!elem) return;
    if (isActive) {
      elem.className = 'actuator-indicator active';
      elem.textContent = activeLabel;
    } else {
      elem.className = 'actuator-indicator off';
      elem.textContent = inactiveLabel;
    }
  }

  // Draw Mini Strip Chart on Canvas
  const canvas = document.getElementById('telemetry-canvas');
  let ctx = canvas ? canvas.getContext('2d') : null;

  function drawSparklines() {
    if (!ctx || !canvas) return;
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 20; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Plot Temperature (Cyan Line)
    // Range -40 to 60
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const step = w / (MAX_HISTORY - 1);
    for (let i = 0; i < telemetryHistory.temp.length; i++) {
      const val = telemetryHistory.temp[i];
      // map -40..+60 to h..0
      const norm = (val + 40) / 100;
      const y = h - (norm * (h - 20) + 10);
      const x = i * step;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Plot Power (Amber Line)
    // Range 0 to 70W
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < telemetryHistory.power.length; i++) {
      const val = telemetryHistory.power[i];
      const norm = Math.min(Math.max(val / 70, 0), 1);
      const y = h - (norm * (h - 20) + 10);
      const x = i * step;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Simulation Tick (Adds slight micro-jitter for authentic realism)
  function simTick() {
    if (!isSimRunning) return;

    // Small jitter based on current scenario
    const base = SCENARIOS[currentScenarioKey];
    const jitterT = (Math.random() - 0.5) * 0.2;
    const jitterP = (Math.random() - 0.5) * 0.08;
    const jitterV = (Math.random() - 0.5) * 0.04;
    const jitterI = (Math.random() - 0.5) * 0.03;

    activeState.temp = +(base.temp + jitterT).toFixed(1);
    activeState.pressure = +(base.pressure + jitterP).toFixed(1);
    activeState.humidity = +(base.humidity + (Math.random() - 0.5) * 0.2).toFixed(1);
    activeState.voltage = +(base.voltage + jitterV).toFixed(2);
    activeState.current = +(base.current + jitterI).toFixed(2);
    activeState.power = +(activeState.voltage * activeState.current).toFixed(1);

    // Slowly discharge battery slightly if discharging
    if (activeState.battery > 5) {
      activeState.battery = +(activeState.battery - 0.002).toFixed(2);
    }

    // Update historical telemetry buffer
    telemetryHistory.temp.shift();
    telemetryHistory.temp.push(activeState.temp);
    telemetryHistory.power.shift();
    telemetryHistory.power.push(activeState.power);

    renderHUD();

    // Occasional periodic telemetry heartbeat log
    if (Math.random() < 0.25) {
      const msg = `TX PACKET: T=${activeState.temp}°C | P=${activeState.pressure}kPa | V=${activeState.voltage}V | I=${activeState.current}A | PWR=${activeState.power}W`;
      appendTerminalLog(msg, 'info');
    }
  }

  // Switch Scenario Function
  function selectScenario(key) {
    if (!SCENARIOS[key]) return;
    currentScenarioKey = key;
    activeState = Object.assign({}, SCENARIOS[key]);

    scenarioBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.scenario === key);
    });

    let logType = 'info';
    if (activeState.status === 'WARNING') logType = 'warn';
    if (activeState.status === 'CRITICAL') logType = 'crit';

    appendTerminalLog(`SCENARIO LOADED: [${activeState.name}]`, logType);
    appendTerminalLog(activeState.log, logType);

    // Audio cue if warning or critical
    if (activeState.status === 'WARNING') {
      playPiezoBuzzerTone(1800, 0.12);
    } else if (activeState.status === 'CRITICAL') {
      playPiezoBuzzerTone(2800, 0.1);
      setTimeout(() => playPiezoBuzzerTone(2800, 0.2), 150);
    }

    renderHUD();
  }

  // Setup Event Handlers
  function initDashboard() {
    // Scenario Buttons
    scenarioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectScenario(btn.dataset.scenario);
      });
    });

    // Toggle Simulation Play/Pause
    if (toggleSimBtn) {
      toggleSimBtn.addEventListener('click', () => {
        isSimRunning = !isSimRunning;
        toggleSimBtn.textContent = isSimRunning ? '⏸ Pause Sim' : '▶ Resume Sim';
        appendTerminalLog(`Simulation engine ${isSimRunning ? 'resumed' : 'paused by user'}.`);
      });
    }

    // Manual Overrides
    if (btnManualHeater) {
      btnManualHeater.addEventListener('click', () => {
        activeState.heater = !activeState.heater;
        appendTerminalLog(`MANUAL OVERRIDE: Heater forced ${activeState.heater ? 'ON' : 'OFF'} by operator.`, 'warn');
        renderHUD();
      });
    }

    if (btnManualFan) {
      btnManualFan.addEventListener('click', () => {
        activeState.fan = !activeState.fan;
        appendTerminalLog(`MANUAL OVERRIDE: Cooling fan forced ${activeState.fan ? 'ON' : 'OFF'} by operator.`, 'warn');
        renderHUD();
      });
    }

    if (btnManualBuzzer) {
      btnManualBuzzer.addEventListener('click', () => {
        playPiezoBuzzerTone(2600, 0.25);
        appendTerminalLog('BUZZER TEST: Piezo alarm triggered manually for audio diagnostic verification.', 'warn');
      });
    }

    // Handle Window Resize for Canvas
    window.addEventListener('resize', drawSparklines);

    // Start Simulation Loop (every 1400ms)
    simTimer = setInterval(simTick, 1400);

    // Initial Logs & Render
    appendTerminalLog('LADAKH-SHIELD Firmware v1.0.4-PROTOTYPE initialized.');
    appendTerminalLog('Sensors connected: BME280 (I2C:0x76), INA219 (I2C:0x40), SX1278 (SPI).');
    appendTerminalLog('SIMULATION ENGINE ACTIVE: Displaying simulated high-altitude testbench stream.');
    renderHUD();
  }

  // Expose to Global Window
  window.LadakhShieldDashboard = {
    init: initDashboard,
    selectScenario: selectScenario,
    playTone: playPiezoBuzzerTone
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }
})();
