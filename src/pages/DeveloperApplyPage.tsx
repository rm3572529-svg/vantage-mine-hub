import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Send, Clock } from "lucide-react";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function DeveloperApplyPage() {
  const [, setLocation] = useLocation();
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    youtubeName: "",
    youtubeLink: "",
    instagram: "",
    telegram: "",
    about: "",
  });

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    if (!currentUser) return;
    if (!form.fullName || !form.about) {
      toast({ title: "Missing fields", description: "Please fill in your name and about section.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, "developers", currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        ...form,
        status: "pending",
        followers: 0,
        totalDownloads: 0,
        totalViews: 0,
        totalUploads: 0,
        verifiedBadge: false,
        trustedBadge: false,
        vipBadge: false,
        logo: currentUser.photoURL || "",
        banner: "",
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "users", currentUser.uid), {
        developerStatus: "pending",
      });
      setSubmitted(true);
    } catch (e: any) {
      toast({ title: "Submit failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleBackToNormal() {
    if (!currentUser) return;
    await updateDoc(doc(db, "users", currentUser.uid), { userType: "normal", developerStatus: "none" });
    setLocation("/home");
  }

  if (userProfile?.developerStatus === "pending" || submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Clock className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Application Submitted!</h2>
          <p className="text-sm text-muted-foreground">
            Your developer application is under review. The admin team will review your application and notify you once approved. This usually takes 24-48 hours.
          </p>
          <div className="bg-card border border-border rounded-xl p-4 text-left space-y-2">
            <p className="text-xs text-muted-foreground">While you wait, you can still:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Browse and download mods</li>
              <li>• Follow other developers</li>
              <li>• Explore content on the platform</li>
            </ul>
          </div>
          <Button className="w-full" onClick={() => setLocation("/home")}>
            Go to Homepage
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground text-sm" onClick={handleBackToNormal}>
            Back to Normal User
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/user-type")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Developer Application</h1>
            <p className="text-xs text-muted-foreground">Tell us about yourself</p>
          </div>
        </div>

        <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
          <p className="text-xs text-muted-foreground">
            As a developer, you'll be able to upload mods, tools, texture packs and more. Your profile will be visible to the entire Vantage Army community.
          </p>
        </Card>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name *</Label>
            <Input
              data-testid="input-full-name"
              placeholder="Your full name"
              value={form.fullName}
              onChange={e => set("fullName", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</Label>
            <Input
              data-testid="input-phone"
              placeholder="+1 234 567 8900"
              value={form.phone}
              onChange={e => set("phone", e.target.value)}
              type="tel"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">YouTube Channel Name</Label>
            <Input
              data-testid="input-youtube-name"
              placeholder="My Minecraft Channel"
              value={form.youtubeName}
              onChange={e => set("youtubeName", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">YouTube Channel Link</Label>
            <Input
              data-testid="input-youtube-link"
              placeholder="https://youtube.com/@channel"
              value={form.youtubeLink}
              onChange={e => set("youtubeLink", e.target.value)}
              type="url"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Instagram Username</Label>
            <Input
              data-testid="input-instagram"
              placeholder="@username"
              value={form.instagram}
              onChange={e => set("instagram", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Telegram Username</Label>
            <Input
              data-testid="input-telegram"
              placeholder="@username"
              value={form.telegram}
              onChange={e => set("telegram", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">About You *</Label>
            <Textarea
              data-testid="textarea-about"
              placeholder="Tell us about yourself, your experience with Minecraft modding, and what kind of content you plan to upload..."
              value={form.about}
              onChange={e => set("about", e.target.value)}
              rows={4}
            />
          </div>

          <Button
            data-testid="button-submit-application"
            className="w-full h-12 font-bold gap-2"
            onClick={handleSubmit}
            disabled={loading || !form.fullName || !form.about}
          >
            <Send className="h-4 w-4" />
            {loading ? "Submitting..." : "Submit Application"}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground text-sm"
            onClick={handleBackToNormal}
          >
            I'll stay as a Normal User
          </Button>
        </div>
      </div>
    </div>
  );
}
