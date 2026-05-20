import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  userType: "normal" | "developer" | "admin";
  developerStatus: "none" | "pending" | "approved" | "rejected";
  createdAt: string;
  isGuest: boolean;
  isBanned: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  setupRecaptcha: (elementId: string) => RecaptchaVerifier;
  sendPhoneOTP: (phone: string, recaptchaVerifier: RecaptchaVerifier) => Promise<string>;
  verifyPhoneOTP: (verificationId: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function createUserProfile(user: User, extra?: Partial<UserProfile>) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || extra?.displayName || "Vantage User",
        photoURL: user.photoURL,
        userType: "normal",
        developerStatus: "none",
        createdAt: new Date().toISOString(),
        isGuest: user.isAnonymous,
        isBanned: false,
        ...extra,
      };
      await setDoc(ref, profile);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await createUserProfile(user);
        const ref = doc(db, "users", user.uid);
        const unsub = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          }
        });
        setLoading(false);
        return unsub;
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function loginWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function registerWithEmail(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(cred.user, { displayName });
  }

  async function loginAsGuest() {
    await signInAnonymously(auth);
  }

  async function logout() {
    await signOut(auth);
  }

  function setupRecaptcha(elementId: string): RecaptchaVerifier {
    const verifier = new RecaptchaVerifier(auth, elementId, {
      size: "invisible",
      callback: () => {},
    });
    return verifier;
  }

  async function sendPhoneOTP(phone: string, recaptchaVerifier: RecaptchaVerifier): Promise<string> {
    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(phone, recaptchaVerifier);
    return verificationId;
  }

  async function verifyPhoneOTP(verificationId: string, otp: string) {
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    await signInWithCredential(auth, credential);
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsGuest,
        logout,
        setupRecaptcha,
        sendPhoneOTP,
        verifyPhoneOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
