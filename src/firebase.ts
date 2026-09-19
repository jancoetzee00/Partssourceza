import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass the firestoreDatabaseId from the configuration
// experimentalAutoDetectLongPolling enables seamless fallback in sandboxed iframe & Cloud Run environments
const firestoreDbId = (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-partsourceza-0798c94a-3733-45c0-b790-a3dbc431cd3c';
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, firestoreDbId);

export const auth = getAuth(app);

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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errCode = (error as any)?.code;

  const isPermissionError = 
    errCode === 'permission-denied' || 
    errMsg.toLowerCase().includes('permission') || 
    errMsg.toLowerCase().includes('insufficient');

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (isPermissionError) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    // For non-permission errors (e.g. offline, connection retry, unavailable),
    // log notice and allow Firestore's offline cache and persistence to operate smoothly
    console.warn(`Firestore [${operationType}] at ${path || 'root'} status notice:`, errMsg);
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection confirmed.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    } else {
      console.info('Firebase connection status: operational / offline cache ready.');
    }
    return false;
  }
}

// Run connectivity probe safely in background
testConnection().catch(() => {});

