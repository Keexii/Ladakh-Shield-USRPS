export type ActuatorMode = 'AUTO' | 'MANUAL';

export interface ActuatorControl {
  id: string;
  name: string;
  icon: string;
  status: 'ON' | 'OFF' | 'TRIPPED' | 'ENGAGED' | 'DISENGAGED';
  mode: ActuatorMode;
  reason: string;
  lastActivation: string;
  dutyCyclePct: number;
  outputMetric: string; // e.g. '18W PTC', '4200 RPM', 'CLOSED', 'ARMED'
}

export interface AdaptiveProtectionState {
  heater: ActuatorControl;
  fan: ActuatorControl;
  powerMosfet: ActuatorControl;
  emergencyMode: ActuatorControl;
  safetyInterlockArmed: boolean;
  hysteresisActive: boolean;
}

export type EngineeringScenario =
  | 'NONE'
  | 'EXTREME_COLD'
  | 'HIGH_TEMPERATURE'
  | 'LOW_PRESSURE'
  | 'LOW_BATTERY'
  | 'OVERCURRENT'
  | 'COMMUNICATION_FAILURE';

export interface ScenarioDefinition {
  id: EngineeringScenario;
  title: string;
  description: string;
  targetMetrics: string;
  expectedProtectionResponse: string;
  durationSeconds: number;
}

export interface ScenarioRunState {
  isActive: boolean;
  currentScenario: EngineeringScenario;
  elapsedSeconds: number;
  durationSeconds: number;
  statusMessage: string;
}
