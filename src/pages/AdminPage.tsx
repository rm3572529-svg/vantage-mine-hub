import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Upload, CheckCircle, XCircle, Ban, Eye, BarChart3, Settings, Lock } from "lucide-react";
import VantageLogo from "@/components/VantageLogo";

const ADMIN_PASSWORD = "741222";

interface AdminUser { uid: string; email: string; displayName: string; userType: string; isBanned: boolean; }
interface AdminDev { uid: string; fullName: string; email: string; youtube1: string; status: string; }
interface AdminUpload { id: string; title: string; developerName: string; category: string; status: string; }

export default function AdminPage() {
  const { toast } = useToast();
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("adminUnlocked") === "true");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [developers, setDevelopers] = useState<AdminDev[]>([]);
  const [uploads, setUploads] = useState<AdminUpload[]>([]);
  const [loading, setLoading] = useState(false);

  function handleUnlock() {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminUnlocked", "true");
      setUnlocked(true);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  }

  useEffect(() => {
    if (!unlocked) return;
    const unsubUsers = onSnapshot(collection(db, "users"), snap => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as AdminUser)));
    });
    const unsubDevs = onSnapshot(collection(db, "developers"), snap => {
      setDevelopers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as AdminDev)));
    });
    const unsubUploads = onSnapshot(collection(db, "uploads"), snap => {
      setUploads(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUpload)));
    });
    return () => { unsubUsers(); unsubDevs(); unsubUploads(); };
  }, [unlocked]);

  async function approveDev(uid: string) {
    await updateDoc(doc(db, "developers", uid), { status: "approved" });
    await updateDoc(doc(db, "users", uid), { developerStatus: "approved" });
    toast({ title: "Developer approved!" });
  }

  async function rejectDev(uid: string) {
    await updateDoc(doc(db, "developers", uid), { status: "rejected" });
    await updateDoc(doc(db, "users", uid), { developerStatus: "rejected" });
    toast({ title: "Developer rejected." });
  }

  async function approveUpload(id: string) {
    await updateDoc(doc(db, "uploads", id), { status: "approved" });
    toast({ title: "Upload approved!" });
  }

  async function rejectUpload(id: string) {
    await updateDoc(doc(db, "uploads", id), { status: "rejected" });
    toast({ title: "Upload rejected." });
  }

  async function banUser(uid: string) {
    await updateDoc(doc(db, "users", uid), { isBanned: true });
    toast({ title: "User banned." });
  }

  async function unbanUser(uid: string) {
    await updateDoc(doc(db, "users", uid), { isBanned: false });
    toast({ title: "User unbanned." });
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter the admin password to continue.</p>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="input-admin-password"
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleUnlock()}
                className={`pl-9 h-11 ${passwordError ? "border-destructive" : ""}`}
              />
            </div>
            {passwordError && <p className="text-xs text-destructive">Incorrect password. Try again.</p>}
            <Button data-testid="button-admin-unlock" className="w-full h-11 font-bold" onClick={handleUnlock}>
              Unlock Admin Panel
            </Button>
          </div>
          <VantageLogo size={32} className="mx-auto opacity-30" />
        </div>
      </div>
    );
  }

  const pendingDevs = developers.filter(d => d.status === "pending");
  const pendingUploads = uploads.filter(u => u.status === "pending");
  const bannedUsers = users.filter(u => u.isBanned);

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
      approved: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return <Badge className={`text-[10px] border ${map[status] || "bg-muted text-muted-foreground border-border"}`}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-3 py-2">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="font-black text-base">Admin Panel</h1>
          <Badge className="ml-auto text-[10px] bg-primary/20 text-primary border-primary/30">SECURED</Badge>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => { sessionStorage.removeItem("adminUnlocked"); setUnlocked(false); }}
          >
            Lock
          </Button>
        </div>
      </header>

      <div className="px-3 py-4 max-w-2xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Total Users", value: users.length, icon: Users, color: "text-blue-400" },
            { label: "Developers", value: developers.length, icon: Upload, color: "text-primary" },
            { label: "Pending Reviews", value: pendingDevs.length + pendingUploads.length, icon: Eye, color: "text-yellow-400" },
            { label: "Total Uploads", value: uploads.length, icon: BarChart3, color: "text-purple-400" },
          ].map(s => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="applications">
          <TabsList className="w-full grid grid-cols-4 mb-4 h-auto">
            <TabsTrigger value="applications" className="text-[11px] py-2 flex-col gap-0.5 h-auto">
              <span>Apps</span>
              {pendingDevs.length > 0 && <Badge className="text-[9px] bg-yellow-500 text-black px-1 py-0 h-3">{pendingDevs.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="uploads" className="text-[11px] py-2 flex-col gap-0.5 h-auto">
              <span>Uploads</span>
              {pendingUploads.length > 0 && <Badge className="text-[9px] bg-yellow-500 text-black px-1 py-0 h-3">{pendingUploads.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="users" className="text-[11px] py-2">Users</TabsTrigger>
            <TabsTrigger value="settings" className="text-[11px] py-2">Config</TabsTrigger>
          </TabsList>

          {/* Developer Applications */}
          <TabsContent value="applications">
            <h3 className="font-bold text-sm mb-3">Developer Applications</h3>
            {developers.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">No applications yet.</Card>
            ) : (
              <div className="space-y-3">
                {developers.map(dev => (
                  <Card key={dev.uid} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-semibold text-sm">{dev.fullName}</p>
                        <p className="text-xs text-muted-foreground">{dev.email}</p>
                        {dev.youtube1 && <p className="text-xs text-primary truncate">{dev.youtube1}</p>}
                      </div>
                      <StatusBadge status={dev.status} />
                    </div>
                    {dev.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          data-testid={`button-approve-dev-${dev.uid}`}
                          size="sm"
                          className="flex-1 h-8 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => approveDev(dev.uid)}
                        >
                          <CheckCircle className="h-3 w-3" /> Approve
                        </Button>
                        <Button
                          data-testid={`button-reject-dev-${dev.uid}`}
                          size="sm"
                          variant="destructive"
                          className="flex-1 h-8 text-xs gap-1"
                          onClick={() => rejectDev(dev.uid)}
                        >
                          <XCircle className="h-3 w-3" /> Reject
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Upload Moderation */}
          <TabsContent value="uploads">
            <h3 className="font-bold text-sm mb-3">Upload Moderation</h3>
            {uploads.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">No uploads to moderate.</Card>
            ) : (
              <div className="space-y-3">
                {uploads.map(upload => (
                  <Card key={upload.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-sm">{upload.title}</p>
                        <p className="text-xs text-muted-foreground">{upload.developerName} · {upload.category}</p>
                      </div>
                      <StatusBadge status={upload.status} />
                    </div>
                    {upload.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          data-testid={`button-approve-upload-${upload.id}`}
                          size="sm"
                          className="flex-1 h-8 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => approveUpload(upload.id)}
                        >
                          <CheckCircle className="h-3 w-3" /> Approve
                        </Button>
                        <Button
                          data-testid={`button-reject-upload-${upload.id}`}
                          size="sm"
                          variant="destructive"
                          className="flex-1 h-8 text-xs gap-1"
                          onClick={() => rejectUpload(upload.id)}
                        >
                          <XCircle className="h-3 w-3" /> Reject
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <h3 className="font-bold text-sm mb-3">All Users ({users.length})</h3>
            <div className="space-y-2">
              {users.length === 0 ? (
                <Card className="p-6 text-center text-sm text-muted-foreground">No users registered yet.</Card>
              ) : (
                users.map(user => (
                  <Card key={user.uid} className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {user.displayName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.displayName || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email || "Guest"}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-[9px]">{user.userType}</Badge>
                      {user.isBanned ? (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => unbanUser(user.uid)}>
                          Unban
                        </Button>
                      ) : (
                        <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2" onClick={() => banUser(user.uid)}>
                          <Ban className="h-2.5 w-2.5" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Site Config */}
          <TabsContent value="settings">
            <div className="space-y-4">
              <Card className="p-4 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Site Configuration</h3>
                <div className="space-y-2">
                  {["Homepage Banner 1 Text", "Homepage Banner 2 Text", "WhatsApp Link", "Telegram Link", "YouTube Link 1", "YouTube Link 2"].map(field => (
                    <div key={field}>
                      <p className="text-xs text-muted-foreground mb-1">{field}</p>
                      <Input className="h-9 text-xs" placeholder={`Enter ${field.toLowerCase()}`} />
                    </div>
                  ))}
                </div>
                <Button className="w-full">Save Configuration</Button>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">Show maintenance message to all users</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">Enable</Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
