/**
 * Driver Ping - Database Layer
 * Supabase PostgreSQL client with automatic schema bootstrap and demo seed data.
 * Falls back to an in-memory store if DATABASE_URL is not yet configured.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DbUser {
  id: string;
  phone: string;
  fullName: string;
  role: 'user' | 'admin';
  plan: 'free' | 'paid_owner';
  smsOptIn: boolean;
  smsMonthlyCapPence: number;
  smsCurrentSpendPence: number;
  defaultPlate?: string;
  defaultProvinceCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbOtp {
  id: string;
  phone: string;
  code: string;
  expiresAt: string;
  verified: boolean;
  createdAt: string;
}

export interface DbVehicle {
  id: string;
  plateNormalized: string;
  plateDisplay: string;
  make: string;
  model: string;
  color: string;
  verifiedOwnerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbVehicleDriver {
  id: string;
  vehicleId: string;
  userId: string;
  role: 'driver' | 'owner';
  status: 'approved' | 'pending_owner_approval' | 'rejected';
  requestedAt: string;
  approvedAt: string | null;
}

export interface DbTrustedContact {
  id: string;
  vehicleId: string;
  name: string;
  phone: string;
  relationship: string;
  consentGiven: boolean;
  createdAt: string;
}

export interface DbOwnershipVerification {
  id: string;
  vehicleId: string;
  userId: string;
  documentName: string;
  documentType: string;
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedById: string | null;
}

export interface DbReport {
  id: string;
  idempotencyKey?: string;
  plateNormalized: string;
  category: 'vehicle_condition' | 'driver_behaviour' | 'road_violation';
  issueCode: string;
  issueTitle: string;
  customNote?: string;
  photoUrl?: string;
  reporterId: string; // Strictly confidential; never returned in vehicle alert feeds
  status: 'received' | 'needs_review' | 'resolved' | 'disputed' | 'flagged_abuse' | 'dismissed';
  disputeReason?: string;
  abuseReason?: string;
  recipientActionNote?: string;
  createdAt: string;
}

export interface DbDeliveryLog {
  id: string;
  reportId: string;
  channel: 'in_app' | 'sms';
  recipientUserId: string | null;
  status: 'delivered' | 'queued_unclaimed' | 'failed' | 'capped_limit';
  costPence: number;
  createdAt: string;
}

export interface DbAuditLog {
  id: string;
  actorId: string | null;
  actionType: string;
  targetId: string | null;
  targetType: string;
  detailsJson: Record<string, any>;
  createdAt: string;
}

// Initial Seed Data for Demo & Supabase Bootstrapping
const SEED_USERS: DbUser[] = [
  {
    id: 'usr_alex_001',
    phone: '+27 82 555 0123',
    fullName: 'Alex Morgan',
    role: 'user',
    plan: 'paid_owner',
    smsOptIn: true,
    smsMonthlyCapPence: 500,
    smsCurrentSpendPence: 20,
    defaultPlate: 'CK 45 DF GP',
    defaultProvinceCode: 'GP',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr_jordan_002',
    phone: '+27 83 555 0456',
    fullName: 'Jordan Lee',
    role: 'user',
    plan: 'free',
    smsOptIn: false,
    smsMonthlyCapPence: 500,
    smsCurrentSpendPence: 0,
    defaultPlate: 'ND 913-317 ZN',
    defaultProvinceCode: 'KZN',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr_admin_003',
    phone: '+27 84 555 0999',
    fullName: 'Compliance Admin',
    role: 'admin',
    plan: 'paid_owner',
    smsOptIn: false,
    smsMonthlyCapPence: 1000,
    smsCurrentSpendPence: 0,
    defaultPlate: '',
    defaultProvinceCode: 'WC',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_VEHICLES: DbVehicle[] = [
  {
    id: 'veh_ford_001',
    plateNormalized: 'CK45DFGP',
    plateDisplay: 'CK 45 DF GP',
    make: 'Ford',
    model: 'Puma EcoBoost',
    color: 'Solar Silver',
    verifiedOwnerId: 'usr_alex_001',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'veh_leaf_002',
    plateNormalized: 'ND913317ZN',
    plateDisplay: 'ND 913-317 ZN',
    make: 'Nissan',
    model: 'Leaf Electric',
    color: 'Pearl White',
    verifiedOwnerId: null,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'veh_golf_003',
    plateNormalized: 'CA812482WC',
    plateDisplay: 'CA 812-482 WC',
    make: 'Volkswagen',
    model: 'Golf TSI',
    color: 'Deep Blue',
    verifiedOwnerId: null,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_VEHICLE_DRIVERS: DbVehicleDriver[] = [
  {
    id: 'vd_001',
    vehicleId: 'veh_ford_001',
    userId: 'usr_alex_001',
    role: 'owner',
    status: 'approved',
    requestedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'vd_002',
    vehicleId: 'veh_leaf_002',
    userId: 'usr_jordan_002',
    role: 'driver',
    status: 'approved',
    requestedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const SEED_TRUSTED_CONTACTS: DbTrustedContact[] = [
  {
    id: 'tc_001',
    vehicleId: 'veh_ford_001',
    name: 'Sarah Morgan',
    phone: '+27 82 555 0321',
    relationship: 'Spouse / Secondary Driver',
    consentGiven: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

const SEED_OWNERSHIP_VERIFICATIONS: DbOwnershipVerification[] = [
  {
    id: 'verif_001',
    vehicleId: 'veh_leaf_002',
    userId: 'usr_jordan_002',
    documentName: 'V5C_Logbook_Scan_ND913317ZN.pdf',
    documentType: 'v5c_logbook',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
    status: 'pending',
    adminNotes: null,
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    reviewedAt: null,
    reviewedById: null,
  },
];

const SEED_REPORTS: DbReport[] = [
  {
    id: 'rep_001',
    idempotencyKey: 'idemp_seed_001',
    plateNormalized: 'CK45DFGP',
    category: 'vehicle_condition',
    issueCode: 'brake_light_out',
    issueTitle: 'Brake light reported',
    customNote: 'Driver side rear brake light does not illuminate when braking at junctions.',
    photoUrl: '',
    reporterId: 'usr_jordan_002', // Stored strictly for security audit; scrubbed from alerts
    status: 'needs_review',
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 'rep_002',
    idempotencyKey: 'idemp_seed_002',
    plateNormalized: 'CK45DFGP',
    category: 'driver_behaviour',
    issueCode: 'unsafe_lane_change',
    issueTitle: 'Unsafe lane change reported',
    customNote: 'Switched into lane without indicating on the N1 highway interchange.',
    photoUrl: '',
    reporterId: 'usr_admin_003',
    status: 'received',
    createdAt: new Date(Date.now() - 24 * 60000).toISOString(),
  },
  {
    id: 'rep_003',
    idempotencyKey: 'idemp_seed_003',
    plateNormalized: 'ND913317ZN',
    category: 'vehicle_condition',
    issueCode: 'tyre_low',
    issueTitle: 'Low tyre pressure noticed',
    customNote: 'Front left passenger tyre looked noticeably underinflated while parked.',
    photoUrl: '',
    reporterId: 'usr_alex_001',
    status: 'resolved',
    recipientActionNote: 'Checked at local petrol station, re-inflated from 22 PSI to 34 PSI. Thank you!',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const SEED_DELIVERY_LOGS: DbDeliveryLog[] = [
  {
    id: 'del_001',
    reportId: 'rep_001',
    channel: 'in_app',
    recipientUserId: 'usr_alex_001',
    status: 'delivered',
    costPence: 0,
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 'del_002',
    reportId: 'rep_001',
    channel: 'sms',
    recipientUserId: 'usr_alex_001',
    status: 'delivered',
    costPence: 10,
    createdAt: new Date(Date.now() - 8 * 60000 + 2000).toISOString(),
  },
  {
    id: 'del_003',
    reportId: 'rep_002',
    channel: 'in_app',
    recipientUserId: 'usr_alex_001',
    status: 'delivered',
    costPence: 0,
    createdAt: new Date(Date.now() - 24 * 60000).toISOString(),
  },
  {
    id: 'del_004',
    reportId: 'rep_003',
    channel: 'in_app',
    recipientUserId: 'usr_jordan_002',
    status: 'delivered',
    costPence: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const SEED_AUDIT_LOGS: DbAuditLog[] = [
  {
    id: 'aud_001',
    actorId: 'usr_alex_001',
    actionType: 'VEHICLE_OWNERSHIP_REGISTERED',
    targetId: 'veh_ford_001',
    targetType: 'vehicle',
    detailsJson: { plate: 'CK 45 DF GP', method: 'admin_verified' },
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'aud_002',
    actorId: 'usr_jordan_002',
    actionType: 'DRIVER_SELF_REGISTERED',
    targetId: 'veh_leaf_002',
    targetType: 'vehicle',
    detailsJson: { plate: 'ND 913-317 ZN' },
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

class DatabaseService {
  private pool: pg.Pool | null = null;
  private isConnected = false;
  private initPromise: Promise<void> | null = null;
  private connectionError: string | null = null;

  // In-memory fallback structures
  public memory = {
    users: [...SEED_USERS],
    otps: [] as DbOtp[],
    vehicles: [...SEED_VEHICLES],
    vehicleDrivers: [...SEED_VEHICLE_DRIVERS],
    trustedContacts: [...SEED_TRUSTED_CONTACTS],
    ownershipVerifications: [...SEED_OWNERSHIP_VERIFICATIONS],
    reports: [...SEED_REPORTS],
    deliveryLogs: [...SEED_DELIVERY_LOGS],
    auditLogs: [...SEED_AUDIT_LOGS],
  };

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.SUPABASE_DB_URL ||
      process.env.POSTGRES_URL;

    if (!connectionString) {
      if (process.env.NODE_ENV === 'production') {
        const errorMsg =
          'FATAL STARTUP ERROR: DATABASE_URL environment variable is required in production deployment. Refusing to run in-memory fallback in production.';
        this.connectionError = errorMsg;
        console.error(`❌ [Driver Ping DB] ${errorMsg}`);
        throw new Error(errorMsg);
      }
      console.log('ℹ️ [Driver Ping DB] DATABASE_URL is not set.');
      console.log('ℹ️ [Driver Ping DB] Running with in-memory persistence in development.');
      return;
    }

    try {
      console.log('🔄 [Driver Ping DB] Connecting to Supabase PostgreSQL...');
      this.pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 10000,
      });

      // Test connection
      const client = await this.pool.connect();
      const testRes = await client.query('SELECT NOW() as current_time, version()');
      client.release();

      this.isConnected = true;
      this.connectionError = null;
      console.log(`✅ [Driver Ping DB] Connected to Supabase PostgreSQL successfully at ${testRes.rows[0].current_time}`);

      // Run schema migrations and seeds
      await this.bootstrapSchema();
    } catch (err: any) {
      this.isConnected = false;
      this.connectionError = err.message || String(err);
      console.error('❌ [Driver Ping DB] Failed to connect to Supabase PostgreSQL:', this.connectionError);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`FATAL STARTUP ERROR: PostgreSQL connection failed in production: ${this.connectionError}`);
      }
      console.log('ℹ️ [Driver Ping DB] Falling back to safe in-memory store in development.');
    }
  }

  public async waitForInit(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  public isUsingPostgres(): boolean {
    return this.isConnected && this.pool !== null;
  }

  public getStatus() {
    return {
      connectedToPostgres: this.isUsingPostgres(),
      error: this.connectionError,
      hasConnectionString: Boolean(
        process.env.DATABASE_URL ||
        process.env.SUPABASE_DB_URL ||
        process.env.POSTGRES_URL
      ),
      driver: this.isUsingPostgres() ? 'Supabase PostgreSQL' : 'In-Memory Fallback',
    };
  }

  private async bootstrapSchema(): Promise<void> {
    if (!this.pool) return;
    try {
      const schemaPath = path.resolve(__dirname, '../db/schema.sql');
      let schemaSql = '';
      if (fs.existsSync(schemaPath)) {
        schemaSql = fs.readFileSync(schemaPath, 'utf8');
      }

      if (schemaSql) {
        console.log('🔄 [Driver Ping DB] Applying schema.sql to Supabase database...');
        await this.pool.query(schemaSql);
        console.log('✅ [Driver Ping DB] Database tables verified & ready.');
      }

      // Check if users table is populated; if empty, seed demo data
      const checkUsers = await this.pool.query('SELECT COUNT(*) as count FROM users');
      const count = parseInt(checkUsers.rows[0]?.count || '0', 10);
      if (count === 0) {
        console.log('🌱 [Driver Ping DB] Seeding initial demo users and vehicles into Supabase...');
        await this.seedSupabaseData();
        console.log('✅ [Driver Ping DB] Supabase database seeded successfully.');
      }
    } catch (err: any) {
      console.error('⚠️ [Driver Ping DB] Error bootstrapping Supabase schema:', err.message);
    }
  }

  private async seedSupabaseData(): Promise<void> {
    if (!this.pool) return;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Users
      for (const u of SEED_USERS) {
        await client.query(
          `INSERT INTO users (id, phone, full_name, role, plan, sms_opt_in, sms_monthly_cap_pence, sms_current_spend_pence, default_plate, default_province_code, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
          [
            u.id,
            u.phone,
            u.fullName,
            u.role,
            u.plan,
            u.smsOptIn,
            u.smsMonthlyCapPence,
            u.smsCurrentSpendPence,
            u.defaultPlate || '',
            u.defaultProvinceCode || '',
            u.createdAt,
            u.updatedAt,
          ]
        );
      }

      // 2. Vehicles
      for (const v of SEED_VEHICLES) {
        await client.query(
          `INSERT INTO vehicles (id, plate_normalized, plate_display, make, model, color, verified_owner_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [v.id, v.plateNormalized, v.plateDisplay, v.make, v.model, v.color, v.verifiedOwnerId, v.createdAt, v.updatedAt]
        );
      }

      // 3. Drivers
      for (const vd of SEED_VEHICLE_DRIVERS) {
        await client.query(
          `INSERT INTO vehicle_drivers (id, vehicle_id, user_id, role, status, requested_at, approved_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [vd.id, vd.vehicleId, vd.userId, vd.role, vd.status, vd.requestedAt, vd.approvedAt]
        );
      }

      // 4. Trusted contacts
      for (const tc of SEED_TRUSTED_CONTACTS) {
        await client.query(
          `INSERT INTO trusted_contacts (id, vehicle_id, name, phone, relationship, consent_given, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [tc.id, tc.vehicleId, tc.name, tc.phone, tc.relationship, tc.consentGiven, tc.createdAt]
        );
      }

      // 5. Ownership verifications
      for (const ov of SEED_OWNERSHIP_VERIFICATIONS) {
        await client.query(
          `INSERT INTO ownership_verifications (id, vehicle_id, user_id, document_name, document_type, document_url, status, admin_notes, submitted_at, reviewed_at, reviewed_by_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [ov.id, ov.vehicleId, ov.userId, ov.documentName, ov.documentType, ov.documentUrl, ov.status, ov.adminNotes, ov.submittedAt, ov.reviewedAt, ov.reviewedById]
        );
      }

      // 6. Reports
      for (const r of SEED_REPORTS) {
        await client.query(
          `INSERT INTO reports (id, idempotency_key, plate_normalized, category, issue_code, issue_title, custom_note, photo_url, reporter_id, status, recipient_action_note, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
          [r.id, r.idempotencyKey, r.plateNormalized, r.category, r.issueCode, r.issueTitle, r.customNote || '', r.photoUrl || '', r.reporterId, r.status, r.recipientActionNote || null, r.createdAt]
        );
      }

      // 7. Delivery logs
      for (const dl of SEED_DELIVERY_LOGS) {
        await client.query(
          `INSERT INTO delivery_logs (id, report_id, channel, recipient_user_id, status, cost_pence, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [dl.id, dl.reportId, dl.channel, dl.recipientUserId, dl.status, dl.costPence, dl.createdAt]
        );
      }

      // 8. Audit logs
      for (const al of SEED_AUDIT_LOGS) {
        await client.query(
          `INSERT INTO audit_logs (id, actor_id, action_type, target_id, target_type, details_json, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [al.id, al.actorId, al.actionType, al.targetId, al.targetType, JSON.stringify(al.detailsJson), al.createdAt]
        );
      }

      await client.query('COMMIT');
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // USERS & AUTHENTICATION
  // ==========================================================================

  public async getUserById(id: string): Promise<DbUser | null> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, phone, full_name, role, plan, sms_opt_in, sms_monthly_cap_pence, sms_current_spend_pence, default_plate, default_province_code, created_at, updated_at
         FROM users WHERE id = $1`,
        [id]
      );
      if (res.rows.length === 0) return null;
      return this.mapUserRow(res.rows[0]);
    }
    return this.memory.users.find((u) => u.id === id) || null;
  }

  public async getUserByPhone(phone: string): Promise<DbUser | null> {
    await this.waitForInit();
    const cleanPhone = phone.trim();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, phone, full_name, role, plan, sms_opt_in, sms_monthly_cap_pence, sms_current_spend_pence, default_plate, default_province_code, created_at, updated_at
         FROM users WHERE phone = $1`,
        [cleanPhone]
      );
      if (res.rows.length === 0) return null;
      return this.mapUserRow(res.rows[0]);
    }
    return this.memory.users.find((u) => u.phone === cleanPhone) || null;
  }

  public async createUser(data: {
    id?: string;
    phone: string;
    fullName?: string;
    role?: 'user' | 'admin';
    plan?: 'free' | 'paid_owner';
    smsOptIn?: boolean;
    smsMonthlyCapPence?: number;
  }): Promise<DbUser> {
    await this.waitForInit();
    const id = data.id || `usr_${Date.now()}`;
    const cleanPhone = data.phone.trim();
    const fullName = data.fullName?.trim() || `Driver ${cleanPhone.slice(-4)}`;
    const role = data.role || 'user';
    const plan = data.plan || 'free';
    const smsOptIn = data.smsOptIn || false;
    const smsMonthlyCapPence = data.smsMonthlyCapPence || 500;
    const now = new Date().toISOString();

    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `INSERT INTO users (id, phone, full_name, role, plan, sms_opt_in, sms_monthly_cap_pence, sms_current_spend_pence, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9)
         RETURNING id, phone, full_name, role, plan, sms_opt_in, sms_monthly_cap_pence, sms_current_spend_pence, default_plate, default_province_code, created_at, updated_at`,
        [id, cleanPhone, fullName, role, plan, smsOptIn, smsMonthlyCapPence, now, now]
      );
      return this.mapUserRow(res.rows[0]);
    }

    const newUser: DbUser = {
      id,
      phone: cleanPhone,
      fullName,
      role,
      plan,
      smsOptIn,
      smsMonthlyCapPence,
      smsCurrentSpendPence: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.memory.users.push(newUser);
    return newUser;
  }

  public async updateUserPreferences(
    userId: string,
    prefs: {
      smsOptIn?: boolean;
      smsMonthlyCapPence?: number;
      smsCurrentSpendPence?: number;
      plan?: 'free' | 'paid_owner';
      fullName?: string;
      defaultPlate?: string;
      defaultProvinceCode?: string;
    }
  ): Promise<DbUser | null> {
    await this.waitForInit();
    const now = new Date().toISOString();

    if (this.isUsingPostgres()) {
      const user = await this.getUserById(userId);
      if (!user) return null;

      const newSmsOptIn = prefs.smsOptIn !== undefined ? prefs.smsOptIn : user.smsOptIn;
      const newCap = prefs.smsMonthlyCapPence !== undefined ? prefs.smsMonthlyCapPence : user.smsMonthlyCapPence;
      const newSpend = prefs.smsCurrentSpendPence !== undefined ? prefs.smsCurrentSpendPence : user.smsCurrentSpendPence;
      const newPlan = prefs.plan !== undefined ? prefs.plan : user.plan;
      const newName = prefs.fullName !== undefined ? prefs.fullName.trim() : user.fullName;
      const newPlate = prefs.defaultPlate !== undefined ? prefs.defaultPlate.trim().toUpperCase() : user.defaultPlate;
      const newProv = prefs.defaultProvinceCode !== undefined ? prefs.defaultProvinceCode.trim().toUpperCase() : user.defaultProvinceCode;

      const res = await this.pool!.query(
        `UPDATE users
         SET sms_opt_in = $1, sms_monthly_cap_pence = $2, sms_current_spend_pence = $3, plan = $4, full_name = $5, default_plate = $6, default_province_code = $7, updated_at = $8
         WHERE id = $9
         RETURNING id, phone, full_name, role, plan, sms_opt_in, sms_monthly_cap_pence, sms_current_spend_pence, default_plate, default_province_code, created_at, updated_at`,
        [newSmsOptIn, newCap, newSpend, newPlan, newName, newPlate || '', newProv || '', now, userId]
      );
      return this.mapUserRow(res.rows[0]);
    }

    const user = this.memory.users.find((u) => u.id === userId);
    if (!user) return null;
    if (prefs.smsOptIn !== undefined) user.smsOptIn = prefs.smsOptIn;
    if (prefs.smsMonthlyCapPence !== undefined) user.smsMonthlyCapPence = prefs.smsMonthlyCapPence;
    if (prefs.smsCurrentSpendPence !== undefined) user.smsCurrentSpendPence = prefs.smsCurrentSpendPence;
    if (prefs.plan !== undefined) user.plan = prefs.plan;
    if (prefs.fullName !== undefined) user.fullName = prefs.fullName.trim();
    if (prefs.defaultPlate !== undefined) user.defaultPlate = prefs.defaultPlate.trim().toUpperCase();
    if (prefs.defaultProvinceCode !== undefined) user.defaultProvinceCode = prefs.defaultProvinceCode.trim().toUpperCase();
    user.updatedAt = now;
    return user;
  }

  public async getDemoAccounts(): Promise<DbUser[]> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, phone, full_name, role, plan, sms_opt_in, sms_monthly_cap_pence, sms_current_spend_pence, default_plate, default_province_code, created_at, updated_at
         FROM users
         ORDER BY (CASE role WHEN 'admin' THEN 2 ELSE 1 END), id ASC
         LIMIT 10`
      );
      return res.rows.map(this.mapUserRow);
    }
    return this.memory.users;
  }

  // ==========================================================================
  // OTPS
  // ==========================================================================

  public async createOtp(phone: string, code: string, expiresAt: string): Promise<DbOtp> {
    await this.waitForInit();
    const id = `otp_${Date.now()}`;
    const cleanPhone = phone.trim();
    const now = new Date().toISOString();

    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `INSERT INTO otps (id, phone, code, expires_at, verified, created_at)
         VALUES ($1, $2, $3, $4, false, $5)
         RETURNING id, phone, code, expires_at, verified, created_at`,
        [id, cleanPhone, code, expiresAt, now]
      );
      return {
        id: res.rows[0].id,
        phone: res.rows[0].phone,
        code: res.rows[0].code,
        expiresAt: res.rows[0].expires_at,
        verified: res.rows[0].verified,
        createdAt: res.rows[0].created_at,
      };
    }

    const otp: DbOtp = { id, phone: cleanPhone, code, expiresAt, verified: false, createdAt: now };
    this.memory.otps.push(otp);
    return otp;
  }

  public async getLatestUnverifiedOtp(phone: string): Promise<DbOtp | null> {
    await this.waitForInit();
    const cleanPhone = phone.trim();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, phone, code, expires_at, verified, created_at
         FROM otps
         WHERE phone = $1 AND verified = false
         ORDER BY created_at DESC
         LIMIT 1`,
        [cleanPhone]
      );
      if (res.rows.length === 0) return null;
      return {
        id: res.rows[0].id,
        phone: res.rows[0].phone,
        code: res.rows[0].code,
        expiresAt: res.rows[0].expires_at,
        verified: res.rows[0].verified,
        createdAt: res.rows[0].created_at,
      };
    }

    const matching = this.memory.otps
      .filter((o) => o.phone === cleanPhone && !o.verified)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return matching[0] || null;
  }

  public async markOtpVerified(otpId: string): Promise<void> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      await this.pool!.query(`UPDATE otps SET verified = true WHERE id = $1`, [otpId]);
      return;
    }
    const record = this.memory.otps.find((o) => o.id === otpId);
    if (record) record.verified = true;
  }

  // ==========================================================================
  // VEHICLES & DRIVERS
  // ==========================================================================

  public async getVehiclesForUser(userId: string): Promise<any[]> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      // Find all vehicles where user is a driver or verified owner
      const res = await this.pool!.query(
        `SELECT v.id, v.plate_normalized, v.plate_display, v.make, v.model, v.color, v.verified_owner_id, v.created_at, v.updated_at,
                vd.role as driver_role, vd.status as driver_status, vd.requested_at, vd.approved_at
         FROM vehicles v
         JOIN vehicle_drivers vd ON vd.vehicle_id = v.id
         WHERE vd.user_id = $1
         ORDER BY v.created_at DESC`,
        [userId]
      );

      const vehicles = [];
      for (const row of res.rows) {
        const vehicleId = row.id;
        const isOwner = row.verified_owner_id === userId;

        // Fetch all drivers for this vehicle
        const driversRes = await this.pool!.query(
          `SELECT vd.id, vd.user_id, vd.role, vd.status, vd.requested_at, vd.approved_at,
                  u.full_name, u.phone
           FROM vehicle_drivers vd
           LEFT JOIN users u ON u.id = vd.user_id
           WHERE vd.vehicle_id = $1`,
          [vehicleId]
        );

        const allDrivers = driversRes.rows.map((d) => ({
          id: d.id,
          userId: d.user_id,
          fullName: d.full_name || 'Driver',
          phone: d.phone ? d.phone.slice(0, 7) + '***' : '',
          role: d.role,
          status: d.status,
          requestedAt: d.requested_at,
          approvedAt: d.approved_at,
        }));

        // Trusted contacts
        const tcRes = await this.pool!.query(
          `SELECT id, vehicle_id, name, phone, relationship, consent_given, created_at
           FROM trusted_contacts WHERE vehicle_id = $1`,
          [vehicleId]
        );

        // Pending verification
        const ovRes = await this.pool!.query(
          `SELECT id FROM ownership_verifications
           WHERE vehicle_id = $1 AND user_id = $2 AND status = 'pending'`,
          [vehicleId, userId]
        );

        vehicles.push({
          id: row.id,
          plateNormalized: row.plate_normalized,
          plateDisplay: row.plate_display,
          make: row.make,
          model: row.model,
          color: row.color,
          verifiedOwnerId: row.verified_owner_id,
          userRole: isOwner ? 'owner' : row.driver_role || 'driver',
          driverStatus: row.driver_status || 'approved',
          isVerifiedOwner: isOwner,
          allDrivers,
          trustedContacts: tcRes.rows.map((tc) => ({
            id: tc.id,
            vehicleId: tc.vehicle_id,
            name: tc.name,
            phone: tc.phone,
            relationship: tc.relationship,
            consentGiven: tc.consent_given,
            createdAt: tc.created_at,
          })),
          pendingOwnershipVerification: ovRes.rows.length > 0,
          createdAt: row.created_at,
        });
      }
      return vehicles;
    }

    // In-memory fallback
    const userDrivers = this.memory.vehicleDrivers.filter((vd) => vd.userId === userId);
    const userVehicleIds = new Set(userDrivers.map((vd) => vd.vehicleId));

    return this.memory.vehicles
      .filter((v) => userVehicleIds.has(v.id))
      .map((v) => {
        const driverRecord = userDrivers.find((vd) => vd.vehicleId === v.id);
        const isOwner = v.verifiedOwnerId === userId;
        const allDrivers = this.memory.vehicleDrivers
          .filter((vd) => vd.vehicleId === v.id)
          .map((vd) => {
            const u = this.memory.users.find((u2) => u2.id === vd.userId);
            return {
              id: vd.id,
              userId: vd.userId,
              fullName: u?.fullName || 'Driver',
              phone: u ? u.phone.slice(0, 7) + '***' : '',
              role: vd.role,
              status: vd.status,
              requestedAt: vd.requestedAt,
              approvedAt: vd.approvedAt,
            };
          });

        const trusted = this.memory.trustedContacts.filter((tc) => tc.vehicleId === v.id);
        const pendingVerification = this.memory.ownershipVerifications.find(
          (ov) => ov.vehicleId === v.id && ov.userId === userId && ov.status === 'pending'
        );

        return {
          ...v,
          userRole: isOwner ? 'owner' : driverRecord?.role || 'driver',
          driverStatus: driverRecord?.status || 'approved',
          isVerifiedOwner: isOwner,
          allDrivers,
          trustedContacts: trusted,
          pendingOwnershipVerification: !!pendingVerification,
        };
      });
  }

  public async getVehicleByPlate(plateNormalized: string): Promise<DbVehicle | null> {
    await this.waitForInit();
    const norm = plateNormalized.trim().toUpperCase();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, plate_normalized, plate_display, make, model, color, verified_owner_id, created_at, updated_at
         FROM vehicles WHERE plate_normalized = $1`,
        [norm]
      );
      if (res.rows.length === 0) return null;
      return this.mapVehicleRow(res.rows[0]);
    }
    return this.memory.vehicles.find((v) => v.plateNormalized === norm) || null;
  }

  public async getVehicleById(id: string): Promise<DbVehicle | null> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, plate_normalized, plate_display, make, model, color, verified_owner_id, created_at, updated_at
         FROM vehicles WHERE id = $1`,
        [id]
      );
      if (res.rows.length === 0) return null;
      return this.mapVehicleRow(res.rows[0]);
    }
    return this.memory.vehicles.find((v) => v.id === id) || null;
  }

  public async createVehicle(data: {
    plateNormalized: string;
    plateDisplay: string;
    make?: string;
    model?: string;
    color?: string;
  }): Promise<DbVehicle> {
    await this.waitForInit();
    const id = `veh_${Date.now()}`;
    const now = new Date().toISOString();

    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `INSERT INTO vehicles (id, plate_normalized, plate_display, make, model, color, verified_owner_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, null, $7, $8)
         RETURNING id, plate_normalized, plate_display, make, model, color, verified_owner_id, created_at, updated_at`,
        [id, data.plateNormalized, data.plateDisplay, data.make || 'Vehicle', data.model || '', data.color || 'Standard', now, now]
      );
      return this.mapVehicleRow(res.rows[0]);
    }

    const veh: DbVehicle = {
      id,
      plateNormalized: data.plateNormalized,
      plateDisplay: data.plateDisplay,
      make: data.make || 'Vehicle',
      model: data.model || '',
      color: data.color || 'Standard',
      verifiedOwnerId: null,
      createdAt: now,
      updatedAt: now,
    };
    this.memory.vehicles.push(veh);
    return veh;
  }

  public async getVehicleDriver(vehicleId: string, userId: string): Promise<DbVehicleDriver | null> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, vehicle_id, user_id, role, status, requested_at, approved_at
         FROM vehicle_drivers WHERE vehicle_id = $1 AND user_id = $2`,
        [vehicleId, userId]
      );
      if (res.rows.length === 0) return null;
      return {
        id: res.rows[0].id,
        vehicleId: res.rows[0].vehicle_id,
        userId: res.rows[0].user_id,
        role: res.rows[0].role,
        status: res.rows[0].status,
        requestedAt: res.rows[0].requested_at,
        approvedAt: res.rows[0].approved_at,
      };
    }
    return (
      this.memory.vehicleDrivers.find(
        (vd) => vd.vehicleId === vehicleId && vd.userId === userId
      ) || null
    );
  }

  public async addDriverToVehicle(data: {
    vehicleId: string;
    userId: string;
    role: 'driver' | 'owner';
    status: 'approved' | 'pending_owner_approval' | 'rejected';
  }): Promise<DbVehicleDriver> {
    await this.waitForInit();
    const id = `vd_${Date.now()}`;
    const now = new Date().toISOString();
    const approvedAt = data.status === 'approved' ? now : null;

    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `INSERT INTO vehicle_drivers (id, vehicle_id, user_id, role, status, requested_at, approved_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, vehicle_id, user_id, role, status, requested_at, approved_at`,
        [id, data.vehicleId, data.userId, data.role, data.status, now, approvedAt]
      );
      return {
        id: res.rows[0].id,
        vehicleId: res.rows[0].vehicle_id,
        userId: res.rows[0].user_id,
        role: res.rows[0].role,
        status: res.rows[0].status,
        requestedAt: res.rows[0].requested_at,
        approvedAt: res.rows[0].approved_at,
      };
    }

    const rec: DbVehicleDriver = {
      id,
      vehicleId: data.vehicleId,
      userId: data.userId,
      role: data.role,
      status: data.status,
      requestedAt: now,
      approvedAt,
    };
    this.memory.vehicleDrivers.push(rec);
    return rec;
  }

  public async getApprovedDriversForVehicle(vehicleId: string): Promise<DbVehicleDriver[]> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, vehicle_id, user_id, role, status, requested_at, approved_at
         FROM vehicle_drivers WHERE vehicle_id = $1 AND status = 'approved'`,
        [vehicleId]
      );
      return res.rows.map((r) => ({
        id: r.id,
        vehicleId: r.vehicle_id,
        userId: r.user_id,
        role: r.role,
        status: r.status,
        requestedAt: r.requested_at,
        approvedAt: r.approved_at,
      }));
    }
    return this.memory.vehicleDrivers.filter(
      (vd) => vd.vehicleId === vehicleId && vd.status === 'approved'
    );
  }

  public async updateDriverStatus(
    driverRecordId: string,
    action: 'approve' | 'reject' | 'remove'
  ): Promise<boolean> {
    await this.waitForInit();
    const now = new Date().toISOString();

    if (this.isUsingPostgres()) {
      if (action === 'approve') {
        const res = await this.pool!.query(
          `UPDATE vehicle_drivers SET status = 'approved', approved_at = $1 WHERE id = $2`,
          [now, driverRecordId]
        );
        return (res.rowCount ?? 0) > 0;
      }
      const res = await this.pool!.query(`DELETE FROM vehicle_drivers WHERE id = $1`, [driverRecordId]);
      return (res.rowCount ?? 0) > 0;
    }

    const driverRecord = this.memory.vehicleDrivers.find((vd) => vd.id === driverRecordId);
    if (!driverRecord) return false;

    if (action === 'approve') {
      driverRecord.status = 'approved';
      driverRecord.approvedAt = now;
      return true;
    }
    this.memory.vehicleDrivers = this.memory.vehicleDrivers.filter((vd) => vd.id !== driverRecordId);
    return true;
  }

  // ==========================================================================
  // TRUSTED CONTACTS
  // ==========================================================================

  public async createTrustedContact(data: {
    vehicleId: string;
    name: string;
    phone: string;
    relationship: string;
    consentGiven: boolean;
  }): Promise<DbTrustedContact> {
    await this.waitForInit();
    const id = `tc_${Date.now()}`;
    const now = new Date().toISOString();

    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `INSERT INTO trusted_contacts (id, vehicle_id, name, phone, relationship, consent_given, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, vehicle_id, name, phone, relationship, consent_given, created_at`,
        [id, data.vehicleId, data.name.trim(), data.phone.trim(), data.relationship.trim(), data.consentGiven, now]
      );
      return {
        id: res.rows[0].id,
        vehicleId: res.rows[0].vehicle_id,
        name: res.rows[0].name,
        phone: res.rows[0].phone,
        relationship: res.rows[0].relationship,
        consentGiven: res.rows[0].consent_given,
        createdAt: res.rows[0].created_at,
      };
    }

    const tc: DbTrustedContact = {
      id,
      vehicleId: data.vehicleId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      relationship: data.relationship.trim(),
      consentGiven: data.consentGiven,
      createdAt: now,
    };
    this.memory.trustedContacts.push(tc);
    return tc;
  }

  public async deleteTrustedContact(id: string, vehicleId: string): Promise<boolean> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `DELETE FROM trusted_contacts WHERE id = $1 AND vehicle_id = $2`,
        [id, vehicleId]
      );
      return (res.rowCount ?? 0) > 0;
    }
    const lenBefore = this.memory.trustedContacts.length;
    this.memory.trustedContacts = this.memory.trustedContacts.filter(
      (tc) => !(tc.id === id && tc.vehicleId === vehicleId)
    );
    return this.memory.trustedContacts.length < lenBefore;
  }

  // ==========================================================================
  // OWNERSHIP VERIFICATION (RULE 4)
  // ==========================================================================

  public async createOwnershipVerification(data: {
    vehicleId: string;
    userId: string;
    documentName: string;
    documentType: string;
    documentUrl: string;
  }): Promise<DbOwnershipVerification> {
    await this.waitForInit();
    const id = `verif_${Date.now()}`;
    const now = new Date().toISOString();

    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `INSERT INTO ownership_verifications (id, vehicle_id, user_id, document_name, document_type, document_url, status, admin_notes, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', null, $7)
         RETURNING id, vehicle_id, user_id, document_name, document_type, document_url, status, admin_notes, submitted_at, reviewed_at, reviewed_by_id`,
        [id, data.vehicleId, data.userId, data.documentName.trim(), data.documentType, data.documentUrl, now]
      );
      return this.mapVerificationRow(res.rows[0]);
    }

    const ov: DbOwnershipVerification = {
      id,
      vehicleId: data.vehicleId,
      userId: data.userId,
      documentName: data.documentName.trim(),
      documentType: data.documentType,
      documentUrl: data.documentUrl,
      status: 'pending',
      adminNotes: null,
      submittedAt: now,
      reviewedAt: null,
      reviewedById: null,
    };
    this.memory.ownershipVerifications.push(ov);
    return ov;
  }

  public async getPendingVerification(vehicleId: string, userId: string): Promise<DbOwnershipVerification | null> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, vehicle_id, user_id, document_name, document_type, document_url, status, admin_notes, submitted_at, reviewed_at, reviewed_by_id
         FROM ownership_verifications WHERE vehicle_id = $1 AND user_id = $2 AND status = 'pending'`,
        [vehicleId, userId]
      );
      if (res.rows.length === 0) return null;
      return this.mapVerificationRow(res.rows[0]);
    }
    return (
      this.memory.ownershipVerifications.find(
        (ov) => ov.vehicleId === vehicleId && ov.userId === userId && ov.status === 'pending'
      ) || null
    );
  }

  public async getOwnershipVerificationsWithDetails(): Promise<any[]> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT ov.id, ov.vehicle_id, ov.user_id, ov.document_name, ov.document_type, ov.document_url, ov.status, ov.admin_notes, ov.submitted_at, ov.reviewed_at, ov.reviewed_by_id,
                u.phone as user_phone, u.full_name as user_name,
                v.plate_display, v.make, v.model, v.color
         FROM ownership_verifications ov
         LEFT JOIN users u ON u.id = ov.user_id
         LEFT JOIN vehicles v ON v.id = ov.vehicle_id
         ORDER BY ov.submitted_at DESC`
      );
      return res.rows.map((r) => ({
        id: r.id,
        vehicleId: r.vehicle_id,
        userId: r.user_id,
        documentName: r.document_name,
        documentType: r.document_type,
        documentUrl: r.document_url,
        status: r.status,
        adminNotes: r.admin_notes,
        submittedAt: r.submitted_at,
        reviewedAt: r.reviewed_at,
        reviewedById: r.reviewed_by_id,
        userPhone: r.user_phone,
        userName: r.user_name,
        plateDisplay: r.plate_display,
        vehicleDetails: r.make ? `${r.make} ${r.model} (${r.color})` : '',
      }));
    }

    return this.memory.ownershipVerifications.map((ov) => {
      const user = this.memory.users.find((u) => u.id === ov.userId);
      const vehicle = this.memory.vehicles.find((v) => v.id === ov.vehicleId);
      return {
        ...ov,
        userPhone: user?.phone,
        userName: user?.fullName,
        plateDisplay: vehicle?.plateDisplay,
        vehicleDetails: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.color})` : '',
      };
    });
  }

  public async reviewOwnershipVerification(
    verificationId: string,
    adminId: string,
    decision: 'approved' | 'rejected',
    notes?: string
  ): Promise<boolean> {
    await this.waitForInit();
    const now = new Date().toISOString();

    if (this.isUsingPostgres()) {
      const client = await this.pool!.connect();
      try {
        await client.query('BEGIN');
        const verifRes = await client.query(
          `SELECT vehicle_id, user_id FROM ownership_verifications WHERE id = $1`,
          [verificationId]
        );
        if (verifRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return false;
        }
        const { vehicle_id, user_id } = verifRes.rows[0];

        await client.query(
          `UPDATE ownership_verifications
           SET status = $1, admin_notes = $2, reviewed_at = $3, reviewed_by_id = $4
           WHERE id = $5`,
          [decision, notes || null, now, adminId, verificationId]
        );

        if (decision === 'approved') {
          // Set vehicle verified_owner_id
          await client.query(
            `UPDATE vehicles SET verified_owner_id = $1, updated_at = $2 WHERE id = $3`,
            [user_id, now, vehicle_id]
          );
          // Upgrade or insert driver record to owner
          await client.query(
            `INSERT INTO vehicle_drivers (id, vehicle_id, user_id, role, status, requested_at, approved_at)
             VALUES ($1, $2, $3, 'owner', 'approved', $4, $4)
             ON CONFLICT (vehicle_id, user_id)
             DO UPDATE SET role = 'owner', status = 'approved', approved_at = $4`,
            [`vd_${Date.now()}`, vehicle_id, user_id, now]
          );
        }

        await client.query('COMMIT');
        return true;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    const verif = this.memory.ownershipVerifications.find((v) => v.id === verificationId);
    if (!verif) return false;
    verif.status = decision;
    verif.adminNotes = notes || null;
    verif.reviewedAt = now;
    verif.reviewedById = adminId;

    if (decision === 'approved') {
      const vehicle = this.memory.vehicles.find((v) => v.id === verif.vehicleId);
      if (vehicle) {
        vehicle.verifiedOwnerId = verif.userId;
        const driverRec = this.memory.vehicleDrivers.find(
          (vd) => vd.vehicleId === vehicle.id && vd.userId === verif.userId
        );
        if (driverRec) {
          driverRec.role = 'owner';
          driverRec.status = 'approved';
        }
      }
    }
    return true;
  }

  // ==========================================================================
  // REPORTS & PRIVACY PROTECTION
  // ==========================================================================

  public async getRecentReportsByUser(userId: string, sinceIso: string): Promise<DbReport[]> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, idempotency_key, plate_normalized, category, issue_code, issue_title, custom_note, photo_url, reporter_id, status, created_at
         FROM reports WHERE reporter_id = $1 AND created_at > $2`,
        [userId, sinceIso]
      );
      return res.rows.map(this.mapReportRow);
    }
    return this.memory.reports.filter(
      (r) => r.reporterId === userId && new Date(r.createdAt) > new Date(sinceIso)
    );
  }

  public async getRecentDuplicateReport(
    plateNormalized: string,
    issueCode: string,
    sinceIso: string
  ): Promise<DbReport | null> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, idempotency_key, plate_normalized, category, issue_code, issue_title, custom_note, photo_url, reporter_id, status, created_at
         FROM reports WHERE plate_normalized = $1 AND issue_code = $2 AND created_at > $3
         LIMIT 1`,
        [plateNormalized, issueCode, sinceIso]
      );
      if (res.rows.length === 0) return null;
      return this.mapReportRow(res.rows[0]);
    }
    return (
      this.memory.reports.find(
        (r) =>
          r.plateNormalized === plateNormalized &&
          r.issueCode === issueCode &&
          new Date(r.createdAt) > new Date(sinceIso)
      ) || null
    );
  }

  public async getReportByIdempotencyKey(key: string): Promise<DbReport | null> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, idempotency_key, plate_normalized, category, issue_code, issue_title, custom_note, photo_url, reporter_id, status, created_at
         FROM reports WHERE idempotency_key = $1`,
        [key]
      );
      if (res.rows.length === 0) return null;
      return this.mapReportRow(res.rows[0]);
    }
    return this.memory.reports.find((r) => r.idempotencyKey === key) || null;
  }

  public async getReportById(id: string): Promise<DbReport | null> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, idempotency_key, plate_normalized, category, issue_code, issue_title, custom_note, photo_url, reporter_id, status, dispute_reason, abuse_reason, recipient_action_note, created_at
         FROM reports WHERE id = $1`,
        [id]
      );
      if (res.rows.length === 0) return null;
      return this.mapReportRow(res.rows[0]);
    }
    return this.memory.reports.find((r) => r.id === id) || null;
  }

  public async createReport(data: {
    plateNormalized: string;
    category: 'vehicle_condition' | 'driver_behaviour' | 'road_violation';
    issueCode: string;
    issueTitle: string;
    customNote?: string;
    photoUrl?: string;
    reporterId: string;
    idempotencyKey?: string;
  }): Promise<DbReport> {
    await this.waitForInit();
    const id = `rep_${Date.now()}`;
    const now = new Date().toISOString();
    const idemp = data.idempotencyKey || `auto_${Date.now()}`;

    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `INSERT INTO reports (id, idempotency_key, plate_normalized, category, issue_code, issue_title, custom_note, photo_url, reporter_id, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'received', $10)
         RETURNING id, idempotency_key, plate_normalized, category, issue_code, issue_title, custom_note, photo_url, reporter_id, status, created_at`,
        [id, idemp, data.plateNormalized, data.category, data.issueCode, data.issueTitle.trim(), data.customNote?.trim() || '', data.photoUrl || '', data.reporterId, now]
      );
      return this.mapReportRow(res.rows[0]);
    }

    const report: DbReport = {
      id,
      idempotencyKey: idemp,
      plateNormalized: data.plateNormalized,
      category: data.category,
      issueCode: data.issueCode,
      issueTitle: data.issueTitle.trim(),
      customNote: data.customNote?.trim() || '',
      photoUrl: data.photoUrl || '',
      reporterId: data.reporterId,
      status: 'received',
      createdAt: now,
    };
    this.memory.reports.unshift(report);
    return report;
  }

  /**
   * CRITICAL PRIVACY RULE:
   * Returns sanitized alert items for vehicles the user is approved to drive.
   * STRICTLY SCRUBS reporter_id, reporter phone, or any reporter identity!
   */
  public async getSanitizedAlertsForUser(userId: string): Promise<any[]> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      // Find all vehicles where the user is an approved driver or owner
      const res = await this.pool!.query(
        `SELECT
            r.id,
            r.plate_normalized,
            r.category,
            r.issue_code,
            r.issue_title,
            r.custom_note,
            r.photo_url,
            r.status,
            r.recipient_action_note,
            r.dispute_reason,
            r.abuse_reason,
            r.created_at,
            v.plate_display,
            v.make,
            v.model,
            EXISTS(
              SELECT 1 FROM delivery_logs dl 
              WHERE dl.report_id = r.id AND dl.recipient_user_id = $1 AND dl.status = 'delivered'
            ) as is_recorded_delivered,
            (
              SELECT MIN(dl.created_at) FROM delivery_logs dl 
              WHERE dl.report_id = r.id AND dl.recipient_user_id = $1 AND dl.status = 'delivered'
            ) as delivered_at
         FROM reports r
         JOIN vehicles v ON v.plate_normalized = r.plate_normalized
         WHERE EXISTS (
           SELECT 1 FROM vehicle_drivers vd 
           WHERE vd.vehicle_id = v.id AND vd.user_id = $1 AND vd.status = 'approved'
         )
         ORDER BY r.created_at DESC`,
        [userId]
      );

      // NOTICE: reporter_id is explicitly NOT included in the projection
      return res.rows.map((r) => ({
        id: r.id,
        plateDisplay: r.plate_display,
        vehicleMakeModel: `${r.make} ${r.model}`,
        category: r.category,
        issueCode: r.issue_code,
        issueTitle: r.issue_title,
        customNote: r.custom_note || null,
        photoUrl: r.photo_url || null,
        status: r.status,
        recipientActionNote: r.recipient_action_note || null,
        disputeReason: r.dispute_reason || null,
        abuseReason: r.abuse_reason || null,
        createdAt: r.created_at,
        isRecordedDelivered: Boolean(r.is_recorded_delivered),
        deliveredAt: r.delivered_at || r.created_at,
        neutralNotice: 'A road user reported a possible observation. Please check when safe.',
        privacyNotice: 'Reporter identity is hidden from you. Restricted security logs are retained to protect against abuse.',
      }));
    }

    // In-memory fallback
    const userDriverRecords = this.memory.vehicleDrivers.filter(
      (vd) => vd.userId === userId && vd.status === 'approved'
    );
    const vehicleIds = userDriverRecords.map((vd) => vd.vehicleId);
    const userVehicles = this.memory.vehicles.filter((v) => vehicleIds.includes(v.id));
    const userPlates = new Set(userVehicles.map((v) => v.plateNormalized));

    const matchedReports = this.memory.reports.filter((r) => userPlates.has(r.plateNormalized));

    return matchedReports.map((r) => {
      const veh = userVehicles.find((v) => v.plateNormalized === r.plateNormalized);
      const delLogs = this.memory.deliveryLogs.filter((dl) => dl.reportId === r.id);
      const userDel = delLogs.find((dl) => dl.recipientUserId === userId && dl.status === 'delivered');

      return {
        id: r.id,
        plateDisplay: veh ? veh.plateDisplay : r.plateNormalized,
        vehicleMakeModel: veh ? `${veh.make} ${veh.model}` : 'Vehicle',
        category: r.category,
        issueCode: r.issueCode,
        issueTitle: r.issueTitle,
        customNote: r.customNote || null,
        photoUrl: r.photoUrl || null,
        status: r.status,
        recipientActionNote: r.recipientActionNote || null,
        disputeReason: r.disputeReason || null,
        abuseReason: r.abuseReason || null,
        createdAt: r.createdAt,
        isRecordedDelivered: !!userDel,
        deliveredAt: userDel?.createdAt || r.createdAt,
        neutralNotice: 'A road user reported a possible observation. Please check when safe.',
        privacyNotice: 'Reporter identity is hidden from you. Restricted security logs are retained to protect against abuse.',
      };
    });
  }

  public async updateReportStatus(
    id: string,
    status: 'received' | 'needs_review' | 'resolved' | 'disputed' | 'flagged_abuse' | 'dismissed',
    notes?: { recipientActionNote?: string; disputeReason?: string; abuseReason?: string }
  ): Promise<boolean> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `UPDATE reports
         SET status = $1,
             recipient_action_note = COALESCE($2, recipient_action_note),
             dispute_reason = COALESCE($3, dispute_reason),
             abuse_reason = COALESCE($4, abuse_reason)
         WHERE id = $5`,
        [status, notes?.recipientActionNote || null, notes?.disputeReason || null, notes?.abuseReason || null, id]
      );
      return (res.rowCount ?? 0) > 0;
    }

    const report = this.memory.reports.find((r) => r.id === id);
    if (!report) return false;
    report.status = status;
    if (notes?.recipientActionNote !== undefined) report.recipientActionNote = notes.recipientActionNote;
    if (notes?.disputeReason !== undefined) report.disputeReason = notes.disputeReason;
    if (notes?.abuseReason !== undefined) report.abuseReason = notes.abuseReason;
    return true;
  }

  // ==========================================================================
  // DISPUTES & ABUSE (ADMIN ACCESS)
  // ==========================================================================

  public async getFlaggedReportsForAdmin(): Promise<any[]> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT r.id, r.plate_normalized, r.category, r.issue_code, r.issue_title, r.custom_note, r.photo_url, r.status, r.dispute_reason, r.abuse_reason, r.created_at,
                v.plate_display,
                u.phone as reporter_phone
         FROM reports r
         LEFT JOIN vehicles v ON v.plate_normalized = r.plate_normalized
         LEFT JOIN users u ON u.id = r.reporter_id
         WHERE r.status IN ('disputed', 'flagged_abuse')
         ORDER BY r.created_at DESC`
      );
      return res.rows.map((r) => ({
        id: r.id,
        plateNormalized: r.plate_normalized,
        category: r.category,
        issueCode: r.issue_code,
        issueTitle: r.issue_title,
        customNote: r.custom_note,
        photoUrl: r.photo_url,
        status: r.status,
        disputeReason: r.dispute_reason,
        abuseReason: r.abuse_reason,
        createdAt: r.created_at,
        plateDisplay: r.plate_display || r.plate_normalized,
        reporterPhoneMasked: r.reporter_phone ? r.reporter_phone.slice(0, 7) + '***' : 'Unknown',
      }));
    }

    const flagged = this.memory.reports.filter(
      (r) => r.status === 'disputed' || r.status === 'flagged_abuse'
    );
    return flagged.map((r) => {
      const vehicle = this.memory.vehicles.find((v) => v.plateNormalized === r.plateNormalized);
      const reporter = this.memory.users.find((u) => u.id === r.reporterId);
      return {
        ...r,
        plateDisplay: vehicle?.plateDisplay || r.plateNormalized,
        reporterPhoneMasked: reporter ? reporter.phone.slice(0, 7) + '***' : 'Unknown',
      };
    });
  }

  // ==========================================================================
  // DELIVERY & AUDIT LOGS
  // ==========================================================================

  public async createDeliveryLog(data: {
    reportId: string;
    channel: 'in_app' | 'sms';
    recipientUserId: string | null;
    status: 'delivered' | 'queued_unclaimed' | 'failed' | 'capped_limit';
    costPence: number;
  }): Promise<DbDeliveryLog> {
    await this.waitForInit();
    const id = `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `INSERT INTO delivery_logs (id, report_id, channel, recipient_user_id, status, cost_pence, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, report_id, channel, recipient_user_id, status, cost_pence, created_at`,
        [id, data.reportId, data.channel, data.recipientUserId, data.status, data.costPence, now]
      );
      return {
        id: res.rows[0].id,
        reportId: res.rows[0].report_id,
        channel: res.rows[0].channel,
        recipientUserId: res.rows[0].recipient_user_id,
        status: res.rows[0].status,
        costPence: res.rows[0].cost_pence,
        createdAt: res.rows[0].created_at,
      };
    }

    const log: DbDeliveryLog = {
      id,
      reportId: data.reportId,
      channel: data.channel,
      recipientUserId: data.recipientUserId,
      status: data.status,
      costPence: data.costPence,
      createdAt: now,
    };
    this.memory.deliveryLogs.push(log);
    return log;
  }

  public async createAuditLog(data: {
    actorId: string | null;
    actionType: string;
    targetId: string | null;
    targetType: string;
    detailsJson: Record<string, any>;
  }): Promise<DbAuditLog> {
    await this.waitForInit();
    const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `INSERT INTO audit_logs (id, actor_id, action_type, target_id, target_type, details_json, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, actor_id, action_type, target_id, target_type, details_json, created_at`,
        [id, data.actorId, data.actionType, data.targetId, data.targetType, JSON.stringify(data.detailsJson), now]
      );
      return {
        id: res.rows[0].id,
        actorId: res.rows[0].actor_id,
        actionType: res.rows[0].action_type,
        targetId: res.rows[0].target_id,
        targetType: res.rows[0].target_type,
        detailsJson: typeof res.rows[0].details_json === 'string' ? JSON.parse(res.rows[0].details_json) : res.rows[0].details_json,
        createdAt: res.rows[0].created_at,
      };
    }

    const log: DbAuditLog = {
      id,
      actorId: data.actorId,
      actionType: data.actionType,
      targetId: data.targetId,
      targetType: data.targetType,
      detailsJson: data.detailsJson,
      createdAt: now,
    };
    this.memory.auditLogs.unshift(log);
    return log;
  }

  public async getAuditLogs(): Promise<DbAuditLog[]> {
    await this.waitForInit();
    if (this.isUsingPostgres()) {
      const res = await this.pool!.query(
        `SELECT id, actor_id, action_type, target_id, target_type, details_json, created_at
         FROM audit_logs
         ORDER BY created_at DESC
         LIMIT 100`
      );
      return res.rows.map((r) => ({
        id: r.id,
        actorId: r.actor_id,
        actionType: r.action_type,
        targetId: r.target_id,
        targetType: r.target_type,
        detailsJson: typeof r.details_json === 'string' ? JSON.parse(r.details_json) : r.details_json,
        createdAt: r.created_at,
      }));
    }

    return [...this.memory.auditLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private mapUserRow(row: any): DbUser {
    return {
      id: row.id,
      phone: row.phone,
      fullName: row.full_name || '',
      role: row.role,
      plan: row.plan,
      smsOptIn: row.sms_opt_in,
      smsMonthlyCapPence: row.sms_monthly_cap_pence,
      smsCurrentSpendPence: row.sms_current_spend_pence,
      defaultPlate: row.default_plate || undefined,
      defaultProvinceCode: row.default_province_code || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapVehicleRow(row: any): DbVehicle {
    return {
      id: row.id,
      plateNormalized: row.plate_normalized,
      plateDisplay: row.plate_display,
      make: row.make,
      model: row.model,
      color: row.color,
      verifiedOwnerId: row.verified_owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapVerificationRow(row: any): DbOwnershipVerification {
    return {
      id: row.id,
      vehicleId: row.vehicle_id,
      userId: row.user_id,
      documentName: row.document_name,
      documentType: row.document_type,
      documentUrl: row.document_url,
      status: row.status,
      adminNotes: row.admin_notes,
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at,
      reviewedById: row.reviewed_by_id,
    };
  }

  private mapReportRow(row: any): DbReport {
    return {
      id: row.id,
      idempotencyKey: row.idempotency_key,
      plateNormalized: row.plate_normalized,
      category: row.category,
      issueCode: row.issue_code,
      issueTitle: row.issue_title,
      customNote: row.custom_note,
      photoUrl: row.photo_url,
      reporterId: row.reporter_id,
      status: row.status,
      disputeReason: row.dispute_reason,
      abuseReason: row.abuse_reason,
      recipientActionNote: row.recipient_action_note,
      createdAt: row.created_at,
    };
  }
}

export const db = new DatabaseService();
