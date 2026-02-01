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
import { lazyWithRetry } from "./lib/lazy-with-retry";

// Lazy load pages with retry logic for production stability
const Landing = lazyWithRetry(() => import("./pages/Landing"));
const Index = lazyWithRetry(() => import("./pages/Index"));
const Trades = lazyWithRetry(() => import("./pages/Trades"));
const Analytics = lazyWithRetry(() => import("./pages/Analytics"));
const Mistakes = lazyWithRetry(() => import("./pages/Mistakes"));
const Leaderboard = lazyWithRetry(() => import("./pages/Leaderboard"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));
const Goals = lazyWithRetry(() => import("./pages/Goals"));
const DisciplineDiary = lazyWithRetry(() => import("./pages/DisciplineDiary"));
const TradersDiary = lazyWithRetry(() => import("./pages/TradersDiary"));
const Community = lazyWithRetry(() => import("./pages/Community"));
const TradersLounge = lazyWithRetry(() => import("./pages/TradersLounge"));
const TraderRoom = lazyWithRetry(() => import("./pages/TraderRoom"));
const Friends = lazyWithRetry(() => import("./pages/Friends"));
const BrokerConnections = lazyWithRetry(() => import("./pages/BrokerConnections"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const Login = lazyWithRetry(() => import("./pages/Login"));
const Register = lazyWithRetry(() => import("./pages/Register"));

// Admin Pages
const AdminDashboard = lazyWithRetry(() => import("./pages/AdminDashboard"));
const UserManagement = lazyWithRetry(() => import("./pages/admin/UserManagement"));
const TradeManagement = lazyWithRetry(() => import("./pages/admin/TradeManagement"));
const SystemLogs = lazyWithRetry(() => import("./pages/admin/SystemLogs"));
const Announcements = lazyWithRetry(() => import("./pages/admin/Announcements"));
const AdminAnalytics = lazyWithRetry(() => import("./pages/admin/AdminAnalytics"));
const Sales = lazyWithRetry(() => import("./pages/admin/Sales"));

import { ThemeProvider } from "./context/ThemeContext";
import { CommandMenu } from "./components/CommandMenu";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <CommandMenu />
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
                  <Route path="/community" element={<Community />} />
                  <Route path="/community/lounge" element={<TradersLounge />} />
                  <Route path="/trader-room" element={<TraderRoom />} />
                  <Route path="/friends" element={<Friends />} />
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
