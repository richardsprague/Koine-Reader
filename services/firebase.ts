
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  User, 
  onAuthStateChanged as firebaseOnAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy 
} from 'firebase/firestore';
import { Flashcard, WordAnalysis } from '../types';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Check if config is likely valid to avoid initial crashes
const isConfigValid = !!process.env.FIREBASE_API_KEY && process.env.FIREBASE_API_KEY !== 'undefined';

let auth: any = null;
let db: any = null;

if (isConfigValid) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.warn("Firebase init failed, falling back to local storage:", e);
  }
} else {
  console.log("Running in Demo Mode (Local Storage) due to missing Firebase keys.");
}

// --- Auth Wrappers ---

export const subscribeToAuthChanges = (callback: (user: User | null) => void): () => void => {
  if (auth) {
    return firebaseOnAuthStateChanged(auth, callback);
  } else {
    // Local Storage Mock Auth
    const checkLocalUser = () => {
      const stored = localStorage.getItem('koine_mock_user');
      if (stored) {
        try {
          callback(JSON.parse(stored) as User);
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
    };
    
    window.addEventListener('koine_auth_change', checkLocalUser);
    checkLocalUser();
    
    return () => {
      window.removeEventListener('koine_auth_change', checkLocalUser);
    };
  }
};

export const loginWithGoogle = async () => {
  if (auth) {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } else {
    // Mock Login for Demo Mode
    const mockUser = {
      uid: 'local-user-' + Date.now().toString().slice(-4),
      displayName: 'Demo User',
      photoURL: null,
      email: 'demo@example.com',
      emailVerified: true,
      isAnonymous: false
    } as unknown as User;
    
    localStorage.setItem('koine_mock_user', JSON.stringify(mockUser));
    window.dispatchEvent(new Event('koine_auth_change'));
  }
};

export const logout = async () => {
  if (auth) {
    await signOut(auth);
  } else {
    localStorage.removeItem('koine_mock_user');
    window.dispatchEvent(new Event('koine_auth_change'));
  }
};

// --- Database Wrappers ---

export const saveFlashcard = async (user: User, analysis: WordAnalysis, verseReference: string) => {
  if (db && !user.uid.startsWith('local-user-')) {
    await addDoc(collection(db, 'flashcards'), {
      ...analysis,
      userId: user.uid,
      verseReference,
      createdAt: Date.now()
    });
  } else {
    // Local Storage Fallback
    const existing = localStorage.getItem('koine_flashcards');
    const cards: Flashcard[] = existing ? JSON.parse(existing) : [];
    
    const newCard: Flashcard = {
      ...analysis,
      id: 'local-' + Date.now(),
      userId: user.uid,
      verseReference,
      createdAt: Date.now()
    };
    
    cards.push(newCard);
    localStorage.setItem('koine_flashcards', JSON.stringify(cards));
  }
};

export const getFlashcards = async (user: User): Promise<Flashcard[]> => {
  if (db && !user.uid.startsWith('local-user-')) {
    const q = query(
      collection(db, 'flashcards'), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Flashcard));
  } else {
    // Local Storage Fallback
    const existing = localStorage.getItem('koine_flashcards');
    const cards: Flashcard[] = existing ? JSON.parse(existing) : [];
    return cards
      .filter(c => c.userId === user.uid)
      .sort((a, b) => b.createdAt - a.createdAt);
  }
};

export const deleteFlashcard = async (id: string) => {
  if (db && !id.startsWith('local-')) {
    await deleteDoc(doc(db, 'flashcards', id));
  } else {
    // Local Storage Fallback
    const existing = localStorage.getItem('koine_flashcards');
    if (existing) {
      let cards: Flashcard[] = JSON.parse(existing);
      cards = cards.filter(c => c.id !== id);
      localStorage.setItem('koine_flashcards', JSON.stringify(cards));
    }
  }
};
