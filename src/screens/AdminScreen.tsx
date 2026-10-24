import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { OwnershipVerificationItem, AuditLogItem } from '../types/index.js';
import {
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowLeft,
  AlertTriangle,
  History,
  Shield,
  Eye,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { ProvincialPlate, detectProvinceFromPlate } from '../components/ProvincialPlate.js';

export function AdminScreen() {
  const {
    user,
    setActiveTab,
    fetchAdminVerifications,
    reviewVerification,
    fetchAdminDisputes,
    takeDisputeAction,
    fetchAuditLogs,
    switchAccount,
  } = useApp();

  const [activeTab, setLocalActiveTab] = useState<'verifications' | 'disputes' | 'audit'>('verifications');
  const [verifications, setVerifications] = useState<OwnershipVerificationItem[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [activeTab, user?.id, user?.role]);

  const loadData = async () => {
    if (user?.role !== 'admin') {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      if (activeTab === 'verifications') {
        const list = await fetchAdminVerifications();
        setVerifications(list || []);
      } else if (activeTab === 'disputes') {
        const list = await fetchAdminDisputes();
        setDisputes(list || []);
      } else if (activeTab === 'audit') {
        const list = await fetchAuditLogs();
        setAuditLogs(list || []);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (id: string, decision: 'approved' | 'rejected') => {
    const res = await reviewVerification(id, decision, reviewNotes);
    if (res.success) {
      setActionNotice(`Verification submission ${decision}!`);
      setReviewNotes('');
      loadData();
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleDisputeAction = async (id: string, decision: 'dismiss_flag' | 'delete_report' | 'uphold_abuse') => {
    const res = await takeDisputeAction(id, decision, reviewNotes);
    if (res.success) {
      setActionNotice('Dispute action recorded');
      setReviewNotes('');
      loadData();
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  // If current user is not admin, provide 1-click "Switch to Admin Demo User"
  if (user?.role !== 'admin') {
    return (
      <div className="pb-28 pt-3 px-3 max-w-[420px] mx-auto text-gray-900">
        <div className="bg-white rounded-[34px] p-6 crimson-card-shadow text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0D1829] text-white rounded-full text-[9px] font-black uppercase tracking-widest mx-auto mb-4 shadow-sm">
            <span>ADMIN COMPLIANCE · RESTRICTED</span>
          </div>

          <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h1 className="text-2xl font-black font-display text-gray-950">
            Compliance Console
          </h1>
          <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
            This area is restricted to compliance personnel to review vehicle ownership registration documents, manage disputes, and audit security records.
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left text-xs text-gray-600 space-y-2">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <Shield className="w-4 h-4 text-purple-700" />
              <span>Admin Role Required:</span>
            </div>
            <p>
              Current session user is <strong>{user?.fullName || 'Guest'}</strong> ({user?.role || 'none'}). Switch to the pre-configured Compliance Admin demo account to inspect and approve documents.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => switchAccount('usr_admin_003')}
              className="w-full py-3.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Switch to Compliance Admin (Instant Access)</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-900 font-semibold"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-3 px-3 max-w-[420px] mx-auto text-gray-900">
      <div className="bg-white rounded-[34px] p-6 crimson-card-shadow relative overflow-hidden">
        {/* Top Dark Capsule Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0D1829] text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-4 shadow-sm">
          <span>COMPLIANCE CONSOLE · ADMIN MODE</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Profile</span>
            </button>
            <h1 className="text-2xl font-black font-display text-gray-950">
              Admin Compliance
            </h1>
          </div>
          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-1 rounded-full uppercase">
            Admin
          </span>
        </div>

        {actionNotice && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-100 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-2xl mb-4">
          <button
            onClick={() => setLocalActiveTab('verifications')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'verifications'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ownership Proofs
          </button>
          <button
            onClick={() => setLocalActiveTab('disputes')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'disputes'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Disputes & Abuse
          </button>
          <button
            onClick={() => setLocalActiveTab('audit')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'audit'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Audit Logs
          </button>
        </div>

        {/* TAB 1: OWNERSHIP VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-center text-xs text-gray-400 py-6">Loading submissions...</p>
            ) : verifications.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 text-xs text-gray-500">
                No ownership documents currently in queue.
              </div>
            ) : (
              verifications.map((verif) => (
                <div
                  key={verif.id}
                  className="bg-gray-50/70 rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="w-28 drop-shadow-xs">
                        <ProvincialPlate
                          provinceCode={detectProvinceFromPlate(verif.plateDisplay || '')}
                          plateText={verif.plateDisplay || ''}
                        />
                      </div>
                      <div className="font-mono font-black text-[11px] text-gray-900">
                        {verif.plateDisplay || 'UNKNOWN PLATE'}
                      </div>
                      <h2 className="text-xs font-bold text-gray-900 mt-1">
                        {verif.userName} ({verif.userPhone})
                      </h2>
                      <span className="text-[11px] text-gray-500">
                        {verif.vehicleDetails}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        verif.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : verif.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {verif.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl text-xs flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-800 truncate max-w-[180px]">
                        {verif.documentName}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase">
                      {verif.documentType}
                    </span>
                  </div>

                  {verif.status === 'pending' && (
                    <div className="pt-2 border-t border-gray-200/60 space-y-2">
                      <input
                        type="text"
                        placeholder="Admin review notes (optional)..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="w-full p-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(verif.id, 'rejected')}
                          className="flex-1 py-2 bg-red-50 text-red-700 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors"
                        >
                          Reject Logbook
                        </button>
                        <button
                          onClick={() => handleReview(verif.id, 'approved')}
                          className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                          Approve Owner
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: DISPUTES & ABUSE REPORTS */}
        {activeTab === 'disputes' && (
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-center text-xs text-gray-400 py-6">Loading disputes...</p>
            ) : disputes.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 text-xs text-gray-500">
                No pending disputes or abuse reports.
              </div>
            ) : (
              disputes.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50/70 rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="w-28 drop-shadow-xs">
                        <ProvincialPlate
                          provinceCode={detectProvinceFromPlate(item.plateDisplay)}
                          plateText={item.plateDisplay}
                        />
                      </div>
                      <div className="font-mono font-black text-[11px] text-gray-900">
                        {item.plateDisplay}
                      </div>
                      <h2 className="text-xs font-bold text-gray-900 mt-1">
                        {item.issueTitle}
                      </h2>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'flagged_abuse'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {item.status === 'flagged_abuse' ? 'ABUSE FLAGGED' : 'DISPUTED'}
                    </span>
                  </div>

                  <div className="p-3 bg-red-50/70 rounded-xl text-xs text-red-900 border border-red-100">
                    <span className="font-bold block mb-0.5">Recipient explanation:</span>
                    "{item.disputeReason || item.abuseReason || 'No notes provided'}"
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200/60">
                    <button
                      onClick={() => handleDisputeAction(item.id, 'dismiss_flag')}
                      className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100"
                    >
                      Dismiss Flag
                    </button>
                    <button
                      onClick={() => handleDisputeAction(item.id, 'delete_report')}
                      className="flex-1 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700"
                    >
                      Uphold & Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: AUDIT LOGS (Rule 9) */}
        {activeTab === 'audit' && (
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-center text-xs text-gray-400 py-6">Loading audit trails...</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900 text-[11px]">
                      {log.actionType}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono">
                    Actor: {log.actorId ? log.actorId : 'SYSTEM'} · Target: {log.targetType}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
