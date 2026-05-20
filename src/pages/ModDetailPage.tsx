import { useLocation } from "wouter";
import { ArrowLeft, Download, Eye, Shield, Crown, Star, ChevronRight, Play, MessageCircle, Flag } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import CommentsSection from "@/components/CommentsSection";
import LikeBookmarkBar from "@/components/LikeBookmarkBar";
import { useEffect } from "react";

const DEMO_MODS: Record<string, any> = {
  "apollon-clight": {
    id: "apollon-clight",
    title: "APOLLON CLIGHT",
    description: "APOLLON CLIGHT is the ultimate Minecraft performance and visual enhancement mod, officially developed by the Vantage team. This mod delivers unparalleled performance improvements, stunning visual effects, and a suite of features designed to transform your Minecraft experience. Includes anti-ban protection, FPS boost up to 300%, and exclusive VIP visual effects.",
    category: "Mod",
    version: "3.2.1",
    downloads: 125000,
    views: 450000,
    likes: 8724,
    developerId: "vantage",
    developerName: "Vantage Official",
    status: "approved",
    isVIP: true,
    isOfficial: true,
    downloadLink: "https://mediafire.com/",
    setupVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    gameplayVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    installGuide: "1. Download the APK file from the link below.\n2. Enable 'Unknown Sources' in your Android settings (Settings > Security).\n3. Install the APK file.\n4. Open Minecraft and go to Settings > Mods.\n5. Enable APOLLON CLIGHT in the mod manager.\n6. Restart Minecraft and enjoy the experience!",
    changelog: "v3.2.1 — Performance improvements, fixed crash on Realms servers\nv3.2.0 — Added ray tracing support, new visual effects\nv3.1.0 — Anti-ban improvements, stability updates\nv3.0.0 — Major rewrite with enhanced FPS engine",
    screenshots: [],
    createdAt: new Date().toISOString(),
    versionHistory: ["3.2.1", "3.2.0", "3.1.0", "3.0.5", "3.0.0"],
  },
  "vantage-toolbox": {
    id: "vantage-toolbox",
    title: "Vantage Toolbox Pro",
    description: "All-in-one Minecraft utility tool with anti-ban, fps boost, custom UI skins, and server tools. The most comprehensive toolkit for serious Minecraft players.",
    category: "Tool",
    version: "2.0.5",
    downloads: 87000,
    views: 200000,
    likes: 5200,
    developerId: "vantage",
    developerName: "Vantage Official",
    status: "approved",
    isVIP: true,
    downloadLink: "https://mediafire.com/",
    setupVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    installGuide: "1. Download the APK.\n2. Install with Unknown Sources enabled.\n3. Open and grant all permissions.\n4. Configure your settings in the tool.",
    changelog: "v2.0.5 — New UI, added server tools\nv2.0.0 — Redesigned from scratch\nv1.8.0 — Anti-ban v3 integration",
    versionHistory: ["2.0.5", "2.0.0", "1.8.0"],
  },
};

function formatCount(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function ModDetailPage({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const mod = DEMO_MODS[params.id] || DEMO_MODS["apollon-clight"];

  // Track views
  useEffect(() => {
    const viewed = sessionStorage.getItem(`viewed_${params.id}`);
    if (!viewed) {
      sessionStorage.setItem(`viewed_${params.id}`, "1");
      updateDoc(doc(db, "uploads", params.id), { views: increment(1) }).catch(() => {});
    }
  }, [params.id]);

  return (
    <Layout>
      <div className="pb-6">
        {/* Back Header */}
        <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-3 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <p className="font-semibold text-sm flex-1 truncate">{mod.title}</p>
          <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">{mod.category}</Badge>
        </div>

        <div className="px-3 pt-4 space-y-5">
          {/* Hero */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-border h-44 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl font-black text-primary">{mod.title[0]}</span>
              </div>
              <p className="font-black text-lg">{mod.title}</p>
              <p className="text-xs text-muted-foreground">by {mod.developerName}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {mod.isOfficial && <Badge className="bg-primary/20 text-primary border-primary/30"><Shield className="h-3 w-3 mr-1" />Official</Badge>}
            {mod.isVIP && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Crown className="h-3 w-3 mr-1" />VIP</Badge>}
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><Star className="h-3 w-3 mr-1" />Latest</Badge>
            <Badge variant="secondary">v{mod.version}</Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Download, label: "Downloads", value: formatCount(mod.downloads) },
              { icon: Eye, label: "Views", value: formatCount(mod.views) },
              { icon: Star, label: "Rating", value: "4.9" },
            ].map(s => (
              <Card key={s.label} className="p-3 text-center">
                <s.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-sm font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Download Button */}
          <Button
            data-testid="button-download"
            className="w-full h-12 font-bold text-base gap-2 shadow-lg shadow-primary/20"
            onClick={() => setLocation(`/download/${mod.id}`)}
          >
            <Download className="h-5 w-5" />
            Download Now — Free
          </Button>

          {/* Like / Bookmark / Share */}
          <LikeBookmarkBar modId={mod.id} modTitle={mod.title} initialLikes={mod.likes || 0} />

          {/* Tabbed Content */}
          <Tabs defaultValue="about">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="about" className="text-xs">About</TabsTrigger>
              <TabsTrigger value="guide" className="text-xs">Guide</TabsTrigger>
              <TabsTrigger value="videos" className="text-xs">Videos</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs gap-1">
                <MessageCircle className="h-3 w-3" />
                Reviews
              </TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-4 pt-2">
              <div>
                <h3 className="font-bold text-sm mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
              </div>

              {mod.changelog && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-bold text-sm mb-2">Changelog</h3>
                    <Card className="p-4">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{mod.changelog}</pre>
                    </Card>
                  </div>
                </>
              )}

              {mod.versionHistory && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-bold text-sm mb-2">Version History</h3>
                    <div className="space-y-2">
                      {mod.versionHistory.map((v: string, i: number) => (
                        <div key={v} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <span className="text-sm">v{v}</span>
                          {i === 0 && <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">Latest</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Developer Card */}
              <Separator />
              <Card
                className="p-4 flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => setLocation(`/developer/${mod.developerId}`)}
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg shrink-0">
                  {mod.developerName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{mod.developerName}</p>
                  <p className="text-xs text-muted-foreground">Developer</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Card>

              {/* Report */}
              <button className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors w-full justify-center py-2">
                <Flag className="h-3 w-3" />
                Report this mod
              </button>
            </TabsContent>

            {/* Installation Guide Tab */}
            <TabsContent value="guide" className="pt-2">
              {mod.installGuide ? (
                <Card className="p-4 bg-muted/50">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{mod.installGuide}</pre>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">No installation guide available.</div>
              )}
              <Button
                className="w-full mt-4 h-11 font-bold gap-2"
                onClick={() => setLocation(`/download/${mod.id}`)}
              >
                <Download className="h-4 w-4" />
                Download Now
              </Button>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="space-y-4 pt-2">
              {mod.setupVideo && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm">Setup Guide</h3>
                  </div>
                  <div className="rounded-xl overflow-hidden aspect-video bg-muted">
                    <iframe src={mod.setupVideo} className="w-full h-full" allowFullScreen title="Setup Video" />
                  </div>
                </div>
              )}
              {mod.gameplayVideo && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm">Gameplay Preview</h3>
                  </div>
                  <div className="rounded-xl overflow-hidden aspect-video bg-muted">
                    <iframe src={mod.gameplayVideo} className="w-full h-full" allowFullScreen title="Gameplay" />
                  </div>
                </div>
              )}
              {!mod.setupVideo && !mod.gameplayVideo && (
                <div className="text-center py-8 text-muted-foreground text-sm">No videos available.</div>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="pt-2">
              <CommentsSection modId={mod.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
