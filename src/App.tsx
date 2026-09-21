import React, { useState } from 'react';
import { TelemetryProvider, useTelemetry } from './context/TelemetryContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { BottomStatusBar } from './components/common/BottomStatusBar';
import { EquipmentDetailModal } from './components/common/EquipmentDetailModal';
import { DashboardView } from './components/views/DashboardView';
import { SensorsView } from './components/views/SensorsView';
import { EquipmentView } from './components/views/EquipmentView';
import { CommunicationView } from './components/views/CommunicationView';
import { ProtectionView } from './components/views/ProtectionView';
import { DataLogsView } from './components/views/DataLogsView';
import { AlertsView } from './components/views/AlertsView';
import { SettingsView } from './components/views/SettingsView';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { selectedEquipment, setSelectedEquipment } = useTelemetry();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'sensors':
        return <SensorsView />;
      case 'equipment':
        return <EquipmentView />;
      case 'communication':
        return <CommunicationView />;
      case 'protection':
        return <ProtectionView />;
      case 'datalogs':
        return <DataLogsView />;
      case 'alerts':
        return <AlertsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className='min-h-screen flex flex-col tech-grid-bg transition-colors duration-200'>
      {/* Cockpit Top Header */}
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Main Container: Sidebar + Active View */}
      <div className='flex-1 flex max-w-7xl w-full mx-auto pb-16 pt-2 px-3 sm:px-4'>
        {/* Left Navigation Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />

        {/* Dynamic Viewport */}
        <main className='flex-1 lg:pl-64 py-2 w-full min-w-0'>
          {renderActiveView()}
        </main>
      </div>

      {/* Cockpit Bottom Status Bar */}
      <BottomStatusBar />

      {/* Interactive Equipment Detail Modal */}
      <EquipmentDetailModal 
        equipment={selectedEquipment} 
        onClose={() => setSelectedEquipment(null)} 
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TelemetryProvider>
        <MainLayout />
      </TelemetryProvider>
    </ThemeProvider>
  );
};

export default App;
