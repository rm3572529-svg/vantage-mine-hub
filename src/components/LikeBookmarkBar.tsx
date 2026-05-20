import { useState, useEffect } from "react";
import {
  doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc, setDoc, deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { sendNotification } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Share2 } from "lucide-react";

interface LikeBookmarkBarProps {
  modId: string;
  modTitle: string;
  developerUid?: string;
  initialLikes?: number;
}

export default function LikeBookmarkBar({ modId, modTitle, developerUid, initialLikes = 0 }: LikeBookmarkBarProps) {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    async function load() {
      const uploadSnap = await getDoc(doc(db, "uploads", modId));
      if (uploadSnap.exists()) {
        const data = uploadSnap.data();
        setLikeCount(data.likes || 0);
        setLiked(data.likedBy?.includes(currentUser!.uid) || false);
      }
      const bSnap = await getDoc(doc(db, "users", currentUser!.uid, "bookmarks", modId));
      setBookmarked(bSnap.exists());
    }
    load().catch(() => {});
  }, [modId, currentUser]);

  async function handleLike() {
    if (!currentUser) {
      toast({ title: "Sign in required", description: "Log in to like mods.", variant: "destructive" });
      return;
    }
    setLoadingLike(true);
    try {
      const ref = doc(db, "uploads", modId);
      if (liked) {
        await updateDoc(ref, { likes: increment(-1), likedBy: arrayRemove(currentUser.uid) });
        setLiked(false);
        setLikeCount(c => c - 1);
      } else {
        await updateDoc(ref, { likes: increment(1), likedBy: arrayUnion(currentUser.uid) });
        setLiked(true);
        setLikeCount(c => c + 1);
        toast({ title: "Liked!" });
        // Notify developer when their mod is liked
        if (developerUid && developerUid !== currentUser.uid) {
          await sendNotification(
            developerUid,
            "mod_liked",
            "Your Mod Got Liked",
            `${userProfile?.displayName || "Someone"} liked your mod "${modTitle}". Keep releasing great content!`,
            `/mod/${modId}`
          );
        }
      }
    } catch {}
    setLoadingLike(false);
  }

  async function handleBookmark() {
    if (!currentUser) {
      toast({ title: "Sign in required", description: "Log in to save mods.", variant: "destructive" });
      return;
    }
    setLoadingBookmark(true);
    try {
      const ref = doc(db, "users", currentUser.uid, "bookmarks", modId);
      if (bookmarked) {
        await deleteDoc(ref);
        setBookmarked(false);
        toast({ title: "Removed from saved mods." });
      } else {
        await setDoc(ref, { modId, modTitle, savedAt: new Date().toISOString() });
        setBookmarked(true);
        toast({ title: "Saved!", description: "Find it in your bookmarks anytime." });
      }
    } catch {}
    setLoadingBookmark(false);
  }

  async function handleShare() {
    const url = `${window.location.origin}/mod/${modId}`;
    if (navigator.share) {
      try { await navigator.share({ title: modTitle, text: `Check out ${modTitle} on Vantage Mine Hub!`, url }); }
      catch {}
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      toast({ title: "Link copied!", description: "Share it with the Vantage Army." });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={liked ? "default" : "outline"}
        size="sm"
        className={`h-9 gap-1.5 flex-1 ${liked ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30" : ""}`}
        onClick={handleLike}
        disabled={loadingLike}
      >
        <Heart className={`h-4 w-4 ${liked ? "fill-red-400 text-red-400" : ""}`} />
        <span>{likeCount}</span>
      </Button>
      <Button
        variant={bookmarked ? "default" : "outline"}
        size="sm"
        className={`h-9 gap-1.5 flex-1 ${bookmarked ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30" : ""}`}
        onClick={handleBookmark}
        disabled={loadingBookmark}
      >
        <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-primary text-primary" : ""}`} />
        <span>{bookmarked ? "Saved" : "Save"}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
}
