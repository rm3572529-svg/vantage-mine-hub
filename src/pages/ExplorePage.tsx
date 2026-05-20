import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Layout from "@/components/Layout";
import ModCard, { Mod } from "@/components/ModCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["All", "Mods", "Tools", "Texture Packs", "Shader Packs", "Utility APKs"];

const ALL_MODS: Mod[] = [
  { id: "apollon-clight", title: "APOLLON CLIGHT", description: "Official Vantage performance mod", category: "Mod", version: "3.2.1", downloads: 125000, views: 450000, bannerImage: "", developerId: "vantage", developerName: "Vantage Official", status: "approved", isVIP: true, isOfficial: true, tags: ["official"], createdAt: new Date().toISOString() },
  { id: "vantage-toolbox", title: "Vantage Toolbox Pro", description: "All-in-one Minecraft utility tool", category: "Tool", version: "2.0.5", downloads: 87000, views: 200000, bannerImage: "", developerId: "vantage", developerName: "Vantage Official", status: "approved", isVIP: true, tags: ["utility"], createdAt: new Date().toISOString() },
  { id: "ultra-shader", title: "Ultra HD Shader Pack", description: "Next-gen shaders for Minecraft", category: "Shader Pack", version: "1.5.0", downloads: 43000, views: 110000, bannerImage: "", developerId: "dev1", developerName: "ShaderMaster", status: "approved", tags: ["shaders"], createdAt: new Date().toISOString() },
  { id: "texture-supreme", title: "Supreme Texture Pack 512x", description: "Photorealistic 512x textures", category: "Texture Pack", version: "4.1.0", downloads: 62000, views: 180000, bannerImage: "", developerId: "dev2", developerName: "TexturePro", status: "approved", tags: ["textures"], createdAt: new Date().toISOString() },
  { id: "speed-mod", title: "SpeedBoost Utility APK", description: "Boost your Minecraft FPS by 300%", category: "Utility APK", version: "1.2.0", downloads: 29000, views: 75000, bannerImage: "", developerId: "dev3", developerName: "OptimizePro", status: "approved", tags: ["performance"], createdAt: new Date().toISOString() },
  { id: "pvp-mod", title: "PvP Master Mod", description: "Advanced PvP tools and configurations", category: "Mod", version: "1.8.0", downloads: 38000, views: 95000, bannerImage: "", developerId: "dev4", developerName: "PvPKing", status: "approved", tags: ["pvp"], createdAt: new Date().toISOString() },
  { id: "sky-texture", title: "Sky HD Texture Pack", description: "Beautiful sky and atmosphere textures", category: "Texture Pack", version: "2.0.0", downloads: 21000, views: 60000, bannerImage: "", developerId: "dev5", developerName: "SkyArtist", status: "approved", tags: ["textures", "sky"], createdAt: new Date().toISOString() },
  { id: "fps-utility", title: "FPS Optimizer Pro", description: "Ultimate FPS optimization tool", category: "Utility APK", version: "3.0.1", downloads: 45000, views: 120000, bannerImage: "", developerId: "dev6", developerName: "FPS_Master", status: "approved", tags: ["performance"], createdAt: new Date().toISOString() },
];

const CATEGORY_MAP: Record<string, string> = {
  "Mods": "Mod",
  "Tools": "Tool",
  "Texture Packs": "Texture Pack",
  "Shader Packs": "Shader Pack",
  "Utility APKs": "Utility APK",
};

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = ALL_MODS.filter(mod => {
    const matchesSearch = !search ||
      mod.title.toLowerCase().includes(search.toLowerCase()) ||
      mod.description.toLowerCase().includes(search.toLowerCase()) ||
      mod.developerName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || mod.category === CATEGORY_MAP[activeCategory];
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="px-3 pt-3 pb-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-explore-search"
            placeholder="Search mods, tools, developers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card border-border"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              data-testid={`filter-${cat.toLowerCase().replace(/\s/g, "-")}`}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
          </p>
          <button className="flex items-center gap-1 text-xs text-primary">
            <SlidersHorizontal className="h-3 w-3" />
            Sort
          </button>
        </div>

        {/* Mods Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm">No results found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different search term or category</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(mod => (
              <ModCard key={mod.id} mod={mod} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
