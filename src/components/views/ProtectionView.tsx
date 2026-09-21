import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { 
  Flame, 
  Snowflake, 
  Zap, 
  AlertOctagon, 
  Play, 
  Square, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  CheckCircle2,
  Power
} from 'lucide-react';
import { EngineeringScenario } from '../../types/protection';
import { SCENARIO_DEFINITIONS } from '../../services/scenarioTester';
import { SafetyConfirmationModal } from '../common/SafetyConfirmationModal';

export const ProtectionView: React.FC = () => {
  const { 
    protection, 
    setActuatorMode, 
    setActuatorStatus, 
    scenarioRun, 
    startScenarioTest, 
    stopScenarioTest, 
    resetScenarioTest 
  } = useTelemetry();

  const [selectedScenario, setSelectedScenario] = useState<EngineeringScenario>('EXTREME_COLD');
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [pendingEmergencyState, setPendingEmergencyState] = useState<'ENGAGED' | 'DISENGAGED'>('ENGAGED');

  const handleEmergencyClick = () => {
    const nextState = protection.emergencyMode.status === 'ENGAGED' ? 'DISENGAGED' : 'ENGAGED';
    setPendingEmergencyState(nextState);
    setSafetyModalOpen(true);
  };

  const confirmEmergency = () => {
    setActuatorStatus('emergencyMode', pendingEmergencyState, 'Manual operator emergency isolation engaged.');
    setSafetyModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div 
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-mono font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                ADAPTIVE PROTECTION ACTUATION SUITE
              </h2>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Closed-loop autonomous thermal and electrical safeguards with manual engineering overrides
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
          <span className="px-2.5 py-1 rounded border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            HYSTERESIS: <strong className="text-[#00FF9C]">ACTIVE (±4°C)</strong>
          </span>
        </div>
      </div>

      {/* 4 PRIMARY PROTECTION ACTUATOR CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ACTUATOR 1: PTC HEATER PAD */}
        <div className="cockpit-card p-4 rounded-xl border flex flex-col justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded bg-[#FFB020]/10 border border-[#FFB020]/30 text-[#FFB020]">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                  HEATER PAD
                </h3>
              </div>
              <div className="flex rounded border p-0.5 text-[10px] font-mono" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
                <button
                  onClick={() => setActuatorMode('heater', 'AUTO')}
                  className={`px-1.5 py-0.5 rounded ${protection.heater.mode === 'AUTO' ? 'bg-[#00D9FF] text-[#07111F] font-bold' : 'opacity-60'}`}
                >
                  AUTO
                </button>
                <button
                  onClick={() => setActuatorMode('heater', 'MANUAL')}
                  className={`px-1.5 py-0.5 rounded ${protection.heater.mode === 'MANUAL' ? 'bg-[#00D9FF] text-[#07111F] font-bold' : 'opacity-60'}`}
                >
                  MANUAL
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className={`font-mono font-extrabold text-sm ${protection.heater.status === 'ON' ? 'text-[#FFB020]' : 'text-[#8FA3B8]'}`}>
                  ● {protection.heater.status}
                </span>
              </div>
              <div className="text-xs font-mono font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {protection.heater.outputMetric}
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono mb-4" style={{ color: 'var(--text-secondary)' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>Trigger:</strong> {protection.heater.reason}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Last Activation:</strong> {protection.heater.lastActivation}</div>
            </div>
          </div>

          <div className="pt-2 border-t flex space-x-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={() => setActuatorStatus('heater', 'ON')}
              disabled={protection.heater.mode === 'AUTO'}
              className="flex-1 py-1.5 text-xs font-mono font-bold rounded border transition-all disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: '#FFB020', color: '#FFB020' }}
            >
              Force ON
            </button>
            <button
              onClick={() => setActuatorStatus('heater', 'OFF')}
              disabled={protection.heater.mode === 'AUTO'}
              className="flex-1 py-1.5 text-xs font-mono font-bold rounded border transition-all disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              Force OFF
            </button>
          </div>
        </div>

        {/* ACTUATOR 2: COOLING FAN */}
        <div className="cockpit-card p-4 rounded-xl border flex flex-col justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF]">
                  <Snowflake className="w-4 h-4" />
                </div>
                <h3 className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                  COOLING FAN
                </h3>
              </div>
              <div className="flex rounded border p-0.5 text-[10px] font-mono" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
                <button
                  onClick={() => setActuatorMode('fan', 'AUTO')}
                  className={`px-1.5 py-0.5 rounded ${protection.fan.mode === 'AUTO' ? 'bg-[#00D9FF] text-[#07111F] font-bold' : 'opacity-60'}`}
                >
                  AUTO
                </button>
                <button
                  onClick={() => setActuatorMode('fan', 'MANUAL')}
                  className={`px-1.5 py-0.5 rounded ${protection.fan.mode === 'MANUAL' ? 'bg-[#00D9FF] text-[#07111F] font-bold' : 'opacity-60'}`}
                >
                  MANUAL
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className={`font-mono font-extrabold text-sm ${protection.fan.status === 'ON' ? 'text-[#00D9FF]' : 'text-[#8FA3B8]'}`}>
                  ● {protection.fan.status}
                </span>
              </div>
              <div className="text-xs font-mono font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {protection.fan.outputMetric}
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono mb-4" style={{ color: 'var(--text-secondary)' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>Trigger:</strong> {protection.fan.reason}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Last Activation:</strong> {protection.fan.lastActivation}</div>
            </div>
          </div>

          <div className="pt-2 border-t flex space-x-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={() => setActuatorStatus('fan', 'ON')}
              disabled={protection.fan.mode === 'AUTO'}
              className="flex-1 py-1.5 text-xs font-mono font-bold rounded border transition-all disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: '#00D9FF', color: '#00D9FF' }}
            >
              Force ON
            </button>
            <button
              onClick={() => setActuatorStatus('fan', 'OFF')}
              disabled={protection.fan.mode === 'AUTO'}
              className="flex-1 py-1.5 text-xs font-mono font-bold rounded border transition-all disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              Force OFF
            </button>
          </div>
        </div>

        {/* ACTUATOR 3: POWER MOSFET BREAKER */}
        <div className="cockpit-card p-4 rounded-xl border flex flex-col justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded bg-[#00FF9C]/10 border border-[#00FF9C]/30 text-[#00FF9C]">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                  MOSFET BREAKER
                </h3>
              </div>
              <div className="flex rounded border p-0.5 text-[10px] font-mono" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
                <button
                  onClick={() => setActuatorMode('powerMosfet', 'AUTO')}
                  className={`px-1.5 py-0.5 rounded ${protection.powerMosfet.mode === 'AUTO' ? 'bg-[#00D9FF] text-[#07111F] font-bold' : 'opacity-60'}`}
                >
                  AUTO
                </button>
                <button
                  onClick={() => setActuatorMode('powerMosfet', 'MANUAL')}
                  className={`px-1.5 py-0.5 rounded ${protection.powerMosfet.mode === 'MANUAL' ? 'bg-[#00D9FF] text-[#07111F] font-bold' : 'opacity-60'}`}
                >
                  MANUAL
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>State:</span>
                <span className={`font-mono font-extrabold text-sm ${protection.powerMosfet.status === 'ON' ? 'text-[#00FF9C]' : 'text-[#FF4D4D]'}`}>
                  ● {protection.powerMosfet.status === 'ON' ? 'NORMAL' : 'TRIPPED'}
                </span>
              </div>
              <div className="text-xs font-mono font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {protection.powerMosfet.outputMetric}
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono mb-4" style={{ color: 'var(--text-secondary)' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>Trigger:</strong> {protection.powerMosfet.reason}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Overcurrent Limit:</strong> 3.50 A</div>
            </div>
          </div>

          <div className="pt-2 border-t flex space-x-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={() => setActuatorStatus('powerMosfet', 'ON', 'Manual circuit reset')}
              className="w-full py-1.5 text-xs font-mono font-bold rounded border transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: '#00FF9C', color: '#00FF9C' }}
            >
              Reset Breaker
            </button>
          </div>
        </div>

        {/* ACTUATOR 4: EMERGENCY ISOLATION */}
        <div className="cockpit-card p-4 rounded-xl border flex flex-col justify-between" style={{ borderColor: protection.emergencyMode.status === 'ENGAGED' ? '#FF4D4D' : 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D]">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <h3 className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                  EMERGENCY MODE
                </h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FF4D4D]/20 text-[#FF4D4D] border border-[#FF4D4D]/30 font-bold">
                INTERLOCK ARMED
              </span>
            </div>

            <div className="mb-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className={`font-mono font-extrabold text-sm ${protection.emergencyMode.status === 'ENGAGED' ? 'text-[#FF4D4D]' : 'text-[#8FA3B8]'}`}>
                  ● {protection.emergencyMode.status}
                </span>
              </div>
              <div className="text-xs font-mono font-bold mt-1 text-[#FF4D4D]">
                {protection.emergencyMode.outputMetric}
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono mb-4" style={{ color: 'var(--text-secondary)' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>Protocol:</strong> Immediate hardware load shedding &amp; RF silence.</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Requires:</strong> Interlock Confirmation</div>
            </div>
          </div>

          <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={handleEmergencyClick}
              className="w-full py-2 text-xs font-mono font-bold rounded uppercase tracking-wider transition-all text-[#F5F7FA]"
              style={{ backgroundColor: protection.emergencyMode.status === 'ENGAGED' ? '#1E4055' : '#FF4D4D' }}
            >
              {protection.emergencyMode.status === 'ENGAGED' ? 'Disengage Emergency' : 'Engage Emergency Cutoff'}
            </button>
          </div>
        </div>
      </div>

      {/* ENGINEERING SYSTEM TEST & SCENARIO EVALUATION BENCH */}
      <div className="cockpit-card p-6 rounded-xl border" style={{ borderColor: 'var(--border-accent)' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                System Test &amp; Scenario Evaluation Bench
              </h3>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Inject calibrated environmental and electrical stress vectors to verify autonomous closed-loop response
            </p>
          </div>

          {/* Test Status Indicator */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className={`w-2 h-2 rounded-full ${scenarioRun.isActive ? 'bg-[#FF4D4D] animate-ping' : 'bg-[#00FF9C]'}`} />
            <span className={scenarioRun.isActive ? 'text-[#FF4D4D] font-bold' : 'text-[#00FF9C]'}>
              {scenarioRun.isActive ? `TEST IN PROGRESS (${Math.round(scenarioRun.elapsedSeconds)}s)` : 'TEST BENCH READY'}
            </span>
          </div>
        </div>

        {/* Scenario Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {(['EXTREME_COLD', 'HIGH_TEMPERATURE', 'LOW_PRESSURE', 'LOW_BATTERY', 'OVERCURRENT', 'COMMUNICATION_FAILURE'] as EngineeringScenario[]).map((scKey) => {
            const def = SCENARIO_DEFINITIONS[scKey];
            const isSelected = selectedScenario === scKey;
            const isRunning = scenarioRun.isActive && scenarioRun.currentScenario === scKey;

            return (
              <div
                key={scKey}
                onClick={() => setSelectedScenario(scKey)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected ? 'hud-border-active' : 'hover:border-slate-500'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--bg-secondary)' : 'rgba(0,0,0,0.2)',
                  borderColor: isRunning ? '#FF4D4D' : isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs tracking-wider" style={{ color: isRunning ? '#FF4D4D' : isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {def.title}
                    </span>
                    {isRunning && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#FF4D4D] text-[#07111F] animate-pulse">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] mb-2 font-sans" style={{ color: 'var(--text-secondary)' }}>
                    {def.description}
                  </p>
                </div>

                <div className="pt-2 border-t text-[10px] font-mono" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <div><strong style={{ color: 'var(--accent-primary)' }}>Targets:</strong> {def.targetMetrics}</div>
                  <div><strong style={{ color: 'var(--text-secondary)' }}>Expected:</strong> {def.expectedProtectionResponse}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            Active Scenario: <strong style={{ color: 'var(--text-primary)' }}>{SCENARIO_DEFINITIONS[selectedScenario].title}</strong>
          </div>

          <div className="flex items-center space-x-2 font-mono">
            <button
              onClick={() => startScenarioTest(selectedScenario)}
              disabled={scenarioRun.isActive}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 text-[#07111F] shadow-md"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Test</span>
            </button>

            <button
              onClick={stopScenarioTest}
              disabled={!scenarioRun.isActive}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 text-[#F5F7FA] bg-[#FF4D4D] hover:opacity-90"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Test</span>
            </button>

            <button
              onClick={resetScenarioTest}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Interlock Modal */}
      <SafetyConfirmationModal
        isOpen={safetyModalOpen}
        title="CONFIRM EMERGENCY SYSTEM ISOLATION"
        warningMessage="Executing this command will immediately trigger emergency load isolation. This action simulates complete power cutoff to external payloads and enters fail-safe radio silence. Ensure bench operators are cleared."
        onConfirm={confirmEmergency}
        onCancel={() => setSafetyModalOpen(false)}
      />
    </div>
  );
};
