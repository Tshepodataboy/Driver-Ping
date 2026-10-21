import React from 'react';
import { useApp } from '../context/AppContext.js';
import { Bell, Settings } from 'lucide-react';

export function Header() {
  const {
    activeTab,
    unreadAlertsCount,
    setActiveTab,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[#941329]/80 backdrop-blur-xl border-b border-white/10 text-white transition-colors">
      <div className="max-w-[420px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand Zone */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-white text-[#941329] flex items-center justify-center font-black shadow-md transition-transform group-hover:scale-105">
            <svg
              className="w-4 h-4 text-[#941329]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19L10 5" />
              <path d="M20 19L14 5" />
              <path d="M12 9v6" strokeDasharray="2 2" />
              <path d="M16 8a4 4 0 0 1 0 6" stroke="#941329" />
              <path d="M19 6a8 8 0 0 1 0 10" stroke="#941329" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tight font-display text-white uppercase leading-none">
              Driver Ping
            </span>
            <span className="text-[9px] text-white/60 tracking-wider font-semibold uppercase">
              South Africa · RSA
            </span>
          </div>
        </button>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* Settings Button */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-full transition-all focus:outline-none border cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-[#941329] border-white shadow-md'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/15'
            }`}
            title="Settings - Set default plate & preferences"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Alerts Bell */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 rounded-full hover:bg-white/10 text-white transition-colors focus:outline-none cursor-pointer"
            aria-label="View alerts"
          >
            <Bell className="w-5 h-5 text-white" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-white rounded-full ring-2 ring-[#941329] animate-pulse"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
