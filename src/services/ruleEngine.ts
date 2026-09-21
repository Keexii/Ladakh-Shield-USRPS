import { BME280Reading, INA219Reading, BatteryTelemetry, SystemThresholds, RiskAnalysis, StatusLevel } from '../types/telemetry';

export function evaluateRules(
  bme280: BME280Reading,
  ina219: INA219Reading,
  battery: BatteryTelemetry,
  thresholds: SystemThresholds
): RiskAnalysis {
  const activeRules = [
    {
      id: 'RULE_LOW_TEMP',
      name: 'Sub-Zero Freeze Barrier',
      triggered: bme280.temperature < thresholds.lowTemperature,
      condition: `Ambient Temp (${bme280.temperature}°C) < ${thresholds.lowTemperature}°C`,
      action: 'Activate PTC silicone heating pad; pre-condition Li-ion battery core.',
      severity: (bme280.temperature < -30 ? 'CRITICAL' : 'WARNING') as StatusLevel
    },
    {
      id: 'RULE_HIGH_TEMP',
      name: 'Thermal Dissipation Limit',
      triggered: bme280.temperature > thresholds.highTemperature,
      condition: `Ambient/Enclosure Temp (${bme280.temperature}°C) > ${thresholds.highTemperature}°C`,
      action: 'Engage high-speed brushless cooling fan; throttle high-power transmissions.',
      severity: (bme280.temperature > 50 ? 'CRITICAL' : 'WARNING') as StatusLevel
    },
    {
      id: 'RULE_LOW_BATTERY',
      name: 'Power Depletion Threshold',
      triggered: battery.voltage < thresholds.lowVoltage || battery.socPct < 20,
      condition: `Bus Voltage (${battery.voltage}V) < ${thresholds.lowVoltage}V or SOC (${battery.socPct}%) < 20%`,
      action: 'Shed non-critical peripheral payloads; trigger return-to-base alert.',
      severity: (battery.socPct < 15 || battery.voltage < 10.5 ? 'CRITICAL' : 'WARNING') as StatusLevel
    },
    {
      id: 'RULE_OVERCURRENT',
      name: 'Power Rail Overcurrent Trip',
      triggered: ina219.current > thresholds.overcurrent,
      condition: `Bus Current (${ina219.current}A) > ${thresholds.overcurrent}A`,
      action: 'Trigger solid-state MOSFET circuit breaker; isolate affected load rail.',
      severity: 'CRITICAL' as StatusLevel
    },
    {
      id: 'RULE_LOW_PRESSURE',
      name: 'High-Altitude Barometric Derating',
      triggered: bme280.pressure < thresholds.lowPressure,
      condition: `Barometric Pressure (${bme280.pressure} kPa) < ${thresholds.lowPressure} kPa`,
      action: 'Derate convective heat transfer coefficients; monitor motor insulation dielectric.',
      severity: 'WARNING' as StatusLevel
    }
  ];

  const triggeredRules = activeRules.filter(r => r.triggered);

  let riskLevel: StatusLevel = 'NORMAL';
  let primaryReason = 'All environmental and electrical telemetry within calibrated nominal safety envelope.';
  let recommendedAction = 'Maintain standard continuous autonomous telemetry monitoring.';

  if (triggeredRules.some(r => r.severity === 'CRITICAL')) {
    riskLevel = 'CRITICAL';
    const crit = triggeredRules.find(r => r.severity === 'CRITICAL')!;
    primaryReason = `${crit.name} violated: ${crit.condition}. Immediate hardware damage or operational failure risk.`;
    recommendedAction = crit.action;
  } else if (triggeredRules.length > 0) {
    riskLevel = 'WARNING';
    primaryReason = `${triggeredRules.map(r => r.name).join(', ')} active: ${triggeredRules[0].condition}.`;
    recommendedAction = triggeredRules[0].action;
  }

  return {
    riskLevel,
    primaryReason,
    recommendedAction,
    activeRules
  };
}
