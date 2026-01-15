import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Trades from "./pages/Trades";
import Analytics from "./pages/Analytics";
import Mistakes from "./pages/Mistakes";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Goals from "./pages/Goals";
import DisciplineDiary from "./pages/DisciplineDiary";
import TradersDiary from "./pages/TradersDiary";
import Community from "./pages/Community";
import TradersLounge from "./pages/TradersLounge";
import ProtectedAdminRoute from "./components/layout/ProtectedAdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import TradeManagement from "./pages/admin/TradeManagement";
import SystemLogs from "./pages/admin/SystemLogs";
import Announcements from "./pages/admin/Announcements";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import Sales from "./pages/admin/Sales";
import BrokerConnections from "./pages/BrokerConnections";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
