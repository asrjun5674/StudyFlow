import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ParentContactConfig,
  ParentReportRecord,
  PlanTier,
  StudentProfile,
  UpiPaymentReceipt,
  LocalAuthUser,
} from '../types';
import {
  UPI_VPA,
  encodeGmailRawMessage,
  resolveLoginEmail,
  validateUsername,
} from './proAndPlugins';

// Initialize Firebase SDK with explicit firestoreDatabaseId
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Gmail Workspace OAuth Scope (minimal scope per principle of least privilege)
export const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';

// Strictly in-memory OAuth access token cache (never persisted to localStorage/sessionStorage)
let cachedGmailAccessToken: string | null = null;

export function getGmailAccessToken(): string | null {
  return cachedGmailAccessToken;
}

export function clearGmailAccessToken(): void {
  cachedGmailAccessToken = null;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: Array<{
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }>;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection boot verification (non-blocking test doc ping)
let connectionTested = false;
export async function testFirestoreConnection(): Promise<void> {
  if (connectionTested) return;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. Client appears offline.');
    }
  }
}

testFirestoreConnection();

onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedGmailAccessToken = null;
  }
});

// ---------------------------------------------------------
// Authentication Operations (Google/Gmail + Username/Password)
// ---------------------------------------------------------
function buildGoogleProvider(includeGmailScope: boolean): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  if (includeGmailScope) {
    provider.addScope(GMAIL_SEND_SCOPE);
  }
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export async function signInWithGmail(requestGmailSendScope = false): Promise<{
  user: User;
  hasGmailToken: boolean;
}> {
  const provider = buildGoogleProvider(requestGmailSendScope);
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (credential?.accessToken && requestGmailSendScope) {
    cachedGmailAccessToken = credential.accessToken;
  }
  return {
    user: result.user,
    hasGmailToken: Boolean(cachedGmailAccessToken),
  };
}

export async function authorizeGmailPlugin(): Promise<string> {
  const provider = buildGoogleProvider(true);
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error('Google did not return a Gmail access token. Please allow Gmail send permission in the popup.');
  }
  cachedGmailAccessToken = credential.accessToken;
  return credential.accessToken;
}

export function mapAuthErrorMessage(err: any): string {
  const code = err?.code || '';
  const msg = err?.message || String(err);
  if (code === 'auth/unauthorized-domain') {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
    return `Google popup is not authorized yet for "${host}" in Firebase Authentication -> Settings -> Authorized domains. You can sign in or create a Username & Password account right below immediately!`;
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Email/Password sign-in is disabled in Firebase Console, so StudyFlow uses its built-in account service automatically. Please try again!';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Google sign-in popup was closed before finishing. Please try again.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Popup was blocked by your browser. Please allow popups for this site and retry.';
  }
  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Invalid username/email or password. Please check your credentials or Create Account first.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'That email or username is already registered. Please switch to Sign In.';
  }
  if (code === 'auth/weak-password') {
    return 'Password should be at least 6 characters long.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address or username.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'An account already exists with this email using a different sign-in method.';
  }
  return msg;
}

async function loginViaServerAuth(identifier: string, password: string): Promise<LocalAuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok || data?.ok === false || !data?.user) {
    throw new Error(data?.error || 'Could not sign in with username and password.');
  }
  return data.user as LocalAuthUser;
}

async function registerViaServerAuth(params: {
  username: string;
  email?: string;
  password: string;
}): Promise<LocalAuthUser> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || data?.ok === false || !data?.user) {
    throw new Error(data?.error || 'Could not create account.');
  }
  return data.user as LocalAuthUser;
}

export async function signInWithUsernameOrEmail(
  identifier: string,
  password: string,
  _usernameMap: Record<string, string>
): Promise<{ mode: 'firebase'; user: User } | { mode: 'local_server'; localUser: LocalAuthUser }> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    throw new Error('Please enter your username or email.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  const localUser = await loginViaServerAuth(trimmed, password);
  return { mode: 'local_server', localUser };
}

export async function signUpWithUsernamePassword(params: {
  username: string;
  email?: string;
  password: string;
}): Promise<{
  mode: 'firebase' | 'local_server';
  user?: User;
  localUser?: LocalAuthUser;
  resolvedEmail: string;
  normalizedUsername: string;
  verificationSent: boolean;
}> {
  const check = validateUsername(params.username);
  if (!check.valid) {
    throw new Error(check.error || 'Invalid username.');
  }
  if (!params.password || params.password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const trimmedEmail = (params.email || '').trim().toLowerCase();
  const localUser = await registerViaServerAuth({
    username: params.username.trim(),
    email: trimmedEmail || undefined,
    password: params.password,
  });

  return {
    mode: 'local_server',
    localUser,
    resolvedEmail: localUser.email,
    normalizedUsername: localUser.username,
    verificationSent: false,
  };
}

export async function resendVerificationEmail(): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('No active signed-in user.');
  }
  await sendEmailVerification(auth.currentUser);
}

export async function logoutFirebaseUser(): Promise<void> {
  clearGmailAccessToken();
  await signOut(auth);
}

// ---------------------------------------------------------
// Gmail API Send (https://www.googleapis.com/auth/gmail.send)
// ---------------------------------------------------------
export async function sendEmailViaGmailApi(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ id: string }> {
  const token = cachedGmailAccessToken;
  if (!token) {
    throw new Error('Gmail permission token is not active in this session. Click "Connect Gmail" first.');
  }

  const raw = encodeGmailRawMessage(params);
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (res.status === 401) {
    cachedGmailAccessToken = null;
    throw new Error('Gmail authorization expired. Please click "Connect Gmail" again.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gmail API error (${res.status})`);
  }

  return { id: data.id || `gmail-${Date.now()}` };
}

// ---------------------------------------------------------
// Firestore Sync Helpers (Strict Rules + Verified-User Guard)
// ---------------------------------------------------------
function canSyncToCloud(user: User | null): user is User {
  return Boolean(user && user.emailVerified);
}

function sanitizeUid(uid: string): string {
  return uid.slice(0, 128);
}

function clampInt(val: number, min: number, max: number): number {
  const n = Math.round(Number(val) || 0);
  return Math.max(min, Math.min(max, n));
}

export async function ensureVerifiedUserProfileInCloud(params: {
  user: User;
  profile: StudentProfile;
  planTier: PlanTier;
  username?: string;
  authMethod: 'google' | 'password';
  parentContact: ParentContactConfig;
}): Promise<void> {
  const { user, profile, planTier, authMethod, parentContact } = params;
  if (!canSyncToCloud(user)) return;

  const uid = sanitizeUid(user.uid);
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  const safeUsername = (params.username || user.displayName || profile.name || 'student')
    .trim()
    .slice(0, 40);
  const safeDisplayName = (profile.name || user.displayName || safeUsername || 'Student')
    .trim()
    .slice(0, 80);
  const safeGrade = (profile.grade || 'Class 10').trim().slice(0, 60);
  const safeSchool = (profile.school || '').trim().slice(0, 120);
  const safeAvatar = (profile.avatar || '🌱').trim().slice(0, 16);
  const safeDailyGoal = clampInt(profile.dailyGoalMinutes, 10, 720);
  const safeStreak = clampInt(profile.streakDays, 0, 10000);
  const safeLanguage = profile.language === 'ta' ? 'ta' : 'en';

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid,
        username: safeUsername.length >= 2 ? safeUsername : 'student',
        displayName: safeDisplayName,
        grade: safeGrade,
        school: safeSchool,
        avatar: safeAvatar,
        dailyGoalMinutes: safeDailyGoal,
        streakDays: safeStreak,
        language: safeLanguage,
        planTier,
        authMethod,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        username: safeUsername.length >= 2 ? safeUsername : 'student',
        displayName: safeDisplayName,
        grade: safeGrade,
        school: safeSchool,
        avatar: safeAvatar,
        dailyGoalMinutes: safeDailyGoal,
        streakDays: safeStreak,
        language: safeLanguage,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, snapSafeOp(err), userPath);
  }

  // Also ensure isolated PII doc exists
  const privatePath = `users/${uid}/private/info`;
  const privateRef = doc(db, 'users', uid, 'private', 'info');
  const safeEmail = (user.email || `${uid}@users.studyflow.app`).slice(0, 160);
  const safeParentName = (parentContact.parentName || '').trim().slice(0, 80);
  const safeParentEmail = (parentContact.parentEmail || '').trim().slice(0, 160);
  const safeParentWhatsapp = (parentContact.parentWhatsapp || '').trim().slice(0, 24);

  try {
    const pSnap = await getDoc(privateRef);
    if (!pSnap.exists()) {
      await setDoc(privateRef, {
        uid,
        email: safeEmail,
        parentName: safeParentName,
        parentEmail: safeParentEmail,
        parentWhatsapp: safeParentWhatsapp,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(privateRef, {
        email: safeEmail,
        parentName: safeParentName,
        parentEmail: safeParentEmail,
        parentWhatsapp: safeParentWhatsapp,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, privatePath);
  }
}

function snapSafeOp(_err: unknown): OperationType {
  return OperationType.WRITE;
}

export async function updatePlanTierInCloud(user: User | null, planTier: PlanTier): Promise<void> {
  if (!canSyncToCloud(user)) return;
  const uid = sanitizeUid(user.uid);
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      planTier,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function recordUpiPaymentInCloud(
  user: User | null,
  receipt: UpiPaymentReceipt
): Promise<void> {
  if (!canSyncToCloud(user)) return;
  const uid = sanitizeUid(user.uid);
  const docId = receipt.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128) || `pay_${Date.now()}`;
  const path = `users/${uid}/payments/${docId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'payments', docId), {
      uid,
      planTier: receipt.planTier,
      amountInr: clampInt(receipt.amountInr, 1, 50000),
      upiPayee: (receipt.upiPayee || UPI_VPA).slice(0, 64),
      utrNumber: receipt.utrNumber.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32),
      status: 'verified',
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function recordParentReportInCloud(
  user: User | null,
  report: ParentReportRecord
): Promise<void> {
  if (!canSyncToCloud(user)) return;
  const uid = sanitizeUid(user.uid);
  const docId = report.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128) || `rep_${Date.now()}`;
  const path = `users/${uid}/parentReports/${docId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'parentReports', docId), {
      uid,
      channel: report.channel,
      completionRate: clampInt(report.completionRate, 0, 100),
      weeklyFocusMinutes: clampInt(report.weeklyFocusMinutes, 0, 20000),
      streakDays: clampInt(report.streakDays, 0, 10000),
      sentAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function loadCloudUserState(user: User): Promise<{
  planTier?: PlanTier;
  parentContact?: ParentContactConfig;
  profilePatch?: Partial<StudentProfile>;
  payments?: UpiPaymentReceipt[];
} | null> {
  if (!canSyncToCloud(user)) return null;
  const uid = sanitizeUid(user.uid);

  const userPath = `users/${uid}`;
  let planTier: PlanTier | undefined;
  let profilePatch: Partial<StudentProfile> | undefined;
  let parentContact: ParentContactConfig | undefined;
  const payments: UpiPaymentReceipt[] = [];

  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.planTier === 'free' || data.planTier === 'plus' || data.planTier === 'pro_ultra') {
        planTier = data.planTier;
      }
      const nextPatch: Partial<StudentProfile> = {};
      if (typeof data.displayName === 'string' && data.displayName.trim()) {
        nextPatch.name = data.displayName;
      }
      if (typeof data.grade === 'string' && data.grade.trim()) {
        nextPatch.grade = data.grade;
      }
      if (typeof data.school === 'string') {
        nextPatch.school = data.school;
      }
      if (typeof data.avatar === 'string' && data.avatar.trim()) {
        nextPatch.avatar = data.avatar;
      }
      if (typeof data.dailyGoalMinutes === 'number' && data.dailyGoalMinutes > 0) {
        nextPatch.dailyGoalMinutes = data.dailyGoalMinutes;
      }
      if (typeof data.streakDays === 'number' && data.streakDays >= 0) {
        nextPatch.streakDays = data.streakDays;
      }
      if (data.language === 'ta' || data.language === 'en') {
        nextPatch.language = data.language;
      }
      if (Object.keys(nextPatch).length > 0) {
        profilePatch = nextPatch;
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, userPath);
  }

  try {
    const privSnap = await getDoc(doc(db, 'users', uid, 'private', 'info'));
    if (privSnap.exists()) {
      const p = privSnap.data();
      parentContact = {
        parentName: typeof p.parentName === 'string' ? p.parentName : '',
        parentEmail: typeof p.parentEmail === 'string' ? p.parentEmail : '',
        parentWhatsapp: typeof p.parentWhatsapp === 'string' ? p.parentWhatsapp : '',
      };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}/private/info`);
  }

  try {
    const q = query(collection(db, 'users', uid, 'payments'), where('uid', '==', uid));
    const paySnaps = await getDocs(q);
    paySnaps.forEach((d) => {
      const data = d.data();
      payments.push({
        id: d.id,
        planTier: data.planTier === 'pro_ultra' ? 'pro_ultra' : 'plus',
        amountInr: Number(data.amountInr) || 149,
        upiPayee: String(data.upiPayee || UPI_VPA),
        utrNumber: String(data.utrNumber || ''),
        timestamp: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        status: 'verified',
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/payments`);
  }

  return {
    planTier,
    profilePatch,
    parentContact,
    payments: payments.length > 0 ? payments : undefined,
  };
}
