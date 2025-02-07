import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { HomeView } from "./pages/HomeView";
import { ProvinceView } from "./pages/ProvinceView";
import { UsersView } from "./pages/UsersView";
import AuthPage from "./pages/AuthPage";
import { useUser } from "./hooks/use-user";
import { Loader2 } from "lucide-react";

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Switch>
      <Route path="/" component={HomeView} />
      <Route path="/provincia/:id" component={ProvinceView} />
      {user.role === "admin" && <Route path="/users" component={UsersView} />}
      <Route>404 - Página no encontrada</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;