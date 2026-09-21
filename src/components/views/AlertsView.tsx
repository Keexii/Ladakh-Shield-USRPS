import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle, 
  Trash2, 
  Volume2, 
  VolumeX, 
  CheckCheck
} from 'lucide-react';
import { AlertSeverity, EquipmentCode } from '../../types/telemetry';
import { soundManager } from '../../services/audioService';

export const AlertsView: React.FC = () => {
  const { 
    alerts, 
    acknowledgeAlert, 
    clearAlerts, 
    soundEnabled, 
    setSoundEnabled 
  } = useTelemetry();

  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlertSeverity>('ALL');
  const [equipmentFilter, setEquipmentFilter] = useState<'ALL' | EquipmentCode | 'SYSTEM'>('ALL');

  const filteredAlerts = alerts.filter(a => {
    const matchesSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesEq = equipmentFilter === 'ALL' || a.equipment === equipmentFilter;
    return matchesSev && matchesEq;
  });

  const getSeverityIcon = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICAL': return <AlertOctagon className="w-4 h-4 text-[#FF4D4D]" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-[#FFB020]" />;
      case 'INFO': return <Info className="w-4 h-4 text-[#00D9FF]" />;
    }
  };

  const getSeverityColor = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICAL': return '#FF4D4D';
      case 'WARNING': return '#FFB020';
      case 'INFO': return '#00D9FF';
    }
  };

  const handleTestChime = () => {
    soundManager.playCriticalAlert();
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
            <Bell className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-mono font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                INCIDENT &amp; ALERT DISPATCH CENTER
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF4D4D] text-[#07111F] animate-pulse">
                {alerts.filter(a => !a.acknowledged).length} UNACKNOWLEDGED
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Real-time multi-tier threshold violations with audible piezo buzzer annunciator
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all hover:opacity-80"
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderColor: 'var(--border-subtle)',
              color: soundEnabled ? 'var(--accent-primary)' : 'var(--text-muted)'
            }}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'ALARM ON' : 'ALARM MUTED'}</span>
          </button>

          <button
            onClick={handleTestChime}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            title="Test piezo audio sound synthesis"
          >
            <span>Test Sound</span>
          </button>

          <button
            onClick={clearAlerts}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Severity:</span>
          <div className="flex rounded-lg border p-0.5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  severityFilter === sev ? 'font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: severityFilter === sev ? 'var(--accent-primary)' : 'transparent',
                  color: severityFilter === sev ? '#07111F' : 'var(--text-primary)'
                }}
              >
                {sev}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono ml-2" style={{ color: 'var(--text-muted)' }}>Equipment:</span>
          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value as any)}
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
        </div>

        <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          Showing {filteredAlerts.length} recorded alerts
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const color = getSeverityColor(alert.severity);

          return (
            <div
              key={alert.id}
              className="cockpit-card p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              style={{
                borderColor: alert.acknowledged ? 'var(--border-subtle)' : color,
                backgroundColor: alert.acknowledged ? 'var(--bg-card)' : '#12263A',
                boxShadow: alert.acknowledged ? 'none' : `0 0 10px ${color}33`
              }}
            >
              <div className="flex items-start space-x-3">
                <div 
                  className="p-2 rounded-lg border shrink-0 mt-0.5"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: color }}
                >
                  {getSeverityIcon(alert.severity)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span 
                      className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold uppercase border"
                      style={{ borderColor: color, color: color, backgroundColor: 'var(--bg-secondary)' }}
                    >
                      ● {alert.severity}
                    </span>

                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      {alert.equipment}
                    </span>

                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                      {alert.title}
                    </span>
                  </div>

                  <p className="text-xs font-sans" style={{ color: 'var(--text-secondary)' }}>
                    {alert.message}
                  </p>
                </div>
              </div>

              {/* Right Side: Timestamp and Acknowledge Button */}
              <div className="flex items-center justify-between sm:justify-end space-x-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E4055] shrink-0 font-mono">
                <div className="text-right">
                  <div className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                    {alert.timeFormatted}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {alert.id}
                  </div>
                </div>

                <div>
                  {alert.acknowledged ? (
                    <span className="flex items-center space-x-1 text-xs text-[#00FF9C] font-semibold px-2 py-1 rounded bg-[#00FF9C]/10 border border-[#00FF9C]/30">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>ACK</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded text-xs font-bold border transition-all hover:scale-105"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: color,
                        color: color
                      }}
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="cockpit-card p-12 text-center rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
            <CheckCircle className="w-8 h-8 text-[#00FF9C] mx-auto mb-2" />
            <h3 className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              No Active Alerts Detected
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              All high-altitude telemetry envelopes and power rails operating within calibrated thresholds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
