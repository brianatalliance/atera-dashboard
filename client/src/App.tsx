import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import OverviewPage from "@/pages/overview";
import AgentsPage from "@/pages/agents";
import AlertsPage from "@/pages/alerts";
import TicketsPage from "@/pages/tickets";
import CustomersPage from "@/pages/customers";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={OverviewPage} />
        <Route path="/agents" component={AgentsPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/tickets" component={TicketsPage} />
        <Route path="/customers" component={CustomersPage} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
