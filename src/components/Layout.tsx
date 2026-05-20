import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Home, Compass, Upload, Bell, User, Menu, Search, X, Shield, LogOut, LayoutDashboard, Crown, Bookmark } from "lucide-react";
import { SiWhatsapp, SiTelegram, SiDiscord, SiInstagram, SiYoutube } from "react-icons/si";
import { useAuth } from "@/contexts/AuthContext";
import VantageLogo from "@/components/VantageLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface LayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

const socialLinks = [
  { icon: SiWhatsapp, href: "https://wa.me/", color: "#25D366", label: "WhatsApp" },
  { icon: SiTelegram, href: "https://t.me/", color: "#229ED9", label: "Telegram" },
  { icon: SiYoutube, href: "https://youtube.com/", color: "#FF0000", label: "YouTube" },
  { icon: SiInstagram, href: "https://instagram.com/", color: "#E4405F", label: "Instagram" },
  { icon: SiDiscord, href: "https://discord.gg/", color: "#5865F2", label: "Discord" },
];

export default function Layout({ children, searchQuery = "", onSearchChange }: LayoutProps) {
  const [location] = useLocation();
  const { currentUser, userProfile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSocial, setShowSocial] = useState(false);

  const tabs = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/explore", icon: Compass, label: "Explore" },
    { path: "/leaderboard", icon: Crown, label: "Ranks" },
    { path: "/notifications", icon: Bell, label: "Alerts" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) =>
    path === "/home" ? location === "/home" || location === "/"
    : location.startsWith(path);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-2 px-3 py-2 max-w-2xl mx-auto">
          <Link href="/home">
            <a className="flex items-center gap-2 shrink-0">
              <VantageLogo size={32} />
              <span className="font-bold text-sm hidden sm:block">Vantage Mine Hub</span>
            </a>
          </Link>

          <div className="flex-1">
            {searchOpen || onSearchChange ? (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  data-testid="input-search"
                  placeholder="Search mods, tools..."
                  value={searchQuery}
                  onChange={e => onSearchChange?.(e.target.value)}
                  className="pl-9 h-9 bg-muted border-0 text-sm"
                  autoFocus
                />
              </div>
            ) : (
              <button
                data-testid="button-search-toggle"
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm"
              >
                <Search className="h-4 w-4" />
                <span>Search mods, tools...</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {searchOpen && (
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Link href="/notifications">
              <a className="relative p-2 rounded-full hover:bg-muted transition-colors">
                <Bell className="h-5 w-5" />
              </a>
            </Link>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" data-testid="button-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-background border-border p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border bg-card">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={currentUser?.photoURL || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {userProfile?.displayName?.[0]?.toUpperCase() || "V"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{userProfile?.displayName || "Vantage User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentUser?.email || "Guest"}</p>
                        <Badge variant="secondary" className="text-xs mt-1 capitalize">{userProfile?.userType || "normal"}</Badge>
                      </div>
                    </div>
                  </div>

                  <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {[
                      { href: "/home", icon: Home, label: "Home" },
                      { href: "/explore", icon: Compass, label: "Explore" },
                      { href: "/leaderboard", icon: Crown, label: "Leaderboard" },
                      { href: "/bookmarks", icon: Bookmark, label: "Saved Mods" },
                      { href: "/notifications", icon: Bell, label: "Notifications" },
                      { href: "/profile", icon: User, label: "Profile" },
                    ].map(item => (
                      <Link key={item.href} href={item.href}>
                        <a
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${isActive(item.href) ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </a>
                      </Link>
                    ))}

                    <Separator className="my-2" />

                    {userProfile?.developerStatus === "approved" && (
                      <Link href="/developer-dashboard">
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm" onClick={() => setMenuOpen(false)}>
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                          Developer Dashboard
                        </a>
                      </Link>
                    )}
                    {(userProfile?.developerStatus === "none" || !userProfile?.developerStatus) && (
                      <Link href="/developer-apply">
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm" onClick={() => setMenuOpen(false)}>
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          Become a Developer
                        </a>
                      </Link>
                    )}
                    <Link href="/admin">
                      <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm" onClick={() => setMenuOpen(false)}>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        Admin Panel
                      </a>
                    </Link>

                    <Separator className="my-2" />

                    <div className="px-3 py-2">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Social</p>
                      <div className="flex gap-2 flex-wrap">
                        {socialLinks.map(s => (
                          <a
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={s.label}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                            style={{ backgroundColor: `${s.color}25` }}
                          >
                            <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                          </a>
                        ))}
                      </div>
                    </div>
                  </nav>

                  <div className="p-3 border-t border-border">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => { logout(); setMenuOpen(false); }}
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-2xl mx-auto px-1 py-1">
          {tabs.map(tab => {
            const active = isActive(tab.path);
            return (
              <Link key={tab.path} href={tab.path}>
                <a
                  data-testid={`tab-${tab.label.toLowerCase()}`}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <tab.icon className={`h-5 w-5 shrink-0 ${active ? "stroke-[2.5]" : ""}`} />
                  <span className="text-[10px] font-medium truncate">{tab.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Social Bar */}
      <div className="fixed right-3 bottom-24 z-40 flex flex-col items-end gap-2">
        <div className={`flex flex-col gap-2 transition-all duration-300 ${showSocial ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
          {socialLinks.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={s.label}
              className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
              style={{ backgroundColor: s.color }}
            >
              <s.icon className="h-5 w-5 text-white" />
            </a>
          ))}
        </div>
        <button
          data-testid="button-social-toggle"
          onClick={() => setShowSocial(v => !v)}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-primary text-primary-foreground transition-all hover:scale-110 active:scale-95 ${showSocial ? "rotate-45" : ""}`}
        >
          <SiWhatsapp className={`h-6 w-6 transition-all ${showSocial ? "opacity-0 scale-50 absolute" : ""}`} />
          <X className={`h-5 w-5 transition-all ${!showSocial ? "opacity-0 scale-50 absolute" : ""}`} />
        </button>
      </div>
    </div>
  );
}
