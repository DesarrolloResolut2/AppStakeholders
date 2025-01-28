import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { HomeView } from "./pages/HomeView";
import { ProvinceView } from "./pages/ProvinceView";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={HomeView} />
        <Route path="/provincia/:id" component={ProvinceView} />
        <Route>404 - Página no encontrada</Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
