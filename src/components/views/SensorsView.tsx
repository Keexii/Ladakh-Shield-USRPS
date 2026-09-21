import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Thermometer, 
  Gauge, 
  Droplets, 
  Zap, 
  Activity, 
  TrendingUp, 
  Database,
  Cpu
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

type TimeFilter = '1H' | '6H' | '24H' | '7D';

export const SensorsView: React.FC = () => {
  const { bme280, ina219, historicalSensorData, dataSource } = useTelemetry();
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>('1H');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner: Prominent Data Source Notice */}
      <div 
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <Cpu className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-mono font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                HIGH-ALTITUDE SENSOR TELEMETRY SUITE
              </h2>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Dual I2C Bus Acquisition: Bosch BME280 (0x76) &amp; Texas Instruments INA219/INA226 (0x40)
            </p>
          </div>
        </div>

        {/* Mandatory Transparency Label */}
        <div className="flex items-center space-x-3">
          <div 
            className="px-3 py-1.5 rounded-lg border flex items-center space-x-2 font-mono text-xs"
            style={{ 
              borderColor: dataSource === 'LIVE' ? '#00FF9C' : '#00D9FF',
              backgroundColor: 'var(--bg-secondary)',
              color: dataSource === 'LIVE' ? '#00FF9C' : '#00D9FF'
            }}
          >
            <Database className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider">
              DATA SOURCE: {dataSource}
            </span>
          </div>

          {/* Time Filter Tabs */}
          <div className="flex rounded-lg border p-1" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            {(['1H', '6H', '24H', '7D'] as TimeFilter[]).map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeFilter(tf)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
                  selectedTimeFilter === tf ? 'font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedTimeFilter === tf ? 'var(--accent-primary)' : 'transparent',
                  color: selectedTimeFilter === tf ? '#07111F' : 'var(--text-primary)'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Core Sensor Metric Summaries */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Temp */}
        <div className="cockpit-card p-3 rounded-xl border">
          <div className="flex items-center justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-[#00D9FF]" />
          </div>
          <div className="text-xl font-mono font-bold text-[#00D9FF]">
            {bme280.temperature}°C
          </div>
          <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            BME280 Ambient
          </div>
        </div>

        {/* Pressure */}
        <div className="cockpit-card p-3 rounded-xl border">
          <div className="flex items-center justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Pressure</span>
            <Gauge className="w-3.5 h-3.5 text-[#00D9FF]" />
          </div>
          <div className="text-xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
            {bme280.pressure} <span className="text-xs">kPa</span>
          </div>
          <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            4,850m Baro Alt
          </div>
        </div>

        {/* Humidity */}
        <div className="cockpit-card p-3 rounded-xl border">
          <div className="flex items-center justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-[#00D9FF]" />
          </div>
          <div className="text-xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
            {bme280.humidity}%
          </div>
          <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Arid Plateau Air
          </div>
        </div>

        {/* Voltage */}
        <div className="cockpit-card p-3 rounded-xl border">
          <div className="flex items-center justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Voltage</span>
            <Zap className="w-3.5 h-3.5 text-[#FFB020]" />
          </div>
          <div className="text-xl font-mono font-bold text-[#FFB020]">
            {ina219.voltage} V
          </div>
          <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            INA219 High-Side
          </div>
        </div>

        {/* Current */}
        <div className="cockpit-card p-3 rounded-xl border">
          <div className="flex items-center justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Current</span>
            <Activity className="w-3.5 h-3.5 text-[#00FF9C]" />
          </div>
          <div className="text-xl font-mono font-bold text-[#00FF9C]">
            {ina219.current} A
          </div>
          <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Shunt 0.1Ω Resistor
          </div>
        </div>

        {/* Power */}
        <div className="cockpit-card p-3 rounded-xl border">
          <div className="flex items-center justify-between text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Power</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#00D9FF]" />
          </div>
          <div className="text-xl font-mono font-bold text-[#00D9FF]">
            {ina219.power} W
          </div>
          <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Autocalc: V × A
          </div>
        </div>
      </div>

      {/* 6 Real-Time Dynamic Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 1: Temperature vs Time */}
        <div className="cockpit-card p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-[#00D9FF]" />
              <h4 className="text-xs font-mono font-bold uppercase" style={{ color: 'var(--text-primary)' }}>
                1. Temperature vs Time (°C)
              </h4>
            </div>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Filter: {selectedTimeFilter}</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalSensorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.6} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis domain={[-40, 20]} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
                  formatter={(val: number) => [`${val} °C`, 'Temperature']}
                />
                <Area type="monotone" dataKey="temperature" stroke="#00D9FF" strokeWidth={2} fill="rgba(0, 217, 255, 0.15)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Pressure vs Time */}
        <div className="cockpit-card p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-[#00D9FF]" />
              <h4 className="text-xs font-mono font-bold uppercase" style={{ color: 'var(--text-primary)' }}>
                2. Atmospheric Pressure vs Time (kPa)
              </h4>
            </div>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Filter: {selectedTimeFilter}</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalSensorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.6} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis domain={[40, 80]} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
                  formatter={(val: number) => [`${val} kPa`, 'Pressure']}
                />
                <Area type="monotone" dataKey="pressure" stroke="#00D9FF" strokeWidth={2} fill="rgba(0, 217, 255, 0.15)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Humidity vs Time */}
        <div className="cockpit-card p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-[#00D9FF]" />
              <h4 className="text-xs font-mono font-bold uppercase" style={{ color: 'var(--text-primary)' }}>
                3. Relative Humidity vs Time (%)
              </h4>
            </div>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Filter: {selectedTimeFilter}</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalSensorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.6} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 60]} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
                  formatter={(val: number) => [`${val} %`, 'Humidity']}
                />
                <Area type="monotone" dataKey="humidity" stroke="#00D9FF" strokeWidth={2} fill="rgba(0, 217, 255, 0.15)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Voltage vs Time */}
        <div className="cockpit-card p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#FFB020]" />
              <h4 className="text-xs font-mono font-bold uppercase" style={{ color: 'var(--text-primary)' }}>
                4. Bus Voltage vs Time (V)
              </h4>
            </div>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Filter: {selectedTimeFilter}</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalSensorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.6} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis domain={[10, 14]} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
                  formatter={(val: number) => [`${val} V`, 'Voltage']}
                />
                <Line type="monotone" dataKey="voltage" stroke="#FFB020" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 5: Current vs Time */}
        <div className="cockpit-card p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#00FF9C]" />
              <h4 className="text-xs font-mono font-bold uppercase" style={{ color: 'var(--text-primary)' }}>
                5. Load Current vs Time (A)
              </h4>
            </div>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Filter: {selectedTimeFilter}</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalSensorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.6} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 6]} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
                  formatter={(val: number) => [`${val} A`, 'Current']}
                />
                <Line type="monotone" dataKey="current" stroke="#00FF9C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 6: Power vs Time */}
        <div className="cockpit-card p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#00D9FF]" />
              <h4 className="text-xs font-mono font-bold uppercase" style={{ color: 'var(--text-primary)' }}>
                6. Total Dissipated Power vs Time (W)
              </h4>
            </div>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Filter: {selectedTimeFilter}</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalSensorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.6} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 70]} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
                  formatter={(val: number) => [`${val} W`, 'Power (V × A)']}
                />
                <Area type="monotone" dataKey="power" stroke="#00D9FF" strokeWidth={2} fill="rgba(0, 217, 255, 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
