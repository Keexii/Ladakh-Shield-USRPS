import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Palette, 
  Volume2, 
  VolumeX, 
  Activity, 
  Radio, 
  Menu,
  X,
  StopCircle,
  Clock,
  Sun,
  Moon
} from 'lucide-react';
import { ThemeSelectorModal } from './ThemeSelectorModal';

interface Props {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

export const Header: React.FC<Props> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { 
    subsystems, 
    lora, 
    soundEnabled, 
    setSoundEnabled, 
    scenarioRun, 
    stopScenarioTest
  } = useTelemetry();

  const { themeDefinition, setTheme, toggleTheme, isDark } = useTheme();
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-GB', { hour12: false }));
      setDateStr(now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).toUpperCase());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Strict LADAKH-SHIELD Theme status colors:
  // Normal: #00FF9C | Warning: #FFB020 | Critical: #FF4D4D
  const overallStatusColor = 
    subsystems.overall === 'NORMAL' ? '#00FF9C' :
    subsystems.overall === 'WARNING' ? '#FFB020' : '#FF4D4D';

  return (
    <>
      <header 
        className="sticky top-0 z-40 border-b backdrop-blur-md px-4 py-2.5 transition-all"
        style={{ 
          backgroundColor: 'var(--header-bg)', 
          borderColor: 'var(--border-subtle)' 
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg border"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-2.5">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center border shadow-sm relative overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-accent)' 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00D9FF]/20 to-transparent" />
                <Activity className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-extrabold text-base tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    LADAKH-SHIELD
                  </span>
                  <span 
                    className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    V2.3 COCKPIT
                  </span>
                </div>
                <div className="text-[10px] font-mono tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
                  High-Altitude Electronic System Monitoring &amp; Protection
                </div>
              </div>
            </div>
          </div>

          {/* Center: Real-time Date, Time & Scenario Testing Status */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Live Clock */}
            <div className="flex items-center space-x-2 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
              <span>{dateStr}</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{timeStr} IST</span>
            </div>

            {/* Scenario Testing Status Banner */}
            {scenarioRun.isActive ? (
              <div 
                className="flex items-center space-x-2 px-3 py-1 rounded-full border animate-pulse"
                style={{ 
                  backgroundColor: 'rgba(255, 77, 77, 0.15)', 
                  borderColor: '#FF4D4D' 
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#FF4D4D] animate-ping" />
                <span className="text-xs font-mono font-bold text-[#FF4D4D]">
                  SYSTEM TEST: {scenarioRun.currentScenario.replace('_', ' ')}
                </span>
                <button
                  onClick={stopScenarioTest}
                  className="ml-2 flex items-center space-x-1 text-[10px] font-mono bg-[#FF4D4D] hover:opacity-90 text-white px-2 py-0.5 rounded uppercase font-bold transition-all"
                  title="Stop running test"
                >
                  <StopCircle className="w-3 h-3" />
                  <span>Stop</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                <span className="w-2 h-2 rounded-full bg-[#00FF9C]" />
                <span>MONITORING STREAM READY</span>
              </div>
            )}
          </div>

          {/* Right: Controls, Overall Status, Theme Selector */}
          <div className="flex items-center space-x-3">
            {/* Overall System Status Pill */}
            <div 
              className="flex items-center space-x-2 px-2.5 py-1 rounded-full border"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-subtle)' 
              }}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: overallStatusColor, boxShadow: `0 0 8px ${overallStatusColor}` }}
              />
              <span 
                className="text-[11px] font-mono font-bold tracking-wider uppercase"
                style={{ color: overallStatusColor }}
              >
                {subsystems.overall === 'NORMAL' ? 'SYSTEM OPERATIONAL' : `SYSTEM ${subsystems.overall}`}
              </span>
            </div>

            {/* LoRa Connection Pill */}
            <div 
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-subtle)',
                color: lora.status === 'CONNECTED' ? '#00FF9C' : '#FF4D4D'
              }}
              title={`LoRa SX1278 RSSI: ${lora.rssi} dBm`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{lora.status}</span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg border transition-all hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-subtle)',
                color: soundEnabled ? 'var(--accent-primary)' : 'var(--text-muted)'
              }}
              title={soundEnabled ? 'Mute Alert Audio' : 'Enable Alert Audio'}
              aria-label="Toggle audio alarms"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dual Theme Switcher (Dark / Light) */}
            <div 
              className="flex items-center p-0.5 rounded-lg border text-xs font-mono shadow-sm"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-subtle)' 
              }}
            >
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-all ${
                  isDark
                    ? 'font-bold shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isDark ? 'var(--accent-primary)' : 'transparent',
                  color: isDark ? '#07111F' : 'var(--text-primary)',
                }}
                title="Active: Dark Theme (High-Altitude Military-Tech)"
                aria-label="Set Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">DARK</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-all ${
                  !isDark
                    ? 'font-bold shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: !isDark ? 'var(--accent-primary)' : 'transparent',
                  color: !isDark ? '#FFFFFF' : 'var(--text-primary)',
                }}
                title="Active: Light Theme (Arctic Snow & High Visibility)"
                aria-label="Set Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">LIGHT</span>
              </button>
            </div>

            {/* THEME MENU BUTTON */}
            <button
              onClick={() => setThemeModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)'
              }}
              title="Theme Settings & Swatches"
              aria-label="Select cockpit theme"
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Theme Selection Modal */}
      <ThemeSelectorModal isOpen={themeModalOpen} onClose={() => setThemeModalOpen(false)} />
    </>
  );
};
