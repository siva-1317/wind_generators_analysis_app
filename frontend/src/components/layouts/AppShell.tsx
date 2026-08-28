import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useAlerts } from '../../hooks/useAlerts';
import { useGenerators } from '../../hooks/useGenerators';
import { useRealtimeTelemetry } from '../../hooks/useRealtimeTelemetry';

export const AppShell: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [selectedGeneratorId, setSelectedGeneratorId] = useState<string>('');

  const { alerts } = useAlerts();
  const { generators } = useGenerators();
  const { isConnected } = useRealtimeTelemetry();

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden app-bg-main app-text-main transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar unacknowledgedAlertsCount={unacknowledgedCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onToggleMobileNav={() => setMobileNavOpen(true)}
          generators={generators}
          selectedGeneratorId={selectedGeneratorId}
          onSelectGenerator={(id) => setSelectedGeneratorId(id)}
          unacknowledgedAlertsCount={unacknowledgedCount}
          isConnected={isConnected}
        />

        {/* Scrollable Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet context={{ selectedGeneratorId, setSelectedGeneratorId }} />
        </main>
      </div>

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        unacknowledgedAlertsCount={unacknowledgedCount}
      />
    </div>
  );
};
