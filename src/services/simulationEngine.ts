import { BME280Reading, INA219Reading, BatteryTelemetry, EquipmentTelemetry, LoRaTelemetry, SDCardMetrics } from '../types/telemetry';

export interface TelemetryStateSnapshot {
  bme280: BME280Reading;
  ina219: INA219Reading;
  battery: BatteryTelemetry;
  equipment: Record<string, EquipmentTelemetry>;
  lora: LoRaTelemetry;
  sdCard: SDCardMetrics;
}

export class SimulationEngine {
  private tempBase: number = -24.8;
  private pressureBase: number = 58.2;
  private humidityBase: number = 18.2;
  private voltageBase: number = 12.42;
  private currentBase: number = 2.58;
  private batterySoc: number = 82.4;
  private batteryHealth: number = 94.0;
  private packetsSent: number = 14820;
  private packetsReceived: number = 14761;
  private sdUsedMB: number = 4280;

  private phase: number = 0;

  constructor() {
    this.phase = Math.random() * 100;
  }

  private drift(current: number, target: number, maxStep: number, min: number, max: number): number {
    const pull = (target - current) * 0.05;
    const noise = (Math.random() - 0.5) * maxStep;
    const next = current + pull + noise;
    return Math.min(Math.max(next, min), max);
  }

  public step(
    heaterActive: boolean,
    fanActive: boolean,
    mosfetTripped: boolean,
    commFailed: boolean,
    biasOverrides?: {
      tempTarget?: number;
      pressureTarget?: number;
      currentSurge?: number;
      voltageDrop?: number;
      batteryDrainRate?: number;
    }
  ): TelemetryStateSnapshot {
    this.phase += 0.05;

    let targetTemp = biasOverrides?.tempTarget !== undefined ? biasOverrides.tempTarget : this.tempBase;
    if (heaterActive && biasOverrides?.tempTarget === undefined) {
      targetTemp += 12.5;
    }
    if (fanActive && biasOverrides?.tempTarget === undefined) {
      targetTemp -= 8.0;
    }

    const currentTemp = this.drift(this.tempBase, targetTemp, 0.25, -45, 65);
    this.tempBase = currentTemp;

    const targetPressure = biasOverrides?.pressureTarget !== undefined ? biasOverrides.pressureTarget : 58.2;
    this.pressureBase = this.drift(this.pressureBase, targetPressure, 0.08, 40, 75);

    this.humidityBase = this.drift(this.humidityBase, 18.0 + Math.sin(this.phase * 0.1) * 3, 0.2, 8, 40);

    let targetCurrent = biasOverrides?.currentSurge !== undefined ? biasOverrides.currentSurge : 2.58;
    if (heaterActive) targetCurrent += 1.6;
    if (fanActive) targetCurrent += 0.45;
    if (mosfetTripped) targetCurrent = 0.05;

    this.currentBase = this.drift(this.currentBase, targetCurrent, 0.08, 0.02, 8.0);

    let targetVoltage = 12.42;
    if (biasOverrides?.voltageDrop !== undefined) {
      targetVoltage -= biasOverrides.voltageDrop;
    }
    targetVoltage -= (this.currentBase - 2.5) * 0.12;
    if (this.batterySoc < 20) {
      targetVoltage -= (20 - this.batterySoc) * 0.08;
    }
    this.voltageBase = this.drift(this.voltageBase, targetVoltage, 0.03, 9.2, 13.6);

    const drainRate = biasOverrides?.batteryDrainRate !== undefined ? biasOverrides.batteryDrainRate : 0.002;
    this.batterySoc = Math.max(0, this.batterySoc - (this.currentBase / 2.6) * drainRate);

    const calculatedPower = parseFloat((this.voltageBase * this.currentBase).toFixed(2));

    const remainingAmpHours = (this.batterySoc / 100) * 20.0;
    const remainingHours = this.currentBase > 0.05 ? remainingAmpHours / this.currentBase : 99.0;
    const remainingSeconds = Math.round(remainingHours * 3600);

    if (!commFailed) {
      this.packetsSent += 1;
      if (Math.random() > 0.005) {
        this.packetsReceived += 1;
      }
    }
    const packetLoss = parseFloat((((this.packetsSent - this.packetsReceived) / this.packetsSent) * 100).toFixed(1));

    this.sdUsedMB += 0.005;

    const nowStr = new Date().toLocaleTimeString('en-GB');

    const bme280: BME280Reading = {
      temperature: parseFloat(this.tempBase.toFixed(1)),
      pressure: parseFloat(this.pressureBase.toFixed(2)),
      humidity: parseFloat(this.humidityBase.toFixed(1)),
      altitude: 4850
    };

    const ina219: INA219Reading = {
      voltage: parseFloat(this.voltageBase.toFixed(2)),
      current: parseFloat(this.currentBase.toFixed(2)),
      power: calculatedPower
    };

    const battery: BatteryTelemetry = {
      healthPct: Math.round(this.batteryHealth),
      socPct: Math.round(this.batterySoc),
      voltage: parseFloat(this.voltageBase.toFixed(2)),
      current: parseFloat(this.currentBase.toFixed(2)),
      temperature: parseFloat((this.tempBase + 6.2).toFixed(1)),
      remainingSeconds,
      cycleCount: 142,
      cellBalanceMv: 12
    };

    const equipment: Record<string, EquipmentTelemetry> = {
      DRONE: {
        code: 'DRONE',
        name: 'UAV Recon Quadcopter',
        icon: 'Plane',
        status: currentTemp < -30 ? 'WARNING' : this.currentBase > 3.8 ? 'CRITICAL' : 'NORMAL',
        health: Math.round(Math.max(50, 92 - (currentTemp < -25 ? 8 : 0))),
        temperature: parseFloat((currentTemp + 4.5).toFixed(1)),
        voltage: parseFloat((this.voltageBase * 0.98).toFixed(2)),
        current: parseFloat((this.currentBase * 0.42).toFixed(2)),
        power: parseFloat(((this.voltageBase * 0.98) * (this.currentBase * 0.42)).toFixed(2)),
        lastUpdate: nowStr,
        params: {
          'ESC Temp': `${(currentTemp + 14).toFixed(1)}°C`,
          'Motor Rotor Load': '38%',
          'Airfoil Icing Risk': currentTemp < -15 && this.humidityBase > 20 ? 'HIGH' : 'LOW',
          'Baro Altitude': '4850 m'
        },
        metricsHistory: []
      },
      RADAR: {
        code: 'RADAR',
        name: 'Early Warning Surveillance Radar',
        icon: 'RadioTower',
        status: currentTemp > 45 ? 'WARNING' : 'NORMAL',
        health: 96,
        temperature: parseFloat((currentTemp + 11.8).toFixed(1)),
        voltage: parseFloat(this.voltageBase.toFixed(2)),
        current: parseFloat((this.currentBase * 0.35).toFixed(2)),
        power: parseFloat((this.voltageBase * (this.currentBase * 0.35)).toFixed(2)),
        lastUpdate: nowStr,
        params: {
          'Radome Heater': currentTemp < -15 ? 'ENGAGED' : 'STANDBY',
          'RF Output Power': '120 W PEP',
          'Convective Margin': this.pressureBase < 55 ? 'DERATED 15%' : 'OPTIMAL',
          'Sweep Rate': '24 RPM'
        },
        metricsHistory: []
      },
      RADIO: {
        code: 'RADIO',
        name: 'Tactical LoRa / VHF Relay',
        icon: 'Radio',
        status: commFailed ? 'OFFLINE' : 'NORMAL',
        health: commFailed ? 35 : 98,
        temperature: parseFloat((currentTemp + 2.1).toFixed(1)),
        voltage: parseFloat(this.voltageBase.toFixed(2)),
        current: parseFloat((this.currentBase * 0.08).toFixed(2)),
        power: parseFloat((this.voltageBase * (this.currentBase * 0.08)).toFixed(2)),
        lastUpdate: nowStr,
        params: {
          'LoRa Link': commFailed ? 'LOST' : 'ACTIVE',
          'RSSI Level': commFailed ? '-130 dBm' : '-88 dBm',
          'SNR Margin': commFailed ? '-12 dB' : '+8.2 dB',
          'Tx Frequency': '433.175 MHz'
        },
        metricsHistory: []
      },
      COMPUTER: {
        code: 'COMPUTER',
        name: 'Tactical Edge Compute Unit',
        icon: 'Cpu',
        status: currentTemp > 50 ? 'CRITICAL' : currentTemp > 40 ? 'WARNING' : 'NORMAL',
        health: 94,
        temperature: parseFloat((currentTemp + 18.4).toFixed(1)),
        voltage: 12.05,
        current: parseFloat((this.currentBase * 0.28).toFixed(2)),
        power: parseFloat((12.05 * (this.currentBase * 0.28)).toFixed(2)),
        lastUpdate: nowStr,
        params: {
          'CPU Core Clock': '1.8 GHz',
          'Thermal Throttling': currentTemp > 48 ? 'ACTIVE (70%)' : 'NONE',
          'Storage Bus': 'NVMe Gen3 OK',
          'Cold Boot Heater': currentTemp < -20 ? 'ACTIVE' : 'IDLE'
        },
        metricsHistory: []
      },
      BATTERY: {
        code: 'BATTERY',
        name: 'Lithium Cold-Barrier Power Bank',
        icon: 'BatteryCharging',
        status: this.batterySoc < 15 ? 'CRITICAL' : this.batterySoc < 25 ? 'WARNING' : 'NORMAL',
        health: Math.round(this.batteryHealth),
        temperature: parseFloat((currentTemp + 7.0).toFixed(1)),
        voltage: parseFloat(this.voltageBase.toFixed(2)),
        current: parseFloat(this.currentBase.toFixed(2)),
        power: calculatedPower,
        lastUpdate: nowStr,
        params: {
          'State of Charge': `${Math.round(this.batterySoc)}%`,
          'Cell Temp Spread': '1.4°C',
          'Pre-Charge Heater': currentTemp < -18 ? 'ENGAGED' : 'STANDBY',
          'Est. Autonomy': `${Math.floor(remainingSeconds / 3600)}h ${Math.floor((remainingSeconds % 3600) / 60)}m`
        },
        metricsHistory: []
      }
    };

    const lora: LoRaTelemetry = {
      status: commFailed ? 'OFFLINE' : 'CONNECTED',
      frequencyMHz: 433.175,
      rssi: commFailed ? -128 : Math.round(this.drift(-88, -88, 2, -110, -70)),
      snr: commFailed ? -14.0 : parseFloat(this.drift(7.5, 7.8, 0.4, 3.0, 11.0).toFixed(1)),
      dataRateKbps: 5.4,
      packetsSent: this.packetsSent,
      packetsReceived: commFailed ? this.packetsReceived : this.packetsReceived,
      packetLossPct: commFailed ? 100.0 : packetLoss,
      spreadingFactor: 8,
      bandwidthKhz: 125,
      lastCommunication: commFailed ? 'FAILED 2m AGO' : nowStr
    };

    const sdCard: SDCardMetrics = {
      totalMB: 30436,
      usedMB: Math.round(this.sdUsedMB),
      freeMB: Math.round(30436 - this.sdUsedMB),
      utilizationPct: parseFloat(((this.sdUsedMB / 30436) * 100).toFixed(1)),
      writeSpeedMBps: 18.6,
      status: 'HEALTHY',
      fileFormat: 'FAT32 (Cluster 32KB)',
      sectorSize: 512
    };

    return {
      bme280,
      ina219,
      battery,
      equipment,
      lora,
      sdCard
    };
  }

  public reset(): void {
    this.tempBase = -24.8;
    this.pressureBase = 58.2;
    this.humidityBase = 18.2;
    this.voltageBase = 12.42;
    this.currentBase = 2.58;
    this.batterySoc = 82.4;
  }
}
