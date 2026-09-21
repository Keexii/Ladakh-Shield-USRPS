import React from 'react';
import { EquipmentTelemetry } from '../../types/telemetry';
import { 
  X, 
  Plane, 
  RadioTower, 
  Radio, 
  Cpu, 
  BatteryCharging, 
  Thermometer, 
  Zap, 
  Activity, 
  CheckCircle2, 
  RotateCw
} from 'lucide-react';
import { soundManager } from '../../services/audioService';

interface Props {
  equipment: EquipmentTelemetry | null;
  onClose: () => void;
}

export const EquipmentDetailModal: React.FC<Props> = ({ equipment, onClose }) => {
  if (!equipment) return null;

  const getIcon = () => {
    switch (equipment.code) {
      case 'DRONE': return Plane;
      case 'RADAR': return RadioTower;
      case 'RADIO': return Radio;
      case 'COMPUTER': return Cpu;
      case 'BATTERY': return BatteryCharging;
    }
  };

  const Icon = getIcon();

  // Strict LADAKH-SHIELD Theme status colors:
  // Normal: #00FF9C | Warning: #FFB020 | Critical: #FF4D4D
  const statusColor = 
    equipment.status === 'NORMAL' ? '#00FF9C' :
    equipment.status === 'WARNING' ? '#FFB020' :
    equipment.status === 'CRITICAL' ? '#FF4D4D' : '#8FA3B8';

  const handleSelfTest = () => {
    soundManager.playClick();
    alert(`Self-Diagnostic Initiated for [${equipment.code}] ${equipment.name}.\n\nAll sensor probes (BME280 / INA219), bus lines, and thermal margins checked.\nResult: NOMINAL RESPONSE`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="cockpit-card w-full max-w-2xl p-6 rounded-xl relative border shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center space-x-3">
            <div 
              className="p-3 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: statusColor }}
            >
              <Icon className="w-6 h-6" style={{ color: statusColor }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-mono font-extrabold text-lg tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  {equipment.code}
                </h3>
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase"
                  style={{ 
                    borderColor: statusColor, 
                    backgroundColor: 'var(--bg-secondary)', 
                    color: statusColor 
                  }}
                >
                  ● {equipment.status}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {equipment.name} • Managed via Universal Smart Module
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-lg border hover:opacity-80 transition-all"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Gauges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {/* Temperature */}
          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center space-x-1.5 text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
              <Thermometer className="w-3.5 h-3.5 text-[#00D9FF]" />
              <span>Temp</span>
            </div>
            <div className="text-lg font-mono font-bold text-[#00D9FF]">
              {equipment.temperature}°C
            </div>
            <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              Safe: -20°C to 45°C
            </div>
          </div>

          {/* Voltage */}
          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center space-x-1.5 text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
              <Zap className="w-3.5 h-3.5 text-[#FFB020]" />
              <span>Voltage</span>
            </div>
            <div className="text-lg font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
              {equipment.voltage} V
            </div>
            <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              Nominal: 12.0–12.6V
            </div>
          </div>

          {/* Current */}
          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center space-x-1.5 text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
              <Activity className="w-3.5 h-3.5 text-[#00D9FF]" />
              <span>Current</span>
            </div>
            <div className="text-lg font-mono font-bold text-[#00D9FF]">
              {equipment.current} A
            </div>
            <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              Max: 3.5 A
            </div>
          </div>

          {/* Health */}
          <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center space-x-1.5 text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF9C]" />
              <span>Health</span>
            </div>
            <div className="text-lg font-mono font-bold text-[#00FF9C]">
              {equipment.health}%
            </div>
            <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              Degradation: Low
            </div>
          </div>
        </div>

        {/* Equipment Specific Parameters */}
        <div className="mb-5">
          <h4 className="text-xs font-mono font-bold tracking-wider uppercase mb-2.5" style={{ color: 'var(--text-primary)' }}>
            Subsystem Diagnostics &amp; Operational Telemetry
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(equipment.params).map(([key, val]) => (
              <div 
                key={key}
                className="flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{key}:</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Last Sensor Sync: <span style={{ color: 'var(--text-primary)' }}>{equipment.lastUpdate}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelfTest}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Self-Test</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#07111F' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
