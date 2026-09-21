import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  DataSourceType,
  BME280Reading,
  INA219Reading,
  BatteryTelemetry,
  EquipmentTelemetry,
  EquipmentCode,
  LoRaTelemetry,
  SDCardMetrics,
  SubsystemStatus,
  AlertItem,
  LogEntry,
  SystemThresholds,
  RiskAnalysis
} from '../types/telemetry';
import { AdaptiveProtectionState, EngineeringScenario, ScenarioRunState } from '../types/protection';
import { SimulationEngine } from '../services/simulationEngine';
import { SCENARIO_DEFINITIONS } from '../services/scenarioTester';
import { evaluateRules } from '../services/ruleEngine';
import { soundManager } from '../services/audioService';
import { apiService } from '../services/apiService';

export interface TelemetryContextType {
  dataSource: DataSourceType;
  setDataSource: (source: DataSourceType) => void;
  bme280: BME280Reading;
  ina219: INA219Reading;
  battery: BatteryTelemetry;
  equipment: Record<string, EquipmentTelemetry>;
  selectedEquipment: EquipmentTelemetry | null;
  setSelectedEquipment: (eq: EquipmentTelemetry | null) => void;
  lora: LoRaTelemetry;
  sdCard: SDCardMetrics;
  subsystems: SubsystemStatus;
  riskAnalysis: RiskAnalysis;
  protection: AdaptiveProtectionState;
  thresholds: SystemThresholds;
  updateThresholds: (newT: Partial<SystemThresholds>) => void;
  alerts: AlertItem[];
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
  logs: LogEntry[];
  historicalSensorData: {
    time: string;
    temperature: number;
    pressure: number;
    humidity: number;
    voltage: number;
    current: number;
    power: number;
  }[];
  scenarioRun: ScenarioRunState;
  startScenarioTest: (scenario: EngineeringScenario) => void;
  stopScenarioTest: () => void;
  resetScenarioTest: () => void;
  setActuatorMode: (actuator: 'heater' | 'fan' | 'powerMosfet' | 'emergencyMode', mode: 'AUTO' | 'MANUAL') => void;
  setActuatorStatus: (actuator: 'heater' | 'fan' | 'powerMosfet' | 'emergencyMode', status: 'ON' | 'OFF' | 'TRIPPED' | 'ENGAGED' | 'DISENGAGED', reason?: string) => void;
  clearDataBuffer: () => void;
  exportCsvLogs: () => void;
  downloadJsonLogs: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const DEFAULT_THRESHOLDS: SystemThresholds = {
  lowTemperature: -20.0,
  highTemperature: 45.0,
  lowVoltage: 11.1,
  overcurrent: 3.5,
  lowPressure: 55.0
};

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const simEngineRef = useRef(new SimulationEngine());

  const [dataSource, setDataSourceState] = useState<DataSourceType>(() => {
    return apiService.getConfig().sourceMode || 'SIMULATED';
  });

  const [thresholds, setThresholds] = useState<SystemThresholds>(() => {
    const saved = localStorage.getItem('ladakh_shield_thresholds');
    if (saved) {
      try { return { ...DEFAULT_THRESHOLDS, ...JSON.parse(saved) }; } catch { /* ignore */ }
    }
    return DEFAULT_THRESHOLDS;
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => soundManager.isEnabled());

  const setSoundEnabled = (val: boolean) => {
    soundManager.setEnabled(val);
    setSoundEnabledState(val);
  };

  const setDataSource = (source: DataSourceType) => {
    setDataSourceState(source);
    apiService.updateConfig({ sourceMode: source });
  };

  const updateThresholds = (newT: Partial<SystemThresholds>) => {
    setThresholds(prev => {
      const updated = { ...prev, ...newT };
      localStorage.setItem('ladakh_shield_thresholds', JSON.stringify(updated));
      return updated;
    });
  };

  const [scenarioRun, setScenarioRun] = useState<ScenarioRunState>({
    isActive: false,
    currentScenario: 'NONE',
    elapsedSeconds: 0,
    durationSeconds: 0,
    statusMessage: 'Baseline monitoring nominal'
  });

  const [protection, setProtection] = useState<AdaptiveProtectionState>({
    heater: {
      id: 'HEATER_PTC',
      name: 'PTC Silicone Heating Pad',
      icon: 'Flame',
      status: 'ON',
      mode: 'AUTO',
      reason: 'Ambient temperature below -20°C freeze barrier',
      lastActivation: '10:04:12',
      dutyCyclePct: 65,
      outputMetric: '19.5 W Thermal'
    },
    fan: {
      id: 'COOLING_FAN',
      name: 'Brushless Maglev Convection Fan',
      icon: 'Fan',
      status: 'OFF',
      mode: 'AUTO',
      reason: 'Enclosure temperature within nominal thermal envelope',
      lastActivation: '08:14:22',
      dutyCyclePct: 0,
      outputMetric: '0 RPM (Standby)'
    },
    powerMosfet: {
      id: 'MOSFET_ISOLATOR',
      name: 'Solid-State MOSFET Breaker',
      icon: 'Zap',
      status: 'ON',
      mode: 'AUTO',
      reason: 'DC bus current below 3.5A overcurrent trip limit',
      lastActivation: 'System Boot',
      dutyCyclePct: 100,
      outputMetric: 'CLOSED (Conducting)'
    },
    emergencyMode: {
      id: 'EMERGENCY_ISOLATOR',
      name: 'System Emergency Isolation',
      icon: 'AlertOctagon',
      status: 'DISENGAGED',
      mode: 'MANUAL',
      reason: 'Safety interlock armed; normal operation permitted',
      lastActivation: 'Never',
      dutyCyclePct: 0,
      outputMetric: 'STANDBY'
    },
    safetyInterlockArmed: true,
    hysteresisActive: true
  });

  const initialSnap = simEngineRef.current.step(true, false, false, false);
  const [bme280, setBme280] = useState<BME280Reading>(initialSnap.bme280);
  const [ina219, setIna219] = useState<INA219Reading>(initialSnap.ina219);
  const [battery, setBattery] = useState<BatteryTelemetry>(initialSnap.battery);
  const [equipment, setEquipment] = useState<Record<string, EquipmentTelemetry>>(initialSnap.equipment);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentTelemetry | null>(null);
  const [lora, setLora] = useState<LoRaTelemetry>(initialSnap.lora);
  const [sdCard, setSdCard] = useState<SDCardMetrics>(initialSnap.sdCard);

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'ALT-101',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      timeFormatted: '10:04:12',
      severity: 'WARNING',
      equipment: 'SYSTEM',
      title: 'Sub-Zero Freeze Barrier Triggered',
      message: 'Ambient temperature plunged below -20.0°C. Autonomous PTC heating engaged.',
      acknowledged: false,
      resolved: false
    },
    {
      id: 'ALT-102',
      timestamp: new Date(Date.now() - 360000).toISOString(),
      timeFormatted: '10:00:20',
      severity: 'INFO',
      equipment: 'SYSTEM',
      title: 'Telemetry Stream Initialized',
      message: 'BME280 and INA219 acquisition initialized at 1.0 Hz polling frequency.',
      acknowledged: true,
      resolved: true
    }
  ]);

  const [historicalSensorData, setHistoricalSensorData] = useState<{
    time: string;
    temperature: number;
    pressure: number;
    humidity: number;
    voltage: number;
    current: number;
    power: number;
  }[]>(() => {
    const arr = [];
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const t = new Date(now - i * 60000);
      const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      arr.push({
        time: timeStr,
        temperature: parseFloat((-24.5 - Math.sin(i * 0.3) * 1.5).toFixed(1)),
        pressure: parseFloat((58.1 + Math.cos(i * 0.2) * 0.3).toFixed(2)),
        humidity: parseFloat((18.0 + Math.sin(i * 0.4) * 2.0).toFixed(1)),
        voltage: parseFloat((12.42 - (24 - i) * 0.005).toFixed(2)),
        current: parseFloat((2.55 + Math.sin(i * 0.5) * 0.15).toFixed(2)),
        power: parseFloat((12.4 * 2.55).toFixed(2))
      });
    }
    return arr;
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const list: LogEntry[] = [];
    const eqCodes: EquipmentCode[] = ['DRONE', 'RADAR', 'RADIO', 'COMPUTER', 'BATTERY'];
    const now = Date.now();
    for (let i = 0; i < 35; i++) {
      const t = new Date(now - i * 45000);
      const code = eqCodes[i % eqCodes.length];
      list.push({
        id: `LOG-${1000 + i}`,
        timestamp: t.toISOString(),
        timeFormatted: t.toLocaleTimeString('en-GB'),
        equipment: code,
        temperature: parseFloat((-24.8 + (i % 4) * 0.6).toFixed(1)),
        pressure: 58.21,
        humidity: 18.4,
        voltage: 12.41,
        current: 2.58,
        power: 32.02,
        health: 94,
        status: 'NORMAL',
        alert: i === 2 ? 'Cold Warning' : 'Nominal'
      });
    }
    return list;
  });

  const calculateSubsystems = useCallback((
    bme: BME280Reading,
    ina: INA219Reading,
    bat: BatteryTelemetry,
    lr: LoRaTelemetry,
    prot: AdaptiveProtectionState
  ): SubsystemStatus => {
    const powerSys = bat.socPct < 15 || ina.current > 3.8 ? 'CRITICAL' : bat.socPct < 25 ? 'WARNING' : 'NORMAL';
    const sensorArr = bme.pressure < 40 || bme.temperature < -45 ? 'CRITICAL' : 'NORMAL';
    const comm = lr.status === 'OFFLINE' ? 'CRITICAL' : lr.packetLossPct > 15 ? 'WARNING' : 'NORMAL';
    const dataStore = 'NORMAL';
    const thermal = bme.temperature > 50 ? 'CRITICAL' : bme.temperature < -30 || bme.temperature > 40 ? 'WARNING' : 'NORMAL';
    const protSys = prot.emergencyMode.status === 'ENGAGED' || prot.powerMosfet.status === 'TRIPPED' ? 'WARNING' : 'NORMAL';

    let overall: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if ([powerSys, sensorArr, comm, dataStore, thermal, protSys].some(s => s === 'CRITICAL')) {
      overall = 'CRITICAL';
    } else if ([powerSys, sensorArr, comm, dataStore, thermal, protSys].some(s => s === 'WARNING')) {
      overall = 'WARNING';
    }

    return {
      powerSystem: powerSys,
      sensorArray: sensorArr,
      communication: comm,
      dataStorage: dataStore,
      thermalManagement: thermal,
      protectionSystem: protSys,
      overall
    };
  }, []);

  const [subsystems, setSubsystems] = useState<SubsystemStatus>(() =>
    calculateSubsystems(initialSnap.bme280, initialSnap.ina219, initialSnap.battery, initialSnap.lora, protection)
  );

  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis>(() =>
    evaluateRules(initialSnap.bme280, initialSnap.ina219, initialSnap.battery, thresholds)
  );

  const setActuatorMode = (actuator: 'heater' | 'fan' | 'powerMosfet' | 'emergencyMode', mode: 'AUTO' | 'MANUAL') => {
    soundManager.playClick();
    setProtection(prev => ({
      ...prev,
      [actuator]: {
        ...prev[actuator],
        mode,
        reason: `Operator toggled mode to ${mode}`
      }
    }));
  };

  const setActuatorStatus = (
    actuator: 'heater' | 'fan' | 'powerMosfet' | 'emergencyMode',
    status: 'ON' | 'OFF' | 'TRIPPED' | 'ENGAGED' | 'DISENGAGED',
    reason?: string
  ) => {
    soundManager.playClick();
    setProtection(prev => {
      const nowStr = new Date().toLocaleTimeString('en-GB');
      let duty = prev[actuator].dutyCyclePct;
      let output = prev[actuator].outputMetric;

      if (actuator === 'heater') {
        duty = status === 'ON' ? 85 : 0;
        output = status === 'ON' ? '25.5 W PTC Thermal' : '0 W (Standby)';
      } else if (actuator === 'fan') {
        duty = status === 'ON' ? 90 : 0;
        output = status === 'ON' ? '4,500 RPM Active' : '0 RPM (Standby)';
      } else if (actuator === 'powerMosfet') {
        duty = status === 'ON' ? 100 : 0;
        output = status === 'ON' ? 'CLOSED (Conducting)' : 'OPEN (Isolated)';
      } else if (actuator === 'emergencyMode') {
        duty = status === 'ENGAGED' ? 100 : 0;
        output = status === 'ENGAGED' ? 'ALL BUSES SHUT DOWN' : 'STANDBY';
      }

      return {
        ...prev,
        [actuator]: {
          ...prev[actuator],
          status,
          dutyCyclePct: duty,
          outputMetric: output,
          reason: reason || `Manual operator command: ${status}`,
          lastActivation: nowStr
        }
      };
    });
  };

  const startScenarioTest = (scenario: EngineeringScenario) => {
    soundManager.playClick();
    const def = SCENARIO_DEFINITIONS[scenario];
    setScenarioRun({
      isActive: true,
      currentScenario: scenario,
      elapsedSeconds: 0,
      durationSeconds: def.durationSeconds,
      statusMessage: `Running test: ${def.title}`
    });

    const now = new Date();
    const alertCode = `ALT-TEST-${Date.now() % 10000}`;
    const newAlert: AlertItem = {
      id: alertCode,
      timestamp: now.toISOString(),
      timeFormatted: now.toLocaleTimeString('en-GB'),
      severity: scenario === 'OVERCURRENT' || scenario === 'COMMUNICATION_FAILURE' ? 'CRITICAL' : 'WARNING',
      equipment: scenario === 'COMMUNICATION_FAILURE' ? 'RADIO' : scenario === 'LOW_BATTERY' ? 'BATTERY' : 'SYSTEM',
      title: `Scenario Test Initiated: ${def.title}`,
      message: `Simulating ${def.description}. Expected reaction: ${def.expectedProtectionResponse}`,
      acknowledged: false,
      resolved: false
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
    if (newAlert.severity === 'CRITICAL') {
      soundManager.playCriticalAlert();
    } else {
      soundManager.playWarningAlert();
    }
  };

  const stopScenarioTest = () => {
    soundManager.playClick();
    setScenarioRun(prev => ({
      ...prev,
      isActive: false,
      statusMessage: 'Scenario test stopped by operator'
    }));
  };

  const resetScenarioTest = () => {
    soundManager.playClick();
    simEngineRef.current.reset();
    setScenarioRun({
      isActive: false,
      currentScenario: 'NONE',
      elapsedSeconds: 0,
      durationSeconds: 0,
      statusMessage: 'Telemetry parameters reset to calibrated baseline'
    });
    setProtection(prev => ({
      ...prev,
      heater: { ...prev.heater, status: 'ON', mode: 'AUTO', dutyCyclePct: 65 },
      fan: { ...prev.fan, status: 'OFF', mode: 'AUTO', dutyCyclePct: 0 },
      powerMosfet: { ...prev.powerMosfet, status: 'ON', mode: 'AUTO', dutyCyclePct: 100 },
      emergencyMode: { ...prev.emergencyMode, status: 'DISENGAGED', mode: 'MANUAL', dutyCyclePct: 0 }
    }));
  };

  const acknowledgeAlert = (id: string) => {
    soundManager.playClick();
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const clearAlerts = () => {
    soundManager.playClick();
    setAlerts([]);
  };

  const clearDataBuffer = () => {
    soundManager.playClick();
    setHistoricalSensorData([]);
    setLogs([]);
  };

  const exportCsvLogs = () => {
    soundManager.playClick();
    const headers = ['Timestamp', 'Time', 'Equipment', 'Temperature_C', 'Pressure_kPa', 'Humidity_Pct', 'Voltage_V', 'Current_A', 'Power_W', 'Health_Pct', 'Status', 'Alert'];
    const rows = logs.map(l => [
      l.timestamp,
      l.timeFormatted,
      l.equipment,
      l.temperature,
      l.pressure,
      l.humidity,
      l.voltage,
      l.current,
      l.power,
      l.health,
      l.status,
      `"${l.alert.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LADAKH_SHIELD_TELEMETRY_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJsonLogs = () => {
    soundManager.playClick();
    const dumpData = {
      system: 'LADAKH-SHIELD',
      deviceId: 'LSH-24-05-0017',
      firmware: 'v2.3.7',
      altitudeMsl: 4850,
      exportedAt: new Date().toISOString(),
      metrics: { bme280, ina219, battery, lora, sdCard },
      protectionState: protection,
      activeAlerts: alerts,
      historicalLogs: logs
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dumpData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `LADAKH_SHIELD_DIAGNOSTIC_${Date.now()}.json`);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      let overrides: {
        tempTarget?: number;
        pressureTarget?: number;
        currentSurge?: number;
        voltageDrop?: number;
        batteryDrainRate?: number;
      } | undefined = undefined;

      let commFailed = false;

      if (scenarioRun.isActive) {
        setScenarioRun(prev => {
          const nextElapsed = prev.elapsedSeconds + 1.5;
          if (nextElapsed >= prev.durationSeconds && prev.durationSeconds > 0) {
            return {
              ...prev,
              isActive: false,
              elapsedSeconds: prev.durationSeconds,
              statusMessage: `Test ${prev.currentScenario} completed.`
            };
          }
          return { ...prev, elapsedSeconds: nextElapsed };
        });

        switch (scenarioRun.currentScenario) {
          case 'EXTREME_COLD':
            overrides = { tempTarget: -36.2, batteryDrainRate: 0.008 };
            break;
          case 'HIGH_TEMPERATURE':
            overrides = { tempTarget: 53.5 };
            break;
          case 'LOW_PRESSURE':
            overrides = { pressureTarget: 46.1 };
            break;
          case 'LOW_BATTERY':
            overrides = { voltageDrop: 1.9, batteryDrainRate: 0.045 };
            break;
          case 'OVERCURRENT':
            overrides = { currentSurge: 4.88 };
            break;
          case 'COMMUNICATION_FAILURE':
            commFailed = true;
            break;
        }
      }

      const heaterActive = protection.heater.status === 'ON';
      const fanActive = protection.fan.status === 'ON';
      const mosfetTripped = protection.powerMosfet.status === 'TRIPPED';

      const snap = simEngineRef.current.step(
        heaterActive,
        fanActive,
        mosfetTripped,
        commFailed,
        overrides
      );

      setBme280(snap.bme280);
      setIna219(snap.ina219);
      setBattery(snap.battery);
      setEquipment(snap.equipment);
      setLora(snap.lora);
      setSdCard(snap.sdCard);

      const risk = evaluateRules(snap.bme280, snap.ina219, snap.battery, thresholds);
      setRiskAnalysis(risk);

      setProtection(prev => {
        const next = { ...prev };
        const nowStr = new Date().toLocaleTimeString('en-GB');

        if (next.heater.mode === 'AUTO') {
          if (snap.bme280.temperature < thresholds.lowTemperature && next.heater.status !== 'ON') {
            next.heater = {
              ...next.heater,
              status: 'ON',
              dutyCyclePct: 90,
              outputMetric: '27.0 W PTC Active',
              reason: `Autonomous activation: Temp (${snap.bme280.temperature}°C) < ${thresholds.lowTemperature}°C`,
              lastActivation: nowStr
            };
          } else if (snap.bme280.temperature > (thresholds.lowTemperature + 5.0) && next.heater.status === 'ON') {
            next.heater = {
              ...next.heater,
              status: 'OFF',
              dutyCyclePct: 0,
              outputMetric: '0 W (Standby)',
              reason: `Hysteresis release: Temp (${snap.bme280.temperature}°C) stabilized`,
              lastActivation: nowStr
            };
          }
        }

        if (next.fan.mode === 'AUTO') {
          if (snap.bme280.temperature > thresholds.highTemperature && next.fan.status !== 'ON') {
            next.fan = {
              ...next.fan,
              status: 'ON',
              dutyCyclePct: 95,
              outputMetric: '4,800 RPM Active',
              reason: `Autonomous thermal mitigation: Temp (${snap.bme280.temperature}°C) > ${thresholds.highTemperature}°C`,
              lastActivation: nowStr
            };
          } else if (snap.bme280.temperature < (thresholds.highTemperature - 4.0) && next.fan.status === 'ON') {
            next.fan = {
              ...next.fan,
              status: 'OFF',
              dutyCyclePct: 0,
              outputMetric: '0 RPM (Standby)',
              reason: 'Thermal dissipation nominal',
              lastActivation: nowStr
            };
          }
        }

        if (next.powerMosfet.mode === 'AUTO') {
          if (snap.ina219.current > thresholds.overcurrent && next.powerMosfet.status !== 'TRIPPED') {
            next.powerMosfet = {
              ...next.powerMosfet,
              status: 'TRIPPED',
              dutyCyclePct: 0,
              outputMetric: 'TRIPPED (Cutoff)',
              reason: `Autonomous overcurrent protection: Current (${snap.ina219.current}A) > ${thresholds.overcurrent}A`,
              lastActivation: nowStr
            };
          }
        }

        return next;
      });

      const subs = calculateSubsystems(snap.bme280, snap.ina219, snap.battery, snap.lora, protection);
      setSubsystems(subs);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setHistoricalSensorData(prev => [
        ...prev.slice(prev.length >= 30 ? 1 : 0),
        {
          time: timeStr,
          temperature: snap.bme280.temperature,
          pressure: snap.bme280.pressure,
          humidity: snap.bme280.humidity,
          voltage: snap.ina219.voltage,
          current: snap.ina219.current,
          power: snap.ina219.power
        }
      ]);

      if (Math.random() > 0.4) {
        const codes: EquipmentCode[] = ['DRONE', 'RADAR', 'RADIO', 'COMPUTER', 'BATTERY'];
        const randomCode = codes[Math.floor(Math.random() * codes.length)];
        const eqData = snap.equipment[randomCode];
        const newLogEntry: LogEntry = {
          id: `LOG-${Date.now() % 100000}`,
          timestamp: new Date().toISOString(),
          timeFormatted: timeStr,
          equipment: randomCode,
          temperature: eqData ? eqData.temperature : snap.bme280.temperature,
          pressure: snap.bme280.pressure,
          humidity: snap.bme280.humidity,
          voltage: eqData ? eqData.voltage : snap.ina219.voltage,
          current: eqData ? eqData.current : snap.ina219.current,
          power: eqData ? eqData.power : snap.ina219.power,
          health: eqData ? eqData.health : 95,
          status: eqData ? eqData.status : 'NORMAL',
          alert: risk.riskLevel !== 'NORMAL' ? risk.primaryReason : 'Telemetry Nominal'
        };
        setLogs(prev => [newLogEntry, ...prev.slice(0, 99)]);
      }

    }, 1500);

    return () => clearInterval(interval);
  }, [scenarioRun, protection, thresholds, calculateSubsystems]);

  return (
    <TelemetryContext.Provider
      value={{
        dataSource,
        setDataSource,
        bme280,
        ina219,
        battery,
        equipment,
        selectedEquipment,
        setSelectedEquipment,
        lora,
        sdCard,
        subsystems,
        riskAnalysis,
        protection,
        thresholds,
        updateThresholds,
        alerts,
        acknowledgeAlert,
        clearAlerts,
        logs,
        historicalSensorData,
        scenarioRun,
        startScenarioTest,
        stopScenarioTest,
        resetScenarioTest,
        setActuatorMode,
        setActuatorStatus,
        clearDataBuffer,
        exportCsvLogs,
        downloadJsonLogs,
        soundEnabled,
        setSoundEnabled
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
