import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot, doc,
  updateDoc, deleteDoc, writeBatch, getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, CheckCircle, XCircle, Upload, Shield,
  Heart, ThumbsUp, Users, Star, MessageCircle,
  CheckCheck, Trash2
} from "lucide-react";
import { Link } from "wouter";
import type { NotifType } from "@/lib/notifications";

interface Notif {
  id: string;
  type: NotifType | string;
  title?: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: any;
}

function NotifIcon({ type }: { type: string }) {
  const cls = "h-4 w-4";
  switch (type) {
    case "comment_liked": return <ThumbsUp className={`${cls} text-blue-400`} />;
    case "mod_liked": return <Heart className={`${cls} text-red-400`} />;
    case "new_upload": return <Upload className={`${cls} text-primary`} />;
    case "follow": return <Users className={`${cls} text-purple-400`} />;
    case "dev_approved":
    case "approved": return <CheckCircle className={`${cls} text-green-400`} />;
    case "dev_rejected":
    case "mod_rejected":
    case "rejected": return <XCircle className={`${cls} text-red-400`} />;
    case "mod_approved": return <Star className={`${cls} text-yellow-400`} />;
    case "comment_reply": return <MessageCircle className={`${cls} text-blue-400`} />;
    case "system":
    default: return <Bell className={`${cls} text-muted-foreground`} />;
  }
}

function notifBg(type: string) {
  switch (type) {
    case "comment_liked": return "bg-blue-500/15";
    case "mod_liked": return "bg-red-500/15";
    case "new_upload": return "bg-primary/15";
    case "follow": return "bg-purple-500/15";
    case "dev_approved": case "approved": case "mod_approved": return "bg-green-500/15";
    case "dev_rejected": case "mod_rejected": case "rejected": return "bg-red-500/15";
    default: return "bg-muted";
  }
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const DEMO_NOTIFS: Notif[] = [
  { id: "d1", type: "dev_approved", title: "Developer Approved!", message: "Your developer application has been approved. You can now upload mods to the platform.", link: "/developer-dashboard", read: false, createdAt: null },
  { id: "d2", type: "mod_approved", title: "Mod Approved", message: "Your mod 'APOLLON CLIGHT' is now live for the community.", link: "/mod/apollon-clight", read: false, createdAt: null },
  { id: "d3", type: "mod_liked", title: "Your Mod Got Liked", message: "Someone liked your mod 'APOLLON CLIGHT'. Keep up the great work!", link: "/mod/apollon-clight", read: true, createdAt: null },
  { id: "d4", type: "comment_liked", title: "Your Review Was Helpful", message: "Someone found your review helpful and liked it.", read: true, createdAt: null },
  { id: "d5", type: "new_upload", title: "New Upload from Vantage Official", message: "Vantage Toolbox Pro v2.0.5 is now available to download.", link: "/mod/vantage-toolbox", read: true, createdAt: null },
  { id: "d6", type: "system", title: "Welcome to Vantage Mine Hub!", message: "Explore mods, tools, shaders and texture packs from the Vantage Army.", link: "/explore", read: true, createdAt: null },
];

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "notifications", currentUser.uid, "items"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      const real = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notif));
      setNotifs(real.length > 0 ? real : DEMO_NOTIFS);
      setLoading(false);
    }, () => {
      setNotifs(DEMO_NOTIFS);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  async function markRead(id: string) {
    if (id.startsWith("d")) {
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      return;
    }
    await updateDoc(doc(db, "notifications", currentUser!.uid, "items", id), { read: true }).catch(() => {});
  }

  async function markAllRead() {
    if (!currentUser) return;
    const isDemo = notifs.some(n => n.id.startsWith("d"));
    if (isDemo) { setNotifs(prev => prev.map(n => ({ ...n, read: true }))); return; }
    const snap = await getDocs(collection(db, "notifications", currentUser.uid, "items")).catch(() => null);
    if (!snap) return;
    const batch = writeBatch(db);
    snap.docs.filter(d => !d.data().read).forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit().catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function deleteNotif(id: string) {
    if (id.startsWith("d")) { setNotifs(prev => prev.filter(n => n.id !== id)); return; }
    await deleteDoc(doc(db, "notifications", currentUser!.uid, "items", id)).catch(() => {});
  }

  const displayed = filter === "unread" ? notifs.filter(n => !n.read) : notifs;
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <Layout>
      <div className="px-3 pt-4 pb-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-black flex-1">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">{unreadCount} new</Badge>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex rounded-lg overflow-hidden border border-border flex-1">
            {(["all", "unread"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 text-xs font-semibold transition-colors capitalize ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                {f}{f === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-3 items-start p-3 border border-border rounded-xl">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm">
              {filter === "unread" ? "You're all caught up!" : "No notifications yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Activity will show up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map(notif => {
              const date = notif.createdAt?.toDate ? notif.createdAt.toDate() : null;
              const cardContent = (
                <Card
                  key={notif.id}
                  data-testid={`notif-${notif.id}`}
                  className={`p-3 flex items-start gap-3 transition-all cursor-pointer hover:border-primary/40 ${!notif.read ? "border-primary/30 bg-primary/5" : ""}`}
                  onClick={() => markRead(notif.id)}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${notifBg(notif.type)}`}>
                    <NotifIcon type={notif.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notif.title || "Notification"}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!notif.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                        <button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); deleteNotif(notif.id); }}
                          className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{date ? timeAgo(date) : "recently"}</p>
                  </div>
                </Card>
              );

              return notif.link ? (
                <Link key={notif.id} href={notif.link}>
                  <a>{cardContent}</a>
                </Link>
              ) : (
                <div key={notif.id}>{cardContent}</div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
