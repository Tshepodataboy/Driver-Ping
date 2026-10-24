export type UserRole = 'user' | 'admin';
export type PlanTier = 'free' | 'paid_owner';

export interface User {
  id: string;
  phone: string;
  fullName: string;
  firstName?: string;
  surname?: string;
  role: UserRole;
  plan: PlanTier;
  smsOptIn: boolean;
  smsMonthlyCapPence: number;
  smsCurrentSpendPence: number;
  defaultPlate?: string;
  defaultProvinceCode?: string;
  createdAt: string;
}

export type ReportCategory = 'vehicle_condition' | 'driver_behaviour' | 'road_violation';

export interface IssueOption {
  code: string;
  title: string;
  description: string;
}

export interface VehicleDriverItem {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  role: 'driver' | 'owner';
  status: 'approved' | 'pending_owner_approval' | 'rejected';
  requestedAt: string;
  approvedAt: string | null;
}

export interface TrustedContactItem {
  id: string;
  vehicleId: string;
  name: string;
  phone: string;
  relationship: string;
  consentGiven: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plateNormalized: string;
  plateDisplay: string;
  make: string;
  model: string;
  color: string;
  verifiedOwnerId: string | null;
  userRole: 'owner' | 'driver';
  driverStatus: 'approved' | 'pending_owner_approval' | 'rejected';
  isVerifiedOwner: boolean;
  allDrivers: VehicleDriverItem[];
  trustedContacts: TrustedContactItem[];
  pendingOwnershipVerification: boolean;
  isDefault?: boolean;
  createdAt: string;
}

export type AlertStatus =
  | 'received'
  | 'needs_review'
  | 'resolved'
  | 'disputed'
  | 'flagged_abuse'
  | 'dismissed';

export interface AlertItem {
  id: string;
  plateDisplay: string;
  vehicleMakeModel: string;
  category: ReportCategory;
  issueCode: string;
  issueTitle: string;
  customNote: string | null;
  photoUrl: string | null;
  status: AlertStatus;
  recipientActionNote: string | null;
  disputeReason: string | null;
  abuseReason: string | null;
  createdAt: string;
  isRecordedDelivered: boolean;
  deliveredAt: string;
  neutralNotice: string;
  privacyNotice: string;
}

export interface OwnershipVerificationItem {
  id: string;
  vehicleId: string;
  userId: string;
  userPhone?: string;
  userName?: string;
  plateDisplay?: string;
  vehicleDetails?: string;
  documentName: string;
  documentType: string;
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedById: string | null;
}

export interface AuditLogItem {
  id: string;
  actorId: string | null;
  actionType: string;
  targetId: string | null;
  targetType: string;
  detailsJson: Record<string, any>;
  createdAt: string;
}
