import { Crown, TrendingUp, Download, Star, Shield, Users } from "lucide-react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

const TOP_MODS = [
  { id: "apollon-clight", rank: 1, title: "APOLLON CLIGHT", dev: "Vantage Official", downloads: 125000, rating: 4.9, isVIP: true, isOfficial: true },
  { id: "vantage-toolbox", rank: 2, title: "Vantage Toolbox Pro", dev: "Vantage Official", downloads: 87000, rating: 4.8, isVIP: true },
  { id: "texture-supreme", rank: 3, title: "Supreme Texture Pack", dev: "TexturePro", downloads: 62000, rating: 4.7 },
  { id: "ultra-shader", rank: 4, title: "Ultra HD Shader Pack", dev: "ShaderMaster", downloads: 43000, rating: 4.6 },
  { id: "fps-utility", rank: 5, title: "FPS Optimizer Pro", dev: "FPS_Master", downloads: 45000, rating: 4.5 },
  { id: "pvp-mod", rank: 6, title: "PvP Master Mod", dev: "PvPKing", downloads: 38000, rating: 4.4 },
  { id: "sky-texture", rank: 7, title: "Sky HD Texture Pack", dev: "SkyArtist", downloads: 21000, rating: 4.3 },
  { id: "speed-mod", rank: 8, title: "SpeedBoost Utility", dev: "OptimizePro", downloads: 29000, rating: 4.2 },
];

const TOP_DEVS = [
  { id: "vantage", rank: 1, name: "Vantage Official", uploads: 24, totalDownloads: 312000, followers: 48200, verified: true, vip: true },
  { id: "dev2", rank: 2, name: "TexturePro", uploads: 12, totalDownloads: 98000, followers: 12400, verified: true },
  { id: "dev1", rank: 3, name: "ShaderMaster", uploads: 8, totalDownloads: 73000, followers: 9800, verified: true },
  { id: "dev6", rank: 4, name: "FPS_Master", uploads: 6, totalDownloads: 61000, followers: 7200 },
  { id: "dev4", rank: 5, name: "PvPKing", uploads: 15, totalDownloads: 54000, followers: 5900 },
];

function formatCount(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const rankBadge = (rank: number) => {
  if (rank === 1) return <span className="text-base">🥇</span>;
  if (rank === 2) return <span className="text-base">🥈</span>;
  if (rank === 3) return <span className="text-base">🥉</span>;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
};

export default function LeaderboardPage() {
  return (
    <Layout>
      <div className="px-3 pt-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <h1 className="text-lg font-black">Leaderboard</h1>
        </div>

        <Tabs defaultValue="mods">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="mods" className="flex-1 gap-1.5 text-xs">
              <TrendingUp className="h-3 w-3" /> Top Mods
            </TabsTrigger>
            <TabsTrigger value="developers" className="flex-1 gap-1.5 text-xs">
              <Users className="h-3 w-3" /> Top Developers
            </TabsTrigger>
          </TabsList>

          {/* Top Mods */}
          <TabsContent value="mods">
            <div className="space-y-2">
              {TOP_MODS.map(mod => (
                <Link key={mod.id} href={`/mod/${mod.id}`}>
                  <a data-testid={`leaderboard-mod-${mod.id}`}>
                    <Card className="p-3 flex items-center gap-3 hover:border-primary/50 transition-all active:scale-[0.99] cursor-pointer">
                      <div className="w-8 text-center shrink-0">{rankBadge(mod.rank)}</div>
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 font-bold text-primary">
                        {mod.title[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm truncate">{mod.title}</p>
                          {mod.isOfficial && <Shield className="h-3 w-3 text-primary shrink-0" />}
                          {mod.isVIP && <Crown className="h-3 w-3 text-yellow-400 fill-yellow-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{mod.dev}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold">{mod.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <Download className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{formatCount(mod.downloads)}</span>
                        </div>
                      </div>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Top Developers */}
          <TabsContent value="developers">
            <div className="space-y-2">
              {TOP_DEVS.map(dev => (
                <Link key={dev.id} href={`/developer/${dev.id}`}>
                  <a data-testid={`leaderboard-dev-${dev.id}`}>
                    <Card className="p-3 flex items-center gap-3 hover:border-primary/50 transition-all active:scale-[0.99] cursor-pointer">
                      <div className="w-8 text-center shrink-0">{rankBadge(dev.rank)}</div>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 font-bold text-primary text-lg">
                        {dev.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm truncate">{dev.name}</p>
                          {dev.verified && <Shield className="h-3 w-3 text-primary shrink-0" />}
                          {dev.vip && <Crown className="h-3 w-3 text-yellow-400 fill-yellow-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{dev.uploads} uploads · {formatCount(dev.followers)} followers</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <Download className="h-3 w-3 text-primary" />
                          <span className="text-xs font-bold text-primary">{formatCount(dev.totalDownloads)}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">total DLs</p>
                      </div>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
