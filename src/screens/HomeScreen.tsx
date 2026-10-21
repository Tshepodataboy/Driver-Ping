import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { ReportCategory, AlertItem } from '../types/index.js';
import {
  AlertTriangle,
  Car,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  Clock,
  Shield,
  X,
  ArrowRight,
  EyeOff,
  Siren,
  Phone,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ProvincialPlate, detectProvinceFromPlate } from '../components/ProvincialPlate.js';

export function HomeScreen() {
  const {
    user,
    setActiveTab,
    setReportCategoryPreset,
    alerts,
    takeAlertAction,
  } = useApp();

  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionType, setActionType] = useState<'resolve' | 'dispute' | 'flag_abuse' | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [pressedQuadrant, setPressedQuadrant] = useState<'vehicle' | 'driver' | 'road' | 'emergency' | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<'vehicle' | 'driver' | 'road' | 'emergency' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'vehicle' | 'driver' | 'road' | 'emergency' | null>(null);
  const quadrantTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeCategory = pressedQuadrant || hoveredCategory || selectedCategory;

  const getPillLabel = () => {
    switch (activeCategory) {
      case 'vehicle':
        return 'Vehicle Conditions';
      case 'driver':
        return 'Driver Behavior';
      case 'road':
        return 'Road Violation';
      case 'emergency':
        return 'Emergency SOS';
      default:
        return 'RSA · 9 Provinces';
    }
  };

  useEffect(() => {
    return () => {
      if (quadrantTimerRef.current) {
        clearTimeout(quadrantTimerRef.current);
      }
    };
  }, []);

  const handleStartReport = (category?: ReportCategory) => {
    if (category) {
      setReportCategoryPreset(category);
    } else {
      setReportCategoryPreset(null);
    }
    setActiveTab('report');
  };

  const handleQuadrantClick = (target: 'vehicle' | 'driver' | 'road' | 'emergency') => {
    setSelectedCategory(target);
    if (pressedQuadrant) return;
    setPressedQuadrant(target);
    if (quadrantTimerRef.current) {
      clearTimeout(quadrantTimerRef.current);
    }
    quadrantTimerRef.current = setTimeout(() => {
      setPressedQuadrant(null);
      if (target === 'vehicle') {
        handleStartReport('vehicle_condition');
      } else if (target === 'driver') {
        handleStartReport('driver_behaviour');
      } else if (target === 'road') {
        handleStartReport('road_violation');
      } else if (target === 'emergency') {
        setShowEmergencyModal(true);
      }
    }, 500);
  };

  const handleAlertClick = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setActionType(null);
    setActionNote('');
  };

  const submitAlertAction = async (type: 'resolve' | 'dismiss' | 'dispute' | 'flag_abuse') => {
    if (!selectedAlert) return;
    setIsSubmittingAction(true);
    await takeAlertAction(selectedAlert.id, type, actionNote);
    setIsSubmittingAction(false);
    setSelectedAlert(null);
  };

  // Format relative time helper
  const getRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} d ago`;
  };

  // Mask plate for recent alerts preview (e.g. "Vehicle ending • 482")
  const getMaskedPlate = (plateDisplay: string) => {
    const digitsMatch = plateDisplay.match(/\d{3}/g);
    if (digitsMatch && digitsMatch.length > 0) {
      const lastDigits = digitsMatch[digitsMatch.length - 1];
      return `Vehicle ending • ${lastDigits}`;
    }
    const clean = plateDisplay.replace(/[^A-Z0-9]/gi, '');
    const ending = clean.slice(-3);
    return `Vehicle ending • ${ending}`;
  };

  return (
    <div className="pb-28 pt-3 px-3 max-w-[420px] mx-auto text-white">
      {/* 1. PRIMARY FLOATING WHITE HERO CARD - Compact & Sleek */}
      <div className="bg-white text-gray-900 rounded-[28px] px-4 py-3 crimson-card-shadow relative overflow-hidden text-center">
        {/* Top Dark Capsule Pill */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mx-auto mb-1.5 shadow-sm transition-all duration-200 relative z-10 ${
            activeCategory
              ? 'bg-[#0D1829] text-rose-300 ring-1 ring-rose-500/40'
              : 'bg-[#0D1829] text-white'
          }`}
        >
          {activeCategory && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
          )}
          <span>{getPillLabel()}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-lg font-black font-display tracking-tight text-gray-950 max-w-[270px] mx-auto leading-tight relative z-10">
          Smart vehicle alerts
        </h1>

        {/* Center Circular GO / Social Button */}
        <div className="my-1 relative flex flex-col items-center justify-center z-10">
          <div className="wrapper" tabIndex={-1}>
            <div className="stage">
              <div className="go-wrap">
                <button
                  className="btn"
                  onClick={(e) => {
                    e.currentTarget.focus();
                  }}
                  onDoubleClick={() => handleStartReport()}
                  aria-label="Report vehicle"
                >
                  REPORT
                </button>
              </div>

              <div className="main socials">
                <div className="up">
                  {/* Category 1: Vehicle condition */}
                  <button
                    className={`card1 group/c1 relative ${pressedQuadrant === 'vehicle' ? 'active-hover' : ''}`}
                    aria-label="Report Vehicle Condition"
                    title="Vehicle Condition: Lights, tyres, hazards"
                    onClick={() => handleQuadrantClick('vehicle')}
                    onMouseEnter={() => setHoveredCategory('vehicle')}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Car className="w-8 h-8 icon-quadrant-vehicle stroke-[2.2]" />
                  </button>

                  {/* Category 2: Driver behaviour */}
                  <button
                    className={`card2 group/c2 relative ${pressedQuadrant === 'driver' ? 'active-hover' : ''}`}
                    aria-label="Report Driver Behaviour"
                    title="Driver Behaviour: Tailgating, reckless driving, distraction"
                    onClick={() => handleQuadrantClick('driver')}
                    onMouseEnter={() => setHoveredCategory('driver')}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <svg
                      className="w-8 h-8 icon-quadrant-driver"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="12" y1="2" x2="12" y2="9" />
                      <line x1="2" y1="12" x2="9" y2="12" />
                      <line x1="15" y1="12" x2="22" y2="12" />
                    </svg>
                  </button>
                </div>
                <div className="down">
                  {/* Category 3: Road violation */}
                  <button
                    className={`card3 group/c3 relative ${pressedQuadrant === 'road' ? 'active-hover' : ''}`}
                    aria-label="Report Road Violation"
                    title="Road Violation: Red robot, lane straddling, illegal overtaking"
                    onClick={() => handleQuadrantClick('road')}
                    onMouseEnter={() => setHoveredCategory('road')}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <svg
                      className="w-8 h-8 icon-quadrant-road"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="4" y1="2" x2="4" y2="22" />
                      <line x1="20" y1="2" x2="20" y2="22" />
                      <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3" />
                    </svg>
                  </button>

                  {/* 4th button: Emergency */}
                  <button
                    className={`card4 group/c4 relative ${pressedQuadrant === 'emergency' ? 'active-hover' : ''}`}
                    aria-label="Emergency SOS button"
                    title="Emergency: Police, Ambulance, Traffic Authorities"
                    onClick={() => handleQuadrantClick('emergency')}
                    onMouseEnter={() => setHoveredCategory('emergency')}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="flex flex-col items-center justify-center icon-quadrant-emergency">
                      <Siren className="w-7 h-7 stroke-[2.3] animate-pulse" />
                      <span className="text-[8px] font-black tracking-tighter uppercase leading-none mt-0.5">SOS</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide button explaining how the 4 reporting buttons work - placed under the hero card */}
      <div className="flex justify-center mt-3">
        <button
          onClick={() => setShowGuideModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-white/90 hover:text-white transition-all shadow-xs cursor-pointer group"
          title="Guide: Learn how the 4 reporting buttons work"
        >
          <HelpCircle className="w-3.5 h-3.5 text-rose-300 group-hover:scale-110 transition-transform shrink-0" />
          <span>How the 4 reporting buttons work</span>
          <span className="text-rose-300 text-[10px]">▶</span>
        </button>
      </div>

      {/* 2. RECENT ALERTS (Clean white rounded cards with crimson accents) */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-2 mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">
            Recent alerts
          </span>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-[11px] font-semibold text-white/80 hover:text-white flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-[26px] p-5 text-center border border-white/15">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-white">All clear</p>
            <p className="text-[10px] text-white/60 mt-0.5">
              No active observations for your registered vehicles.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.slice(0, 3).map((alert) => (
              <button
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className="w-full bg-white text-gray-900 hover:bg-gray-50/95 p-3.5 rounded-[24px] flex items-center justify-between text-left transition-all active:scale-[0.99] focus:outline-none shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#941329] flex items-center justify-center shrink-0">
                    {alert.category === 'vehicle_condition' ? (
                      <Lightbulb className="w-4 h-4" />
                    ) : (
                      <Car className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-gray-950 truncate">
                      {alert.issueTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 shrink-0 drop-shadow-2xs">
                        <ProvincialPlate
                          provinceCode={detectProvinceFromPlate(alert.plateDisplay)}
                          plateText={alert.plateDisplay}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {getRelativeTime(alert.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {alert.status === 'needs_review' && (
                    <span className="text-[9px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                      Needs review
                    </span>
                  )}
                  {alert.status === 'received' && (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Received
                    </span>
                  )}
                  {alert.status === 'resolved' && (
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      Resolved
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Alert Quick-Action Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white text-gray-900 rounded-[32px] max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAlert(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="w-36 max-w-full drop-shadow-xs">
                <ProvincialPlate
                  provinceCode={detectProvinceFromPlate(selectedAlert.plateDisplay)}
                  plateText={selectedAlert.plateDisplay}
                />
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {getRelativeTime(selectedAlert.createdAt)}
              </span>
            </div>

            <h3 className="text-xl font-black font-display text-gray-950 mt-1">
              {selectedAlert.issueTitle}
            </h3>

            {/* Mandatory Neutral Language Banner */}
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200/60 rounded-2xl text-xs text-amber-900 font-medium leading-relaxed">
              "A road user reported a possible observation. Please check when safe."
            </div>

            {selectedAlert.customNote && (
              <div className="mt-3 p-3 bg-gray-50 rounded-2xl text-xs text-gray-700">
                <span className="font-semibold text-gray-900 block mb-0.5">Observation note:</span>
                "{selectedAlert.customNote}"
              </div>
            )}

            {/* Recorded Delivery Confirmation */}
            <div className="mt-3 p-2.5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-2 text-xs text-blue-900">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>System confirmation: Recorded delivered to your app feed.</span>
            </div>

            {/* Action selector */}
            {!actionType ? (
              <div className="mt-5 space-y-2">
                <button
                  onClick={() => submitAlertAction('resolve')}
                  disabled={isSubmittingAction}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Resolved</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActionType('dispute')}
                    className="py-2.5 px-3 border border-gray-200 text-gray-700 font-semibold text-xs rounded-2xl hover:bg-gray-50"
                  >
                    Dispute Note
                  </button>
                  <button
                    onClick={() => setActionType('flag_abuse')}
                    className="py-2.5 px-3 border border-red-200 text-red-600 font-semibold text-xs rounded-2xl hover:bg-red-50"
                  >
                    Flag as Abuse
                  </button>
                </div>

                <button
                  onClick={() => submitAlertAction('dismiss')}
                  disabled={isSubmittingAction}
                  className="w-full py-2 text-xs text-gray-400 hover:text-gray-700"
                >
                  Dismiss / Acknowledge
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-2 border-t border-gray-100 space-y-3">
                <div className="text-xs font-semibold text-gray-800">
                  {actionType === 'dispute'
                    ? 'Why are you disputing this report?'
                    : 'Report this alert as harassment or abuse:'}
                </div>
                <textarea
                  rows={2}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Provide details..."
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setActionType(null)}
                    className="w-1/3 py-2 text-xs border border-gray-200 rounded-2xl text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitAlertAction(actionType)}
                    disabled={isSubmittingAction || !actionNote.trim()}
                    className={`w-2/3 py-2 text-xs font-bold text-white rounded-2xl ${
                      actionType === 'dispute' ? 'bg-[#941329]' : 'bg-red-600'
                    }`}
                  >
                    Submit {actionType === 'dispute' ? 'Dispute' : 'Abuse Report'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. EMERGENCY CONTACTS MODAL */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-gray-900 rounded-[28px] max-w-sm w-full p-5 shadow-2xl relative border border-red-100">
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Siren className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-950 font-display leading-tight">
                  Emergency Road SOS
                </h3>
                <p className="text-xs text-red-600 font-semibold">South Africa Emergency Services</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              In danger, road accidents, or witnessing criminal activity? Dial directly:
            </p>

            <div className="space-y-2 mb-4">
              <a
                href="tel:10111"
                className="flex items-center justify-between p-3 rounded-2xl bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-950 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">10111</div>
                    <div className="text-[10px] text-gray-500">SAPS Police Emergency (Nationwide)</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-700 bg-white px-2.5 py-1 rounded-full shadow-sm">
                  Call
                </span>
              </a>

              <a
                href="tel:112"
                className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-950 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">112</div>
                    <div className="text-[10px] text-gray-500">Mobile Emergency (Free from any cellphone)</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-white px-2.5 py-1 rounded-full shadow-sm">
                  Call
                </span>
              </a>

              <a
                href="tel:10177"
                className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-950 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">10177</div>
                    <div className="text-[10px] text-gray-500">Ambulance & Medical Rescue</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-full shadow-sm">
                  Call
                </span>
              </a>
            </div>

            <button
              onClick={() => {
                setShowEmergencyModal(false);
                handleStartReport('driver_behaviour');
              }}
              className="w-full py-2.5 px-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Submit Urgent Reckless Driving Report</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Reporting Buttons Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white text-gray-900 rounded-[32px] max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-2xl bg-red-100 text-[#941329] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-950 font-display leading-tight">
                  Reporting Buttons Guide
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">How the 4 reporting buttons work</p>
              </div>
            </div>

            {/* Visual 2x2 Dial Preview */}
            <div className="my-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/70 border border-gray-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="grid grid-cols-2 gap-1 p-1 bg-gray-200/70 rounded-full shadow-inner shrink-0">
                {/* 1. Vehicle Condition Mini */}
                <div
                  className="w-7 h-7 bg-white rounded-tl-[14px] rounded-tr-[3px] rounded-br-[3px] rounded-bl-[3px] shadow-xs flex items-center justify-center text-[#941329]"
                  title="Vehicle Condition: Lights, tyres, hazards"
                >
                  <Car className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                {/* 2. Driver Behaviour Mini */}
                <div
                  className="w-7 h-7 bg-white rounded-tl-[3px] rounded-tr-[14px] rounded-br-[3px] rounded-bl-[3px] shadow-xs flex items-center justify-center text-[#1e40af]"
                  title="Driver Behaviour: Tailgating, reckless driving"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="12" y1="2" x2="12" y2="9" />
                    <line x1="2" y1="12" x2="9" y2="12" />
                    <line x1="15" y1="12" x2="22" y2="12" />
                  </svg>
                </div>
                {/* 3. Road Violation Mini */}
                <div
                  className="w-7 h-7 bg-white rounded-tl-[3px] rounded-tr-[3px] rounded-br-[3px] rounded-bl-[14px] shadow-xs flex items-center justify-center text-[#d97706]"
                  title="Road Violation: Red robot, lane straddling"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="2" x2="4" y2="22" />
                    <line x1="20" y1="2" x2="20" y2="22" />
                    <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3" />
                  </svg>
                </div>
                {/* 4. Emergency SOS Mini */}
                <div
                  className="w-7 h-7 bg-white rounded-tl-[3px] rounded-tr-[3px] rounded-br-[14px] rounded-bl-[3px] shadow-xs flex flex-col items-center justify-center text-[#dc2626]"
                  title="Emergency SOS: Police, Ambulance"
                >
                  <Siren className="w-2.5 h-2.5 stroke-[2.3] animate-pulse" />
                  <span className="text-[5px] font-black tracking-tighter leading-none">SOS</span>
                </div>
              </div>
              <div className="text-[11px] text-gray-700 leading-snug">
                Tap the center <strong>REPORT</strong> dial to expand the 4 quadrant buttons shown on the left.
              </div>
            </div>

            {/* The 4 Buttons Detailed - Exact Original Icons & Colors */}
            <div className="space-y-2.5">
              {/* Button 1: Vehicle Condition */}
              <div className="p-3 bg-red-50/40 border border-[#941329]/20 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-tl-[16px] rounded-tr-[3px] rounded-br-[3px] rounded-bl-[3px] bg-white border border-[#941329]/20 shadow-xs flex items-center justify-center text-[#941329] shrink-0">
                      <Car className="w-4.5 h-4.5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-950">1. Vehicle Condition</h4>
                      <span className="text-[10px] text-gray-400 font-medium">Top-Left Button · Crimson</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-[#941329] bg-[#941329]/10 border border-[#941329]/20 px-2 py-0.5 rounded-full">
                    Faults
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed mt-1">
                  Warns drivers about safety defects they cannot see from inside: broken brake lights, flat or soft tyres, doors/boot unlatched, fuel flap open, loose roof cargo, or heavy exhaust smoke.
                </p>
              </div>

              {/* Button 2: Driver Behaviour */}
              <div className="p-3 bg-blue-50/40 border border-[#1e40af]/20 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-tl-[3px] rounded-tr-[16px] rounded-br-[3px] rounded-bl-[3px] bg-white border border-[#1e40af]/20 shadow-xs flex items-center justify-center text-[#1e40af] shrink-0">
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="12" y1="2" x2="12" y2="9" />
                        <line x1="2" y1="12" x2="9" y2="12" />
                        <line x1="15" y1="12" x2="22" y2="12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-950">2. Driver Behaviour</h4>
                      <span className="text-[10px] text-gray-400 font-medium">Top-Right Button · Deep Blue</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-[#1e40af] bg-[#1e40af]/10 border border-[#1e40af]/20 px-2 py-0.5 rounded-full">
                    Safety
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed mt-1">
                  Sends calm, anonymous reminders for hazardous driving: tailgating, swerving between lanes, texting or handling phones while driving, or speeding through residential areas.
                </p>
              </div>

              {/* Button 3: Road Violation */}
              <div className="p-3 bg-amber-50/40 border border-[#d97706]/20 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-tl-[3px] rounded-tr-[3px] rounded-br-[3px] rounded-bl-[16px] bg-white border border-[#d97706]/20 shadow-xs flex items-center justify-center text-[#d97706] shrink-0">
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="2" x2="4" y2="22" />
                        <line x1="20" y1="2" x2="20" y2="22" />
                        <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-950">3. Road Violation</h4>
                      <span className="text-[10px] text-gray-400 font-medium">Bottom-Left Button · Amber</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-[#d97706] bg-[#d97706]/10 border border-[#d97706]/20 px-2 py-0.5 rounded-full">
                    Traffic
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed mt-1">
                  Documents public traffic and parking infractions: running red robots (traffic lights), blocking driveways or kerb ramps, stopping in cycle/bus lanes, and double parking.
                </p>
              </div>

              {/* Button 4: Emergency SOS */}
              <div className="p-3 bg-red-50/60 border border-[#dc2626]/20 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-tl-[3px] rounded-tr-[3px] rounded-br-[16px] rounded-bl-[3px] bg-white border border-[#dc2626]/20 shadow-xs flex flex-col items-center justify-center text-[#dc2626] shrink-0">
                      <Siren className="w-3.5 h-3.5 stroke-[2.3] animate-pulse" />
                      <span className="text-[6px] font-black tracking-tighter uppercase leading-none mt-0.5">SOS</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-950">4. Emergency SOS</h4>
                      <span className="text-[10px] text-red-600 font-medium">Bottom-Right Button · Red</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-white bg-[#dc2626] px-2 py-0.5 rounded-full shadow-2xs">
                    SOS
                  </span>
                </div>
                <p className="text-[11px] text-gray-700 leading-relaxed mt-1">
                  Reserved strictly for immediate danger, active hijacking, violent road rage, or severe crashes. Opens direct one-tap dialing for SAPS Police (10111), Mobile Emergency (112), and Medical Ambulance (10177).
                </p>
              </div>
            </div>

            {/* Privacy Protection Callout */}
            <div className="mt-3.5 p-3 bg-emerald-50/80 border border-emerald-100 rounded-2xl flex items-center gap-2.5 text-[11px] text-emerald-950">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="leading-snug">
                <strong>100% Anonymous:</strong> The reported driver never sees your identity, name, or phone number.
              </span>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-4 w-full py-3 bg-[#941329] hover:bg-[#7D0E20] text-white font-bold text-xs rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Got it, close guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
