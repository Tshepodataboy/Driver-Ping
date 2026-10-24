import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import {
  User,
  Shield,
  Smartphone,
  CreditCard,
  Bell,
  Lock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Sliders,
  Star,
  Car,
  LogOut,
} from 'lucide-react';
import { ProvincialPlate, detectProvinceFromPlate } from '../components/ProvincialPlate.js';

export function ProfileScreen() {
  const { user, vehicles, setDefaultVehicle, updateUserPreferences, setActiveTab, switchAccount, signOut } = useApp();

  const [isUpdating, setIsUpdating] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="pb-28 pt-3 px-3 max-w-[420px] mx-auto text-center">
        <div className="bg-white rounded-[34px] p-8 crimson-card-shadow text-gray-900">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#B81D39] flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black font-display text-gray-950">
            Not Signed In
          </h1>
          <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
            Sign in or register with your South African mobile phone number to manage vehicles and receive alerts.
          </p>
        </div>
      </div>
    );
  }

  const handleSelectDefaultVehicle = async (vehicleId: string, plateDisplay: string) => {
    setIsUpdating(true);
    const res = await setDefaultVehicle(vehicleId);
    setIsUpdating(false);
    if (res.success) {
      setSuccessNotice(`✓ Default number plate updated to ${plateDisplay}`);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  return (
    <div className="pb-28 pt-3 px-3 max-w-[420px] mx-auto text-gray-900">
      {/* Floating White Main Profile Card */}
      <div className="bg-white rounded-[34px] p-6 crimson-card-shadow relative overflow-hidden space-y-4">
        {/* Top Dark Capsule Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0D1829] text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-1 shadow-sm">
          <span>ACCOUNT & PRIVACY SETTINGS</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black font-display text-gray-950">
            Profile & Security
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Driver Ping account limits, notifications, and ownership plans.
          </p>
        </div>

        {successNotice && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 border border-emerald-100 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* User Card */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0D1829] text-white flex items-center justify-center font-black text-lg font-display shrink-0">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-gray-950 font-display truncate">
                {user.fullName || 'Driver'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span className="capitalize font-semibold text-[#B81D39]">{user.role}</span>
                <span>·</span>
                <span className="text-gray-600 font-medium">Driver Ping Member</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60">
            <div className="p-2.5 bg-white rounded-xl border border-gray-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                User ID
              </span>
              <span className="font-mono text-xs font-black text-gray-900 select-all">
                {user.id}
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-gray-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Call / Mobile Number
              </span>
              <span className="font-mono text-xs font-black text-emerald-800 select-all">
                {user.phone || 'Not set'}
              </span>
            </div>
          </div>
        </div>

        {/* DEFAULT NUMBER PLATE SECTION */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="text-sm font-bold text-gray-950">
                Default Number Plate
              </span>
            </div>
            {vehicles.length > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Active Primary
              </span>
            )}
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Your default number plate is your primary registered vehicle in Driver Ping for road safety observations and alerts.
          </p>

          {vehicles.length === 0 ? (
            <div className="p-3 bg-white rounded-xl border border-dashed border-gray-200 text-center">
              <p className="text-xs text-gray-500">No vehicles registered yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab('vehicles')}
                className="mt-2 text-xs font-bold text-[#B81D39] hover:underline"
              >
                + Register a vehicle in Fleet
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Highlight active default plate */}
              {(() => {
                const defaultVeh = vehicles.find((v) => v.isDefault) || vehicles[0];
                return (
                  <div className="p-3 bg-white rounded-xl border-2 border-amber-300/80 shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-32 shrink-0 drop-shadow-xs">
                        <ProvincialPlate
                          provinceCode={detectProvinceFromPlate(defaultVeh.plateDisplay)}
                          plateText={defaultVeh.plateDisplay}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono font-black text-xs text-gray-950 truncate">
                          {defaultVeh.plateDisplay}
                        </div>
                        <div className="text-xs font-bold text-gray-700 truncate">
                          {defaultVeh.make} {defaultVeh.model}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {defaultVeh.color} · {defaultVeh.isVerifiedOwner ? 'Verified Owner' : 'Registered Driver'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <span>✓ Current</span>
                    </span>
                  </div>
                );
              })()}

              {/* Quick Switcher if user has more than 1 vehicle */}
              {vehicles.length > 1 && (
                <div className="pt-2 border-t border-gray-200/60">
                  <div className="text-[11px] font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>Switch default vehicle:</span>
                    <span className="text-[10px] text-gray-400">{vehicles.length} cars registered</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {vehicles.map((v) => {
                      const isCurrentDefault = v.isDefault || (!vehicles.some((x) => x.isDefault) && v.id === vehicles[0].id);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={isUpdating || isCurrentDefault}
                          onClick={() => handleSelectDefaultVehicle(v.id, v.plateDisplay)}
                          className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                            isCurrentDefault
                              ? 'bg-amber-50/80 border border-amber-300 font-semibold cursor-default text-amber-950'
                              : 'bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-24 shrink-0 drop-shadow-xs">
                              <ProvincialPlate
                                provinceCode={detectProvinceFromPlate(v.plateDisplay)}
                                plateText={v.plateDisplay}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-mono font-bold text-[11px] text-gray-900 truncate">
                                {v.plateDisplay}
                              </div>
                              <span className="text-[10px] text-gray-500 truncate block">
                                {v.make} {v.model}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold shrink-0">
                            {isCurrentDefault ? (
                              <span className="text-amber-800">★ Default</span>
                            ) : (
                              <span className="text-[#B81D39] hover:underline">Set as Default ▶</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PRIVACY BY DESIGN (Rule 8) */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <EyeOff className="w-4 h-4 text-gray-800" />
            <h2 className="text-sm font-bold text-gray-950">
              Privacy Guarantee (Rule 8)
            </h2>
          </div>

          <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>No Public Searches:</strong> No plate search directory, no live maps, and no location tracking.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Identity Hidden:</strong> The recipient never sees your phone number, account name, or profile.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Security Logs:</strong> Restricted audit records are maintained strictly to stop spam and abuse.
              </span>
            </li>
          </ul>
        </div>

        {/* ADMIN CONSOLE SHORTCUT (Rule 9) */}
        <div className="bg-[#0D1829] text-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-purple-400" />
              <div>
                <h2 className="text-sm font-bold font-display text-white">
                  Compliance Console
                </h2>
                <p className="text-[11px] text-gray-400">
                  Review ownership documents & audit logs.
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                if (user.role !== 'admin') {
                  await switchAccount('usr_admin_003');
                }
                setActiveTab('admin');
              }}
              className="px-3.5 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 flex items-center gap-1 transition-transform active:scale-95"
            >
              <span>{user.role === 'admin' ? 'Open' : 'Admin Demo'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* SIGN OUT ACTION */}
        <div className="pt-2">
          <button
            onClick={signOut}
            className="w-full py-3.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-2xl border border-red-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
