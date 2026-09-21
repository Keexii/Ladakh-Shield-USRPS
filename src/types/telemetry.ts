export type DataSourceType = 'SIMULATED' | 'LIVE' | 'OFFLINE';

export type EquipmentCode = 'DRONE' | 'RADAR' | 'RADIO' | 'COMPUTER' | 'BATTERY';

export type StatusLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface BME280Reading {
  temperature: number; // °C
  pressure: number;    // kPa
  humidity: number;    // %
  altitude: number;    // meters MSL
}

export interface INA219Reading {
  voltage: number;     // V
  current: number;     // A
  power: number;       // W (V * A)
}

export interface BatteryTelemetry {
  healthPct: number;
  socPct: number;
  voltage: number;
  current: number;
  temperature: number;
  remainingSeconds: number;
  cycleCount: number;
  cellBalanceMv: number;
}

export interface EquipmentTelemetry {
  code: EquipmentCode;
  name: string;
  icon: string;
  status: StatusLevel;
  health: number; // 0 - 100%
  temperature: number; // °C
  voltage: number; // V
  current: number; // A
  power: number; // W
  lastUpdate: string;
  params: Record<string, string | number>;
  metricsHistory: {
    time: string;
    temperature: number;
    voltage: number;
    current: number;
  }[];
}

export interface SubsystemStatus {
  powerSystem: StatusLevel;
  sensorArray: StatusLevel;
  communication: StatusLevel;
  dataStorage: StatusLevel;
  thermalManagement: StatusLevel;
  protectionSystem: StatusLevel;
  overall: StatusLevel;
}

export interface LoRaTelemetry {
  status: 'CONNECTED' | 'DISCONNECTED' | 'OFFLINE';
  frequencyMHz: number;
  rssi: number; // dBm, e.g. -88
  snr: number;  // dB, e.g. +7.5
  dataRateKbps: number;
  packetsSent: number;
  packetsReceived: number;
  packetLossPct: number;
  spreadingFactor: number;
  bandwidthKhz: number;
  lastCommunication: string;
}

export interface SDCardMetrics {
  totalMB: number;
  usedMB: number;
  freeMB: number;
  utilizationPct: number;
  writeSpeedMBps: number;
  status: 'HEALTHY' | 'DEGRADED' | 'FAULT';
  fileFormat: string;
  sectorSize: number;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  timeFormatted: string;
  severity: AlertSeverity;
  equipment: EquipmentCode | 'SYSTEM';
  title: string;
  message: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  timeFormatted: string;
  equipment: EquipmentCode | 'SYSTEM';
  temperature: number;
  pressure: number;
  humidity: number;
  voltage: number;
  current: number;
  power: number;
  health: number;
  status: StatusLevel;
  alert: string;
}

export interface SystemThresholds {
  lowTemperature: number;     // default -20 °C
  highTemperature: number;    // default 45 °C
  lowVoltage: number;        // default 11.1 V
  overcurrent: number;       // default 3.5 A
  lowPressure: number;       // default 55.0 kPa
}

export interface RiskAnalysis {
  riskLevel: StatusLevel;
  primaryReason: string;
  recommendedAction: string;
  activeRules: {
    id: string;
    name: string;
    triggered: boolean;
    condition: string;
    action: string;
    severity: StatusLevel;
  }[];
}
