import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Vehicle,
  AlertItem,
  ReportCategory,
  OwnershipVerificationItem,
  AuditLogItem,
} from '../types/index.js';

export type TabKey = 'home' | 'vehicles' | 'report' | 'alerts' | 'profile' | 'admin' | 'settings' | 'landing';

interface DemoAccount {
  id: string;
  phone: string;
  fullName: string;
  role: 'user' | 'admin';
  plan: 'free' | 'paid_owner';
}

interface AppContextType {
  user: User | null;
  currentUserId: string;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  reportCategoryPreset: ReportCategory | null;
  setReportCategoryPreset: (cat: ReportCategory | null) => void;
  vehicles: Vehicle[];
  alerts: AlertItem[];
  unreadAlertsCount: number;
  isLoading: boolean;
  demoAccounts: DemoAccount[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  
  // Auth methods
  loginAsDemo: (userId?: string) => Promise<void>;
  loginWithEmail: (email: string, fullNameOrUserId?: string, mode?: 'signin' | 'signup') => Promise<{ success: boolean; isNew?: boolean; user?: User; error?: string }>;
  requestOtp: (phone: string) => Promise<{ success: boolean; message: string; debugCode?: string; error?: string }>;
  verifyOtp: (phone: string, code: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  switchAccount: (userId: string) => Promise<void>;
  signOut: () => void;
  updateUserPreferences: (prefs: {
    smsOptIn?: boolean;
    smsMonthlyCapPence?: number;
    plan?: 'free' | 'paid_owner';
    fullName?: string;
    phone?: string;
    defaultPlate?: string;
    defaultProvinceCode?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  // Vehicle actions
  refreshVehicles: () => Promise<void>;
  registerVehicle: (data: { plate: string; make?: string; model?: string; color?: string }) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  submitOwnershipProof: (vehicleId: string, docData: { documentName: string; documentType: string; documentUrl?: string }) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    requiresUpgrade?: boolean;
  }>;
  manageDriver: (vehicleId: string, driverRecordId: string, action: 'approve' | 'remove') => Promise<{ success: boolean; error?: string }>;
  addTrustedContact: (vehicleId: string, contact: { name: string; phone: string; relationship: string; consentGiven: boolean }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  removeTrustedContact: (vehicleId: string, contactId: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultVehicle: (vehicleId: string) => Promise<{ success: boolean; error?: string }>;

  // Reporting actions
  submitReport: (reportData: {
    plate: string;
    category: ReportCategory;
    issueCode: string;
    issueTitle: string;
    customNote?: string;
    photoUrl?: string;
    idempotencyKey?: string;
  }) => Promise<{
    success: boolean;
    message?: string;
    statusMessage?: string;
    deliveriesRecorded?: number;
    isQueuedUnclaimed?: boolean;
    isDuplicatePrevented?: boolean;
    error?: string;
  }>;

  // Alert actions
  refreshAlerts: () => Promise<void>;
  takeAlertAction: (alertId: string, action: 'resolve' | 'dismiss' | 'dispute' | 'flag_abuse', noteOrReason?: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Admin actions
  fetchAdminVerifications: () => Promise<OwnershipVerificationItem[]>;
  reviewVerification: (id: string, decision: 'approved' | 'rejected', notes?: string) => Promise<{ success: boolean; error?: string }>;
  fetchAdminDisputes: () => Promise<any[]>;
  takeDisputeAction: (id: string, decision: 'dismiss_flag' | 'delete_report' | 'uphold_abuse', notes?: string) => Promise<{ success: boolean; error?: string }>;
  fetchAuditLogs: () => Promise<AuditLogItem[]>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('driver_ping_token') : null;
  });
  const [user, setUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('usr_alex_001');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [reportCategoryPreset, setReportCategoryPreset] = useState<ReportCategory | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Headers helper - Uses cryptographic Bearer token; never trusts spoofed headers
  const getHeaders = (tokenOverride?: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = tokenOverride !== undefined ? tokenOverride : authToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch initial profile & demo accounts
  useEffect(() => {
    fetchDemoAccounts();
    initSession();
  }, []);

  const initSession = async () => {
    setIsLoading(true);
    let token = authToken;

    // If no token stored yet, auto-login as demo user so app is immediately usable
    if (!token) {
      await loginAsDemo('usr_alex_001');
      return;
    }

    // Validate existing token
    try {
      const meRes = await fetch('/api/auth/me', { headers: getHeaders(token) });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
        setCurrentUserId(meData.user.id);
        await loadUserData(token);
      } else {
        // Token expired or invalid, reset session
        setAuthToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('driver_ping_token');
        }
        setUser(null);
        setCurrentUserId('');
      }
    } catch (err) {
      console.error('Error validating session', err);
      setUser(null);
      setCurrentUserId('');
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (userId: string = 'usr_alex_001') => {
    setIsLoading(true);
    try {
      const demoRes = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (demoRes.ok) {
        const demoData = await demoRes.json();
        setAuthToken(demoData.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('driver_ping_token', demoData.token);
        }
        setUser(demoData.user);
        setCurrentUserId(demoData.user.id);
        await loadUserData(demoData.token);
      }
    } catch (err) {
      console.error('Failed to log in as demo', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDemoAccounts = async () => {
    try {
      const res = await fetch('/api/auth/demo-accounts');
      if (res.ok) {
        const data = await res.json();
        setDemoAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error('Failed to load demo accounts', err);
    }
  };

  const loadUserData = async (tokenOverride?: string | null) => {
    setIsLoading(true);
    try {
      const headers = getHeaders(tokenOverride);

      // 1. Get Me
      const meRes = await fetch('/api/auth/me', { headers });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
        setCurrentUserId(meData.user.id);
      } else {
        setUser(null);
      }

      // 2. Get Vehicles
      const vehRes = await fetch('/api/vehicles', { headers });
      if (vehRes.ok) {
        const vehData = await vehRes.json();
        setVehicles(vehData.vehicles || []);
      }

      // 3. Get Alerts
      const alertRes = await fetch('/api/alerts', { headers });
      if (alertRes.ok) {
        const alertData = await alertRes.json();
        const rawAlerts: AlertItem[] = alertData.alerts || [];
        const seen = new Set<string>();
        const uniqueAlerts = rawAlerts.filter((a) => {
          if (!a?.id || seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });
        setAlerts(uniqueAlerts);
      }
    } catch (err) {
      console.error('Error loading user data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshVehicles = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/vehicles', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      console.error('Failed to refresh vehicles', err);
    }
  };

  const refreshAlerts = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/alerts', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        const rawAlerts: AlertItem[] = data.alerts || [];
        const seen = new Set<string>();
        const uniqueAlerts = rawAlerts.filter((a) => {
          if (!a?.id || seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });
        setAlerts(uniqueAlerts);
      }
    } catch (err) {
      console.error('Failed to refresh alerts', err);
    }
  };

  // Auth
  const loginWithEmail = async (
    email: string,
    fullNameOrUserId?: string,
    mode: 'signin' | 'signup' = 'signin'
  ) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/email-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName: mode === 'signup' ? fullNameOrUserId : undefined,
          userId: mode === 'signin' ? fullNameOrUserId : undefined,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to sign in' };

      setAuthToken(data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('driver_ping_token', data.token);
      }
      setCurrentUserId(data.user.id);
      setUser(data.user);
      // For sign in, close modal; for signup caller can handle post-registration step
      if (mode === 'signin' || !data.isNew) {
        setIsAuthModalOpen(false);
      }
      await loadUserData(data.token);
      fetchDemoAccounts();
      return { success: true, isNew: data.isNew, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async (phone: string) => {
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || 'Failed to request OTP' };
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const verifyOtp = async (phone: string, code: string, fullName?: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, fullName }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Verification failed' };

      setAuthToken(data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('driver_ping_token', data.token);
      }
      setCurrentUserId(data.user.id);
      setUser(data.user);
      setIsAuthModalOpen(false);
      await loadUserData(data.token);
      fetchDemoAccounts();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const switchAccount = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setAuthToken(data.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('driver_ping_token', data.token);
        }
        setUser(data.user);
        setCurrentUserId(data.user.id);
        await loadUserData(data.token);
      }
    } catch (err) {
      console.error('Failed to switch demo account', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('driver_ping_token');
    }
    setCurrentUserId('');
    setUser(null);
    setVehicles([]);
    setAlerts([]);
  };

  const updateUserPreferences = async (prefs: {
    smsOptIn?: boolean;
    smsMonthlyCapPence?: number;
    plan?: 'free' | 'paid_owner';
    fullName?: string;
    phone?: string;
    defaultPlate?: string;
    defaultProvinceCode?: string;
  }) => {
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to update preferences' };
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Vehicle operations
  const registerVehicle = async (data: { plate: string; make?: string; model?: string; color?: string }) => {
    try {
      const res = await fetch('/api/vehicles/register', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) return { success: false, error: resData.error || 'Failed to register vehicle' };
      await refreshVehicles();
      return { success: true, message: resData.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const submitOwnershipProof = async (
    vehicleId: string,
    docData: { documentName: string; documentType: string; documentUrl?: string }
  ) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/submit-ownership`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(docData),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Failed to submit ownership document',
          requiresUpgrade: data.requiresUpgrade,
        };
      }
      await refreshVehicles();
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const manageDriver = async (
    vehicleId: string,
    driverRecordId: string,
    action: 'approve' | 'remove'
  ) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/drivers/${driverRecordId}/${action}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Action failed' };
      await refreshVehicles();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const addTrustedContact = async (
    vehicleId: string,
    contact: { name: string; phone: string; relationship: string; consentGiven: boolean }
  ) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/trusted-contacts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(contact),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to add contact' };
      await refreshVehicles();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const removeTrustedContact = async (vehicleId: string, contactId: string) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/trusted-contacts/${contactId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) return { success: false, error: 'Failed to delete contact' };
      await refreshVehicles();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const setDefaultVehicle = async (vehicleId: string) => {
    const veh = vehicles.find((v) => v.id === vehicleId);
    if (!veh) return { success: false, error: 'Vehicle not found' };
    const lastWord = veh.plateDisplay.split(' ').pop() || '';
    const res = await updateUserPreferences({
      defaultPlate: veh.plateDisplay,
      defaultProvinceCode: lastWord.length === 2 ? lastWord : user?.defaultProvinceCode || 'WC',
    });
    return res;
  };

  // Report submission
  const submitReport = async (reportData: {
    plate: string;
    category: ReportCategory;
    issueCode: string;
    issueTitle: string;
    customNote?: string;
    photoUrl?: string;
    idempotencyKey?: string;
  }) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(reportData),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Failed to submit report',
          isDuplicatePrevented: data.isDuplicatePrevented,
        };
      }
      // If the report was for user's own car in demo, refresh alerts
      refreshAlerts();
      return {
        success: true,
        message: data.message,
        statusMessage: data.statusMessage,
        deliveriesRecorded: data.deliveriesRecorded,
        isQueuedUnclaimed: data.isQueuedUnclaimed,
        isDuplicatePrevented: data.isDuplicatePrevented,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Alert recipient actions
  const takeAlertAction = async (
    alertId: string,
    action: 'resolve' | 'dismiss' | 'dispute' | 'flag_abuse',
    noteOrReason?: string
  ) => {
    try {
      const payload: Record<string, string> = { action };
      if (action === 'resolve' || action === 'dismiss') payload.note = noteOrReason || '';
      if (action === 'dispute') payload.reason = noteOrReason || '';
      if (action === 'flag_abuse') payload.reason = noteOrReason || '';

      const res = await fetch(`/api/alerts/${alertId}/action`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to update alert' };
      await refreshAlerts();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Admin APIs
  const fetchAdminVerifications = async () => {
    try {
      const res = await fetch('/api/admin/verifications', { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.verifications || [];
    } catch {
      return [];
    }
  };

  const reviewVerification = async (
    id: string,
    decision: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/verifications/${id}/review`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ decision, notes }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Review failed' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const fetchAdminDisputes = async () => {
    try {
      const res = await fetch('/api/admin/disputes-abuse', { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.items || [];
    } catch {
      return [];
    }
  };

  const takeDisputeAction = async (
    id: string,
    decision: 'dismiss_flag' | 'delete_report' | 'uphold_abuse',
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/disputes-abuse/${id}/action`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ decision, notes }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Action failed' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.logs || [];
    } catch {
      return [];
    }
  };

  const unreadAlertsCount = alerts.filter(
    (a) => a.status === 'received' || a.status === 'needs_review'
  ).length;

  const enrichedVehicles = vehicles.map((v) => ({
    ...v,
    isDefault: Boolean(
      user?.defaultPlate &&
      v.plateDisplay.replace(/\s+/g, '').toUpperCase() === user.defaultPlate.replace(/\s+/g, '').toUpperCase()
    ),
  }));

  return (
    <AppContext.Provider
      value={{
        user,
        currentUserId,
        activeTab,
        setActiveTab,
        reportCategoryPreset,
        setReportCategoryPreset,
        vehicles: enrichedVehicles,
        alerts,
        unreadAlertsCount,
        isLoading,
        demoAccounts,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginAsDemo,
        loginWithEmail,
        requestOtp,
        verifyOtp,
        switchAccount,
        signOut,
        updateUserPreferences,
        refreshVehicles,
        registerVehicle,
        submitOwnershipProof,
        manageDriver,
        addTrustedContact,
        removeTrustedContact,
        setDefaultVehicle,
        submitReport,
        refreshAlerts,
        takeAlertAction,
        fetchAdminVerifications,
        reviewVerification,
        fetchAdminDisputes,
        takeDisputeAction,
        fetchAuditLogs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
