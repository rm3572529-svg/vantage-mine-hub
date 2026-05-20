import { useState } from "react";
import { useLocation } from "wouter";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, BarChart3, FileText, Settings, Clock, CheckCircle, XCircle } from "lucide-react";

const DEMO_UPLOADS = [
  { id: "1", title: "My New Mod v1.0", category: "Mod", status: "approved", downloads: 1200, createdAt: "2024-01-15" },
  { id: "2", title: "Shader Pack Ultra", category: "Shader Pack", status: "pending", downloads: 0, createdAt: "2024-01-20" },
  { id: "3", title: "Utility Tool Beta", category: "Utility APK", status: "rejected", downloads: 0, createdAt: "2024-01-10" },
];

const STATUS_BADGE: Record<string, { label: string; className: string; icon: any }> = {
  approved: { label: "Approved", className: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  pending: { label: "Pending Review", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  rejected: { label: "Rejected", className: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
};

export default function DeveloperDashboardPage() {
  const [, setLocation] = useLocation();
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "", category: "", description: "", version: "", changelog: "",
    downloadLink: "", installGuide: "", tags: "",
    screenshot1: "", screenshot2: "", screenshot3: "",
    bannerImage: "", setupVideo: "", gameplayVideo: "",
  });

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  if (!userProfile) return null;

  if (userProfile.developerStatus !== "approved") {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto">
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold">Application Under Review</h2>
          <p className="text-sm text-muted-foreground">
            Your developer application is currently being reviewed by the admin team. You'll be notified once approved.
          </p>
          {userProfile.developerStatus === "none" && (
            <Button onClick={() => setLocation("/developer-apply")}>Apply as Developer</Button>
          )}
          <Button variant="ghost" onClick={() => setLocation("/home")}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  async function handleUpload() {
    if (!currentUser) return;
    if (!form.title || !form.category || !form.downloadLink) {
      toast({ title: "Missing fields", description: "Title, category, and download link are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const screenshots = [form.screenshot1, form.screenshot2, form.screenshot3].filter(Boolean);
      await addDoc(collection(db, "uploads"), {
        ...form,
        screenshots,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        developerId: currentUser.uid,
        developerName: userProfile.displayName || "Developer",
        status: "pending",
        downloads: 0,
        views: 0,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Upload submitted!", description: "Your mod is pending admin review." });
      setForm({ title: "", category: "", description: "", version: "", changelog: "", downloadLink: "", installGuide: "", tags: "", screenshot1: "", screenshot2: "", screenshot3: "", bannerImage: "", setupVideo: "", gameplayVideo: "" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="px-3 pt-4 pb-4">
        <div className="mb-4">
          <h1 className="text-lg font-black">Developer Dashboard</h1>
          <p className="text-xs text-muted-foreground">Manage your uploads and profile</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="text-xs gap-1"><BarChart3 className="h-3 w-3" />Stats</TabsTrigger>
            <TabsTrigger value="uploads" className="text-xs gap-1"><FileText className="h-3 w-3" />Uploads</TabsTrigger>
            <TabsTrigger value="new" className="text-xs gap-1"><Upload className="h-3 w-3" />New</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1"><Settings className="h-3 w-3" />Profile</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Total Uploads", value: "3", color: "text-blue-400" },
                { label: "Total Downloads", value: "1,200", color: "text-primary" },
                { label: "Total Views", value: "4,800", color: "text-purple-400" },
                { label: "Followers", value: "42", color: "text-yellow-400" },
              ].map(s => (
                <Card key={s.label} className="p-4">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </Card>
              ))}
            </div>
            <Card className="p-4 bg-primary/5 border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <p className="font-semibold text-sm">Developer Status: Approved</p>
              </div>
              <p className="text-xs text-muted-foreground">Your developer account is active. Upload quality content and build your audience!</p>
            </Card>
          </TabsContent>

          {/* My Uploads */}
          <TabsContent value="uploads">
            <div className="space-y-3">
              {DEMO_UPLOADS.map(upload => {
                const status = STATUS_BADGE[upload.status] || STATUS_BADGE["pending"];
                return (
                  <Card key={upload.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-sm">{upload.title}</p>
                        <p className="text-xs text-muted-foreground">{upload.category} · {upload.createdAt}</p>
                      </div>
                      <Badge className={`text-[10px] border shrink-0 ${status.className}`}>
                        {status.label}
                      </Badge>
                    </div>
                    {upload.status === "approved" && (
                      <p className="text-xs text-muted-foreground">{upload.downloads.toLocaleString()} downloads</p>
                    )}
                    {upload.status === "rejected" && (
                      <p className="text-xs text-red-400">Contact admin for rejection reason.</p>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Upload New */}
          <TabsContent value="new">
            <div className="space-y-4">
              <Card className="p-3 bg-yellow-500/5 border-yellow-500/30">
                <p className="text-xs text-yellow-400">All uploads require admin approval before going live. Ensure your content follows our guidelines.</p>
              </Card>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">APK Title *</Label>
                <Input data-testid="input-upload-title" placeholder="My Amazing Mod v1.0" value={form.title} onChange={e => setF("title", e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category *</Label>
                <Select value={form.category} onValueChange={v => setF("category", v)}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Mod", "Tool", "Texture Pack", "Shader Pack", "Utility APK"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
                <Textarea data-testid="textarea-description" placeholder="Describe your mod..." value={form.description} onChange={e => setF("description", e.target.value)} rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Version</Label>
                  <Input data-testid="input-version" placeholder="1.0.0" value={form.version} onChange={e => setF("version", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tags</Label>
                  <Input data-testid="input-tags" placeholder="pvp, fps, tool" value={form.tags} onChange={e => setF("tags", e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">MediaFire Download Link *</Label>
                <Input data-testid="input-download-link" placeholder="https://mediafire.com/file/..." value={form.downloadLink} onChange={e => setF("downloadLink", e.target.value)} type="url" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Banner Image URL</Label>
                <Input placeholder="https://..." value={form.bannerImage} onChange={e => setF("bannerImage", e.target.value)} type="url" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Setup Video URL (YouTube)</Label>
                  <Input placeholder="https://youtube.com/watch?v=..." value={form.setupVideo} onChange={e => setF("setupVideo", e.target.value)} type="url" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gameplay Video URL</Label>
                  <Input placeholder="https://youtube.com/watch?v=..." value={form.gameplayVideo} onChange={e => setF("gameplayVideo", e.target.value)} type="url" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Screenshots (URLs)</Label>
                {[form.screenshot1, form.screenshot2, form.screenshot3].map((val, i) => (
                  <Input key={i} placeholder={`Screenshot ${i + 1} URL`} value={val} onChange={e => setF(`screenshot${i + 1}`, e.target.value)} type="url" />
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Installation Guide</Label>
                <Textarea placeholder="Step-by-step installation instructions..." value={form.installGuide} onChange={e => setF("installGuide", e.target.value)} rows={3} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Changelog</Label>
                <Textarea placeholder="What's new in this version?" value={form.changelog} onChange={e => setF("changelog", e.target.value)} rows={3} />
              </div>

              <Button data-testid="button-submit-upload" className="w-full h-12 font-bold gap-2" onClick={handleUpload} disabled={loading}>
                <Upload className="h-4 w-4" />
                {loading ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="settings">
            <div className="space-y-4">
              <Card className="p-4">
                <p className="font-semibold text-sm mb-3">Developer Profile</p>
                <div className="space-y-3">
                  {[
                    { label: "Developer Logo URL", key: "logo" },
                    { label: "Banner Image URL", key: "banner" },
                    { label: "YouTube Channel 1", key: "youtube1" },
                    { label: "YouTube Channel 2", key: "youtube2" },
                    { label: "Instagram", key: "instagram" },
                    { label: "Telegram", key: "telegram" },
                    { label: "WhatsApp", key: "whatsapp" },
                    { label: "Discord", key: "discord" },
                  ].map(field => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{field.label}</Label>
                      <Input placeholder="https://..." className="h-9" />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">About</Label>
                    <Textarea placeholder="Tell the Vantage Army about yourself..." rows={3} />
                  </div>
                  <Button className="w-full">Save Profile</Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
