import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Header } from './components/Header.js';
import { BottomNav } from './components/BottomNav.js';
import { AuthModal } from './components/AuthModal.js';
import { GeometricBackground } from './components/GeometricBackground.js';
import { LoginPage } from './screens/LoginPage.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { ReportScreen } from './screens/ReportScreen.js';
import { VehiclesScreen } from './screens/VehiclesScreen.js';
import { AlertsScreen } from './screens/AlertsScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';
import { AdminScreen } from './screens/AdminScreen.js';
import { SettingsScreen } from './screens/SettingsScreen.js';

function MainApp() {
  const { user, activeTab, isLoading } = useApp();

  // Loading Splash Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-crimson-gradient flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
        {/* Geometric Background for full app */}
        <GeometricBackground />

        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-2xl animate-bounce mb-4 p-2">
            <img
              src="https://res.cloudinary.com/dwd83begj/image/upload/v1792686945/logo_icon-removebg-preview_e6k6ne.png"
              alt="Driver Ping Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-xl font-black font-display tracking-tight uppercase mb-1">
            Driver Ping
          </div>
          <div className="text-xs text-white/70 font-medium">
            Loading secure driver session...
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, display the Login Page
  if (!user) {
    return (
      <div className="min-h-screen bg-crimson-gradient text-white relative overflow-hidden">
        <GeometricBackground />
        <LoginPage />
        <AuthModal />
      </div>
    );
  }

  // When logged in, render full app with persistent geometric background
  return (
    <div className="min-h-screen bg-crimson-gradient text-white flex flex-col font-sans selection:bg-white/20 selection:text-white relative overflow-hidden">
      {/* App-wide Animated Geometric Background */}
      <GeometricBackground />

      {/* Top Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-[420px] mx-auto relative z-10">
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

      {/* Phone / Email Authentication Modal */}
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
