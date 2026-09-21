import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Settings, 
  Palette, 
  Cpu, 
  Sliders, 
  Bell, 
  Database, 
  Check, 
  RotateCcw, 
  HardDrive, 
  Code, 
  Save
} from 'lucide-react';
import { ThemeId } from '../../types/theme';
import { apiService } from '../../services/apiService';

type SettingsTab = 'appearance' | 'system' | 'thresholds' | 'notifications' | 'data' | 'esp32';

export const SettingsView: React.FC = () => {
  const { 
    dataSource, 
    setDataSource, 
    thresholds, 
    updateThresholds, 
    soundEnabled, 
    setSoundEnabled,
    clearDataBuffer,
    exportCsvLogs,
    downloadJsonLogs,
    bme280
  } = useTelemetry();

  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  const [lowTemp, setLowTemp] = useState(thresholds.lowTemperature);
  const [highTemp, setHighTemp] = useState(thresholds.highTemperature);
  const [lowVolt, setLowVolt] = useState(thresholds.lowVoltage);
  const [overcurr, setOvercurr] = useState(thresholds.overcurrent);
  const [lowPress, setLowPress] = useState(thresholds.lowPressure);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [esp32Url, setEsp32Url] = useState(apiService.getConfig().endpoint);
  const [apiKey, setApiKey] = useState(apiService.getConfig().apiKey || '');
  const [apiSaveSuccess, setApiSaveSuccess] = useState(false);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds({
      lowTemperature: Number(lowTemp),
      highTemperature: Number(highTemp),
      lowVoltage: Number(lowVolt),
      overcurrent: Number(overcurr),
      lowPressure: Number(lowPress)
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveApiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    apiService.updateConfig({
      endpoint: esp32Url,
      apiKey
    });
    setApiSaveSuccess(true);
    setTimeout(() => setApiSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div 
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <Settings className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-mono font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                SYSTEM CONFIGURATION &amp; PREFERENCES
              </h2>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Configure telemetry thresholds, hardware endpoints, cockpit themes, and diagnostic persistence
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap rounded-lg border p-1" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          {[
            { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
            { id: 'thresholds' as SettingsTab, label: 'Thresholds', icon: Sliders },
            { id: 'system' as SettingsTab, label: 'System Info', icon: Cpu },
            { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
            { id: 'esp32' as SettingsTab, label: 'ESP32 API', icon: Code },
            { id: 'data' as SettingsTab, label: 'Data Mgmt', icon: Database },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  isActive ? 'font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                  color: isActive ? '#07111F' : 'var(--text-primary)'
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: APPEARANCE / THEME SELECTOR */}
      {activeTab === 'appearance' && (
        <div className="cockpit-card p-6 rounded-xl border space-y-6" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h3 className="font-mono font-bold text-sm tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>
                Day &amp; Night Theme Customization
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Switch between high-altitude Tactical Night Ops and Arctic Daylight operations without page reload.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#00FF9C]">
              2 MODES AVAILABLE (DAY &amp; NIGHT)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableThemes.map((theme) => {
              const isSelected = currentTheme === theme.id || 
                (theme.id === 'night' && (currentTheme === 'dark' || currentTheme === 'defence-dark')) || 
                (theme.id === 'day' && (currentTheme === 'light' || currentTheme === 'arctic-light'));
              const isLight = theme.id === 'day' || theme.id === 'light' || theme.id === 'arctic-light';
              return (
                <div
                  key={theme.id}
                  onClick={() => setTheme(theme.id as ThemeId)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between shadow-sm ${
                    isSelected ? 'ring-2 ring-offset-2 scale-[1.01]' : 'hover:scale-[1.005]'
                  }`}
                  style={{
                    backgroundColor: theme.previewColors.card,
                    borderColor: isSelected ? theme.previewColors.accent : theme.previewColors.border,
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2.5">
                        <div 
                          className="w-4 h-4 rounded-full border shadow-sm" 
                          style={{ backgroundColor: theme.previewColors.accent, borderColor: isLight ? '#0F172A' : '#ffffff' }} 
                        />
                        <div>
                          <span 
                            className="font-mono font-bold text-sm tracking-wider block"
                            style={{ color: isLight ? '#0F172A' : '#F5F7FA' }}
                          >
                            {theme.name}
                          </span>
                          <span 
                            className="text-[10px] font-mono block"
                            style={{ color: isLight ? '#64748B' : '#8FA3B8' }}
                          >
                            {theme.subtitle}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <span 
                          className="flex items-center space-x-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-sm"
                          style={{ 
                            backgroundColor: theme.previewColors.accent,
                            color: isLight ? '#ffffff' : '#07111F'
                          }}
                        >
                          <Check className="w-3 h-3 mr-0.5" /> ACTIVE
                        </span>
                      )}
                    </div>
                    <p 
                      className="text-xs mb-4 font-sans leading-relaxed"
                      style={{ color: isLight ? '#475569' : '#8FA3B8' }}
                    >
                      {theme.tagline}
                    </p>
                  </div>

                  {/* Palette Preview */}
                  <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: theme.previewColors.border }}>
                    <span className="text-[10px] font-mono" style={{ color: isLight ? '#64748B' : '#8FA3B8' }}>
                      PALETTE PREVIEW
                    </span>
                    <div className="flex space-x-2">
                      <span className="w-4 h-4 rounded border" style={{ backgroundColor: theme.previewColors.bg, borderColor: theme.previewColors.border }} title="Background" />
                      <span className="w-4 h-4 rounded border" style={{ backgroundColor: theme.previewColors.card, borderColor: theme.previewColors.border }} title="Card" />
                      <span className="w-4 h-4 rounded border" style={{ backgroundColor: theme.previewColors.accent, borderColor: theme.previewColors.border }} title="Accent" />
                      <span className="w-4 h-4 rounded border" style={{ backgroundColor: isLight ? '#059669' : '#00FF9C', borderColor: theme.previewColors.border }} title="Normal (Green)" />
                      <span className="w-4 h-4 rounded border" style={{ backgroundColor: isLight ? '#D97706' : '#FFB020', borderColor: theme.previewColors.border }} title="Warning (Yellow)" />
                      <span className="w-4 h-4 rounded border" style={{ backgroundColor: isLight ? '#DC2626' : '#FF4D4D', borderColor: theme.previewColors.border }} title="Critical (Red)" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: THRESHOLDS */}
      {activeTab === 'thresholds' && (
        <div className="cockpit-card p-6 rounded-xl border space-y-6" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h3 className="font-mono font-bold text-sm tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>
                Autonomous Rule Engine Thresholds
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Modifying these thresholds immediately updates the risk evaluation engine and automatic protection triggers
              </p>
            </div>
            {saveSuccess && (
              <span className="flex items-center space-x-1 text-xs font-mono font-bold text-[#00FF9C]">
                <Check className="w-4 h-4" /> SAVED TO EEPROM
              </span>
            )}
          </div>

          <form onSubmit={handleSaveThresholds} className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
            {/* Low Temp */}
            <div className="p-3.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Low Temperature Trigger (°C)
              </label>
              <p className="text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                Autonomous PTC silicone heater engagement point (default -20.0°C)
              </p>
              <input
                type="number"
                step="0.5"
                value={lowTemp}
                onChange={(e) => setLowTemp(parseFloat(e.target.value))}
                className="w-full p-2 rounded border outline-none font-bold text-sm"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)', color: 'var(--accent-primary)' }}
              />
            </div>

            {/* High Temp */}
            <div className="p-3.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                High Temperature Trigger (°C)
              </label>
              <p className="text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                Autonomous convective cooling fan engagement point (default 45.0°C)
              </p>
              <input
                type="number"
                step="0.5"
                value={highTemp}
                onChange={(e) => setHighTemp(parseFloat(e.target.value))}
                className="w-full p-2 rounded border outline-none font-bold text-sm"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)', color: 'var(--accent-primary)' }}
              />
            </div>

            {/* Low Voltage */}
            <div className="p-3.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Low Voltage Warning Limit (V)
              </label>
              <p className="text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                Trigger for battery discharge warning and load shedding (default 11.1V)
              </p>
              <input
                type="number"
                step="0.1"
                value={lowVolt}
                onChange={(e) => setLowVolt(parseFloat(e.target.value))}
                className="w-full p-2 rounded border outline-none font-bold text-sm"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)', color: 'var(--accent-primary)' }}
              />
            </div>

            {/* Overcurrent */}
            <div className="p-3.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Overcurrent Cutoff Trip (A)
              </label>
              <p className="text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                Solid-state MOSFET breaker autonomous trip limit (default 3.5A)
              </p>
              <input
                type="number"
                step="0.1"
                value={overcurr}
                onChange={(e) => setOvercurr(parseFloat(e.target.value))}
                className="w-full p-2 rounded border outline-none font-bold text-sm"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)', color: 'var(--accent-primary)' }}
              />
            </div>

            {/* Low Pressure */}
            <div className="p-3.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Low Pressure Derating Threshold (kPa)
              </label>
              <p className="text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                Thin-air convective cooling derating alert threshold (default 55.0 kPa)
              </p>
              <input
                type="number"
                step="0.5"
                value={lowPress}
                onChange={(e) => setLowPress(parseFloat(e.target.value))}
                className="w-full p-2 rounded border outline-none font-bold text-sm"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)', color: 'var(--accent-primary)' }}
              />
            </div>

            {/* Save Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
                style={{ backgroundColor: 'var(--accent-primary)', color: '#07111F' }}
              >
                <Save className="w-4 h-4" />
                <span>Save Calibration Parameters</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SYSTEM INFO */}
      {activeTab === 'system' && (
        <div className="cockpit-card p-6 rounded-xl border space-y-4 font-mono text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--text-primary)' }}>
            Hardware System Architecture &amp; Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'Device Identifier', val: 'LSH-24-05-0017' },
              { label: 'Firmware Build', val: 'v2.3.7-PROD (ESP32 Xtensa Dual Core)' },
              { label: 'Geographic Deployment', val: 'High-Altitude Area (Ladakh Plateau Sector)' },
              { label: 'Calibrated Altitude', val: `${bme280.altitude} m MSL (Barometric)` },
              { label: 'Primary Telemetry Controller', val: 'ESP32 NodeMCU-32S (FreeRTOS v10.4)' },
              { label: 'Environmental Sensor', val: 'Bosch Sensortec BME280 (I2C 0x76)' },
              { label: 'Power Telemetry Sensor', val: 'Texas Instruments INA219 / INA226 (I2C 0x40)' },
              { label: 'Long Range RF Transceiver', val: 'Semtech SX1278 LoRa 433/868 MHz' },
              { label: 'Local Display Interface', val: '0.96" SSD1306 OLED (I2C 0x3C)' },
              { label: 'Offline Telemetry Sink', val: 'MicroSD SPI Module (FAT32 32GB)' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.label}:</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.val}</span>
              </div>
            ))}
          </div>

          {/* Data Source Switcher (SIMULATED / LIVE / OFFLINE) */}
          <div className="p-4 rounded-xl border mt-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <h4 className="font-bold text-xs uppercase mb-1" style={{ color: 'var(--text-primary)' }}>
              Active Data Source Mode
            </h4>
            <p className="text-[11px] mb-3" style={{ color: 'var(--text-secondary)' }}>
              Toggle between internal physics simulation, live ESP32 hardware endpoint, or offline cached playback
            </p>
            <div className="flex space-x-2">
              {(['SIMULATED', 'LIVE', 'OFFLINE'] as const).map(src => (
                <button
                  key={src}
                  onClick={() => setDataSource(src)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                    dataSource === src ? 'bg-[#00D9FF] text-[#07111F] font-extrabold' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: dataSource === src ? 'var(--accent-primary)' : 'transparent',
                    color: dataSource === src ? '#07111F' : 'var(--text-primary)',
                    borderColor: dataSource === src ? 'var(--accent-primary)' : 'var(--border-subtle)'
                  }}
                >
                  DATA SOURCE: {src}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="cockpit-card p-6 rounded-xl border space-y-4 font-mono text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--text-primary)' }}>
            Alert &amp; Annunciator Configuration
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <div>
                <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>Audible Piezo Buzzer Synthesizer</div>
                <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Plays tactical frequency tones when critical/warning thresholds are breached</div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-4 py-1.5 rounded text-xs font-bold ${soundEnabled ? 'bg-[#00FF9C] text-[#07111F]' : 'bg-[#1E4055] text-[#8FA3B8]'}`}
              >
                {soundEnabled ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            <div className="p-3.5 rounded-lg border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <div>
                <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>Critical Priority Visual Banners</div>
                <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Displays pulsing red cockpit alerts during overcurrent and thermal emergencies</div>
              </div>
              <span className="text-[#00FF9C] font-bold">ACTIVE</span>
            </div>

            <div className="p-3.5 rounded-lg border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <div>
                <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>Automatic Incident Persistence</div>
                <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Flushes all fault snapshots to MicroSD blackbox storage automatically</div>
              </div>
              <span className="text-[#00FF9C] font-bold">ENABLED (FAT32)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ESP32 / MYSQL BACKEND INTEGRATION */}
      {activeTab === 'esp32' && (
        <div className="cockpit-card p-6 rounded-xl border space-y-6 font-mono text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                ESP32 Hardware &amp; MySQL Backend Ready Architecture
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Clean API client prepared for real hardware deployment and relational storage integration
              </p>
            </div>
            {apiSaveSuccess && (
              <span className="text-[#00FF9C] font-bold flex items-center">
                <Check className="w-4 h-4 mr-1" /> API ENDPOINT SAVED
              </span>
            )}
          </div>

          <form onSubmit={handleSaveApiConfig} className="space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                ESP32 / API Gateway Endpoint URL
              </label>
              <input
                type="text"
                value={esp32Url}
                onChange={(e) => setEsp32Url(e.target.value)}
                placeholder="http://192.168.4.1/api or https://your-server.com/api"
                className="w-full p-2.5 rounded border outline-none"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Hardware Security Token / API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Optional token for authenticated ESP32 REST ingest"
                className="w-full p-2.5 rounded border outline-none"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded text-xs font-bold uppercase tracking-wider text-[#07111F] font-mono"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Update API Configuration
            </button>
          </form>

          {/* API Endpoints Reference */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <h4 className="font-bold text-xs uppercase mb-2" style={{ color: 'var(--text-primary)' }}>
              Standardized REST API Ingress Endpoints
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <span className="text-[#00FF9C] font-bold">POST /api/sensor-data</span>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Ingests BME280 &amp; INA219 readings from ESP32</p>
              </div>
              <div className="p-2 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <span className="text-[#00D9FF] font-bold">GET /api/sensor-data</span>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Streams recent 24-hour telemetry time-series</p>
              </div>
              <div className="p-2 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <span className="text-[#00D9FF] font-bold">GET /api/equipment</span>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Retrieves status of Drone, Radar, Radio, Computer, Battery</p>
              </div>
              <div className="p-2 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <span className="text-[#FFB020] font-bold">POST /api/protection</span>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Dispatches actuator commands (Heater, Fan, MOSFET)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DATA MANAGEMENT */}
      {activeTab === 'data' && (
        <div className="cockpit-card p-6 rounded-xl border space-y-4 font-mono text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--text-primary)' }}>
            Data Persistence &amp; Storage Maintenance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={exportCsvLogs}
              className="p-4 rounded-xl border text-center transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: '#00FF9C', color: '#00FF9C' }}
            >
              <Database className="w-6 h-6 mx-auto mb-2" />
              <div className="font-bold text-xs">EXPORT CSV LOGS</div>
              <div className="text-[10px] opacity-70 mt-1">Download RFC 4180 Table</div>
            </button>

            <button
              onClick={downloadJsonLogs}
              className="p-4 rounded-xl border text-center transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
            >
              <HardDrive className="w-6 h-6 mx-auto mb-2" />
              <div className="font-bold text-xs">DOWNLOAD SYSTEM DUMP</div>
              <div className="text-[10px] opacity-70 mt-1">Full JSON System State</div>
            </button>

            <button
              onClick={clearDataBuffer}
              className="p-4 rounded-xl border text-center transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: '#FF4D4D', color: '#FF4D4D' }}
            >
              <RotateCcw className="w-6 h-6 mx-auto mb-2" />
              <div className="font-bold text-xs">CLEAR LOCAL BUFFER</div>
              <div className="text-[10px] opacity-70 mt-1">Purge In-Memory Telemetry</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
