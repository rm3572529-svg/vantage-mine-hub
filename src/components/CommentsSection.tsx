import { useState, useEffect } from "react";
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, doc, updateDoc, increment, getDoc, arrayUnion, arrayRemove
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { sendNotification } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp, Send, Star, MessageCircle, AlertTriangle } from "lucide-react";

interface Comment {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  text: string;
  rating: number;
  likes: number;
  likedBy: string[];
  createdAt: any;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`transition-colors ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          <Star
            className={`h-4 w-4 transition-colors ${
              star <= (hover || value) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CommentsSection({ modId, modTitle = "this mod" }: { modId: string; modTitle?: string }) {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [userRated, setUserRated] = useState(false);

  const ratedComments = comments.filter(c => c.rating > 0);
  const avgRating = ratedComments.length
    ? ratedComments.reduce((acc, c) => acc + c.rating, 0) / ratedComments.length
    : 0;

  useEffect(() => {
    const q = query(
      collection(db, "uploads", modId, "comments"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
      setComments(data);
      setLoading(false);
      if (currentUser) setUserRated(data.some(c => c.uid === currentUser.uid));
    });
    return unsub;
  }, [modId, currentUser]);

  async function handleSubmit() {
    if (!currentUser || !text.trim()) return;
    if (userProfile?.isGuest) {
      toast({ title: "Sign in required", description: "Create an account to leave comments.", variant: "destructive" });
      return;
    }
    if (userRated) {
      toast({ title: "Already reviewed", description: "You can only post one review per mod.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "uploads", modId, "comments"), {
        uid: currentUser.uid,
        displayName: userProfile?.displayName || currentUser.displayName || "User",
        photoURL: currentUser.photoURL || "",
        text: text.trim(),
        rating,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
      });
      if (rating > 0) {
        updateDoc(doc(db, "uploads", modId), { rating: increment(rating), ratingCount: increment(1) }).catch(() => {});
      }
      setText("");
      setRating(0);
      toast({ title: "Review posted!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(comment: Comment) {
    if (!currentUser) return;
    const ref = doc(db, "uploads", modId, "comments", comment.id);
    const alreadyLiked = comment.likedBy?.includes(currentUser.uid);
    try {
      if (alreadyLiked) {
        await updateDoc(ref, { likes: increment(-1), likedBy: arrayRemove(currentUser.uid) });
      } else {
        await updateDoc(ref, { likes: increment(1), likedBy: arrayUnion(currentUser.uid) });
        // Notify the commenter (skip if liking own comment)
        if (comment.uid !== currentUser.uid) {
          await sendNotification(
            comment.uid,
            "comment_liked",
            "Your Review Was Liked",
            `${userProfile?.displayName || "Someone"} found your review on "${modTitle}" helpful!`,
            `/mod/${modId}`
          );
        }
      }
    } catch {}
  }

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      {comments.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
          <div className="text-center">
            <p className="text-4xl font-black text-foreground">{avgRating.toFixed(1)}</p>
            <StarRating value={Math.round(avgRating)} />
            <p className="text-[10px] text-muted-foreground mt-1">{comments.length} review{comments.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map(star => {
              const count = comments.filter(c => c.rating === star).length;
              const pct = comments.length ? (count / comments.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-3">{star}</span>
                  <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-3">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write Review */}
      {currentUser && !userRated && !userProfile?.isGuest && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <p className="font-semibold text-sm">Write a Review</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Your Rating</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <Textarea
            placeholder="Share your experience with this mod..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{text.length}/500</span>
            <Button
              size="sm"
              className="gap-1.5 h-8 text-xs font-bold"
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
            >
              <Send className="h-3 w-3" />
              {submitting ? "Posting..." : "Post Review"}
            </Button>
          </div>
        </Card>
      )}

      {userProfile?.isGuest && (
        <Card className="p-3 flex items-center gap-3 bg-muted/50">
          <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
          <p className="text-xs text-muted-foreground">Sign in to leave comments and ratings.</p>
        </Card>
      )}

      {userRated && (
        <Card className="p-3 flex items-center gap-3 bg-primary/5 border-primary/20">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 shrink-0" />
          <p className="text-xs text-muted-foreground">You've already reviewed this mod. Thank you!</p>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">No reviews yet</p>
          <p className="text-xs text-muted-foreground">Be the first to review this mod!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => {
            const date = comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date();
            const isLiked = currentUser && comment.likedBy?.includes(currentUser.uid);
            return (
              <Card key={comment.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={comment.photoURL} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {comment.displayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold">{comment.displayName}</p>
                        {comment.rating > 0 && <StarRating value={comment.rating} />}
                      </div>
                      <p className="text-[10px] text-muted-foreground shrink-0">{timeAgo(date)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{comment.text}</p>
                    <button
                      onClick={() => handleLike(comment)}
                      className={`flex items-center gap-1.5 mt-2 text-[11px] transition-colors ${isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                    >
                      <ThumbsUp className={`h-3 w-3 ${isLiked ? "fill-primary" : ""}`} />
                      <span>{comment.likes || 0} helpful</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
