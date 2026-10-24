import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { AlertItem } from '../types/index.js';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Car,
  Clock,
  Shield,
  HelpCircle,
  Flag,
  FileQuestion,
  X,
  ChevronRight,
  Check,
  EyeOff,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

import { ProvincialPlate, detectProvinceFromPlate } from '../components/ProvincialPlate.js';

export function AlertsScreen() {
  const { alerts, takeAlertAction, refreshAlerts } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [actionType, setActionType] = useState<'resolve' | 'dispute' | 'flag_abuse' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'unread') return a.status === 'received' || a.status === 'needs_review';
    if (filter === 'read') return a.status === 'resolved' || a.status === 'dismissed';
    return true;
  });

  const getRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} d ago`;
  };

  const handleAction = async (type: 'resolve' | 'dismiss' | 'dispute' | 'flag_abuse') => {
    if (!selectedAlert) return;
    setIsSubmitting(true);
    await takeAlertAction(selectedAlert.id, type, actionNote);
    setIsSubmitting(false);
    setSelectedAlert(null);
    setActionType(null);
    setActionNote('');
  };

  return (
    <div className="pb-28 pt-3 px-3 max-w-[420px] mx-auto text-gray-900">
      {/* Floating White Main Alerts Card */}
      <div className="bg-white rounded-[34px] p-6 crimson-card-shadow relative overflow-hidden">
        {/* Top Dark Capsule Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0D1829] text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-4 shadow-sm">
          <span>VEHICLE OBSERVATIONS · ALERTS</span>
        </div>

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-black font-display text-gray-950">
            Alerts & Observations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Observations reported by road users for your registered vehicles.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filter === 'unread'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Unread ({alerts.filter((a) => a.status === 'received' || a.status === 'needs_review').length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filter === 'read'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Read ({alerts.filter((a) => a.status === 'resolved' || a.status === 'dismissed').length})
          </button>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="bg-gray-50/80 rounded-2xl p-8 text-center border border-gray-100 shadow-xs mt-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-base font-bold text-gray-900 font-display">
              No alerts found
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Everything is clear. When road users submit observations for your vehicles, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const photo = alert.photoUrl || (alert as any).photo_url;
              return (
                <button
                  key={alert.id}
                  onClick={() => {
                    setSelectedAlert(alert);
                    setActionType(null);
                    setActionNote('');
                  }}
                  className="w-full bg-gray-50/70 hover:bg-gray-100/80 p-4 rounded-2xl border border-gray-200/60 flex flex-col gap-2 text-left shadow-xs transition-all active:scale-[0.99] focus:outline-none"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B81D39] flex items-center justify-center shrink-0 mt-0.5">
                        {alert.category === 'vehicle_condition' ? (
                          <Lightbulb className="w-5 h-5" />
                        ) : (
                          <Car className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-28 shrink-0 drop-shadow-xs">
                            <ProvincialPlate
                              provinceCode={detectProvinceFromPlate(alert.plateDisplay)}
                              plateText={alert.plateDisplay}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-mono font-bold text-[11px] text-gray-900 leading-tight truncate">
                              {alert.plateDisplay}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium leading-tight">
                              {getRelativeTime(alert.createdAt)}
                            </span>
                          </div>
                        </div>

                        <h2 className="text-sm font-bold text-gray-950 mt-1 truncate">
                          {alert.issueTitle}
                        </h2>

                        {/* Neutral language preview */}
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 italic">
                          {alert.customNote ? `"${alert.customNote}"` : 'Please check when safe.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {alert.status === 'needs_review' && (
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                          Needs review
                        </span>
                      )}
                      {alert.status === 'received' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Unread
                        </span>
                      )}
                      {alert.status === 'resolved' && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Read
                        </span>
                      )}
                      {alert.status === 'disputed' && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          Disputed
                        </span>
                      )}
                      {alert.status === 'flagged_abuse' && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          Flagged
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Photo attachment preview if reporter sent a photo */}
                  {photo && (
                    <div className="mt-1 relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 group/photo w-full">
                      <img
                        src={photo}
                        alt="Observation attachment preview"
                        className="w-full h-32 object-cover transition-transform duration-300 group-hover/photo:scale-[1.02]"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1 shadow-xs border border-white/10">
                        <Camera className="w-3 h-3 text-rose-400" /> Photo Attached
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL ALERT DETAIL MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAlert(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <div className="w-40 max-w-full drop-shadow-xs">
                  <ProvincialPlate
                    provinceCode={detectProvinceFromPlate(selectedAlert.plateDisplay)}
                    plateText={selectedAlert.plateDisplay}
                  />
                </div>
                <div className="font-mono font-black text-xs text-gray-900 mt-1">
                  {selectedAlert.plateDisplay}
                </div>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {getRelativeTime(selectedAlert.createdAt)}
              </span>
            </div>

            <h3 className="text-xl font-black font-display text-gray-950">
              {selectedAlert.issueTitle}
            </h3>

            {/* Mandatory Neutral Language Banner (Rule 6) */}
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200/70 rounded-2xl text-xs text-amber-900 leading-relaxed">
              <strong className="block mb-0.5 font-bold">Observation notice:</strong>
              "A road user reported a possible observation. Please check when safe."
            </div>

            {selectedAlert.customNote && (
              <div className="mt-3 p-3 bg-gray-50 rounded-2xl text-xs text-gray-700">
                <span className="font-semibold text-gray-900 block mb-0.5">Note:</span>
                "{selectedAlert.customNote}"
              </div>
            )}

            {(() => {
              const modalPhoto = selectedAlert.photoUrl || (selectedAlert as any).photo_url;
              if (!modalPhoto) return null;
              return (
                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200/90 bg-gray-900/5 shadow-xs">
                  <div className="px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold tracking-wider uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-rose-400" /> Reporter Attached Photo
                    </span>
                    <span className="text-gray-400 font-normal text-[9px]">Observation Media</span>
                  </div>
                  <div className="relative">
                    <img
                      src={modalPhoto}
                      alt="Observation attachment"
                      className="w-full max-h-64 object-cover"
                    />
                    <a
                      href={modalPhoto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/75 hover:bg-black text-white text-[10px] font-bold rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-sm transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ImageIcon className="w-3 h-3" /> View Full
                    </a>
                  </div>
                </div>
              );
            })()}

            {/* Recorded Delivery Status (Rule 10) */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Delivery recorded:</span>
                Delivered in-app to registered vehicle drivers.
              </div>
            </div>

            {/* Privacy rule notice (Rule 8) */}
            <div className="mt-2 p-3 bg-gray-50 rounded-2xl text-[11px] text-gray-500 flex items-start gap-2">
              <EyeOff className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span>
                Reporter identity is hidden from you. Restricted security records are kept by Driver Ping to protect against abuse.
              </span>
            </div>

            {/* Existing status notes if resolved/disputed */}
            {selectedAlert.recipientActionNote && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-900">
                <span className="font-bold">Your note: </span>
                {selectedAlert.recipientActionNote}
              </div>
            )}
            {selectedAlert.disputeReason && (
              <div className="mt-3 p-2.5 bg-purple-50 border border-purple-100 rounded-2xl text-xs text-purple-900">
                <span className="font-bold">Dispute filed: </span>
                {selectedAlert.disputeReason}
              </div>
            )}

            {/* Action buttons (Rule 6: resolve, dismiss, dispute, flag abuse) */}
            {!actionType ? (
              <div className="mt-5 space-y-2">
                <button
                  onClick={() => handleAction('resolve')}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark as Read</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActionType('dispute')}
                    className="py-2.5 px-3 border border-gray-200 text-gray-700 font-semibold text-xs rounded-2xl hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileQuestion className="w-3.5 h-3.5" />
                    <span>Dispute</span>
                  </button>
                  <button
                    onClick={() => setActionType('flag_abuse')}
                    className="py-2.5 px-3 border border-red-200 text-red-600 font-semibold text-xs rounded-2xl hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Flag Abuse</span>
                  </button>
                </div>

                <button
                  onClick={() => handleAction('dismiss')}
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-700 font-medium"
                >
                  Dismiss / Acknowledge
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                <div className="text-xs font-semibold text-gray-900">
                  {actionType === 'dispute'
                    ? 'Reason for disputing this observation:'
                    : 'Explain why you are flagging this report as abuse/harassment:'}
                </div>
                <textarea
                  rows={2}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={
                    actionType === 'dispute'
                      ? 'e.g. Observation is factually incorrect...'
                      : 'e.g. Repeated targeting or malicious falsehood...'
                  }
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
                    onClick={() => handleAction(actionType)}
                    disabled={isSubmitting || !actionNote.trim()}
                    className={`w-2/3 py-2 text-xs font-semibold text-white rounded-2xl ${
                      actionType === 'dispute' ? 'bg-purple-600' : 'bg-red-600'
                    } disabled:opacity-40`}
                  >
                    Submit {actionType === 'dispute' ? 'Dispute' : 'Abuse Report'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
