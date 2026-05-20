import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Layout from "@/components/Layout";
import ModCard, { Mod } from "@/components/ModCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Download, Users, Star, TrendingUp, Bell, Gift, ChevronRight, Zap, Trophy } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Link } from "wouter";

const DEMO_MODS: Mod[] = [
  { id: "apollon-clight", title: "APOLLON CLIGHT", description: "Official Vantage performance and visual enhancement mod.", category: "Mod", version: "3.2.1", downloads: 125000, views: 450000, bannerImage: "", developerId: "vantage", developerName: "Vantage Official", status: "approved", isVIP: true, isOfficial: true, tags: ["official"], createdAt: new Date().toISOString() },
  { id: "vantage-toolbox", title: "Vantage Toolbox Pro", description: "All-in-one Minecraft utility tool with anti-ban & fps boost.", category: "Tool", version: "2.0.5", downloads: 87000, views: 200000, bannerImage: "", developerId: "vantage", developerName: "Vantage Official", status: "approved", isVIP: true, tags: ["utility"], createdAt: new Date().toISOString() },
  { id: "ultra-shader", title: "Ultra HD Shader Pack", description: "Next-gen shaders with ray tracing effects.", category: "Shader Pack", version: "1.5.0", downloads: 43000, views: 110000, bannerImage: "", developerId: "dev1", developerName: "ShaderMaster", status: "approved", tags: ["shaders"], createdAt: new Date().toISOString() },
  { id: "texture-supreme", title: "Supreme Texture Pack 512x", description: "Photorealistic 512x texture pack.", category: "Texture Pack", version: "4.1.0", downloads: 62000, views: 180000, bannerImage: "", developerId: "dev2", developerName: "TexturePro", status: "approved", tags: ["textures"], createdAt: new Date().toISOString() },
  { id: "fps-utility", title: "FPS Optimizer Pro", description: "Boost your Minecraft FPS by up to 300%.", category: "Utility APK", version: "3.0.1", downloads: 45000, views: 120000, bannerImage: "", developerId: "dev6", developerName: "FPS_Master", status: "approved", tags: ["performance"], createdAt: new Date().toISOString() },
];

const HERO_SLIDES = [
  { id: 1, title: "APOLLON CLIGHT v3.2.1", subtitle: "Official Vantage Release — Now Live", cta: "Download Now", href: "/mod/apollon-clight", badge: "NEW RELEASE", accentColor: "from-primary/40" },
  { id: 2, title: "Vantage Toolbox Pro", subtitle: "The Ultimate Minecraft Utility", cta: "Get It Free", href: "/mod/vantage-toolbox", badge: "VIP", accentColor: "from-yellow-500/30" },
  { id: 3, title: "Leaderboard is Live!", subtitle: "See the top mods & developers", cta: "View Rankings", href: "/leaderboard", badge: "COMMUNITY", accentColor: "from-blue-500/30" },
];

const TOP_DEVS = [
  { id: "vantage", name: "Vantage Official", uploads: 24, verified: true, vip: true },
  { id: "dev2", name: "TexturePro", uploads: 12, verified: true },
  { id: "dev1", name: "ShaderMaster", uploads: 8, verified: true },
  { id: "dev6", name: "FPS_Master", uploads: 6 },
  { id: "dev4", name: "PvPKing", uploads: 15 },
];

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [siteStats, setSiteStats] = useState({ visitorCount: 1248352, downloadCount: 3842910 });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "siteConfig", "main"), snap => {
      if (snap.exists()) {
        const d = snap.data();
        setSiteStats(s => ({
          visitorCount: d.visitorCount || s.visitorCount,
          downloadCount: d.downloadCount || s.downloadCount,
        }));
      }
    });
    return unsub;
  }, []);

  const trending = DEMO_MODS.filter(m => m.downloads > 40000);
  const vipMods = DEMO_MODS.filter(m => m.isVIP);
  const latest = [...DEMO_MODS].reverse();
  const apollon = DEMO_MODS[0];

  return (
    <Layout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="space-y-6 pb-4">

        {/* Hero Banner Carousel */}
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {HERO_SLIDES.map(slide => (
              <CarouselItem key={slide.id}>
                <div className="relative mx-3 mt-3 rounded-2xl overflow-hidden border border-border min-h-[168px] flex flex-col justify-end p-5"
                  style={{ background: "linear-gradient(145deg, hsl(232 28% 20%), hsl(232 28% 13%))" }}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.accentColor} to-transparent`} />
                  <div className="relative z-10">
                    <Badge className="text-[10px] mb-2 bg-primary/20 text-primary border-primary/30">{slide.badge}</Badge>
                    <h2 className="text-xl font-black leading-tight">{slide.title}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5 mb-3">{slide.subtitle}</p>
                    <Button size="sm" className="h-8 text-xs font-bold shadow-md" onClick={() => setLocation(slide.href)}>
                      {slide.cta}
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 px-3">
          {[
            { icon: Users, label: "Visitors", value: (siteStats.visitorCount / 1000).toFixed(0) + "K+", color: "text-blue-400" },
            { icon: Download, label: "Downloads", value: (siteStats.downloadCount / 1000000).toFixed(1) + "M+", color: "text-primary" },
            { icon: Star, label: "Mods", value: "500+", color: "text-yellow-400" },
          ].map(stat => (
            <Card key={stat.label} className="p-3 text-center">
              <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-sm font-black text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-4 gap-2 px-3">
          {[
            { icon: Zap, label: "New", href: "/explore", color: "bg-orange-500/15 text-orange-400" },
            { icon: Trophy, label: "Top Mods", href: "/leaderboard", color: "bg-yellow-500/15 text-yellow-400" },
            { icon: Crown, label: "VIP", href: "/explore", color: "bg-primary/15 text-primary" },
            { icon: Gift, label: "Giveaway", href: "/explore", color: "bg-pink-500/15 text-pink-400" },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setLocation(item.href)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-all active:scale-95"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">{item.label}</span>
            </button>
          ))}
        </div>

        {/* VIP Section */}
        <section className="px-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <h2 className="font-bold text-sm">VIP Section</h2>
              <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400 border-yellow-500/30">PREMIUM</Badge>
            </div>
            <Link href="/explore">
              <a className="text-xs text-primary flex items-center gap-0.5">See all <ChevronRight className="h-3 w-3" /></a>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {vipMods.map(mod => <ModCard key={mod.id} mod={mod} horizontal />)}
          </div>
        </section>

        {/* APOLLON CLIGHT Featured */}
        <section className="px-3">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-sm">APOLLON CLIGHT</h2>
            <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">OFFICIAL</Badge>
          </div>
          <Card
            className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all active:scale-[0.99]"
            onClick={() => setLocation("/mod/apollon-clight")}
          >
            <div className="relative h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-1">
                  <span className="text-xl font-black text-primary">AC</span>
                </div>
                <p className="text-xs font-bold">APOLLON CLIGHT</p>
                <p className="text-[10px] text-muted-foreground">v3.2.1 · Official Release</p>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">Official</Badge>
                <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400 border-yellow-500/30">VIP</Badge>
                <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">Latest</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{apollon.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Download className="h-3 w-3" /> 125K downloads
                </span>
                <Button size="sm" className="ml-auto h-7 text-xs font-bold">Download</Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Trending */}
        <section className="px-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              <h2 className="font-bold text-sm">Trending Now</h2>
            </div>
            <Link href="/explore"><a className="text-xs text-primary flex items-center gap-0.5">See all <ChevronRight className="h-3 w-3" /></a></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {trending.map(mod => <ModCard key={mod.id} mod={mod} horizontal />)}
          </div>
        </section>

        {/* Top Developers Preview */}
        <section className="px-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <h2 className="font-bold text-sm">Top Developers</h2>
            </div>
            <Link href="/leaderboard"><a className="text-xs text-primary flex items-center gap-0.5">Full Rankings <ChevronRight className="h-3 w-3" /></a></Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {TOP_DEVS.map((dev, i) => (
              <button
                key={dev.id}
                onClick={() => setLocation(`/developer/${dev.id}`)}
                className="flex flex-col items-center gap-2 shrink-0 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all active:scale-95 w-20"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary text-lg">
                    {dev.name[0]}
                  </div>
                  {i === 0 && <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-yellow-400" />}
                  {dev.verified && <Shield className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-primary bg-background rounded-full p-0.5" />}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold leading-tight truncate w-full">{dev.name}</p>
                  <p className="text-[9px] text-muted-foreground">{dev.uploads} mods</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Latest Uploads */}
        <section className="px-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm">Latest Uploads</h2>
            <Link href="/explore"><a className="text-xs text-primary flex items-center gap-0.5">See all <ChevronRight className="h-3 w-3" /></a></Link>
          </div>
          <div className="space-y-2">
            {latest.slice(0, 4).map(mod => <ModCard key={mod.id} mod={mod} />)}
          </div>
        </section>

        {/* Announcements */}
        <section className="px-3">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-blue-400" />
            <h2 className="font-bold text-sm">Announcements</h2>
          </div>
          <div className="space-y-2">
            {[
              { title: "APOLLON CLIGHT v3.2.1 Released!", content: "New performance improvements and bug fixes.", time: "2h ago" },
              { title: "Platform Update", content: "Comments & ratings are now live on all mods!", time: "1d ago" },
              { title: "Leaderboard Launched", content: "See the top mods and developers in the community.", time: "2d ago" },
            ].map((ann, i) => (
              <Card key={i} className="p-3 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                <div>
                  <p className="text-sm font-semibold">{ann.title}</p>
                  <p className="text-xs text-muted-foreground">{ann.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{ann.time}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Giveaway Banner */}
        <section className="px-3">
          <Card className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                <Gift className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Monthly Giveaway</p>
                <p className="text-xs text-muted-foreground">Win exclusive VIP access and premium mods!</p>
              </div>
              <Button size="sm" className="shrink-0 h-8 text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/30 border">
                Enter
              </Button>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <div className="px-3 text-center">
          <p className="text-[11px] text-muted-foreground">
            Vantage Mine Hub · Official Vantage Army Platform
          </p>
        </div>
      </div>
    </Layout>
  );
}
