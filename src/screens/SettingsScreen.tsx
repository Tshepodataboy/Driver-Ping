import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext.js';
import { PROVINCES, searchProvinces, SAProvince } from '../constants/provinces.js';
import {
  ProvincialPlate,
  InteractiveProvincialPlateInput,
  PROVINCE_DEFAULT_PLATES,
  PROVINCE_NAMES,
  normalizeProvinceCode,
  stripProvinceCodeFromInput,
  formatFullProvincialPlate,
} from '../components/ProvincialPlate.js';
import {
  Settings,
  Search,
  X,
  CheckCircle2,
  Shield,
  Bell,
  Car,
  ArrowLeft,
  RefreshCw,
  LogOut,
  Check,
  Smartphone,
  Save,
  AlertCircle,
  Trash2,
  User as UserIcon,
  Database,
} from 'lucide-react';

export function SettingsScreen() {
  const {
    user,
    vehicles,
    updateUserPreferences,
    setActiveTab,
    demoAccounts,
    switchAccount,
    signOut,
    setIsAuthModalOpen,
  } = useApp();

  // Database and security status
  const [dbStatus, setDbStatus] = useState<{
    connectedToPostgres: boolean;
    hasConnectionString: boolean;
    driver: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/db-status')
      .then((res) => res.json())
      .then((data) => setDbStatus(data.database))
      .catch(() => {});
  }, []);

  // State for Default Plate & Province
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>(
    user?.defaultProvinceCode || 'WC'
  );
  const [plateInput, setPlateInput] = useState<string>(
    user?.defaultPlate || ''
  );
  const [provinceSearchQuery, setProvinceSearchQuery] = useState('');
  const [isSavingPlate, setIsSavingPlate] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      if (user.defaultProvinceCode) {
        setSelectedProvinceCode(user.defaultProvinceCode);
      }
      if (user.defaultPlate) {
        setPlateInput(stripProvinceCodeFromInput(user.defaultPlate, user.defaultProvinceCode || 'WC'));
      }
    }
  }, [user]);

  // Province search filtering: only when typing query
  const filteredProvinces = useMemo(() => {
    if (!provinceSearchQuery.trim()) return [];
    return searchProvinces(provinceSearchQuery);
  }, [provinceSearchQuery]);

  const selectedProvince = useMemo(() => {
    return PROVINCES.find((p) => p.code === selectedProvinceCode) || PROVINCES[0];
  }, [selectedProvinceCode]);

  // Handle Saving Default Plate
  const handleSaveDefaultPlate = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!plateInput.trim()) {
      setErrorMessage('Please enter a vehicle registration plate number.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setIsSavingPlate(true);
    setErrorMessage(null);

    const fullPlate = formatFullProvincialPlate(plateInput, selectedProvinceCode);
    const result = await updateUserPreferences({
      defaultPlate: fullPlate,
      defaultProvinceCode: selectedProvinceCode,
    });

    setIsSavingPlate(false);

    if (result.success) {
      setSuccessMessage(`Default number plate updated to ${fullPlate} (${selectedProvinceCode})`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(result.error || 'Failed to update default number plate');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  // Handle Clearing Default Plate
  const handleClearDefaultPlate = async () => {
    if (!user) return;
    setIsSavingPlate(true);
    const result = await updateUserPreferences({
      defaultPlate: '',
      defaultProvinceCode: '',
    });
    setIsSavingPlate(false);
    if (result.success) {
      setPlateInput('');
      setSelectedProvinceCode('WC');
      setSuccessMessage('Default number plate removed');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Quick-select from registered vehicles
  const handleSelectRegisteredVehicle = (v: { plateDisplay: string }) => {
    // Try to guess province from plate ending or default to existing
    const lastWord = v.plateDisplay.split(' ').pop() || '';
    const matchingProv = PROVINCES.find((p) => p.code === lastWord);
    const pCode = matchingProv ? matchingProv.code : selectedProvinceCode;
    if (matchingProv) {
      setSelectedProvinceCode(matchingProv.code);
    }
    setPlateInput(stripProvinceCodeFromInput(v.plateDisplay, pCode));
    setSuccessMessage(`Loaded ${v.plateDisplay} from your registered vehicles`);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  // SMS preferences
  const handleToggleSms = async () => {
    if (!user) return;
    const newOptIn = !user.smsOptIn;
    await updateUserPreferences({ smsOptIn: newOptIn });
    setSuccessMessage(newOptIn ? 'SMS alert notifications enabled' : 'SMS alerts disabled');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="pb-28 pt-2 px-3 max-w-[420px] mx-auto text-gray-900 space-y-3">
      {/* 1. Header Card - Compact */}
      <div className="bg-white rounded-[28px] px-5 py-4 crimson-card-shadow relative overflow-hidden">
        {/* Top Dark Capsule Pill */}
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0D1829] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
            <span>APP & VEHICLE PREFERENCES</span>
          </div>

          <button
            onClick={() => setActiveTab('home')}
            className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#941329] flex items-center justify-center font-black shrink-0">
            <Settings className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black font-display text-gray-950 leading-tight">
              Settings
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">
              Default number plate & app preferences
            </p>
          </div>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 border border-emerald-100 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-2xl text-xs flex items-center gap-2 border border-red-100 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* 2. Primary Feature: DEFAULT NUMBER PLATE SETTINGS */}
      <div className="bg-white rounded-[34px] p-6 crimson-card-shadow relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-100 text-[#941329] flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black font-display text-gray-950">
              Default Number Plate
            </h2>
          </div>
          {user?.defaultPlate && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Set your primary vehicle's number plate. It will be automatically pre-filled whenever you report observations, saving you time on every report.
        </p>

        {/* Active Saved Plate Status Pill with Authentic Provincial Plate */}
        {user?.defaultPlate ? (
          <div className="mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Current Default Plate:
              </span>
              <button
                onClick={handleClearDefaultPlate}
                className="text-[11px] font-semibold text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                title="Remove default plate"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
            <div className="max-w-[260px] mx-auto">
              <ProvincialPlate
                provinceCode={user.defaultProvinceCode || 'WC'}
                plateText={user.defaultPlate}
              />
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>No default plate set yet. Configure your plate below and tap save.</span>
          </div>
        )}

        {/* Registered Vehicles Quick-Fill Chips */}
        {vehicles.length > 0 && (
          <div className="mb-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
              Quick pick from your registered cars:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelectRegisteredVehicle(v)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-[#941329] text-gray-700 rounded-xl text-xs font-mono font-bold transition-colors border border-gray-200 hover:border-red-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Car className="w-3 h-3 text-gray-400" />
                  <span>{v.plateDisplay}</span>
                  <span className="text-[9px] font-sans font-normal text-gray-400">({v.make})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 1. Province Search Engine */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#B81D39]" />
              <span>Province Search Engine</span>
            </label>
            {selectedProvince && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span>✓ {selectedProvince.name}</span>
                <span className="font-mono">({selectedProvince.code})</span>
              </span>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={provinceSearchQuery}
              onChange={(e) => setProvinceSearchQuery(e.target.value)}
              placeholder="Search by province name (e.g. Gauteng, Western Cape) or code (GP, WC)..."
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/30 focus:border-[#B81D39] transition-all"
            />
            {provinceSearchQuery && (
              <button
                type="button"
                onClick={() => setProvinceSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Engine Dropdown Results */}
          {provinceSearchQuery.trim().length > 0 && (
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto p-1 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner animate-in fade-in">
              <div className="text-[10px] text-gray-400 font-semibold px-2 py-1">
                Matching provinces ({filteredProvinces.length}):
              </div>
              {filteredProvinces.length === 0 ? (
                <div className="p-3 text-center text-xs text-gray-400">
                  No provinces found for "{provinceSearchQuery}". Try province name or code.
                </div>
              ) : (
                filteredProvinces.map((prov) => (
                  <button
                    key={prov.code}
                    type="button"
                    onClick={() => {
                      setSelectedProvinceCode(prov.code);
                      setProvinceSearchQuery('');
                      // The province code cannot be edited; text field is empty by default
                      setPlateInput('');
                    }}
                    className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer gap-2 ${
                      selectedProvinceCode === prov.code
                        ? 'bg-red-50 border border-[#B81D39] text-[#B81D39]'
                        : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-7 h-7 rounded-lg bg-gray-950 text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                        {prov.code}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold truncate">{prov.name} ({prov.code})</div>
                        <div className="text-[10px] text-gray-400 truncate">Province Code: {prov.code}</div>
                      </div>
                    </div>
                    <div className="w-24 shrink-0 text-right">
                      <ProvincialPlate provinceCode={prov.code} className="w-full drop-shadow-2xs" />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 2. Authentic South African Provincial Plate Input */}
        <div className="mt-4">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
            License Plate Number ({selectedProvince ? selectedProvince.name : selectedProvinceCode})
          </label>

          <InteractiveProvincialPlateInput
            provinceCode={selectedProvinceCode}
            value={plateInput}
            onChange={setPlateInput}
            placeholder={PROVINCE_DEFAULT_PLATES[normalizeProvinceCode(selectedProvinceCode)]}
          />

          <div className="flex items-center justify-between mt-1.5 px-1 text-[11px] text-gray-400">
            <span>
              Plate format: {PROVINCE_DEFAULT_PLATES[normalizeProvinceCode(selectedProvinceCode)]}
            </span>
            <span>Matched to Search Engine</span>
          </div>
        </div>

        {/* Save Default Plate Action */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={handleSaveDefaultPlate}
            disabled={isSavingPlate || !plateInput.trim()}
            className="flex-1 py-3 px-4 bg-[#B81D39] hover:bg-[#9E142C] disabled:bg-gray-300 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSavingPlate ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save as Default Plate</span>
          </button>

          {user?.defaultPlate && (
            <button
              type="button"
              onClick={handleClearDefaultPlate}
              disabled={isSavingPlate}
              className="py-3 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              title="Clear default"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2b. ALL 9 PROVINCIAL LICENCE PLATES SHOWCASE */}
      <div className="bg-white rounded-[30px] p-5 crimson-card-shadow relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-100 text-[#941329] flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black font-display text-gray-950">
              South African Licence Plates
            </h2>
          </div>
          <span className="text-[10px] font-bold text-gray-400">
            All 9 Provinces
          </span>
        </div>

        <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
          Tap any official provincial plate below to preview its artwork and apply it to your settings:
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {PROVINCES.map((prov) => {
            const isSelected = selectedProvinceCode === prov.code;
            return (
              <button
                key={prov.code}
                type="button"
                onClick={() => {
                  setSelectedProvinceCode(prov.code);
                  if (!plateInput || plateInput === PROVINCE_DEFAULT_PLATES[selectedProvinceCode]) {
                    setPlateInput(PROVINCE_DEFAULT_PLATES[prov.code]);
                  }
                }}
                className={`p-2 rounded-2xl border text-center transition-all cursor-pointer group flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#B81D39] bg-red-50/70 ring-2 ring-[#B81D39]/30 shadow-xs'
                    : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
                }`}
              >
                <div className="w-full mb-1.5 transition-transform group-hover:scale-[1.02]">
                  <ProvincialPlate provinceCode={prov.code} />
                </div>
                <div className="flex items-center justify-between text-[10px] px-0.5">
                  <span className="font-bold text-gray-900 group-hover:text-[#B81D39]">
                    {prov.name}
                  </span>
                  <span className="font-mono text-gray-400 font-bold">
                    {prov.code}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. NOTIFICATION & SMS SETTINGS */}
      <div className="bg-white rounded-[34px] p-6 crimson-card-shadow relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-red-100 text-[#941329] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <h2 className="text-base font-black font-display text-gray-950">
            Alert Notifications
          </h2>
        </div>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Manage how Driver Ping reaches you when other drivers notify you of vehicle conditions.
        </p>

        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-[#941329] flex items-center justify-center shadow-2xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">SMS Notifications</div>
              <div className="text-[10px] text-gray-500">Receive instant SMS alerts when offline</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleSms}
            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
              user?.smsOptIn ? 'bg-[#941329]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                user?.smsOptIn ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. ACCOUNT SWITCHER & TEST ROLES */}
      <div className="bg-white rounded-[34px] p-6 crimson-card-shadow relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-100 text-[#941329] flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black font-display text-gray-950">
              Account Switcher
            </h2>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Demo Testing
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          Switch test accounts to preview different user roles (Owner, Driver, Admin).
        </p>

        <div className="space-y-1.5">
          {demoAccounts.map((acc) => {
            const isActive = user?.id === acc.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => switchAccount(acc.id)}
                className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-red-50 border-[#B81D39] text-[#941329] font-bold'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span>{acc.fullName}</span>
                    {acc.role === 'admin' && (
                      <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded">
                        Admin
                      </span>
                    )}
                    {acc.plan === 'paid_owner' && acc.role !== 'admin' && (
                      <span className="text-[9px] bg-red-100 text-[#941329] font-semibold px-1.5 py-0.2 rounded">
                        Owner
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">{acc.phone}</div>
                </div>
                {isActive && <CheckCircle2 className="w-4 h-4 text-[#941329]" />}
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          {user ? (
            <button
              type="button"
              onClick={signOut}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out (Switch to Guest)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs font-bold text-[#941329] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="text-xs font-bold text-gray-500 hover:text-gray-900"
          >
            View Full Profile →
          </button>
        </div>
      </div>

      {/* 5. DATABASE PERSISTENCE & SYSTEM SECURITY */}
      <div className="bg-white rounded-[34px] p-6 crimson-card-shadow relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-100 text-[#941329] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black font-display text-gray-950">
              Database & Security
            </h2>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              dbStatus?.connectedToPostgres
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {dbStatus?.connectedToPostgres ? 'Supabase Connected' : 'In-Memory Fallback'}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          {dbStatus?.connectedToPostgres
            ? 'Driver Ping is directly connected to Supabase PostgreSQL with schema isolation, automated audits, and encrypted session security.'
            : 'PostgreSQL driver is ready. Set DATABASE_URL in your .env file with your Supabase connection string to persist records to PostgreSQL.'}
        </p>

        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Persistence Engine:</span>
            <span className="font-bold text-gray-900">{dbStatus?.driver || 'Detecting...'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Authentication:</span>
            <span className="font-bold text-emerald-700">Cryptographic JWT Bearer Token</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Reporter Privacy:</span>
            <span className="font-bold text-purple-700">Strict Identity Masking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
