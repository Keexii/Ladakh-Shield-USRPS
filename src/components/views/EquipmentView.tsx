import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Plane, 
  RadioTower, 
  Radio, 
  Cpu, 
  BatteryCharging, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  RotateCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { EquipmentTelemetry, StatusLevel } from '../../types/telemetry';

export const EquipmentView: React.FC = () => {
  const { equipment, setSelectedEquipment } = useTelemetry();
  const [filterStatus, setFilterStatus] = useState<'ALL' | StatusLevel>('ALL');

  const getEquipIcon = (code: string) => {
    switch (code) {
      case 'DRONE': return Plane;
      case 'RADAR': return RadioTower;
      case 'RADIO': return Radio;
      case 'COMPUTER': return Cpu;
      case 'BATTERY': return BatteryCharging;
      default: return Cpu;
    }
  };

  const getStatusColor = (status: StatusLevel) => {
    switch (status) {
      case 'NORMAL': return '#00FF9C';
      case 'WARNING': return '#FFB020';
      case 'CRITICAL': return '#FF4D4D';
      default: return '#8FA3B8';
    }
  };

  const filteredList = Object.values(equipment).filter(eq => {
    if (filterStatus === 'ALL') return true;
    return eq.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div 
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      >
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-base font-mono font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
              CENTRALIZED EQUIPMENT MONITORING ARRAY
            </h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            One Universal Smart Module dynamically adapting protection profiles for 5 diverse defense platforms
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Status Filter:</span>
          <div className="flex rounded-lg border p-0.5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            {(['ALL', 'NORMAL', 'WARNING', 'CRITICAL'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded transition-all ${
                  filterStatus === st ? 'font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: filterStatus === st ? 'var(--accent-primary)' : 'transparent',
                  color: filterStatus === st ? '#07111F' : 'var(--text-primary)'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Detailed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.map((eq) => {
          const Icon = getEquipIcon(eq.code);
          const statusCol = getStatusColor(eq.status);

          return (
            <div
              key={eq.code}
              className="cockpit-card p-5 rounded-xl border flex flex-col justify-between transition-all"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2.5 rounded-xl border"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: statusCol }}
                    >
                      <Icon className="w-5 h-5" style={{ color: statusCol }} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-mono font-extrabold text-base tracking-wider" style={{ color: 'var(--text-primary)' }}>
                          {eq.code}
                        </h3>
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border"
                          style={{ borderColor: statusCol, color: statusCol, backgroundColor: 'var(--bg-secondary)' }}
                        >
                          ● {eq.status}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {eq.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>HEALTH</div>
                    <div className="text-base font-bold text-[#00FF9C]">{eq.health}%</div>
                  </div>
                </div>

                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-4">
                  <div className="p-2 rounded border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>TEMP</div>
                    <div className="font-bold text-sm" style={{ color: 'var(--accent-primary)' }}>{eq.temperature}°C</div>
                  </div>
                  <div className="p-2 rounded border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>VOLTAGE</div>
                    <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{eq.voltage}V</div>
                  </div>
                  <div className="p-2 rounded border text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>CURRENT</div>
                    <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{eq.current}A</div>
                  </div>
                </div>

                {/* Equipment-Specific Parameters */}
                <div className="space-y-2 mb-4">
                  <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    PLATFORM TELEMETRY:
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(eq.params).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{k}:</span>
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Inspect Action */}
              <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  Sync: {eq.lastUpdate}
                </span>

                <button
                  onClick={() => setSelectedEquipment(eq)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--accent-primary)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Telemetry</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
