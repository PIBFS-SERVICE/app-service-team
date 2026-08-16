import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";

const Index = lazy(() => import("./pages/Index"));
const Team = lazy(() => import("./pages/Team"));
const VolunteerProfile = lazy(() => import("./pages/VolunteerProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Volunteers = lazy(() => import("./pages/admin/Volunteers"));
const Events = lazy(() => import("./pages/admin/Events"));
const Sectors = lazy(() => import("./pages/admin/Sectors"));
const Settings = lazy(() => import("./pages/admin/Settings"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              {/* Public area */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/equipe" element={<Team />} />
                <Route path="/equipe/:id" element={<VolunteerProfile />} />
              </Route>

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected admin area */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/admin/volunteers" element={<Volunteers />} />
                  <Route path="/admin/events" element={<Events />} />
                  <Route path="/admin/sectors" element={<Sectors />} />
                  <Route path="/admin/settings" element={<Settings />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
