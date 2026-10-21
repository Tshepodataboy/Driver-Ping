import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext.js';
import { CATEGORIES } from '../constants/issues.js';
import { ReportCategory, IssueOption } from '../types/index.js';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Car,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  HelpCircle,
  Lock,
  Search,
  X,
} from 'lucide-react';

import { SA_PROVINCES, searchProvinces } from '../constants/provinces.js';
import {
  ProvincialPlate,
  InteractiveProvincialPlateInput,
  PROVINCE_DEFAULT_PLATES,
  normalizeProvinceCode,
  formatFullProvincialPlate,
  stripProvinceCodeFromInput,
} from '../components/ProvincialPlate.js';

export function ReportScreen() {
  const {
    user,
    reportCategoryPreset,
    setReportCategoryPreset,
    setActiveTab,
    submitReport,
    setIsAuthModalOpen,
  } = useApp();

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
  const [provinceSearchQuery, setProvinceSearchQuery] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [plate, setPlate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>(
    reportCategoryPreset || 'vehicle_condition'
  );
  const [selectedIssueCode, setSelectedIssueCode] = useState<string>('');
  const [customOtherText, setCustomOtherText] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    deliveriesRecorded?: number;
    isQueuedUnclaimed?: boolean;
    isDuplicatePrevented?: boolean;
    statusMessage?: string;
  } | null>(null);

  // Idempotency key generated per session to prevent accidental double-submits
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => `idemp_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    if (reportCategoryPreset) {
      setSelectedCategory(reportCategoryPreset);
    }
  }, [reportCategoryPreset]);

  // Auto-populate default number plate & province from user settings if available
  useEffect(() => {
    if (user?.defaultPlate && !plateNumber) {
      const defProv = user.defaultProvinceCode || 'WC';
      const cleanReg = stripProvinceCodeFromInput(user.defaultPlate, defProv);
      setPlateNumber(cleanReg);
      if (!selectedProvinceCode) {
        setSelectedProvinceCode(defProv);
      }
      setPlate(formatFullProvincialPlate(cleanReg, defProv));
    } else if (user?.defaultProvinceCode && !selectedProvinceCode) {
      setSelectedProvinceCode(user.defaultProvinceCode);
      setPlateNumber('');
      setPlate('');
    }
  }, [user]);

  const selectedProvince = selectedProvinceCode
    ? SA_PROVINCES.find((p) => p.code === selectedProvinceCode) || null
    : null;

  const filteredProvinces = useMemo(() => {
    return searchProvinces(provinceSearchQuery);
  }, [provinceSearchQuery]);

  // Helper to compute formatted plate with province
  const getCombinedPlate = (rawNumber: string, provCode: string) => {
    return formatFullProvincialPlate(rawNumber, provCode);
  };

  // Clean uppercase plate formatting
  const handlePlateNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = stripProvinceCodeFromInput(e.target.value, selectedProvinceCode || 'WC');
    setPlateNumber(raw);
    if (selectedProvinceCode) {
      setPlate(formatFullProvincialPlate(raw, selectedProvinceCode));
    } else {
      setPlate(raw);
    }
  };

  // User explicitly requested:
  // "the province code the plates cannot be edited. the text field should be empty be default"
  const handleProvinceSelect = (code: string) => {
    setSelectedProvinceCode(code);
    setPlateNumber('');
    setPlate('');
  };

  const currentCategoryData = CATEGORIES.find((c) => c.id === selectedCategory)!;
  const currentIssue = currentCategoryData.issues.find((i) => i.code === selectedIssueCode);

  const isOther = selectedIssueCode.startsWith('other_');

  // Handle Photo selection with automatic client-side compression to prevent large payloads
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1280;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPhotoPreview(compressedDataUrl);
        } else {
          setPhotoPreview(result);
        }
      };
      img.onerror = () => {
        setPhotoPreview(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!plate.trim() || !selectedIssueCode) {
      setError('Please fill in the license plate and selected issue');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const issueTitle = isOther
      ? (customOtherText.trim() || currentIssue?.title || 'Other observed issue')
      : (currentIssue?.title || 'Observed vehicle issue');

    const res = await submitReport({
      plate: plate.trim(),
      category: selectedCategory,
      issueCode: selectedIssueCode,
      issueTitle,
      customNote: customNote.trim() || undefined,
      photoUrl: photoPreview || undefined,
      idempotencyKey,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmissionResult({
        deliveriesRecorded: res.deliveriesRecorded,
        isQueuedUnclaimed: res.isQueuedUnclaimed,
        isDuplicatePrevented: res.isDuplicatePrevented,
        statusMessage: res.statusMessage,
      });
      setStep(4); // Success step
    } else {
      setError(res.error || 'Failed to submit report. Please try again.');
    }
  };

  const handleStartFresh = () => {
    setStep(1);
    setPlateNumber('');
    setPlate('');
    setSelectedProvinceCode('GP');
    setSelectedIssueCode('');
    setCustomOtherText('');
    setCustomNote('');
    setPhotoPreview(null);
    setSubmissionResult(null);
    setError(null);
    setReportCategoryPreset(null);
    setIdempotencyKey(`idemp_${Date.now()}_${Math.random()}`);
  };

  // Dynamic pill header depending on chosen category
  const getPillData = () => {
    if (!reportCategoryPreset && step === 1 && !selectedCategory) {
      return {
        label: 'REPORT OBSERVED VEHICLE',
        icon: null,
      };
    }

    if (selectedCategory === 'vehicle_condition') {
      return {
        label: 'VEHICLE CONDITIONS',
        icon: <Car className="w-3 h-3 text-[#E53E3E]" />,
      };
    }
    if (selectedCategory === 'driver_behaviour') {
      return {
        label: 'DRIVER BEHAVIOR',
        icon: (
          <svg
            className="w-3 h-3 text-[#E53E3E]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="9" />
            <line x1="2" y1="12" x2="9" y2="12" />
            <line x1="15" y1="12" x2="22" y2="12" />
          </svg>
        ),
      };
    }
    if (selectedCategory === 'road_violation') {
      return {
        label: 'ROAD VIOLATION',
        icon: (
          <svg
            className="w-3 h-3 text-[#E53E3E]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="2" x2="4" y2="22" />
            <line x1="20" y1="2" x2="20" y2="22" />
            <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3" />
          </svg>
        ),
      };
    }

    return {
      label: 'REPORT OBSERVED VEHICLE',
      icon: null,
    };
  };

  const pillData = getPillData();

  // Rule 1 Enforcement: If user is not signed in
  if (!user) {
    return (
      <div className="pb-28 pt-3 px-3 max-w-[420px] mx-auto text-center">
        <div className="bg-white rounded-[34px] p-8 crimson-card-shadow text-gray-900 text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#B81D39] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-black font-display text-gray-950">
            Account required to report
          </h2>
          <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
            To protect drivers against automated spam and harassment, there is no guest reporting. Sign up with a phone number in 10 seconds.
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left text-xs text-gray-600 space-y-2">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <Shield className="w-4 h-4 text-[#B81D39]" />
              <span>Privacy Guarantee:</span>
            </div>
            <p>
              The driver you report will <strong>never</strong> see your name, phone number, or account. Your identity is strictly hidden from the recipient.
            </p>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="mt-6 w-full py-3.5 px-4 bg-[#B81D39] hover:bg-[#9E142C] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
          >
            <span>Sign In / Register with Phone</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-3 px-3 max-w-[420px] mx-auto text-gray-900">
      {/* Floating White Report Card */}
      <div className="bg-white rounded-[34px] p-6 crimson-card-shadow relative overflow-hidden">
        {/* Top Dark Capsule Pill */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0D1829] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
            {pillData.icon}
            <span>{pillData.label}</span>
          </div>
        </div>

        {/* Header / Progress */}
        {step < 4 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <button
                onClick={() => {
                  if (step === 1) setActiveTab('home');
                  else setStep((s) => (s - 1) as any);
                }}
                className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <span className="text-[11px] font-black text-[#B81D39] tracking-wider uppercase">
                Step {step} of 3
              </span>
            </div>

            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#B81D39] h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

      {/* STEP 1: PROVINCE PICKER & NUMBER PLATE INPUT */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-950">
            Which vehicle did you notice?
          </h1>

          {/* 1. Province Search Engine */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#B81D39]" />
                <span>1. Province Search Engine</span>
              </label>
              {selectedProvince && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span>✓ Selected: {selectedProvince.name} ({selectedProvince.code})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProvinceCode(null);
                      setProvinceSearchQuery('');
                    }}
                    className="text-emerald-700/60 hover:text-red-600 transition-colors cursor-pointer text-[10px] ml-0.5 font-black"
                    title="Clear selected province"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>

            {/* Search Engine Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={provinceSearchQuery}
                onChange={(e) => setProvinceSearchQuery(e.target.value)}
                placeholder="Search by province name (e.g. Gauteng, Western Cape) or code (GP, WC)..."
                className="w-full pl-9 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/30 focus:border-[#B81D39] transition-all shadow-2xs cursor-text"
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

            {/* Matching Provinces Results (only displayed when actively typing a search query) */}
            {provinceSearchQuery.trim().length > 0 && (
              <div className="mt-2.5 animate-in fade-in duration-200">
                {filteredProvinces.length === 0 ? (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center">
                    <p className="text-xs text-gray-700 font-bold">
                      No provinces match "{provinceSearchQuery}".
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Search by province name (e.g. Gauteng, Western Cape) or code (e.g. GP, WC, ZN).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                    <div className="text-[10px] text-gray-400 font-semibold px-1 mb-1">
                      Found {filteredProvinces.length} {filteredProvinces.length === 1 ? 'province match' : 'province matches'}:
                    </div>
                    {filteredProvinces.map((prov) => {
                      const isSelected = selectedProvinceCode === prov.code;
                      return (
                        <button
                          key={prov.code}
                          type="button"
                          onClick={() => {
                            handleProvinceSelect(prov.code);
                            setProvinceSearchQuery('');
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer group shadow-2xs gap-2 ${
                            isSelected
                              ? 'border-[#B81D39] bg-red-50 ring-2 ring-[#B81D39]/30'
                              : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-gray-950 group-hover:bg-[#B81D39] text-white font-mono font-black text-xs flex items-center justify-center transition-colors shrink-0">
                              {prov.code}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-gray-900 group-hover:text-[#B81D39] transition-colors truncate">
                                {prov.name} ({prov.code})
                              </div>
                              <div className="text-[10px] text-gray-400 truncate">
                                Province Code: {prov.code} · South Africa
                              </div>
                            </div>
                          </div>
                          <div className="w-24 shrink-0 text-right">
                            <ProvincialPlate provinceCode={prov.code} className="w-full drop-shadow-2xs" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Number Plate Input (South African Provincial Plate) */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                2. Registration Number Plate
              </label>
            </div>

            {selectedProvince ? (
              <>
                {/* Authentic South African Provincial Plate with Live Dynamic Typing */}
                <InteractiveProvincialPlateInput
                  provinceCode={selectedProvince.code}
                  value={plateNumber}
                  onChange={(val) => {
                    setPlateNumber(val);
                    setPlate(getCombinedPlate(val, selectedProvince.code));
                  }}
                  placeholder={selectedProvince.plateExample}
                  autoFocus
                />

                {user?.defaultPlate && plateNumber === user.defaultPlate && (
                  <div className="mt-1.5 flex items-center justify-between px-1 text-[10px]">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span>✓ Pre-filled from Settings default plate</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('settings')}
                      className="text-[#B81D39] font-semibold hover:underline cursor-pointer"
                    >
                      Settings
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-xs text-gray-500">
                <span className="font-semibold text-gray-700 block">Plate Input Locked</span>
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  Search and select a province in step 1 above to enter the vehicle plate number.
                </span>
              </div>
            )}
          </div>

          {/* Privacy reassurance callout */}
          <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#B81D39] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600 leading-relaxed">
              <strong className="text-gray-900 block font-semibold mb-0.5">
                Anonymous to the recipient
              </strong>
              Your account identity is strictly protected. The vehicle owner will only receive the neutral observation.
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                if (!selectedProvince) {
                  setError('Please search and select a province through the search engine first');
                  return;
                }
                const combined = getCombinedPlate(plateNumber, selectedProvince.code);
                if (plateNumber.trim().length >= 2) {
                  setPlate(combined);
                  setError(null);
                  setStep(2);
                } else {
                  setError('Please enter a valid registration number');
                }
              }}
              disabled={!selectedProvince || plateNumber.trim().length < 2}
              className={`w-full py-3.5 px-4 font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedProvince && plateNumber.trim().length >= 2
                  ? 'bg-[#B81D39] hover:bg-[#9E142C] text-white shadow-red-900/20 active:scale-[0.99]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Continue to select issue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CATEGORY & ISSUE SELECTION */}
      {step === 2 && (
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-28 shrink-0">
              <ProvincialPlate provinceCode={selectedProvinceCode || 'WC'} plateText={plate} />
            </div>
            <span className="text-xs text-gray-500 font-medium">Selected vehicle</span>
          </div>

          <h2 className="text-2xl font-bold font-display text-gray-950">
            What did you observe?
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Choose the category and specific issue.
          </p>

          {/* 3 Category Segmented Tabs */}
          <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedIssueCode('');
                  }}
                  className={`py-2 px-1 text-[11px] font-semibold rounded-lg transition-all text-center leading-tight ${
                    isSelected
                      ? 'bg-white text-gray-950 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {cat.title}
                </button>
              );
            })}
          </div>

          {/* Issues List with Radio selection */}
          <div className="mt-4 space-y-2 max-h-[46vh] overflow-y-auto pr-1">
            {currentCategoryData.issues.map((issue) => {
              const isChecked = selectedIssueCode === issue.code;
              return (
                <label
                  key={issue.code}
                  className={`block p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isChecked
                      ? 'border-[#B81D39] bg-red-50/60 ring-2 ring-[#B81D39]/20'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="issue"
                      checked={isChecked}
                      onChange={() => setSelectedIssueCode(issue.code)}
                      className="mt-1 accent-[#B81D39]"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        {issue.title}
                      </span>
                      <span className="text-[11px] text-gray-500 leading-snug block mt-0.5">
                        {issue.description}
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* If "Other" chosen, provide text field */}
          {isOther && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Describe the specific issue:
              </label>
              <input
                type="text"
                value={customOtherText}
                onChange={(e) => setCustomOtherText(e.target.value)}
                placeholder="e.g. Passenger wing mirror folded in..."
                maxLength={80}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
              />
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 py-3 border border-gray-200 text-gray-600 font-bold text-xs rounded-2xl hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (selectedIssueCode) {
                  setError(null);
                  setStep(3);
                } else {
                  setError('Please select an issue to continue');
                }
              }}
              disabled={!selectedIssueCode}
              className="w-2/3 py-3 bg-[#B81D39] hover:bg-[#9E142C] text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-900/20 disabled:opacity-40"
            >
              Next: Optional Details
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: OPTIONAL NOTE & PHOTO */}
      {step === 3 && (
        <div>
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 mb-4">
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="w-28 shrink-0">
                <ProvincialPlate provinceCode={selectedProvinceCode || 'WC'} plateText={plate} />
              </div>
              <span className="font-bold text-gray-900 truncate">
                {isOther ? customOtherText || 'Other issue' : currentIssue?.title}
              </span>
            </div>
          </div>

          <h2 className="text-xl font-black font-display text-gray-950">
            Add context (Optional)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Keep your note neutral and helpful. It will be delivered verbatim.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Note for the driver (Optional)
              </label>
              <textarea
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Noticed while waiting at the traffic light on Main Road..."
                maxLength={400}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
              />
              <div className="text-right text-[10px] text-gray-400 mt-1">
                {customNote.length}/400
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Add Photo (Optional)
              </label>
              {photoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 text-white rounded-lg text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="w-full h-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-600">
                    Take or select photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Mandatory Neutral Language Reminder */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold block mb-0.5">How this appears to the driver:</span>
              "A road user reported a possible observation: <strong>{currentIssue?.title}</strong>. Please check when safe."
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 py-3 border border-gray-200 text-gray-600 font-bold text-xs rounded-2xl hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-2/3 py-3.5 bg-[#B81D39] hover:bg-[#9E142C] text-white font-black text-sm rounded-2xl shadow-lg shadow-red-900/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Sending safely...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Anonymous Alert</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RECORDED CONFIRMATION (Rule 10) */}
      {step === 4 && submissionResult && (
        <div className="text-center pt-3 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>

          <h2 className="text-2xl font-black font-display text-gray-950">
            Observation Recorded
          </h2>

          <div className="my-4 max-w-[260px] mx-auto">
            <ProvincialPlate provinceCode={selectedProvinceCode || 'WC'} plateText={plate} />
          </div>

          {/* Rule 10: "Never say an alert was delivered unless the system actually recorded that it was" */}
          <div className="mt-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-left text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <Clock className="w-4 h-4 text-[#B81D39]" />
              <span>Delivery Status Verification:</span>
            </div>
            <p className="text-gray-700">
              {submissionResult.statusMessage}
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => setActiveTab('home')}
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-2xl transition-all"
            >
              Return to Home
            </button>
            <button
              onClick={handleStartFresh}
              className="w-full py-3 border border-gray-200 text-gray-700 font-bold text-xs rounded-2xl hover:bg-gray-50"
            >
              Report Another Vehicle
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
