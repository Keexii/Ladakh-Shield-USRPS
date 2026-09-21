import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Radio, 
  Wifi, 
  ArrowDown, 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  Database, 
  Activity, 
  Signal, 
  CheckCircle,
  XCircle,
  Sliders,
  Send
} from 'lucide-react';

export const CommunicationView: React.FC = () => {
  const { lora, dataSource } = useTelemetry();
  const [selectedFreq, setSelectedFreq] = useState('433.175 MHz');

  const statusColor = 
    lora.status === 'CONNECTED' ? '#00FF9C' :
    lora.status === 'DISCONNECTED' ? '#FFB020' : '#FF4D4D';

  const packetLogs = [
    { time: '10:14:32', id: '0x3F', rssi: `${lora.rssi} dBm`, snr: `+${lora.snr} dB`, payload: '02 4C 53 48 18 3A F1 2A 9C', crc: 'OK' },
    { time: '10:14:30', id: '0x3E', rssi: `${lora.rssi + 1} dBm`, snr: `+${(lora.snr - 0.2).toFixed(1)} dB`, payload: '02 4C 53 48 18 3A F1 2A 9B', crc: 'OK' },
    { time: '10:14:28', id: '0x3D', rssi: `${lora.rssi - 1} dBm`, snr: `+${lora.snr} dB`, payload: '02 4C 53 48 18 3A F1 2A 9A', crc: 'OK' },
    { time: '10:14:26', id: '0x3C', rssi: `${lora.rssi} dBm`, snr: `+${lora.snr} dB`, payload: '02 4C 53 48 18 3A F1 2A 99', crc: 'OK' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div 
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: statusColor }}>
            <Radio className="w-5 h-5" style={{ color: statusColor }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-mono font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                WIRELESS LORA SX1278 TELEMETRY LINK
              </h2>
              <span 
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border"
                style={{ borderColor: statusColor, color: statusColor, backgroundColor: 'var(--bg-secondary)' }}
              >
                ● {lora.status}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Sub-GHz Chirp Spread Spectrum (CSS) Long-Range RF Link (433 / 868 MHz)
            </p>
          </div>
        </div>

        {/* Data Source Label */}
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
            COMMUNICATION SOURCE: {dataSource}
          </span>
        </div>
      </div>

      {/* VISUAL TOPOLOGY FLOW: ESP32 -> LoRa SX1278 -> Monitoring Station */}
      <div className="cockpit-card p-6 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider mb-5" style={{ color: 'var(--text-primary)' }}>
          Hardware Telemetry Pipeline Topology
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center font-mono">
          {/* Node 1: ESP32 */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-accent)' }}>
            <div className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-primary)' }}>
              <Cpu className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="text-bold text-sm" style={{ color: 'var(--text-primary)' }}>ESP32 MCU</div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>Dual-Core 240MHz</div>
            <div className="text-[9px] mt-0.5 text-[#00FF9C] font-bold">FreeRTOS Acquisition</div>
          </div>

          {/* Arrow 1 */}
          <div className="hidden md:flex flex-col items-center justify-center" style={{ color: 'var(--accent-primary)' }}>
            <span className="text-[10px] mb-1 font-mono">SPI Bus</span>
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent" />
            <ArrowRight className="w-5 h-5 mt-1" />
          </div>

          {/* Node 2: LoRa SX1278 */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: statusColor }}>
            <div className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-primary)' }}>
              <Radio className="w-5 h-5" style={{ color: statusColor }} />
            </div>
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>LoRa SX1278</div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>Semtech Transceiver</div>
            <div className="text-[9px] mt-0.5 font-bold" style={{ color: statusColor }}>{lora.status}</div>
          </div>

          {/* Arrow 2 */}
          <div className="hidden md:flex flex-col items-center justify-center" style={{ color: 'var(--accent-primary)' }}>
            <span className="text-[10px] mb-1 font-mono">CSS RF (433MHz)</span>
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent" />
            <ArrowRight className="w-5 h-5 mt-1" />
          </div>

          {/* Node 3: Monitoring Station */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <div className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-primary)' }}>
              <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Monitoring Station</div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>Cockpit Dashboard</div>
            <div className="text-[9px] mt-0.5 text-[#00FF9C] font-bold">ACTIVE RECEPTION</div>
          </div>
        </div>
      </div>

      {/* LoRa Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Signal Strength */}
        <div className="cockpit-card p-3.5 rounded-xl border">
          <div className="text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>Signal Strength</div>
          <div className="text-2xl font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>
            {lora.rssi} <span className="text-xs">dBm</span>
          </div>
          <div className="text-[10px] font-mono mt-1 text-[#00FF9C]">
            SNR: +{lora.snr} dB
          </div>
        </div>

        {/* Data Rate */}
        <div className="cockpit-card p-3.5 rounded-xl border">
          <div className="text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>Data Rate</div>
          <div className="text-2xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
            {lora.dataRateKbps} <span className="text-xs">kbps</span>
          </div>
          <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
            BW: {lora.bandwidthKhz} kHz
          </div>
        </div>

        {/* Packets Sent */}
        <div className="cockpit-card p-3.5 rounded-xl border">
          <div className="text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>Packets Sent</div>
          <div className="text-2xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
            {lora.packetsSent.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
            From Node TX
          </div>
        </div>

        {/* Packets Received */}
        <div className="cockpit-card p-3.5 rounded-xl border">
          <div className="text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>Packets Recv</div>
          <div className="text-2xl font-mono font-bold text-[#00FF9C]">
            {lora.packetsReceived.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
            CRC Validated
          </div>
        </div>

        {/* Packet Loss */}
        <div className="cockpit-card p-3.5 rounded-xl border">
          <div className="text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>Packet Loss</div>
          <div className={`text-2xl font-mono font-bold ${lora.packetLossPct > 5 ? 'text-[#FF4D4D]' : 'text-[#00FF9C]'}`}>
            {lora.packetLossPct}%
          </div>
          <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
            Reliability: {100 - lora.packetLossPct}%
          </div>
        </div>

        {/* Last Comm */}
        <div className="cockpit-card p-3.5 rounded-xl border">
          <div className="text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>Last Comm</div>
          <div className="text-base font-mono font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {lora.lastCommunication}
          </div>
          <div className="text-[10px] font-mono mt-1 text-[#00FF9C]">
            Heartbeat OK
          </div>
        </div>
      </div>

      {/* Packet Stream & RF Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Packet Stream Console */}
        <div className="cockpit-card p-4 rounded-xl border lg:col-span-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Live RF Telemetry Packet Stream
            </h4>
            <span className="text-[10px] font-mono text-[#00FF9C]">RECEIVING 433MHz CSS</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {packetLogs.map((pkt, i) => (
              <div key={i} className="p-2 rounded border flex flex-wrap items-center justify-between gap-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <span className="text-[#00D9FF]">[{pkt.time}]</span>
                <span className="text-[#F5F7FA] font-bold">{pkt.id}</span>
                <span style={{ color: 'var(--text-muted)' }}>RSSI: {pkt.rssi}</span>
                <span style={{ color: 'var(--text-muted)' }}>SNR: {pkt.snr}</span>
                <span className="text-[#00FF9C] text-[11px]">{pkt.payload}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#00FF9C]/20 text-[#00FF9C] font-bold">CRC {pkt.crc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transceiver Configuration */}
        <div className="cockpit-card p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <Sliders className="w-4 h-4 text-[#00D9FF]" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              RF Configuration
            </h4>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[10px] uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Carrier Frequency</label>
              <select 
                value={selectedFreq}
                onChange={(e) => setSelectedFreq(e.target.value)}
                className="w-full p-2 rounded-lg border text-xs font-mono outline-none"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                <option value="433.175 MHz">433.175 MHz (Ladakh High Sector)</option>
                <option value="868.000 MHz">868.000 MHz (ISM EU/IN)</option>
                <option value="915.000 MHz">915.000 MHz (ISM US)</option>
              </select>
            </div>

            <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Spreading Factor:</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>SF{lora.spreadingFactor} (128 chips)</span>
            </div>

            <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Bandwidth:</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{lora.bandwidthKhz} kHz</span>
            </div>

            <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Coding Rate:</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>4/5</span>
            </div>

            <div className="flex justify-between py-1">
              <span style={{ color: 'var(--text-secondary)' }}>TX Output Power:</span>
              <span className="font-bold text-[#00FF9C]">+20 dBm (100 mW)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
