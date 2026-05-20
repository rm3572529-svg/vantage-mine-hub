import { Download, Eye, Star, Shield, Crown } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Mod {
  id: string;
  title: string;
  description: string;
  category: string;
  version: string;
  downloads: number;
  views: number;
  bannerImage?: string;
  developerId: string;
  developerName: string;
  status: string;
  isVIP?: boolean;
  isOfficial?: boolean;
  tags?: string[];
  createdAt: string;
}

interface ModCardProps {
  mod: Mod;
  horizontal?: boolean;
}

const categoryColors: Record<string, string> = {
  Mod: "bg-blue-500/20 text-blue-400",
  Tool: "bg-orange-500/20 text-orange-400",
  "Texture Pack": "bg-purple-500/20 text-purple-400",
  "Shader Pack": "bg-cyan-500/20 text-cyan-400",
  "Utility APK": "bg-yellow-500/20 text-yellow-400",
};

function formatCount(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function ModCard({ mod, horizontal }: ModCardProps) {
  if (horizontal) {
    return (
      <Link href={`/mod/${mod.id}`}>
        <a data-testid={`card-mod-${mod.id}`} className="block shrink-0 w-40">
          <Card className="overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg active:scale-95 cursor-pointer h-full">
            <div className="relative aspect-video bg-muted">
              {mod.bannerImage ? (
                <img src={mod.bannerImage} alt={mod.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <span className="text-2xl font-black text-primary/40">{mod.title[0]}</span>
                </div>
              )}
              {mod.isVIP && (
                <div className="absolute top-1 right-1">
                  <Crown className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
              )}
              {mod.isOfficial && (
                <div className="absolute top-1 left-1">
                  <Shield className="h-4 w-4 text-primary fill-primary/30" />
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs font-semibold line-clamp-2 leading-tight">{mod.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{mod.developerName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Download className="h-3 w-3" />
                  {formatCount(mod.downloads)}
                </span>
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                  v{mod.version}
                </Badge>
              </div>
            </div>
          </Card>
        </a>
      </Link>
    );
  }

  return (
    <Link href={`/mod/${mod.id}`}>
      <a data-testid={`card-mod-${mod.id}`} className="block">
        <Card className="overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg active:scale-95 cursor-pointer">
          <div className="flex gap-3 p-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
              {mod.bannerImage ? (
                <img src={mod.bannerImage} alt={mod.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <span className="text-xl font-black text-primary/40">{mod.title[0]}</span>
                </div>
              )}
              {mod.isVIP && <Crown className="absolute top-0.5 right-0.5 h-3 w-3 text-yellow-400 fill-yellow-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm line-clamp-1">{mod.title}</p>
                <Badge
                  className={`text-[10px] px-1.5 py-0 h-5 shrink-0 border-0 ${categoryColors[mod.category] || "bg-muted text-muted-foreground"}`}
                >
                  {mod.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{mod.developerName}</p>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{mod.description}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {formatCount(mod.downloads)}
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatCount(mod.views)}
                </span>
                <span className="text-[11px] text-muted-foreground ml-auto">v{mod.version}</span>
              </div>
            </div>
          </div>
        </Card>
      </a>
    </Link>
  );
}
