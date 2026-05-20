import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Bookmark, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { doc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface BookmarkItem {
  id: string;
  modId: string;
  modTitle: string;
  savedAt: string;
}

export default function BookmarksPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "users", currentUser.uid, "bookmarks"));
    const unsub = onSnapshot(q, snap => {
      setBookmarks(snap.docs.map(d => ({ id: d.id, ...d.data() } as BookmarkItem)));
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  async function removeBookmark(bookmarkId: string) {
    if (!currentUser) return;
    await deleteDoc(doc(db, "users", currentUser.uid, "bookmarks", bookmarkId));
    toast({ title: "Removed from bookmarks." });
  }

  return (
    <Layout>
      <div className="px-3 pt-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-black">Saved Mods</h1>
          {bookmarks.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">{bookmarks.length} saved</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm">No saved mods</p>
            <p className="text-xs text-muted-foreground mt-1">Bookmark mods to find them here quickly.</p>
            <Link href="/explore">
              <Button className="mt-4 text-xs h-9">Browse Mods</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map(item => (
              <Card key={item.id} data-testid={`bookmark-${item.id}`} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Bookmark className="h-5 w-5 text-primary fill-primary/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.modTitle}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Saved {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/mod/${item.modId}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">View</Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeBookmark(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
