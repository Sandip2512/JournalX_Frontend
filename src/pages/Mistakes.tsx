import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Tag,
  ChevronRight,
  Brain,
  Shield,
  Timer,
  Activity,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Target,
  Search,
  ClipboardCheck,
  LineChart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

const ExecutionTooltip = ({ active, payload, label, stats }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isLossData = data.loss !== undefined;

    return (
      <div className="glass-card-premium p-3 backdrop-blur-3xl bg-white/95 dark:bg-[#0c0d12]/95 border border-black/10 dark:border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.2)] rounded-[1rem] min-w-[180px] max-w-[240px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />

        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground mb-2.5 truncate pl-1 border-b border-black/5 dark:border-white/5 pb-1.5">
          {label || data.name || data.subject}
        </p>

        <div className="space-y-2 relative z-10 pl-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[9px] font-bold text-muted-foreground uppercase">{entry.name}</span>
              </div>
              <span className="text-xs font-black text-foreground tabular-nums">
                {entry.name === 'loss' ? `-$${entry.value.toLocaleString()}` : `${entry.value.toFixed(1)}%`}
              </span>
            </div>
          ))}

          {isLossData && stats && (
            <div className="pt-2 mt-0.5 border-t border-black/5 dark:border-white/5 space-y-1.5">
              <p className="text-[10px] text-muted-foreground leading-snug font-medium italic">
                "Fixing saves <span className="text-emerald-500 font-bold">${Math.round(data.loss * 12).toLocaleString()}</span>/yr."
              </p>
              <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Leakage</span>
                <span className="text-[10px] font-black text-destructive">
                  {Math.round((data.loss / stats.totalLoss) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const renderUniqueBarLabel = ({ x, y, width, value }: any) => {
  return (
    <text
      x={x + width + 12}
      y={y + 36}
      fill="currentColor"
      className="text-foreground/40 font-bold text-[13px] tracking-tighter"
    >
      {Math.abs(value).toFixed(0)}%
    </text>
  );
};

const UniqueBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  if (width === undefined || width === null || isNaN(width)) return null;

  return (
    <g className="group/bar">
      <rect
        x={x}
        y={y + 16}
        width={width}
        height={32}
        fill={fill}
        rx={10}
        className="transition-all duration-500 hover:brightness-110"
      />
      <rect
        x={x}
        y={y + 16}
        width={width}
        height={32}
        fill="white"
        fillOpacity={0.05}
        rx={10}
      />
    </g>
  );
};

const Mistakes = () => {
  const { user } = useAuth();
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [noMistakeCount, setNoMistakeCount] = useState(0);
  const [totalTradesCount, setTotalTradesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMistakes = async () => {
      if (user?.user_id) {
        try {
          const response = await api.get(`/trades/user/${user.user_id}`);
          const allTrades = response.data;

          // Count "No Mistake" trades
          const noMistakes = allTrades.filter((t: any) =>
            t.mistake === "No Mistake" || !t.mistake || t.mistake.trim() === ""
          );
          setNoMistakeCount(noMistakes.length);
          setTotalTradesCount(allTrades.length);

          // Filter "Mistake" trades, excluding -0.00 P/L and "No Mistake" tag
          const mistakeTrades = allTrades.filter((t: any) => {
            const hasMistakeTag = t.mistake && t.mistake.trim() !== "" && t.mistake !== "No Mistake";
            // Check if profit/loss is effectively zero (handling -0.00)
            const netProfit = parseFloat(t.net_profit || 0);
            const lossAmount = parseFloat(t.loss_amount || 0);
            const isZeroPL = Math.abs(netProfit) < 0.001 && Math.abs(lossAmount) < 0.001;

            return hasMistakeTag && !isZeroPL;
          });

          setMistakes(mistakeTrades);
        } catch (error) {
          console.error("Error fetching mistakes:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMistakes();
  }, [user?.user_id]);

  // Derived Statistics
  const stats = useMemo(() => {
    if (mistakes.length === 0) return null;

    const totalLoss = mistakes.reduce((sum, t) => sum + (t.loss_amount || 0), 0);

    // Categorize
    const categoryMap: Record<string, { count: number, loss: number }> = {};
    mistakes.forEach(t => {
      const type = t.mistake;
      if (!categoryMap[type]) categoryMap[type] = { count: 0, loss: 0 };
      categoryMap[type].count++;
      categoryMap[type].loss += (t.loss_amount || 0);
    });

    const categories = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.loss - a.loss);

    const mostFrequent = [...categories].sort((a, b) => b.count - a.count)[0];
    const mostExpensive = categories[0];

    const totalTrades = totalTradesCount;
    const disciplineScore = totalTrades > 0 ? Math.round((noMistakeCount / totalTrades) * 100) : 100;

    // Projected Annual Savings (based on 200 trades per year)
    const avgLossPerMistake = totalLoss / mistakes.length;
    const projectedAnnualLoss = avgLossPerMistake * (mistakes.length / (totalTrades || 1)) * 200;

    // Radar Data (Behavioral Vulnerability)
    const radarData = categories.slice(0, 6).map(cat => ({
      subject: cat.name,
      A: (cat.loss / totalLoss) * 100, // Weighted by loss
      B: (cat.count / mistakes.length) * 100, // Weighted by frequency
      fullMark: 100,
    }));

    return {
      totalLoss,
      totalCount: mistakes.length,
      noMistakeCount,
      totalTrades,
      disciplineScore,
      projectedAnnualLoss,
      radarData,
      categories,
      mostFrequent,
      mostExpensive
    };
  }, [mistakes, noMistakeCount, totalTradesCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030408] relative overflow-hidden">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-white/5 border-t-white/40 rounded-full animate-spin relative z-10" />
            <div className="absolute inset-0 blur-2xl bg-blue-500/10 animate-pulse" />
            <p className="mt-6 text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 animate-pulse text-center">Loading Performance Data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 aurora-bg pointer-events-none" />
      <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" />

      <Header />

      <main className="relative z-10 container mx-auto px-4 lg:px-6 py-12 max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 opacity-0 animate-fade-up">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 tracking-tight drop-shadow-sm">
                Execution <span className="text-gradient">Insights</span>
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-medium tracking-wide">
              Identify systematic trading errors and optimize capital preservation through deep behavioral metrics.
            </p>
          </div>
        </div>

        {!stats ? (
          <div className="glass-card-premium p-20 text-center space-y-4 border-dashed border-2">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">Zero Mistakes Detected</h3>
            <p className="text-muted-foreground">You are either a perfect machine or haven't tagged your mistakes yet.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12"
          >

            {/* Main Insight Card - Most Expensive Mistake */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="lg:col-span-8 glass-card-premium p-8 lg:p-10 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="space-y-8">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-destructive flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Critical Execution Gap
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">{stats.mostExpensive.name}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Financial Impact</p>
                      <p className="text-3xl font-bold text-destructive tracking-tight">
                        -${stats.mostExpensive.loss.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Occurrences</p>
                      <p className="text-3xl font-bold text-foreground tracking-tight">
                        {stats.mostExpensive.count}
                      </p>
                    </div>
                    <div className="space-y-1 md:border-l md:border-white/5 md:pl-8">
                      <p className="text-sm font-medium text-emerald-500">Recovery Potential</p>
                      <p className="text-3xl font-bold text-emerald-500 tracking-tight">
                        +${stats.projectedAnnualLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 italic">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      "Eliminating this behavior would improve execution efficiency by <span className="text-foreground font-bold">{Math.round((stats.mostExpensive.loss / stats.totalLoss) * 100)}%</span> and preserve significant trading capital."
                    </p>
                  </div>
                </div>

                <div className="pt-8 flex items-center justify-between border-t border-white/5 mt-8">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <Activity className="w-4 h-4 text-primary" /> Priority Level: High Impact
                  </div>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-bold">Action Required</Badge>
                </div>
              </div>
            </motion.div>

            {/* BENTO SIDEBAR STATS */}
            <div className="lg:col-span-4 grid grid-cols-1 gap-6">
              {/* PERFORMANCE SCORE CARD */}
              <motion.div
                variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                className="glass-card-premium p-6 flex flex-col items-center text-center relative overflow-hidden group rounded-3xl"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 w-full">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">Performance Score</p>

                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        fill="transparent"
                        stroke="rgba(0,0,0,0.1)"
                        strokeWidth="8"
                        className="dark:stroke-white/5"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="54"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 54}
                        initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                        animate={{ strokeDashoffset: (2 * Math.PI * 54) * (1 - (stats.disciplineScore / 100)) }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className={cn(
                          "transition-all duration-1000",
                          stats.disciplineScore > 80 ? "text-emerald-500" : stats.disciplineScore > 50 ? "text-amber-500" : "text-destructive"
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black tracking-tighter text-foreground">{stats.disciplineScore}%</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Efficiency</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                    <Activity className="w-3 h-3" /> Status: Stable
                  </div>
                </div>
              </motion.div>

              {/* IMPACT ANALYSIS CARD */}
              <motion.div
                variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                className="glass-card-premium p-6 flex flex-col justify-center rounded-3xl relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Efficiency Loss</p>
                    <p className="text-sm font-bold text-destructive">-{Math.round((stats.totalLoss / (stats.totalTrades * 10)) * 100)}%</p>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Loss Impact</p>
                <h3 className="text-4xl font-extrabold text-foreground tracking-tight">-${stats.totalLoss.toLocaleString(undefined, { minimumFractionDigits: 0 })}</h3>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="glass-card-premium p-5 rounded-2xl border-white/5 group hover:scale-[1.02] transition-transform"
                >
                  <div className="p-2 w-fit rounded-lg bg-red-500/10 text-red-500 mb-3">
                    <Brain className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Mistakes</p>
                  <h3 className="text-2xl font-bold text-foreground">{stats.totalCount}</h3>
                </motion.div>
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="glass-card-premium p-5 rounded-2xl border-white/5 group hover:scale-[1.02] transition-transform"
                >
                  <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-500 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Optimal</p>
                  <h3 className="text-2xl font-bold text-foreground">{stats.noMistakeCount}</h3>
                </motion.div>
              </div>
            </div>

            {/* BEHAVIORAL PROFILE CHART */}
            <motion.div
              variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }}
              className="lg:col-span-6 glass-card-premium p-8 h-[440px] rounded-[2.5rem] relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <h3 className="text-2xl font-extrabold mb-10 flex items-center gap-4 relative z-10 text-foreground tracking-tight">
                <div className="p-3 rounded-2xl bg-primary/20 text-primary shadow-lg shadow-primary/20 backdrop-blur-xl">
                  <Activity className="w-6 h-6" />
                </div>
                Behavioral Profile
              </h3>

              <div className="h-[320px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <XAxis
                      type="number"
                      dataKey="B"
                      name="Frequency"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(100,116,139,0.5)', fontSize: 10, fontWeight: 700 }}
                      label={{ value: 'Frequency', position: 'insideBottom', offset: -10, fill: 'rgba(100,116,139,0.4)', fontSize: 10, fontWeight: 800, textAnchor: 'middle' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="A"
                      name="Loss Impact"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(100,116,139,0.5)', fontSize: 10, fontWeight: 700 }}
                      label={{ value: 'Loss Impact', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(100,116,139,0.4)', fontSize: 10, fontWeight: 800, textAnchor: 'middle' }}
                    />
                    <ZAxis type="number" dataKey="A" range={[200, 2000]} />
                    <RechartsTooltip content={<ExecutionTooltip stats={stats} />} />
                    <Scatter
                      name="Mistakes"
                      data={stats.radarData}
                      fill="#3b82f6"
                    >
                      {stats.radarData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.A > 50 ? '#ef4444' : '#3b82f6'}
                          fillOpacity={0.6}
                          stroke={entry.A > 50 ? '#ef4444' : '#3b82f6'}
                          strokeWidth={2}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* LOSS DISTRIBUTION CHART */}
            <motion.div
              variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }}
              className="lg:col-span-6 glass-card-premium p-8 h-[440px] rounded-[2.5rem] relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <h3 className="text-2xl font-extrabold mb-10 flex items-center gap-4 relative z-10 text-foreground tracking-tight">
                <div className="p-3 rounded-2xl bg-destructive/20 text-destructive shadow-lg shadow-destructive/20 backdrop-blur-xl">
                  <TrendingDown className="w-6 h-6" />
                </div>
                Loss Distribution
              </h3>

              <div className="h-[300px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.categories.slice(0, 2)} layout="vertical" margin={{ left: 20, right: 60, top: 20, bottom: 20 }} barGap={30}>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fill: 'rgba(100,116,139,0.6)', fontSize: 11, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip content={<ExecutionTooltip stats={stats} />} />
                    <Bar dataKey="loss" shape={<UniqueBar />} label={renderUniqueBarLabel}>
                      {stats.categories.slice(0, 2).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* EXECUTION DATA STREAM SECTION */}
        <div className="space-y-10 mt-20 mb-32">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-1">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Execution History</h2>
              </div>
              <p className="text-sm text-muted-foreground font-medium ml-12">Detailed log of identified trading mistakes.</p>
            </div>
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/5 text-xs font-bold text-muted-foreground uppercase tracking-widest backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Total Records: {mistakes.length}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence>
              {mistakes.map((mistake, i) => (
                <motion.div
                  key={mistake.id || i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative group pr-4"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/5 group-hover:bg-primary/40 transition-colors" />

                  <div className="glass-card-premium p-8 rounded-3xl group-hover:scale-[1.005] transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16 relative z-10">
                      {/* ID Block */}
                      <div className="lg:w-40 flex-shrink-0 space-y-4 border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/5 pb-6 lg:pb-0 lg:pr-10">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Reference</p>
                          <p className="text-3xl font-extrabold tracking-tighter text-foreground">#{mistake.trade_no || i + 1}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> {new Date(mistake.close_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">TR_ID_{mistake.id?.slice(-6) || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Analysis Block */}
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-bold text-[10px] px-3 py-1">
                            {mistake.mistake}
                          </Badge>
                          <div className="flex items-baseline gap-2">
                            <h4 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">{mistake.symbol}</h4>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{mistake.type}</span>
                          </div>
                        </div>

                        <div className="relative pl-6">
                          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-primary/20" />
                          <p className="text-foreground/80 font-medium leading-relaxed text-lg">
                            "{mistake.reason || 'No execution rationale documented for this entry.'}"
                          </p>
                        </div>

                        <div className="flex gap-8 border-t border-black/5 dark:border-white/5 pt-4">
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Entry Price</p>
                            <p className="text-sm font-mono font-bold text-foreground/70">{mistake.price_open?.toFixed(5)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Exit Price</p>
                            <p className="text-sm font-mono font-bold text-foreground/70">{mistake.price_close?.toFixed(5)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Loss Block */}
                      <div className="lg:w-56 flex flex-col items-end justify-between self-stretch">
                        <div className="text-right space-y-1">
                          <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">Loss Impact</p>
                          <p className="text-4xl font-extrabold text-destructive tracking-tight">
                            -${Math.abs(mistake.loss_amount || 0).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-6 text-primary hover:bg-primary/10 hover:text-primary transition-all group/btn"
                        >
                          Details <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mistakes;
