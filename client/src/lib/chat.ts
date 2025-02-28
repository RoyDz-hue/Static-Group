import { rtdb } from "./firebase";
import { ref, push, onValue, off, query, orderByChild, limitToLast } from "firebase/database";
import type { Message } from "@shared/schema";

export function sendMessage(groupId: string, userId: string, userDisplayName: string, text: string) {
  const messagesRef = ref(rtdb, `messages/${groupId}`);
  
  const message: Omit<Message, "id"> = {
    groupId,
    userId,
    userDisplayName,
    text,
    timestamp: Date.now()
  };

  return push(messagesRef, message);
}

export function subscribeToMessages(groupId: string, callback: (messages: Message[]) => void) {
  const messagesRef = ref(rtdb, `messages/${groupId}`);
  const messagesQuery = query(messagesRef, orderByChild("timestamp"), limitToLast(100));

  onValue(messagesQuery, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key!,
        ...childSnapshot.val()
      });
    });
    callback(messages);
  });

  return () => off(messagesRef);
}
