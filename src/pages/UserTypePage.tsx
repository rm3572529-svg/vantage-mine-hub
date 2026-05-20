import { useState } from "react";
import { useLocation } from "wouter";
import { Gamepad2, Upload, Check } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import VantageLogo from "@/components/VantageLogo";

export default function UserTypePage() {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = useState<"normal" | "developer" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected || !currentUser) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), { userType: selected });
      if (selected === "developer") {
        setLocation("/developer-apply");
      } else {
        setLocation("/home");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <VantageLogo size={56} />
        <h1 className="text-xl font-black mt-3">Choose Your Role</h1>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
          How do you want to use Vantage Mine Hub?
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Card
          data-testid="card-normal-user"
          onClick={() => setSelected("normal")}
          className={`p-5 cursor-pointer transition-all border-2 ${
            selected === "normal"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/40"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Gamepad2 className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">Normal User</h3>
                {selected === "normal" && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Browse and download mods, follow developers, get the latest updates and announcements.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["Browse Mods", "Download APKs", "Follow Devs", "Get Notified"].map(f => (
                  <span key={f} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card
          data-testid="card-developer-user"
          onClick={() => setSelected("developer")}
          className={`p-5 cursor-pointer transition-all border-2 ${
            selected === "developer"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/40"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Extreme User</h3>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">DEVELOPER</span>
                </div>
                {selected === "developer" && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Upload mods and tools, build your developer profile, gain followers, and get verified badges.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["Upload Content", "Developer Profile", "Get Verified", "Build Audience"].map(f => (
                  <span key={f} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 pl-16">
            Requires admin approval. You'll fill out an application form.
          </p>
        </Card>

        <Button
          data-testid="button-continue"
          className="w-full h-12 font-bold mt-2"
          disabled={!selected || loading}
          onClick={handleContinue}
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
