import { useState } from "react";
import { useLocation } from "wouter";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LogOut, Edit2, Shield, Crown, Star, ChevronRight, User } from "lucide-react";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { currentUser, userProfile, logout } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    if (!currentUser || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), { displayName: displayName.trim() });
      toast({ title: "Profile updated!" });
      setEditing(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    setLocation("/");
  }

  if (!userProfile) return null;

  const loginMethod = currentUser?.isAnonymous ? "Guest" :
    currentUser?.providerData?.[0]?.providerId === "google.com" ? "Google" :
    currentUser?.providerData?.[0]?.providerId === "phone" ? "Phone" : "Email";

  return (
    <Layout>
      <div className="px-3 py-4 space-y-4 max-w-sm mx-auto">
        {/* Profile Header */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUser?.photoURL || ""} />
              <AvatarFallback className="bg-primary/20 text-primary font-black text-2xl">
                {userProfile.displayName?.[0]?.toUpperCase() || "V"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <Input
                    data-testid="input-display-name"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="h-9 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs" onClick={saveProfile} disabled={saving}>Save</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditing(false); setDisplayName(userProfile.displayName || ""); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p className="font-bold truncate">{userProfile.displayName || "Vantage User"}</p>
                    <button onClick={() => setEditing(true)}>
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{currentUser?.email || "Guest Account"}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Badge variant="secondary" className="text-[10px] capitalize">{userProfile.userType}</Badge>
                    <Badge variant="outline" className="text-[10px]">{loginMethod}</Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Developer Status */}
        {userProfile.userType === "developer" || userProfile.developerStatus !== "none" ? (
          <Card className="p-4">
            <p className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Developer Status
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {userProfile.developerStatus === "approved" && (
                  <>
                    <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 gap-0.5"><Shield className="h-2.5 w-2.5" />Verified</Badge>
                    <Badge className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30 gap-0.5"><Star className="h-2.5 w-2.5" />Trusted</Badge>
                  </>
                )}
                {userProfile.developerStatus === "pending" && (
                  <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending Review</Badge>
                )}
                {userProfile.developerStatus === "rejected" && (
                  <Badge className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>
                )}
              </div>
              {userProfile.developerStatus === "approved" && (
                <Button size="sm" className="h-7 text-xs" onClick={() => setLocation("/developer-dashboard")}>
                  Dashboard
                </Button>
              )}
            </div>
          </Card>
        ) : null}

        {/* Quick Links */}
        <Card className="divide-y divide-border">
          {[
            { label: "My Developer Profile", href: `/developer/${currentUser?.uid}`, icon: User, show: userProfile.developerStatus === "approved" },
            { label: "Developer Dashboard", href: "/developer-dashboard", icon: Crown, show: userProfile.developerStatus === "approved" },
            { label: "Become a Developer", href: "/developer-apply", icon: Shield, show: userProfile.developerStatus === "none" },
            { label: "Admin Panel", href: "/admin", icon: Shield, show: true },
          ].filter(i => i.show).map(item => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              onClick={() => setLocation(item.href)}
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </Card>

        {/* Account Info */}
        <Card className="p-4 space-y-3">
          <p className="font-semibold text-sm">Account Details</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-[10px] truncate max-w-[150px]">{currentUser?.uid?.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Login Method</span>
              <span>{loginMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type</span>
              <span className="capitalize">{userProfile.userType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span>{userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>
        </Card>

        <Separator />

        <Button
          data-testid="button-logout"
          variant="destructive"
          className="w-full h-11 font-bold gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          Vantage Mine Hub · Official Platform · v1.0.0
        </p>
      </div>
    </Layout>
  );
}
