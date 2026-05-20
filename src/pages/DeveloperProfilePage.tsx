import { useLocation } from "wouter";
import { ArrowLeft, Download, Eye, Users, Shield, Crown, Star, Youtube, Instagram, Send, MessageCircle } from "lucide-react";
import { SiYoutube, SiInstagram, SiTelegram, SiWhatsapp, SiDiscord } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import ModCard, { Mod } from "@/components/ModCard";

const DEMO_DEVELOPERS: Record<string, any> = {
  "vantage": {
    id: "vantage",
    fullName: "Vantage Official",
    about: "Official Vantage Mine Hub developer team. We create premium Minecraft mods, tools, and utilities for the Vantage Army community. Our mods are tested, verified, and anti-ban safe.",
    youtube1: "https://youtube.com/",
    youtube2: "https://youtube.com/",
    instagram: "https://instagram.com/",
    telegram: "https://t.me/",
    whatsapp: "https://wa.me/",
    discord: "https://discord.gg/",
    followers: 48200,
    totalDownloads: 312000,
    totalViews: 985000,
    totalUploads: 24,
    verifiedBadge: true,
    trustedBadge: true,
    vipBadge: true,
    logo: "",
    banner: "",
  },
};

const DEMO_MODS: Mod[] = [
  { id: "apollon-clight", title: "APOLLON CLIGHT", description: "Official Vantage performance mod", category: "Mod", version: "3.2.1", downloads: 125000, views: 450000, bannerImage: "", developerId: "vantage", developerName: "Vantage Official", status: "approved", isVIP: true, isOfficial: true, tags: [], createdAt: new Date().toISOString() },
  { id: "vantage-toolbox", title: "Vantage Toolbox Pro", description: "All-in-one utility tool", category: "Tool", version: "2.0.5", downloads: 87000, views: 200000, bannerImage: "", developerId: "vantage", developerName: "Vantage Official", status: "approved", isVIP: true, tags: [], createdAt: new Date().toISOString() },
];

function formatCount(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function DeveloperProfilePage({ params }: { params: { id: string } }) {
  const dev = DEMO_DEVELOPERS[params.id] || DEMO_DEVELOPERS["vantage"];
  const mods = DEMO_MODS.filter(m => m.developerId === params.id || params.id === "vantage");

  const socials = [
    { icon: SiYoutube, href: dev.youtube1, color: "#FF0000", label: "YouTube" },
    { icon: SiInstagram, href: dev.instagram, color: "#E4405F", label: "Instagram" },
    { icon: SiTelegram, href: dev.telegram, color: "#229ED9", label: "Telegram" },
    { icon: SiWhatsapp, href: dev.whatsapp, color: "#25D366", label: "WhatsApp" },
    { icon: SiDiscord, href: dev.discord, color: "#5865F2", label: "Discord" },
  ].filter(s => s.href);

  return (
    <Layout>
      <div className="pb-6">
        {/* Banner */}
        <div className="relative h-32 bg-gradient-to-br from-primary/30 via-primary/10 to-background">
          {dev.banner && <img src={dev.banner} alt="banner" className="w-full h-full object-cover" />}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 left-3 bg-background/50 backdrop-blur h-8 w-8"
            onClick={() => history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-3 -mt-8 relative z-10">
          {/* Avatar + Name */}
          <div className="flex items-end justify-between mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border-4 border-background flex items-center justify-center font-black text-2xl text-primary overflow-hidden">
              {dev.logo ? <img src={dev.logo} alt={dev.fullName} className="w-full h-full object-cover" /> : dev.fullName[0]}
            </div>
            <Button size="sm" className="h-8 text-xs font-bold gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Follow
            </Button>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <h1 className="font-black text-lg">{dev.fullName}</h1>
              {dev.verifiedBadge && <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 px-1.5 gap-0.5"><Shield className="h-2.5 w-2.5" />Verified</Badge>}
              {dev.trustedBadge && <Badge className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30 px-1.5 gap-0.5"><Star className="h-2.5 w-2.5" />Trusted</Badge>}
              {dev.vipBadge && <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-1.5 gap-0.5"><Crown className="h-2.5 w-2.5" />VIP</Badge>}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{dev.about}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "Uploads", value: dev.totalUploads },
              { label: "Downloads", value: formatCount(dev.totalDownloads) },
              { label: "Views", value: formatCount(dev.totalViews) },
              { label: "Followers", value: formatCount(dev.followers) },
            ].map(s => (
              <Card key={s.label} className="p-2 text-center">
                <p className="text-sm font-bold">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Social Links */}
          {socials.length > 0 && (
            <div className="flex gap-2 mb-4">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: `${s.color}20` }}
                >
                  <s.icon className="h-4 w-4" style={{ color: s.color }} />
                </a>
              ))}
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="uploads">
            <TabsList className="w-full">
              <TabsTrigger value="uploads" className="flex-1 text-xs">Uploads ({mods.length})</TabsTrigger>
              <TabsTrigger value="announcements" className="flex-1 text-xs">Announcements</TabsTrigger>
            </TabsList>
            <TabsContent value="uploads" className="mt-3 space-y-2">
              {mods.map(mod => (
                <ModCard key={mod.id} mod={mod} />
              ))}
              {mods.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No uploads yet.
                </div>
              )}
            </TabsContent>
            <TabsContent value="announcements" className="mt-3">
              <Card className="p-4 text-sm text-muted-foreground text-center">
                No announcements yet.
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
