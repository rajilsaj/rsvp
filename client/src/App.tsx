import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { queryClient } from "./lib/queryClient";
import SaveTheDate from "@/pages/save-the-date";
import FindSeat from "@/pages/find-seat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SaveTheDate} />
      <Route path="/find-seat" component={FindSeat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
