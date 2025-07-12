import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Link, useLocation } from "wouter";
import { Briefcase } from "lucide-react";
import Registration from "@/pages/registration";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-xl font-semibold">TalentHub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <a className={`px-4 py-2 text-sm font-medium transition-colors ${
                location === '/' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`}>
                Register Jobseeker
              </a>
            </Link>
            <Link href="/dashboard">
              <a className={`px-4 py-2 text-sm font-medium transition-colors ${
                location === '/dashboard' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`}>
                View Profiles
              </a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Registration} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-slate-50">
          <Navigation />
          <main>
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
