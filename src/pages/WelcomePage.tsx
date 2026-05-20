import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { SiGoogle } from "react-icons/si";
import { Phone, Mail, UserX, Eye, EyeOff, ChevronDown, ChevronUp, Shield, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import VantageLogo from "@/components/VantageLogo";
import { RecaptchaVerifier } from "firebase/auth";

type AuthTab = "google" | "phone" | "email" | "guest";

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, setupRecaptcha, sendPhoneOTP, verifyPhoneOTP } = useAuth();
  const { toast } = useToast();

  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab | null>(null);
  const [loading, setLoading] = useState(false);

  // Email
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  async function handleGoogle() {
    if (!agreed) return;
    setLoading(true);
    try {
      await loginWithGoogle();
      setLocation("/home");
    } catch (e: any) {
      toast({ title: "Login failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleEmail() {
    if (!agreed) return;
    setLoading(true);
    try {
      if (emailMode === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName);
      }
      setLocation("/home");
    } catch (e: any) {
      toast({ title: "Auth failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOTP() {
    if (!phone) return;
    setLoading(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = setupRecaptcha("recaptcha-container");
      }
      const vid = await sendPhoneOTP(phone, recaptchaRef.current);
      setVerificationId(vid);
      setOtpSent(true);
      toast({ title: "OTP Sent", description: "Check your SMS for the verification code." });
    } catch (e: any) {
      toast({ title: "OTP Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    setLoading(true);
    try {
      await verifyPhoneOTP(verificationId, otp);
      setLocation("/home");
    } catch (e: any) {
      toast({ title: "Verification failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    if (!agreed) return;
    setLoading(true);
    try {
      await loginAsGuest();
      setLocation("/home");
    } catch (e: any) {
      toast({ title: "Guest login failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div id="recaptcha-container" className="hidden" />

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <VantageLogo size={72} />
        <h1 className="text-2xl font-black mt-3 text-foreground tracking-tight">VANTAGE MINE HUB</h1>
        <p className="text-xs text-primary font-medium tracking-widest mt-1">OFFICIAL PLATFORM</p>
      </div>

      {/* Welcome message */}
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-4 mb-5">
        <p className="text-sm text-muted-foreground leading-relaxed text-center">
          Welcome <span className="text-primary font-semibold">Vantage Army</span> to our official website. Here you can find all Minecraft tools and mods. You can also upload and promote your own mods and tools here.
        </p>
      </div>

      {/* Auth Buttons */}
      <div className="w-full max-w-sm space-y-2.5">
        {/* Google */}
        <Button
          data-testid="button-google-login"
          className="w-full h-12 text-sm font-semibold gap-3 bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
          disabled={!agreed || loading}
          onClick={handleGoogle}
        >
          <SiGoogle className="h-5 w-5" />
          Continue with Google
        </Button>

        {/* Phone */}
        <div className="space-y-2">
          <Button
            data-testid="button-phone-toggle"
            variant={activeTab === "phone" ? "secondary" : "outline"}
            className="w-full h-12 text-sm font-semibold gap-3"
            disabled={!agreed}
            onClick={() => setActiveTab(activeTab === "phone" ? null : "phone")}
          >
            <Phone className="h-5 w-5" />
            Phone Number + OTP
          </Button>
          {activeTab === "phone" && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              {!otpSent ? (
                <>
                  <Input
                    data-testid="input-phone"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="h-10"
                    type="tel"
                  />
                  <Button className="w-full" onClick={handleSendOTP} disabled={loading || !phone}>
                    {loading ? "Sending..." : "Send OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to {phone}</p>
                  <Input
                    data-testid="input-otp"
                    placeholder="123456"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    maxLength={6}
                    className="h-10 text-center tracking-widest text-lg"
                  />
                  <Button className="w-full" onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
                    {loading ? "Verifying..." : "Verify & Login"}
                  </Button>
                  <button onClick={() => setOtpSent(false)} className="text-xs text-primary underline">
                    Change number
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Button
            data-testid="button-email-toggle"
            variant={activeTab === "email" ? "secondary" : "outline"}
            className="w-full h-12 text-sm font-semibold gap-3"
            disabled={!agreed}
            onClick={() => setActiveTab(activeTab === "email" ? null : "email")}
          >
            <Mail className="h-5 w-5" />
            Email &amp; Password
          </Button>
          {activeTab === "email" && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                <button
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${emailMode === "login" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  onClick={() => setEmailMode("login")}
                >Sign In</button>
                <button
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${emailMode === "register" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  onClick={() => setEmailMode("register")}
                >Register</button>
              </div>
              {emailMode === "register" && (
                <Input
                  data-testid="input-display-name"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="h-10"
                />
              )}
              <Input
                data-testid="input-email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                className="h-10"
              />
              <div className="relative">
                <Input
                  data-testid="input-password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="h-10 pr-10"
                />
                <button className="absolute right-3 top-2.5 text-muted-foreground" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button className="w-full" onClick={handleEmail} disabled={loading || !email || !password}>
                {loading ? "Please wait..." : emailMode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </div>
          )}
        </div>

        {/* Guest */}
        <Button
          data-testid="button-guest-login"
          variant="ghost"
          className="w-full h-12 text-sm font-semibold gap-3 text-muted-foreground border border-dashed border-border hover:border-primary/50"
          disabled={!agreed || loading}
          onClick={handleGuest}
        >
          <UserX className="h-5 w-5" />
          Browse as Guest
        </Button>
      </div>

      {/* Terms */}
      <div className="w-full max-w-sm mt-5 space-y-3">
        <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-3">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={v => setAgreed(!!v)}
            data-testid="checkbox-terms"
            className="mt-0.5"
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
            I agree to the{" "}
            <button onClick={() => setShowTerms(v => !v)} className="text-primary underline">
              Terms &amp; Conditions
            </button>
            . You must agree to continue.
          </label>
        </div>

        {showTerms && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-destructive font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Terms &amp; Conditions
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <p><span className="text-foreground font-medium">Copyright Warning:</span> All content on this platform is copyrighted. Redistribution without permission is strictly prohibited.</p>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <p><span className="text-foreground font-medium">Scam Warning:</span> Beware of fake websites or links impersonating Vantage Mine Hub. Only trust this official platform.</p>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <p><span className="text-foreground font-medium">Virus Disclaimer:</span> While we review all uploads, we do not guarantee every APK is 100% safe. Use at your own risk.</p>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <p><span className="text-foreground font-medium">Liability:</span> The developer of this platform is not responsible for any damages, data loss, or harm resulting from downloads.</p>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <p><span className="text-foreground font-medium">Account:</span> Do not share your account. Accounts found abusing the platform will be permanently banned.</p>
              </div>
            </div>
            <button onClick={() => setShowTerms(false)} className="text-primary underline text-xs">
              Close Terms
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground mt-6 text-center">
        Vantage Mine Hub &copy; 2024 — Official Vantage Army Platform
      </p>
    </div>
  );
}
