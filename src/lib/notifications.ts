import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type NotifType = "comment_liked" | "mod_liked" | "new_upload" | "follow" | "dev_approved" | "dev_rejected" | "mod_approved" | "mod_rejected" | "comment_reply" | "system";

export interface Notif {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: any;
}

export async function sendNotification(
  toUid: string,
  type: NotifType,
  title: string,
  message: string,
  link?: string
) {
  try {
    await addDoc(collection(db, "notifications", toUid, "items"), {
      type,
      title,
      message,
      link: link || null,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Silently fail — notifications are non-critical
  }
}
