import { db } from "./firebase";
import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import type { Group, User } from "@shared/schema";

export async function createGroup(name: string, description: string, creatorId: string): Promise<Group> {
  const newGroup: Omit<Group, "id"> = {
    name,
    description,
    members: [creatorId],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const docRef = await addDoc(collection(db, "groups"), newGroup);
  return { ...newGroup, id: docRef.id };
}

export async function getGroup(groupId: string): Promise<Group> {
  const groupDoc = await getDoc(doc(db, "groups", groupId));
  return { ...groupDoc.data(), id: groupDoc.id } as Group;
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const q = query(
    collection(db, "groups"),
    where("members", "array-contains", userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Group[];
}

export async function addUserToGroup(groupId: string, userId: string) {
  const groupRef = doc(db, "groups", groupId);
  const userRef = doc(db, "users", userId);
  
  const [groupDoc, userDoc] = await Promise.all([
    getDoc(groupRef),
    getDoc(userRef)
  ]);

  const group = groupDoc.data() as Group;
  const user = userDoc.data() as User;

  if (!group.members.includes(userId)) {
    await updateDoc(groupRef, {
      members: [...group.members, userId],
      updatedAt: Date.now()
    });
  }

  if (!user.groups.includes(groupId)) {
    await updateDoc(userRef, {
      groups: [...user.groups, groupId]
    });
  }
}

export async function removeUserFromGroup(groupId: string, userId: string) {
  const groupRef = doc(db, "groups", groupId);
  const userRef = doc(db, "users", userId);
  
  const [groupDoc, userDoc] = await Promise.all([
    getDoc(groupRef),
    getDoc(userRef)
  ]);

  const group = groupDoc.data() as Group;
  const user = userDoc.data() as User;

  await updateDoc(groupRef, {
    members: group.members.filter(id => id !== userId),
    updatedAt: Date.now()
  });

  await updateDoc(userRef, {
    groups: user.groups.filter(id => id !== groupId)
  });
}

export async function deleteGroup(groupId: string) {
  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);
  const group = groupDoc.data() as Group;

  // Remove group from all member's groups array
  await Promise.all(
    group.members.map(userId =>
      updateDoc(doc(db, "users", userId), {
        groups: arrayRemove(groupId)
      })
    )
  );

  await deleteDoc(groupRef);
}
