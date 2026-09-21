import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Thermometer, 
  Gauge, 
  Droplets, 
  Zap, 
  Activity, 
  BatteryMedium, 
  Clock, 
  Plane, 
  RadioTower, 
  Radio, 
  Cpu, 
  BatteryCharging, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export const DashboardView: React.FC = () => {
  const { 
    bme280, 
    ina219, 
    battery, 
    equipment, 
    setSelectedEquipment, 
    subsystems, 
    riskAnalysis,
    historicalSensorData 
  } = useTelemetry();

  const formatRemainingTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getEquipIcon = (code: string) => {
    switch (code) {
      case 'DRONE': return Plane;
      case 'RADAR': return RadioTower;
      case 'RADIO': return Radio;
      case 'COMPUTER': return Cpu;
      case 'BATTERY': return BatteryCharging;
      default: return Activity;
    }
  };

  // Strict LADAKH-SHIELD Theme status colors:
  // Normal: #00FF9C | Warning: #FFB020 | Critical: #FF4D4D
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL': return '#00FF9C';
      case 'WARNING': return '#FFB020';
      case 'CRITICAL': return '#FF4D4D';
      default: return '#8FA3B8';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner: One Universal Smart Module Motto */}
      <div 
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-3 relative overflow-hidden"
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderColor: 'var(--border-subtle)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                MISSION DIRECTIVE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                HIGH-ALTITUDE (4,850m)
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold font-mono tracking-tight" style={{ color: 'var(--text-primary)' }}>
              ONE UNIVERSAL SMART MODULE FOR MULTIPLE ELECTRONIC SYSTEMS
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono sm:text-right" style={{ color: 'var(--text-secondary)' }}>
          <span className="px-2 py-1 rounded border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
            SENSE → ANALYZE → DECIDE → PROTECT → ALERT → LOG
          </span>
        </div>
      </div>

      {/* SECTION 1: ENVIRONMENT MONITORING (BME280) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              1. Environment Telemetry (Bosch BME280)
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--accent-primary)' }}>
              I2C 0x76
            </span>
          </div>
          <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            Sample Rate: 1.0 Hz
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Temperature */}
          <div className="cockpit-card p-4 rounded-xl border relative overflow-hidden">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>Ambient Temperature</span>
                <div className="flex items-baseline space-x-1 mt-1">
                  <span className="text-3xl font-mono font-extrabold tracking-tight" style={{ color: 'var(--accent-primary)' }}>
                    {bme280.temperature}
                  </span>
                  <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>°C</span>
                </div>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <Thermometer className="w-5 h-5 text-[#00D9FF]" />
              </div>
            </div>

            {/* Indicator progress bar */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                <span>Freeze Limit (-20°C)</span>
                <span className={bme280.temperature < -20 ? 'text-[#FFB020] font-bold' : 'text-[#00FF9C]'}>
                  {bme280.temperature < -20 ? 'SUB-ZERO WARNING' : 'NOMINAL'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${Math.min(100, Math.max(10, ((bme280.temperature + 45) / 90) * 100))}%`,
                    backgroundColor: bme280.temperature < -20 ? '#FFB020' : '#00FF9C'
                  }}
                />
              </div>
            </div>

            {/* Mini Sparkline Chart */}
            <div className="h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalSensorData}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="temperature" stroke="#00D9FF" strokeWidth={1.5} fillOpacity={1} fill="url(#tempGrad)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Atmospheric Pressure */}
          <div className="cockpit-card p-4 rounded-xl border relative overflow-hidden">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>Atmospheric Pressure</span>
                <div className="flex items-baseline space-x-1 mt-1">
                  <span className="text-3xl font-mono font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {bme280.pressure}
                  </span>
                  <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>kPa</span>
                </div>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <Gauge className="w-5 h-5 text-[#00D9FF]" />
              </div>
            </div>

            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                <span>Sea Level: 101.3 kPa</span>
                <span className="text-[#00D9FF] font-bold">ALTITUDE: 4,850m</span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00D9FF] transition-all duration-500 rounded-full"
                  style={{ width: `${(bme280.pressure / 101.3) * 100}%` }}
                />
              </div>
            </div>

            <div className="h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalSensorData}>
                  <defs>
                    <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="pressure" stroke="#00D9FF" strokeWidth={1.5} fillOpacity={1} fill="url(#pressGrad)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Relative Humidity */}
          <div className="cockpit-card p-4 rounded-xl border relative overflow-hidden">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>Relative Humidity</span>
                <div className="flex items-baseline space-x-1 mt-1">
                  <span className="text-3xl font-mono font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {bme280.humidity}
                  </span>
                  <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>%</span>
                </div>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <Droplets className="w-5 h-5 text-[#00D9FF]" />
              </div>
            </div>

            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                <span>Arid Cold Air</span>
                <span className="text-[#00FF9C] font-bold">ICE HAZARD: LOW</span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00D9FF] transition-all duration-500 rounded-full"
                  style={{ width: `${bme280.humidity}%` }}
                />
              </div>
            </div>

            <div className="h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalSensorData}>
                  <defs>
                    <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="humidity" stroke="#00D9FF" strokeWidth={1.5} fillOpacity={1} fill="url(#humGrad)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: POWER MONITORING (INA219 / INA226) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              2. Electrical &amp; Power Telemetry (TI INA219 / INA226)
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--accent-primary)' }}>
              I2C 0x40
            </span>
          </div>
          <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            Formula: Power = Voltage × Current
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Bus Voltage */}
          <div className="cockpit-card p-3.5 rounded-xl border">
            <div className="flex items-center justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Bus Voltage</span>
              <Zap className="w-4 h-4 text-[#FFB020]" />
            </div>
            <div className="text-2xl font-mono font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {ina219.voltage} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>V</span>
            </div>
            <div className="text-[10px] font-mono mt-1" style={{ color: ina219.voltage < 11.1 ? '#FF4D4D' : '#00FF9C' }}>
              {ina219.voltage < 11.1 ? 'CRITICAL SAG' : 'REGULATED 12V'}
            </div>
          </div>

          {/* Current Draw */}
          <div className="cockpit-card p-3.5 rounded-xl border">
            <div className="flex items-center justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Load Current</span>
              <Activity className="w-4 h-4 text-[#00D9FF]" />
            </div>
            <div className="text-2xl font-mono font-extrabold" style={{ color: 'var(--accent-primary)' }}>
              {ina219.current} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>A</span>
            </div>
            <div className="text-[10px] font-mono mt-1" style={{ color: ina219.current > 3.5 ? '#FF4D4D' : '#00FF9C' }}>
              {ina219.current > 3.5 ? 'OVERCURRENT SURGE' : 'SHEDDING LIMIT 3.5A'}
            </div>
          </div>

          {/* Auto Calculated Power */}
          <div className="cockpit-card p-3.5 rounded-xl border">
            <div className="flex items-center justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Calculated Power</span>
              <span className="text-[9px] font-mono px-1 rounded bg-[#00D9FF]/20 text-[#00D9FF]">V × A</span>
            </div>
            <div className="text-2xl font-mono font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {ina219.power} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>W</span>
            </div>
            <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
              Dissipation Nominal
            </div>
          </div>

          {/* Battery Health */}
          <div className="cockpit-card p-3.5 rounded-xl border">
            <div className="flex items-center justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Battery SOC</span>
              <BatteryMedium className="w-4 h-4 text-[#00FF9C]" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-[#00FF9C]">
              {battery.socPct} <span className="text-xs font-normal text-[#00FF9C]/70">%</span>
            </div>
            <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
              Health SOH: {battery.healthPct}%
            </div>
          </div>

          {/* Remaining Time Countdown */}
          <div className="cockpit-card p-3.5 rounded-xl border col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Autonomy Time</span>
              <Clock className="w-4 h-4 text-[#00D9FF]" />
            </div>
            <div className="text-2xl font-mono font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {formatRemainingTime(battery.remainingSeconds)}
            </div>
            <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
              Remaining @ {ina219.current}A load
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: EQUIPMENT HEALTH (5 CLICKABLE CARDS) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            3. Equipment Health Matrix (Click card for detailed diagnostic view)
          </h3>
          <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            Universal Smart Module Managed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {Object.values(equipment).map((eq) => {
            const Icon = getEquipIcon(eq.code);
            const statusColor = getStatusColor(eq.status);
            return (
              <div
                key={eq.code}
                onClick={() => setSelectedEquipment(eq)}
                className="cockpit-card cockpit-card-interactive p-4 rounded-xl border relative group flex flex-col justify-between"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: statusColor }}>
                        <Icon className="w-4 h-4" style={{ color: statusColor }} />
                      </div>
                      <span className="font-mono font-bold text-sm tracking-wider" style={{ color: 'var(--text-primary)' }}>
                        {eq.code}
                      </span>
                    </div>

                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent-primary)' }} />
                  </div>

                  <div className="flex items-center space-x-1.5 mb-3">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
                    <span className="text-[11px] font-mono font-bold" style={{ color: statusColor }}>
                      {eq.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono mb-3">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Temperature:</span>
                      <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{eq.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Voltage:</span>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{eq.voltage} V</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Current:</span>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{eq.current} A</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Health:</span>
                      <span className="font-bold text-[#00FF9C]">{eq.health}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-[10px] font-mono" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <span>Last sync</span>
                  <span>{eq.lastUpdate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: RULE-BASED RISK ENGINE & OVERALL SYSTEM HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subsystems Health Matrix Card */}
        <div className="cockpit-card p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Subsystem Verification Matrix
            </h4>
            <span 
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase"
              style={{ 
                borderColor: getStatusColor(subsystems.overall),
                backgroundColor: 'var(--bg-secondary)',
                color: getStatusColor(subsystems.overall)
              }}
            >
              {subsystems.overall === 'NORMAL' ? 'OPERATIONAL' : subsystems.overall}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {[
              { label: 'Power System', state: subsystems.powerSystem },
              { label: 'Sensor Array (BME+INA)', state: subsystems.sensorArray },
              { label: 'LoRa SX1278 Link', state: subsystems.communication },
              { label: 'SD Blackbox Storage', state: subsystems.dataStorage },
              { label: 'Thermal Management', state: subsystems.thermalManagement },
              { label: 'Protection Actuators', state: subsystems.protectionSystem },
            ].map((sub, idx) => {
              const col = getStatusColor(sub.state);
              return (
                <div key={idx} className="flex items-center justify-between py-1 px-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{sub.label}</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col, boxShadow: `0 0 5px ${col}` }} />
                    <span className="font-bold" style={{ color: col }}>
                      {sub.state === 'NORMAL' ? 'OK' : sub.state}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RULE-BASED RISK ANALYSIS ENGINE CARD */}
        <div className="cockpit-card p-4 rounded-xl border lg:col-span-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" style={{ color: getStatusColor(riskAnalysis.riskLevel) }} />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Autonomous Rule-Based Risk Engine
              </h4>
            </div>
            <div className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              Deterministic State Analysis
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: getStatusColor(riskAnalysis.riskLevel) }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>CURRENT RISK LEVEL:</span>
                <span 
                  className="font-bold text-sm tracking-wider uppercase"
                  style={{ color: getStatusColor(riskAnalysis.riskLevel) }}
                >
                  ● {riskAnalysis.riskLevel}
                </span>
              </div>
              <div className="mb-2">
                <span style={{ color: 'var(--text-muted)' }}>REASON: </span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{riskAnalysis.primaryReason}</span>
              </div>
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-[#00D9FF] font-bold">RECOMMENDED ACTION: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{riskAnalysis.recommendedAction}</span>
              </div>
            </div>

            {/* Active Rules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {riskAnalysis.activeRules.map((rule) => (
                <div 
                  key={rule.id}
                  className="p-2 rounded border flex items-center justify-between"
                  style={{ 
                    borderColor: rule.triggered ? '#FFB020' : 'var(--border-subtle)',
                    backgroundColor: rule.triggered ? 'rgba(255, 176, 32, 0.08)' : 'var(--bg-secondary)'
                  }}
                >
                  <span style={{ color: rule.triggered ? '#FFB020' : 'var(--text-muted)' }}>
                    {rule.name}
                  </span>
                  <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${rule.triggered ? 'bg-[#FFB020]/20 text-[#FFB020]' : 'text-[#00FF9C]'}`}>
                    {rule.triggered ? 'TRIGGERED' : 'CLEAR'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
