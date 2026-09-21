import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  HardDrive, 
  Calendar, 
  CheckCircle2, 
  Database,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { EquipmentCode, StatusLevel } from '../../types/telemetry';

export const DataLogsView: React.FC = () => {
  const { logs, sdCard, exportCsvLogs, downloadJsonLogs, clearDataBuffer } = useTelemetry();
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState<'ALL' | EquipmentCode | 'SYSTEM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StatusLevel>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.alert.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.equipment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEquip = equipmentFilter === 'ALL' || log.equipment === equipmentFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesEquip && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'NORMAL': return '#00FF9C';
      case 'WARNING': return '#FFB020';
      case 'CRITICAL': return '#FF4D4D';
      default: return '#8FA3B8';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Functional Exports */}
      <div 
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <FileText className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-mono font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                HISTORICAL TELEMETRY &amp; BLACKBOX LOGS
              </h2>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Continuous SPI Blackbox persist stream with FAT32 circular partition ring buffer
            </p>
          </div>
        </div>

        {/* Action Buttons: Functional Export CSV & Download Log */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCsvLogs}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: '#00FF9C', color: '#00FF9C' }}
            title="Export RFC 4180 CSV spreadsheet file"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={downloadJsonLogs}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
            title="Download complete JSON diagnostic archive"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD LOG</span>
          </button>

          <button
            onClick={clearDataBuffer}
            className="p-1.5 rounded-lg border transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            title="Purge local log buffer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SD Card Blackbox Hardware Storage Information */}
      <div className="cockpit-card p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-[#00D9FF]" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              MicroSD Blackbox Storage Telemetry
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#00FF9C]/30 text-[#00FF9C] bg-[#00FF9C]/10 font-bold">
            STATUS: {sdCard.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs mb-3">
          <div>
            <div style={{ color: 'var(--text-muted)' }}>Storage Volume</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              32 GB MicroSD Class 10
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Format: {sdCard.fileFormat}</div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)' }}>Capacity Utilization</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--accent-primary)' }}>
              {sdCard.usedMB} MB / {sdCard.totalMB} MB ({sdCard.utilizationPct}%)
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Free: {sdCard.freeMB} MB</div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)' }}>Sustained Write Rate</div>
            <div className="text-sm font-bold mt-0.5 text-[#00FF9C]">
              {sdCard.writeSpeedMBps} MB/s
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>SPI Clock: 20 MHz</div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)' }}>Buffer Architecture</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              Circular Ring Buffer
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Auto-overwrites oldest</div>
          </div>
        </div>

        {/* Utilization bar */}
        <div className="w-full h-2 rounded-full overflow-hidden bg-black/40 border border-[#1E4055]">
          <div 
            className="h-full bg-[#00D9FF] rounded-full"
            style={{ width: `${sdCard.utilizationPct}%` }}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div 
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
          >
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search logs by alert or tag..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none text-xs font-mono w-48"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          {/* Equipment filter */}
          <select
            value={equipmentFilter}
            onChange={(e) => { setEquipmentFilter(e.target.value as any); setCurrentPage(1); }}
            className="p-1.5 rounded-lg border text-xs font-mono outline-none"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Equipment</option>
            <option value="DRONE">Drone</option>
            <option value="RADAR">Radar</option>
            <option value="RADIO">Radio</option>
            <option value="COMPUTER">Computer</option>
            <option value="BATTERY">Battery</option>
            <option value="SYSTEM">System</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
            className="p-1.5 rounded-lg border text-xs font-mono outline-none"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="NORMAL">Normal</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          Showing {currentLogs.length} of {filteredLogs.length} entries
        </div>
      </div>

      {/* HISTORICAL DATA TABLE */}
      <div className="cockpit-card rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">EQUIPMENT</th>
                <th className="p-3">TEMP (°C)</th>
                <th className="p-3">PRESSURE (kPa)</th>
                <th className="p-3">HUMIDITY (%)</th>
                <th className="p-3">VOLTAGE (V)</th>
                <th className="p-3">CURRENT (A)</th>
                <th className="p-3">POWER (W)</th>
                <th className="p-3">HEALTH</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">ALERT / EVENT</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {currentLogs.map((log) => {
                const statusColor = getStatusBadgeColor(log.status);
                return (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>
                      {log.timeFormatted}
                    </td>
                    <td className="p-3 font-bold" style={{ color: 'var(--text-primary)' }}>
                      {log.equipment}
                    </td>
                    <td className="p-3" style={{ color: 'var(--accent-primary)' }}>
                      {log.temperature}°C
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>
                      {log.pressure}
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>
                      {log.humidity}%
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-primary)' }}>
                      {log.voltage}V
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-primary)' }}>
                      {log.current}A
                    </td>
                    <td className="p-3 font-bold" style={{ color: 'var(--accent-primary)' }}>
                      {log.power}W
                    </td>
                    <td className="p-3 text-[#00FF9C] font-bold">
                      {log.health}%
                    </td>
                    <td className="p-3">
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{ borderColor: statusColor, color: statusColor, backgroundColor: 'var(--bg-secondary)' }}
                      >
                        ● {log.status}
                      </span>
                    </td>
                    <td className="p-3" style={{ color: log.alert.includes('Warning') || log.alert.includes('Freeze') ? '#FFB020' : 'var(--text-secondary)' }}>
                      {log.alert}
                    </td>
                  </tr>
                );
              })}
              {currentLogs.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    No telemetry records matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-3 border-t flex items-center justify-between font-mono text-xs" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border disabled:opacity-30"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border disabled:opacity-30"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
