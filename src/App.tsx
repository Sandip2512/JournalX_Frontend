import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ProtectedAdminRoute from "./components/layout/ProtectedAdminRoute";
import { LoadingScreen } from "./components/LoadingScreen";
// Lazy load pages for Suspense
const Landing = React.lazy(() => import("./pages/Landing"));
const Index = React.lazy(() => import("./pages/Index"));
const Trades = React.lazy(() => import("./pages/Trades"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Mistakes = React.lazy(() => import("./pages/Mistakes"));
const Leaderboard = React.lazy(() => import("./pages/Leaderboard"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Goals = React.lazy(() => import("./pages/Goals"));
const DisciplineDiary = React.lazy(() => import("./pages/DisciplineDiary"));
const TradersDiary = React.lazy(() => import("./pages/TradersDiary"));
const Community = React.lazy(() => import("./pages/Community"));
const TradersLounge = React.lazy(() => import("./pages/TradersLounge"));
const BrokerConnections = React.lazy(() => import("./pages/BrokerConnections"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));

// Admin Pages
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const UserManagement = React.lazy(() => import("./pages/admin/UserManagement"));
const TradeManagement = React.lazy(() => import("./pages/admin/TradeManagement"));
const SystemLogs = React.lazy(() => import("./pages/admin/SystemLogs"));
const Announcements = React.lazy(() => import("./pages/admin/Announcements"));
const AdminAnalytics = React.lazy(() => import("./pages/admin/AdminAnalytics"));
const Sales = React.lazy(() => import("./pages/admin/Sales"));

import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen message="Loading your trading journal..." />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Landing />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/trades" element={<Trades />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/mistakes" element={<Mistakes />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/discipline-diary" element={<DisciplineDiary />} />
                  <Route path="/traders-diary" element={<TradersDiary />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/discipline-diary" element={<DisciplineDiary />} />
                  <Route path="/traders-diary" element={<TradersDiary />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/community/lounge" element={<TradersLounge />} />
                  <Route path="/broker-connections" element={<BrokerConnections />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedAdminRoute />}>
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="admin/users" element={<UserManagement />} />
                  <Route path="admin/trades" element={<TradeManagement />} />
                  <Route path="admin/analytics" element={<AdminAnalytics />} />
                  <Route path="admin/sales" element={<Sales />} />
                  <Route path="admin/logs" element={<SystemLogs />} />
                  <Route path="admin/announcements" element={<Announcements />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
