import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type { User } from "@shared/schema";

export async function register(email: string, password: string, displayName: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  const newUser: User = {
    uid: userCredential.user.uid,
    email,
    displayName,
    isAdmin: false,
    groups: []
  };

  await setDoc(doc(db, "users", userCredential.user.uid), newUser);
  return newUser;
}

export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
  return userDoc.data() as User;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function getCurrentUser(): Promise<User | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  const userDoc = await getDoc(doc(db, "users", user.uid));
  return userDoc.data() as User;
}
