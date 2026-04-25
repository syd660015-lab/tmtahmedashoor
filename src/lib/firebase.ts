import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);

// Critical: Test connection on boot
async function testConnection() {
  try {
    const testDoc = doc(db, 'system', 'health');
    await getDocFromServer(testDoc);
    console.log("Firebase connection established.");
  } catch (error) {
    const errMsg = error instanceof Error ? error.message.toLowerCase() : '';
    if (errMsg.includes('permission-denied') || errMsg.includes('insufficient permissions')) {
      // Expected if no system/health doc exists or if restricted, but connection is alive
      return;
    }
    console.error("Firebase connection failed:", error);
  }
}

testConnection();
