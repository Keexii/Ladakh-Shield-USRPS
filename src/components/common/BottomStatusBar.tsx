import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { MapPin, Mountain, Cpu, ShieldCheck, Database } from 'lucide-react';

export const BottomStatusBar: React.FC = () => {
  const { dataSource, bme280 } = useTelemetry();

  // Strict LADAKH-SHIELD Theme status colors:
  // LIVE: #00FF9C | SIMULATED: #00D9FF | OFFLINE: #FF4D4D
  const sourceColor = 
    dataSource === 'LIVE' ? '#00FF9C' :
    dataSource === 'SIMULATED' ? '#00D9FF' : '#FF4D4D';

  return (
    <footer 
      className="fixed bottom-0 left-0 right-0 z-30 border-t py-1.5 px-4 text-[11px] font-mono backdrop-blur-md transition-all"
      style={{ 
        backgroundColor: 'var(--header-bg)', 
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-secondary)'
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1">
        {/* Left: Location & Altitude */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
            <span>Location: <strong style={{ color: 'var(--text-primary)' }}>High Altitude Area (Ladakh Sector)</strong></span>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5">
            <Mountain className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
            <span>Altitude: <strong style={{ color: 'var(--text-primary)' }}>{bme280.altitude} m MSL</strong></span>
          </div>
        </div>

        {/* Center: Device ID & Firmware */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span>Device ID: <strong style={{ color: 'var(--text-primary)' }}>LSH-24-05-0017</strong></span>
          </div>
          <div>
            <span>Firmware: <strong style={{ color: 'var(--text-primary)' }}>v2.3.7-PROD</strong></span>
          </div>
        </div>

        {/* Right: Data Source & Security */}
        <div className="flex items-center space-x-4">
          <div 
            className="flex items-center space-x-1 px-2 py-0.5 rounded border"
            style={{ 
              borderColor: sourceColor,
              backgroundColor: 'var(--bg-secondary)',
              color: sourceColor
            }}
          >
            <Database className="w-3 h-3" />
            <span className="font-bold uppercase tracking-wider text-[10px]">
              DATA SOURCE: {dataSource}
            </span>
          </div>

          <div className="flex items-center space-x-1" style={{ color: '#00FF9C' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-bold">SECURE (AES-128)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
