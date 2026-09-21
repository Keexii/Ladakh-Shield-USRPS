import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  LayoutDashboard, 
  Cpu, 
  Boxes, 
  Radio, 
  ShieldCheck, 
  FileText, 
  Bell, 
  Settings,
  Flame,
  Snowflake,
  Sun,
  Moon
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'sensors'
  | 'equipment'
  | 'communication'
  | 'protection'
  | 'datalogs'
  | 'alerts'
  | 'settings';

interface Props {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const { alerts, protection } = useTelemetry();
  const { setTheme, isNight, isDay } = useTheme();

  const unackAlertsCount = alerts.filter(a => !a.acknowledged).length;

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sensors' as NavTab, label: 'Sensors', icon: Cpu, badge: 'BME+INA' },
    { id: 'equipment' as NavTab, label: 'Equipment', icon: Boxes, badge: '5 UNITS' },
    { id: 'communication' as NavTab, label: 'Communication', icon: Radio, badge: 'LoRa' },
    { 
      id: 'protection' as NavTab, 
      label: 'Protection', 
      icon: ShieldCheck, 
      activeDot: protection.heater.status === 'ON' || protection.fan.status === 'ON'
    },
    { id: 'datalogs' as NavTab, label: 'Data Logs', icon: FileText, badge: 'CSV/JSON' },
    { 
      id: 'alerts' as NavTab, 
      label: 'Alerts', 
      icon: Bell, 
      count: unackAlertsCount 
    },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings }
  ];

  const handleSelect = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-[57px] bottom-0 left-0 z-30 w-64 border-r flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          backgroundColor: 'var(--sidebar-bg)', 
          borderColor: 'var(--border-subtle)' 
        }}
      >
        {/* Navigation Items */}
        <div className="p-3 space-y-1 overflow-y-auto">
          {/* Quick Day / Night Theme Toggle Widget */}
          <div className="mb-3 p-2.5 rounded-lg border shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 uppercase" style={{ color: 'var(--text-muted)' }}>
              <span>Day / Night Mode</span>
              <span className="font-bold flex items-center space-x-1" style={{ color: 'var(--accent-primary)' }}>
                {isNight ? (
                  <>
                    <Moon className="w-3 h-3 inline mr-0.5" />
                    <span>NIGHT MODE</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3 h-3 inline mr-0.5" />
                    <span>DAY MODE</span>
                  </>
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 p-0.5 rounded border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)' }}>
              <button
                onClick={() => setTheme('night')}
                className={`flex items-center justify-center space-x-1.5 py-1.5 rounded text-xs font-mono transition-all ${
                  isNight
                    ? 'font-bold shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isNight ? 'var(--accent-primary)' : 'transparent',
                  color: isNight ? '#07111F' : 'var(--text-primary)'
                }}
                title="Switch to Night Theme (Tactical Deep Navy)"
                aria-label="Switch to Night Theme"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">NIGHT</span>
              </button>
              <button
                onClick={() => setTheme('day')}
                className={`flex items-center justify-center space-x-1.5 py-1.5 rounded text-xs font-mono transition-all ${
                  isDay
                    ? 'font-bold shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isDay ? 'var(--accent-primary)' : 'transparent',
                  color: isDay ? '#FFFFFF' : 'var(--text-primary)'
                }}
                title="Switch to Day Theme (Arctic Snow Daylight)"
                aria-label="Switch to Day Theme"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">DAY</span>
              </button>
            </div>
          </div>

          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            System Console
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all group relative ${
                  isActive 
                    ? 'font-bold shadow-sm' 
                    : 'hover:opacity-100 opacity-80 hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 10px var(--accent-glow)' : 'none'
                }}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.activeDot && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF9C] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF9C]" />
                    </span>
                  )}

                  {item.count !== undefined && item.count > 0 && (
                    <span 
                      className="px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white bg-[#FF4D4D] animate-pulse"
                    >
                      {item.count}
                    </span>
                  )}

                  {item.badge && !item.count && (
                    <span 
                      className="text-[9px] px-1.5 py-0.2 rounded border font-normal"
                      style={{ 
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-primary)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Protection Actuators Mini Indicators */}
        <div className="p-3 m-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between text-[10px] font-mono mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>
            <span>Actuator State</span>
            <span className="font-bold text-[#00FF9C]">ONLINE</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div 
              className="p-1.5 rounded flex items-center space-x-1.5 border"
              style={{ 
                borderColor: protection.heater.status === 'ON' ? '#FFB020' : 'var(--border-subtle)',
                backgroundColor: protection.heater.status === 'ON' ? 'rgba(255, 176, 32, 0.1)' : 'transparent',
                color: protection.heater.status === 'ON' ? '#FFB020' : 'var(--text-muted)'
              }}
            >
              <Flame className="w-3 h-3" />
              <span>HEATER {protection.heater.status}</span>
            </div>
            <div 
              className="p-1.5 rounded flex items-center space-x-1.5 border"
              style={{ 
                borderColor: protection.fan.status === 'ON' ? '#00D9FF' : 'var(--border-subtle)',
                backgroundColor: protection.fan.status === 'ON' ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                color: protection.fan.status === 'ON' ? '#00D9FF' : 'var(--text-muted)'
              }}
            >
              <Snowflake className="w-3 h-3" />
              <span>FAN {protection.fan.status}</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner: Project Core Concept */}
        <div 
          className="p-3 border-t text-[9px] font-mono leading-relaxed"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          <div className="font-bold tracking-wider mb-1" style={{ color: 'var(--accent-primary)' }}>
            ONE UNIVERSAL SMART MODULE
          </div>
          <div className="text-[8.5px] opacity-80 uppercase tracking-tighter">
            SENSE → ANALYZE → DECIDE → PROTECT → ALERT → LOG
          </div>
          <div className="mt-1 text-[8px] opacity-60">
            DRONE • RADAR • RADIO • COMPUTER • BATTERY
          </div>
        </div>
      </aside>
    </>
  );
};
