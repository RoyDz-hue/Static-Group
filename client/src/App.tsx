import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Group from "@/pages/group";
import Navbar from "@/components/layout/Navbar";
import { useEffect, useState } from "react";
import { auth } from "./lib/firebase";
import { getCurrentUser } from "./lib/auth";
import type { User } from "@shared/schema";

function PrivateRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getCurrentUser();
        setUser(userData);
        if (adminOnly && !userData?.isAdmin) {
          setLocation("/dashboard");
        }
      } else {
        setLocation("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminOnly, setLocation]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? (
    <>
      <Navbar />
      <Component />
    </>
  ) : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard">
        <PrivateRoute component={Dashboard} />
      </Route>
      <Route path="/admin">
        <PrivateRoute component={Admin} adminOnly={true} />
      </Route>
      <Route path="/group/:id">
        <PrivateRoute component={Group} />
      </Route>
      <Route path="/">
        <PrivateRoute component={Dashboard} />
      </Route>
      <Route component={NotFound} />
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
