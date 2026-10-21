/**
 * Automated Verification Script for Driver Ping Hackathon Prototype
 * Verifies:
 * 1. Database reliability & status
 * 2. Rejection of unauthenticated requests & forged headers
 * 3. Predefined demo login allowed; arbitrary demo ID rejected (403 Forbidden)
 * 4. No debug code / OTP secrets leaked in public API responses
 * 5. OTP verification with hackathon demo code (123456)
 * 6. Access control: Admin endpoints blocked for non-admin
 * 7. Privacy protection: Reporter identity strictly omitted from alert feeds
 * 8. End-to-end core demo flow:
 *    - Reporter signs in (Jordan Lee)
 *    - Submits observation report for Alex Morgan's vehicle (CK 45 DF GP)
 *    - Vehicle owner (Alex Morgan) signs in
 *    - Owner sees observation alert in feed
 *    - Owner resolves the alert with action note
 *    - Persistence: Verifies updated status persists in database
 */

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- STARTING DRIVER PING VERIFICATION TESTS ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Verify DB Status
  const dbStatusRes = await fetch(`${BASE_URL}/db-status`);
  const dbStatus = await dbStatusRes.json();
  assert(dbStatus.status === 'ok', 'Database status endpoint returns status: ok');

  // 2. Insecure header rejection test:
  // Calling /api/auth/me with NO token and only an x-user-id header
  const forgedHeaderRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      'x-user-id': 'usr_admin_003',
    },
  });
  assert(
    forgedHeaderRes.status === 401,
    'SECURITY: Request with spoofed x-user-id is rejected with 401 Unauthorized'
  );

  // 3. Unauthenticated /api/reports rejection test:
  const unauthReportRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plate: 'CK45DFGP', category: 'vehicle_condition', issueCode: 'test', issueTitle: 'Test' }),
  });
  assert(
    unauthReportRes.status === 401,
    'SECURITY: Unauthenticated report submission is rejected with 401 Unauthorized'
  );

  // 4. Arbitrary Demo Account Login Rejection Test:
  const arbitraryLoginRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'usr_arbitrary_hacker' }),
  });
  assert(
    arbitraryLoginRes.status === 403,
    'SECURITY: Arbitrary user ID request to /auth/demo-login is rejected with 403 Forbidden'
  );

  // 5. Predefined Demo Login Test:
  const alexLoginRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'usr_alex_001' }),
  });
  const alexLoginData = await alexLoginRes.json();
  assert(
    alexLoginRes.ok && Boolean(alexLoginData.token),
    'AUTH: Predefined demo login generates a valid signed JWT session token'
  );
  const alexToken = alexLoginData.token;

  // 6. Authenticated /api/auth/me test:
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${alexToken}` },
  });
  const meData = await meRes.json();
  assert(
    meRes.ok && meData.user?.id === 'usr_alex_001',
    'AUTH: Authenticated user profile successfully retrieved with Bearer token'
  );

  // 7. Access Control: Normal user calling /api/admin/verifications
  const adminForbiddenRes = await fetch(`${BASE_URL}/admin/verifications`, {
    headers: { Authorization: `Bearer ${alexToken}` },
  });
  assert(
    adminForbiddenRes.status === 403,
    'ACCESS CONTROL: Non-admin user cannot access /api/admin/verifications (403 Forbidden)'
  );

  // 8. Admin Login and Access:
  const adminLoginRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'usr_admin_003' }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.token;

  const adminVerifRes = await fetch(`${BASE_URL}/admin/verifications`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    adminVerifRes.ok,
    'ACCESS CONTROL: Admin user successfully accesses /api/admin/verifications'
  );

  // 9. OTP Flow & No Secret Leakage Test:
  const requestOtpRes = await fetch(`${BASE_URL}/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+27 82 999 7766' }),
  });
  const requestOtpData = await requestOtpRes.json();
  assert(
    requestOtpRes.ok && !('debugCode' in requestOtpData),
    'OTP: Public request-otp response does NOT leak generated code'
  );

  const verifyOtpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+27 82 999 7766', code: '123456' }),
  });
  const verifyOtpData = await verifyOtpRes.json();
  assert(
    verifyOtpRes.ok && Boolean(verifyOtpData.token),
    'OTP: Verification with hackathon demo code (123456) issues a valid JWT token'
  );

  // 10. Privacy Protection in Alerts:
  const alertsRes = await fetch(`${BASE_URL}/alerts`, {
    headers: { Authorization: `Bearer ${alexToken}` },
  });
  const alertsData = await alertsRes.json();
  assert(alertsRes.ok && Array.isArray(alertsData.alerts), 'ALERTS: Successfully fetched alerts');

  let privacyPreserved = true;
  for (const alert of alertsData.alerts) {
    if ('reporterId' in alert || 'reporter_id' in alert || 'reporterPhone' in alert) {
      privacyPreserved = false;
      break;
    }
  }
  assert(
    privacyPreserved,
    'PRIVACY: Alerts feed strictly scrubs reporter_id and reporter identity from responses'
  );

  // 11. END-TO-END DEMO FLOW TEST:
  // Step A: Jordan Lee signs in as reporter
  const jordanLoginRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'usr_jordan_002' }),
  });
  const jordanData = await jordanLoginRes.json();
  const jordanToken = jordanData.token;
  assert(Boolean(jordanToken), 'E2E [Step 1]: Reporter (Jordan Lee) signs in');

  // Step B: Jordan submits report for Alex Morgan's vehicle (CK 45 DF GP)
  const e2eIssueCode = `taillight_${Date.now()}`;
  const e2eReportRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jordanToken}`,
    },
    body: JSON.stringify({
      plate: 'CK 45 DF GP',
      category: 'vehicle_condition',
      issueCode: e2eIssueCode,
      issueTitle: 'Rear right taillight out',
      customNote: 'Observed right brake lamp not functioning at intersection.',
      idempotencyKey: `e2e_${Date.now()}`,
    }),
  });
  const e2eReportData = await e2eReportRes.json();
  const reportId = e2eReportData.reportId;
  assert(
    e2eReportRes.ok && Boolean(reportId),
    'E2E [Step 2]: Reporter submits vehicle condition observation for CK 45 DF GP'
  );

  // Step C: Vehicle owner (Alex Morgan) fetches alerts and sees the new report
  const alexAlertsRes = await fetch(`${BASE_URL}/alerts`, {
    headers: { Authorization: `Bearer ${alexToken}` },
  });
  const alexAlertsData = await alexAlertsRes.json();
  const matchingAlert = alexAlertsData.alerts?.find((a: any) => a.id === reportId);
  assert(
    Boolean(matchingAlert),
    'E2E [Step 3]: Vehicle owner (Alex Morgan) immediately sees alert in their alerts feed'
  );

  // Step D: Vehicle owner resolves the alert
  const resolveRes = await fetch(`${BASE_URL}/alerts/${reportId}/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${alexToken}`,
    },
    body: JSON.stringify({
      action: 'resolve',
      note: 'Replaced brake light bulb at service station. Thanks!',
    }),
  });
  const resolveData = await resolveRes.json();
  assert(
    resolveRes.ok && resolveData.status === 'resolved',
    'E2E [Step 4]: Vehicle owner resolves alert with response note'
  );

  // Step E: Verify alert resolution persists after refresh
  const alexRefreshedAlertsRes = await fetch(`${BASE_URL}/alerts`, {
    headers: { Authorization: `Bearer ${alexToken}` },
  });
  const alexRefreshedData = await alexRefreshedAlertsRes.json();
  const resolvedAlert = alexRefreshedData.alerts?.find((a: any) => a.id === reportId);
  assert(
    resolvedAlert && resolvedAlert.status === 'resolved',
    'E2E [Step 5]: Persisted alert state verified (status remains resolved)'
  );

  console.log(`\n--- ALL VERIFICATION TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
