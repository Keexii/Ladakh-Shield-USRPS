import { EngineeringScenario, ScenarioDefinition } from '../types/protection';

export const SCENARIO_DEFINITIONS: Record<EngineeringScenario, ScenarioDefinition> = {
  NONE: {
    id: 'NONE',
    title: 'Standard High-Altitude Baseline',
    description: 'Autonomous ambient monitoring at 4,850m elevation under steady operating conditions.',
    targetMetrics: 'Temp: -25°C, Pressure: 58 kPa, Current: 2.6A, Battery: 82%',
    expectedProtectionResponse: 'Heater cycled in hysteresis band; all subsystems operational.',
    durationSeconds: 0
  },
  EXTREME_COLD: {
    id: 'EXTREME_COLD',
    title: 'Extreme Cold Surge (-36°C)',
    description: 'Simulates severe sub-zero blizzard plunge. Evaluates rapid PTC heater pad activation and battery pre-charge barrier.',
    targetMetrics: 'Ambient Temp: -36°C, Cell Temp: -18°C',
    expectedProtectionResponse: 'PTC Silicone Heater auto-switches to 100% duty cycle; Cold Warning generated.',
    durationSeconds: 45
  },
  HIGH_TEMPERATURE: {
    id: 'HIGH_TEMPERATURE',
    title: 'High Thermal Convection Surge (+52°C)',
    description: 'Simulates solar thermal buildup or enclosed radar amplifier overheating in thin air (reduced convective dissipation).',
    targetMetrics: 'Enclosure Temp: +52°C, Thermal derating: Active',
    expectedProtectionResponse: 'Cooling fan spins to 4,800 RPM; High Temperature Critical Alert fired.',
    durationSeconds: 45
  },
  LOW_PRESSURE: {
    id: 'LOW_PRESSURE',
    title: 'Depressed Atmospheric Pressure (46 kPa)',
    description: 'Simulates high-altitude crest ascent past 5,500m. Tests convective derating analysis and thin-air arcing safeguards.',
    targetMetrics: 'Barometric Pressure: 46.2 kPa, Altitude: ~5,900m MSL',
    expectedProtectionResponse: 'Low Pressure Warning generated; convective thermal derating advisory logged.',
    durationSeconds: 40
  },
  LOW_BATTERY: {
    id: 'LOW_BATTERY',
    title: 'Critical Battery Depletion (12% SOC)',
    description: 'Simulates extended blackout and solar panel snow coverage leading to deep battery discharge.',
    targetMetrics: 'Bus Voltage: 10.4V, Battery SOC: 12%, Autonomy: < 45m',
    expectedProtectionResponse: 'Low Battery Critical Warning logged; non-essential load shedding advisory.',
    durationSeconds: 40
  },
  OVERCURRENT: {
    id: 'OVERCURRENT',
    title: 'Overcurrent Surge & Short Circuit (4.8A)',
    description: 'Simulates rotor stall or power rail short-circuit exceeding rated 3.5A limit.',
    targetMetrics: 'Bus Current: 4.85A, Power Surge: > 58W',
    expectedProtectionResponse: 'Solid-State MOSFET trip triggered; critical circuit breaker isolation alert.',
    durationSeconds: 35
  },
  COMMUNICATION_FAILURE: {
    id: 'COMMUNICATION_FAILURE',
    title: 'LoRa RF Telemetry Blackout',
    description: 'Simulates RF link loss due to mountain ridge shadowing or severe antenna icing.',
    targetMetrics: 'RSSI: -132 dBm, Packet Loss: 100%, Status: OFFLINE',
    expectedProtectionResponse: 'LoRa OFFLINE alert fired; blackbox MicroSD offline data recording activated.',
    durationSeconds: 35
  }
};
