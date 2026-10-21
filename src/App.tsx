import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Header } from './components/Header.js';
import { BottomNav } from './components/BottomNav.js';
import { AuthModal } from './components/AuthModal.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { ReportScreen } from './screens/ReportScreen.js';
import { VehiclesScreen } from './screens/VehiclesScreen.js';
import { AlertsScreen } from './screens/AlertsScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';
import { AdminScreen } from './screens/AdminScreen.js';
import { SettingsScreen } from './screens/SettingsScreen.js';

function MainApp() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-crimson-gradient text-white flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-[420px] mx-auto relative">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'report' && <ReportScreen />}
        {activeTab === 'vehicles' && <VehiclesScreen />}
        {activeTab === 'alerts' && <AlertsScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
        {activeTab === 'admin' && <AdminScreen />}
      </main>

      {/* Fixed Bottom Crimson Dock Navigation */}
      <BottomNav />

      {/* Phone OTP Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
