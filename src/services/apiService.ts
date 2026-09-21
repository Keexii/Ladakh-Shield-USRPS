import { DataSourceType, BME280Reading, INA219Reading, AlertItem } from '../types/telemetry';

export interface ApiConfig {
  endpoint: string;
  sourceMode: DataSourceType;
  pollIntervalMs: number;
  apiKey?: string;
}

export class ApiService {
  private config: ApiConfig = {
    endpoint: 'http://192.168.4.1/api',
    sourceMode: 'SIMULATED',
    pollIntervalMs: 2000
  };

  constructor() {
    const saved = localStorage.getItem('ladakh_shield_api_config');
    if (saved) {
      try {
        this.config = { ...this.config, ...JSON.parse(saved) };
      } catch {
        // fallback
      }
    }
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('ladakh_shield_api_config', JSON.stringify(this.config));
  }

  public async getSensorData(): Promise<{ bme280?: BME280Reading; ina219?: INA219Reading } | null> {
    if (this.config.sourceMode !== 'LIVE') {
      return null;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(this.config.endpoint + '/sensor-data', {
        signal: controller.signal,
        headers: this.config.apiKey ? { 'X-API-Key': this.config.apiKey } : {}
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('HTTP status ' + res.status);
      return await res.json();
    } catch {
      return null;
    }
  }

  public async postProtectionCommand(actuator: string, state: string, mode: string): Promise<boolean> {
    if (this.config.sourceMode === 'LIVE') {
      try {
        const res = await fetch(this.config.endpoint + '/protection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actuator, state, mode, timestamp: new Date().toISOString() })
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    return true;
  }

  public async postAlert(alert: Partial<AlertItem>): Promise<boolean> {
    if (this.config.sourceMode === 'LIVE') {
      try {
        const res = await fetch(this.config.endpoint + '/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    return true;
  }
}

export const apiService = new ApiService();
