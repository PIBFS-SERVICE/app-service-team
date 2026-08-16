import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Index from "./pages/Index";
import Team from "./pages/Team";
import VolunteerProfile from "./pages/VolunteerProfile";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/admin/Dashboard";
import Volunteers from "./pages/admin/Volunteers";
import Events from "./pages/admin/Events";
import Sectors from "./pages/admin/Sectors";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
