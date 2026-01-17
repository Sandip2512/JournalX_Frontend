import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Activity,
  Target,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { MistakeDialog } from "@/components/mistakes/MistakeDialog";
import { FrequencyHeatmap } from "@/components/mistakes/FrequencyHeatmap";
import { MistakeDistributionChart } from "@/components/mistakes/MistakeDistributionChart";
import { MistakesTable } from "@/components/mistakes/MistakesTable";
import { Mistake, MistakeCreate, MistakeAnalytics, FrequencyData } from "@/types/mistake-types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Mistakes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<MistakeAnalytics | null>(null);
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([]);
  const [timeFilter, setTimeFilter] = useState<"all" | "month">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMistake, setEditMistake] = useState<Mistake | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mistakeToDelete, setMistakeToDelete] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user?.user_id) return;

    try {
      setLoading(true);
      const [analyticsRes, frequencyRes] = await Promise.all([
        api.get(`/api/mistakes/analytics/${user.user_id}?time_filter=${timeFilter}`),
        api.get(`/api/mistakes/frequency/${user.user_id}?days=35`),
      ]);

      setAnalytics(analyticsRes.data);
      setFrequencyData(frequencyRes.data.data || []);
    } catch (error) {
      console.error("Error fetching mistake data:", error);
      toast({
        title: "Error",
        description: `Failed to load mistake data: ${error.response?.data?.detail || error.message || 'Unknown Error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.user_id, timeFilter]);

  const handleCreateMistake = async (mistake: MistakeCreate) => {
    try {
      if (editMistake) {
        await api.put(`/api/mistakes/${editMistake.id}`, mistake);
        toast({
          title: "Success",
          description: "Mistake updated successfully",
        });
      } else {
        await api.post("/api/mistakes/", mistake);
        toast({
          title: "Success",
          description: "Mistake created successfully",
        });
      }
      fetchData();
      setEditMistake(null);
    } catch (error) {
      console.error("Error saving mistake:", error);
      toast({
        title: "Error",
        description: "Failed to save mistake",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEditMistake = (mistake: Mistake) => {
    if (mistake.id.startsWith('auto-')) {
      toast({
        title: "Default Mistake",
        description: "This mistake is auto-generated from your trade data and cannot be modified manually.",
      });
      return;
    }
    setEditMistake(mistake);
    setDialogOpen(true);
  };

  const handleDeleteClick = (mistakeId: string) => {
    if (mistakeId.startsWith('auto-')) {
      toast({
        title: "System Protected",
        description: "Default tracking entries cannot be removed. They reflect your actual trading history.",
      });
      return;
    }
    setMistakeToDelete(mistakeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mistakeToDelete) return;

    try {
      await api.delete(`/api/mistakes/${mistakeToDelete}`);
      toast({
        title: "Success",
        description: "Mistake deleted successfully",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting mistake:", error);
      toast({
        title: "Error",
        description: "Failed to delete mistake",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setMistakeToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-white/5 border-t-white/40 rounded-full animate-spin relative z-10" />
            <div className="absolute inset-0 blur-2xl bg-purple-500/10 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const totalMistakes = analytics?.totalMistakes || 0;
  const mostCommon = analytics?.mostCommon;
  const improvement = analytics?.improvement || 0;
  const distribution = analytics?.distribution || [];
  const customMistakes = analytics?.customMistakes || [];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 aurora-bg pointer-events-none" />
      <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" />

      <Header />

      <main className="relative z-10 container mx-auto px-4 lg:px-6 py-12 max-w-7xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-white border border-border/50 dark:border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-1 ring-border/20 dark:ring-white/20">
                <AlertTriangle className="w-8 h-8 drop-shadow-md" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-200 tracking-[-0.03em] drop-shadow-sm dark:drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                  Mistake Analysis
                </h1>
                <p className="text-lg text-muted-foreground font-medium tracking-wide mt-1">
                  Turn your trading errors into your biggest assets.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              setEditMistake(null);
              setDialogOpen(true);
            }}
            size="lg"
            className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/20 hover:scale-105 transition-all duration-300 font-bold tracking-wide"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Mistake
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {/* Total Mistakes Card */}
          <Card className="glass-card-premium p-6 rounded-3xl relative overflow-hidden group hover:shadow-[0_0_40px_rgba(236,72,153,0.2)] transition-all duration-500 border-border/50 dark:border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all duration-500 animate-pulse-slow" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                  <div className="p-2 rounded-lg bg-pink-500/10 ring-1 ring-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-wider">Total Mistakes</span>
                </div>
                <Badge variant="outline" className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20 px-2.5 py-0.5 font-bold rounded-lg flex items-center gap-1 shadow-sm">
                  <TrendingUp className="w-3 h-3" />
                  24%
                </Badge>
              </div>

              <div className="flex items-end justify-between">
                <h3 className="text-4xl font-black text-foreground dark:text-white tracking-tight drop-shadow-sm">
                  {totalMistakes}
                </h3>
                <span className="text-sm font-medium text-muted-foreground mb-1">
                  This Week
                </span>
              </div>

              <div className="relative pt-2">
                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="relative shadow-lg shadow-pink-500/20 flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-500 to-rose-600"
                  >
                    {/* Hazard Stripes for Negative Metric */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:10px_10px]" />
                  </motion.div>
                </div>
              </div>
            </div>
          </Card>

          {/* Most Common Card */}
          <Card className="glass-card-premium p-6 rounded-3xl relative overflow-hidden group hover:shadow-[0_0_40px_rgba(249,115,22,0.2)] transition-all duration-500 border-border/50 dark:border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-500 animate-pulse-slow" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <div className="p-2 rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-wider">Most Common</span>
                </div>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 px-2.5 py-0.5 font-bold rounded-lg shadow-sm">
                  {mostCommon?.count || 0} Occurrences
                </Badge>
              </div>

              <div className="flex items-end justify-between">
                <h3 className="text-xl font-black text-foreground dark:text-white tracking-tight truncate max-w-[180px]" title={mostCommon?.name}>
                  {mostCommon?.name || "None yet"}
                </h3>
              </div>

              <div className="relative pt-2">
                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((mostCommon?.count || 0) / (totalMistakes || 1)) * 100, 100)}%` }}
                    transition={{ duration: 1.5, ease: "circOut", delay: 0.1 }}
                    className="relative shadow-lg shadow-orange-500/20 flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-orange-500 to-amber-600"
                  >
                    {/* Hazard Stripes for Negative Metric */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:10px_10px]" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground mt-1.5 uppercase tracking-wider">
                  <span>Frequency</span>
                  <span>{Math.round(((mostCommon?.count || 0) / (totalMistakes || 1)) * 100)}% of Total</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Improvement Score Card */}
          <Card className="glass-card-premium p-6 rounded-3xl relative overflow-hidden group hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all duration-500 border-border/50 dark:border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500 animate-pulse-slow" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <div className="p-2 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-wider">Improvement</span>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 font-bold rounded-lg flex items-center gap-1 shadow-sm relative overflow-hidden">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                  <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]" />
                </Badge>
              </div>

              <div className="flex items-end justify-between">
                <h3 className="text-4xl font-black text-foreground dark:text-white tracking-tight drop-shadow-sm">
                  {100 - (improvement || 0)}%
                </h3>
                <span className="text-sm font-medium text-muted-foreground mb-1">
                  Score
                </span>
              </div>

              <div className="relative pt-2">
                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - (improvement || 0)}%` }}
                    transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                    className="relative shadow-lg shadow-emerald-500/20 flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-500 to-teal-500"
                  >
                    <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
        >
          {/* Mistake Distribution Chart */}
          <Card className="lg:col-span-2 glass-card-premium p-8 rounded-3xl relative overflow-hidden group hover:shadow-[0_0_40px_rgba(139,92,246,0.1)] transition-all duration-500 border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  Mistake Distribution
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant={timeFilter === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeFilter("month")}
                    className="text-xs font-bold"
                  >
                    This Month
                  </Button>
                  <Button
                    variant={timeFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeFilter("all")}
                    className="text-xs font-bold"
                  >
                    All Time
                  </Button>
                </div>
              </div>
              <MistakeDistributionChart data={distribution} />
            </div>
          </Card>

          {/* Frequency Heatmap */}
          <Card className="lg:col-span-1 glass-card-premium p-8 rounded-3xl relative overflow-hidden group hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] transition-all duration-500 border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <FrequencyHeatmap data={frequencyData} />
            </div>
          </Card>
        </motion.div>

        {/* Mistakes Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Recent Mistakes
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your custom mistake types and track occurrences
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
              {customMistakes.length} Total
            </Badge>
          </div>

          <MistakesTable
            mistakes={customMistakes}
            onEdit={handleEditMistake}
            onDelete={handleDeleteClick}
          />
        </motion.div>
      </main>

      {/* Dialogs */}
      <MistakeDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditMistake(null);
        }}
        onSubmit={handleCreateMistake}
        editMistake={editMistake}
        userId={user?.user_id || ""}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this mistake type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Mistakes;
