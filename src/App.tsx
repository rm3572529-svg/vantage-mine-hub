import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import WelcomePage from "@/pages/WelcomePage";
import UserTypePage from "@/pages/UserTypePage";
import DeveloperApplyPage from "@/pages/DeveloperApplyPage";
import HomePage from "@/pages/HomePage";
import ExplorePage from "@/pages/ExplorePage";
import ModDetailPage from "@/pages/ModDetailPage";
import DownloadPage from "@/pages/DownloadPage";
import DeveloperProfilePage from "@/pages/DeveloperProfilePage";
import DeveloperDashboardPage from "@/pages/DeveloperDashboardPage";
import AdminPage from "@/pages/AdminPage";
import ProfilePage from "@/pages/ProfilePage";
import NotificationsPage from "@/pages/NotificationsPage";
import BookmarksPage from "@/pages/BookmarksPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import NotFound from "@/pages/not-found";
import { Skeleton } from "@/components/ui/skeleton";

const queryClient = new QueryClient();

function Guard({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 animate-pulse flex items-center justify-center">
            <span className="text-2xl font-black text-primary">V</span>
          </div>
          <div className="space-y-2 w-32">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-3/4 mx-auto" />
          </div>
        </div>
      </div>
    );
  }
  if (!currentUser) return <WelcomePage />;
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 animate-pulse flex items-center justify-center">
            <span className="text-2xl font-black text-primary">V</span>
          </div>
          <div className="space-y-2 w-32">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-3/4 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={() => currentUser ? <HomePage /> : <WelcomePage />} />
      <Route path="/home" component={() => <Guard><HomePage /></Guard>} />
      <Route path="/user-type" component={() => <Guard><UserTypePage /></Guard>} />
      <Route path="/developer-apply" component={() => <Guard><DeveloperApplyPage /></Guard>} />
      <Route path="/explore" component={() => <Guard><ExplorePage /></Guard>} />
      <Route path="/mod/:id">{(params) => <Guard><ModDetailPage params={params} /></Guard>}</Route>
      <Route path="/download/:id">{(params) => <Guard><DownloadPage params={params} /></Guard>}</Route>
      <Route path="/developer/:id">{(params) => <DeveloperProfilePage params={params} />}</Route>
      <Route path="/developer-dashboard" component={() => <Guard><DeveloperDashboardPage /></Guard>} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/profile" component={() => <Guard><ProfilePage /></Guard>} />
      <Route path="/notifications" component={() => <Guard><NotificationsPage /></Guard>} />
      <Route path="/bookmarks" component={() => <Guard><BookmarksPage /></Guard>} />
      <Route path="/leaderboard" component={() => <Guard><LeaderboardPage /></Guard>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
