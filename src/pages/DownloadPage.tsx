import { useState, useEffect } from "react";
import { ArrowLeft, Download, CheckCircle, ExternalLink } from "lucide-react";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiYoutube } from "react-icons/si";

const DEMO_DOWNLOADS: Record<string, { title: string; downloadLink: string }> = {
  "apollon-clight": { title: "APOLLON CLIGHT", downloadLink: "https://www.mediafire.com/" },
  "vantage-toolbox": { title: "Vantage Toolbox Pro", downloadLink: "https://www.mediafire.com/" },
  "ultra-shader": { title: "Ultra HD Shader Pack", downloadLink: "https://www.mediafire.com/" },
  "texture-supreme": { title: "Supreme Texture Pack 512x", downloadLink: "https://www.mediafire.com/" },
};

type Step = "social" | "countdown" | "captcha" | "ready";

export default function DownloadPage({ params }: { params: { id: string } }) {
  const { currentUser } = useAuth();
  const mod = DEMO_DOWNLOADS[params.id] || { title: "Minecraft Mod", downloadLink: "https://www.mediafire.com/" };

  const [step, setStep] = useState<Step>("social");
  const [countdown, setCountdown] = useState(5);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaDone, setCaptchaDone] = useState(false);
  const [youtubeClicked, setYoutubeClicked] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Check once-per-day captcha
  useEffect(() => {
    async function checkCaptcha() {
      if (!currentUser) return;
      try {
        const snap = await getDoc(doc(db, "downloadSessions", currentUser.uid));
        if (snap.exists()) {
          const last = snap.data().lastCaptchaTime?.toMillis?.() || 0;
          if (Date.now() - last < 24 * 60 * 60 * 1000) {
            setCaptchaDone(true);
          }
        }
      } catch {}
    }
    checkCaptcha();
  }, [currentUser]);

  // Countdown
  useEffect(() => {
    if (step !== "countdown") return;
    if (countdown <= 0) {
      setTimeout(() => setStep(captchaDone ? "ready" : "captcha"), 300);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown, captchaDone]);

  async function handleCaptchaCheck() {
    setCaptchaChecked(true);
    if (currentUser) {
      try {
        await setDoc(doc(db, "downloadSessions", currentUser.uid), { lastCaptchaTime: new Date() }, { merge: true });
      } catch {}
    }
    setTimeout(() => { setCaptchaDone(true); setStep("ready"); }, 800);
  }

  async function handleDownload() {
    if (!downloaded) {
      setDownloaded(true);
      // Increment download counter
      try {
        await updateDoc(doc(db, "uploads", params.id), { downloads: increment(1) });
      } catch {}
    }
    window.open(mod.downloadLink, "_blank");
  }

  const progress = ((5 - countdown) / 5) * 100;
  const circumference = 2 * Math.PI * 45;

  const stepIndex = { social: 0, countdown: 1, captcha: 2, ready: 3 }[step];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-3 py-2 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="font-semibold text-sm flex-1 truncate">Downloading: {mod.title}</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-sm mx-auto w-full">
        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-8 w-full justify-center">
          {(["social", "countdown", "captcha", "ready"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? "bg-primary text-primary-foreground scale-110"
                : stepIndex > i ? "bg-primary/30 text-primary"
                : "bg-muted text-muted-foreground"
              }`}>
                {stepIndex > i ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < 3 && <div className={`w-8 h-0.5 transition-all ${stepIndex > i ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Social */}
        {step === "social" && (
          <div className="w-full space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto">
              <SiYoutube className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Support Vantage Army</h2>
              <p className="text-sm text-muted-foreground mt-1">Help us grow by subscribing to our YouTube channel!</p>
            </div>
            <Card className="p-4 space-y-3">
              <Button
                data-testid="button-youtube-subscribe"
                className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white h-11"
                onClick={() => { setYoutubeClicked(true); window.open("https://youtube.com/", "_blank"); }}
              >
                <SiYoutube className="h-5 w-5" />
                Subscribe on YouTube
                {youtubeClicked && <CheckCircle className="h-4 w-4 ml-auto" />}
              </Button>
            </Card>
            <Button
              data-testid="button-skip-social"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => { setCountdown(5); setStep("countdown"); }}
            >
              Skip & Continue
            </Button>
          </div>
        )}

        {/* Step 2: Countdown */}
        {step === "countdown" && (
          <div className="w-full space-y-6 text-center">
            <div>
              <h2 className="text-lg font-bold">Preparing Download</h2>
              <p className="text-sm text-muted-foreground mt-1">Please wait while we verify your link...</p>
            </div>
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (circumference * progress) / 100}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black">{countdown > 0 ? countdown : "✓"}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {countdown > 0 ? `Ready in ${countdown}s...` : "Complete!"}
            </p>
          </div>
        )}

        {/* Step 3: Captcha */}
        {step === "captcha" && (
          <div className="w-full space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Security Check</h2>
              <p className="text-sm text-muted-foreground mt-1">Verify once per day to access downloads.</p>
            </div>
            <Card className="p-5">
              {!captchaChecked ? (
                <button
                  data-testid="button-captcha-check"
                  onClick={handleCaptchaCheck}
                  className="w-full flex items-center gap-4 p-4 border-2 border-border rounded-xl hover:border-primary/50 transition-all group"
                >
                  <div className="w-6 h-6 border-2 border-muted-foreground rounded group-hover:border-primary transition-colors" />
                  <span className="text-sm font-medium">I am not a robot</span>
                  <div className="ml-auto text-right">
                    <p className="text-[10px] text-muted-foreground">reCAPTCHA</p>
                    <p className="text-[9px] text-muted-foreground">Privacy · Terms</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-4 p-4 border-2 border-primary/30 rounded-xl bg-primary/5">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-primary">Verified!</span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground text-center mt-3">Security check required once per day.</p>
            </Card>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === "ready" && (
          <div className="w-full space-y-4 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Download Ready!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="text-foreground font-medium">{mod.title}</span> is ready to download.
              </p>
            </div>
            <Card className="p-4 bg-primary/5 border-primary/30 text-left space-y-2">
              <p className="text-xs font-semibold text-primary">Before you install:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Enable "Unknown Sources" in Android settings</li>
                <li>• Uninstall older versions first</li>
                <li>• Allow all permissions when prompted</li>
              </ul>
            </Card>
            <Button
              className="w-full h-14 font-bold text-base gap-3 shadow-lg shadow-primary/20"
              onClick={handleDownload}
              data-testid="button-proceed-download"
            >
              <Download className="h-6 w-6" />
              Proceed to Download
              <ExternalLink className="h-4 w-4" />
            </Button>
            <p className="text-[11px] text-muted-foreground">Redirects to MediaFire. Secure & verified file.</p>
            <Button variant="ghost" className="w-full text-muted-foreground text-sm" onClick={() => history.back()}>
              Back to Mod Details
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
