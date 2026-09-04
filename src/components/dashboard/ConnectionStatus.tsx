import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, ChevronDown, LogOut, Check, Plus, Loader2, Zap, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Account {
  account_id: string;
  server: string;
  label: string;
  is_active: boolean;
}

interface ConnectionStatusProps {
  isConnected: boolean;
  accountId: string;
  server: string;
  lastFetch: string;
  variant?: "default" | "compact";
  onDisconnect?: () => void;
  onSwitchAccount?: (accountId: string) => void;
}

export function ConnectionStatus({
  isConnected,
  accountId,
  server,
  lastFetch,
  variant = "default",
  onDisconnect,
  onSwitchAccount,
}: ConnectionStatusProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [disconnecting, setDisconnecting] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  // Add account modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [connectStep, setConnectStep] = useState<"platform" | "credentials">("platform");
  const [selectedPlatform, setSelectedPlatform] = useState<"MT4" | "MT5" | null>(null);
  const [connectionForm, setConnectionForm] = useState({ login: "", password: "", server: "" });
  const [isConnecting, setIsConnecting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Allow the global + button to trigger the MT5 connect modal
  useEffect(() => {
    const handler = () => setShowAddModal(true);
    window.addEventListener("journalx-open-mt5-modal", handler);
    return () => window.removeEventListener("journalx-open-mt5-modal", handler);
  }, []);

  // Fetch saved accounts when dropdown opens
  useEffect(() => {
    if (open && user?.user_id) {
      api
        .get(`/mt5/list-accounts?user_id=${user.user_id}`)
        .then((r) => setAccounts(r.data))
        .catch(() => {
          if (isConnected && accountId) {
            setAccounts([{ account_id: accountId, server, label: `Account #${accountId}`, is_active: true }]);
          }
        });
    }
  }, [open, user?.user_id, isConnected, accountId, server]);

  const handleDisconnect = async () => {
    if (!user?.user_id) return;
    setDisconnecting(true);
    try {
      // Try full disconnect first (removes token + creds)
      await api.delete(`/mt5/disconnect-all?user_id=${user.user_id}`);
      setOpen(false);
      toast.success("Disconnected from MT5");
      onDisconnect?.();
    } catch {
      // Fallback: token-only disconnect
      try {
        await api.delete(`/mt5/token?user_id=${user.user_id}`);
        setOpen(false);
        toast.success("EA disconnected");
        onDisconnect?.();
      } catch {
        toast.error("Failed to disconnect. Please try again.");
      }
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSwitch = async (targetAccountId: string) => {
    if (!user?.user_id || targetAccountId === accountId) return;
    setSwitching(targetAccountId);
    try {
      await api.post(`/mt5/switch-account?user_id=${user.user_id}&account_id=${targetAccountId}`);
      setOpen(false);
      toast.success(`Switched to account ${targetAccountId}`);
      onSwitchAccount?.(targetAccountId);
    } catch {
      toast.error("Failed to switch account.");
    }
    setSwitching(null);
  };

  const handleConnect = async () => {
    if (!connectionForm.login || !connectionForm.password || !connectionForm.server) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!user?.user_id) {
      toast.error("User session not found. Please log in again.");
      return;
    }
    setIsConnecting(true);
    try {
      await api.post("/mt5/connect", {
        account: parseInt(connectionForm.login),
        password: connectionForm.password,
        server: connectionForm.server,
        user_id: user.user_id,
        days: 365,
      });
      await api.post(`/users/${user.user_id}/fetch-mt5-trades`);
      setShowAddModal(false);
      setOpen(false);
      toast.success(`${selectedPlatform} Account Connected!`, {
        description: "Trades are syncing. Refresh the dashboard to see them.",
      });
      setConnectionForm({ login: "", password: "", server: "" });
      setConnectStep("platform");
      setSelectedPlatform(null);
      onSwitchAccount?.("");
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "Connection failed. Check your credentials.";
      toast.error("Connection Failed", { description: detail });
    } finally {
      setIsConnecting(false);
    }
  };

  // ── Add Account Modal ────────────────────────────────────────────────────────
  const renderAddModal = () => (
    <Dialog
      open={showAddModal}
      onOpenChange={(v) => {
        setShowAddModal(v);
        if (!v) {
          setConnectStep("platform");
          setSelectedPlatform(null);
          setConnectionForm({ login: "", password: "", server: "" });
        }
      }}
    >
      <DialogContent className="sm:max-w-[360px] bg-card border-border shadow-2xl rounded-[24px] p-0 overflow-hidden border">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-purple-500" />
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-lg font-black tracking-tighter text-foreground flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-primary" /> Connect Account
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-xs leading-relaxed mt-1.5">
            {connectStep === "platform"
              ? "Select your trading terminal to begin syncing trades."
              : `Enter your ${selectedPlatform} credentials below.`}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-0">
          {connectStep === "platform" ? (
            <div className="grid grid-cols-2 gap-3 py-2">
              <button
                onClick={() => { setSelectedPlatform("MT4"); setConnectStep("credentials"); }}
                className="group flex flex-col items-center justify-center p-5 rounded-[16px] border border-border bg-secondary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-primary/20">
                  <span className="text-base font-black text-primary tracking-tighter">MT4</span>
                </div>
                <span className="font-bold text-foreground tracking-tight text-sm">Terminal 4</span>
              </button>
              <button
                onClick={() => { setSelectedPlatform("MT5"); setConnectStep("credentials"); }}
                className="group flex flex-col items-center justify-center p-5 rounded-[16px] border border-border bg-secondary/30 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-indigo-500/20">
                  <span className="text-base font-black text-indigo-500 tracking-tighter">MT5</span>
                </div>
                <span className="font-bold text-foreground tracking-tight text-sm">Terminal 5</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="cs-login" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Login (Account Number)</Label>
                <Input
                  id="cs-login"
                  placeholder="Account Number"
                  value={connectionForm.login}
                  onChange={(e) => setConnectionForm({ ...connectionForm, login: e.target.value })}
                  className="bg-secondary/40 border-border rounded-xl h-11 font-mono font-bold text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cs-pass" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</Label>
                <Input
                  id="cs-pass"
                  type="password"
                  placeholder="••••••••"
                  value={connectionForm.password}
                  onChange={(e) => setConnectionForm({ ...connectionForm, password: e.target.value })}
                  className="bg-secondary/40 border-border rounded-xl h-11 font-bold text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cs-server" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Server</Label>
                <Input
                  id="cs-server"
                  placeholder="Broker-Server-Name"
                  value={connectionForm.server}
                  onChange={(e) => setConnectionForm({ ...connectionForm, server: e.target.value })}
                  className="bg-secondary/40 border-border rounded-xl h-11 font-bold text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-xl h-11 font-bold text-sm text-muted-foreground"
                  onClick={() => setConnectStep("platform")}
                >
                  Back
                </Button>
                <Button
                  className="flex-[2] rounded-xl h-11 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                  {isConnecting ? "Connecting..." : `Connect ${selectedPlatform}`}
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-secondary/30 border-t border-border">
          <p className="text-[9px] text-center text-muted-foreground/60 leading-relaxed font-medium uppercase tracking-wider">
            Credentials are encrypted and never stored in plain text.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ── Compact pill variant ─────────────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <>
        {renderAddModal()}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen((p) => !p)}
            className={cn(
              "glass-card-premium px-3 py-1.5 rounded-full flex items-center gap-2.5 animate-fade-up border shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none",
              isConnected
                ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
                : "border-red-500/20 bg-red-500/5 hover:border-red-500/40"
            )}
            style={{ animationDelay: "0.2s" }}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"
                : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            )} />
            <span className="text-xs font-bold text-foreground">
              {isConnected ? (accountId ? `MT5 · ${accountId}` : "MT5 Live") : "MT5 Offline"}
            </span>
            <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {isConnected ? "Active Account" : "MT5 Status"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                  <p className="text-sm font-bold text-foreground">{isConnected ? accountId : "Not Connected"}</p>
                </div>
                {isConnected && server && <p className="text-[10px] text-muted-foreground mt-0.5">{server}</p>}
              </div>

              {/* Account switcher */}
              {accounts.length > 1 && (
                <div className="px-2 py-2 border-b border-border/50">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2 mb-1.5">Switch Account</p>
                  {accounts.map((acc) => (
                    <button
                      key={acc.account_id}
                      onClick={() => handleSwitch(acc.account_id)}
                      disabled={acc.is_active || switching === acc.account_id}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all",
                        acc.is_active ? "bg-primary/10 text-primary cursor-default" : "hover:bg-muted text-foreground cursor-pointer"
                      )}
                    >
                      {switching === acc.account_id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      ) : acc.is_active ? (
                        <Check className="w-3 h-3 text-primary" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-border" />
                      )}
                      <div className="text-left">
                        <p className="font-semibold text-xs">{acc.label}</p>
                        {acc.server && <p className="text-[10px] text-muted-foreground">{acc.server}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Add another account */}
              <div className="px-2 py-1.5 border-b border-border/50">
                <button
                  onClick={() => { setOpen(false); setShowAddModal(true); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition-all group"
                >
                  <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
                  Add / change account
                </button>
              </div>

              {/* Disconnect */}
              <div className="px-2 py-2">
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-all group"
                >
                  {disconnecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  )}
                  {disconnecting ? "Disconnecting..." : "Disconnect MT5"}
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // ── Default (full card) variant ──────────────────────────────────────────────
  return (
    <>
      {renderAddModal()}
      <div className="glass-card-premium p-6 rounded-2xl opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] animate-pulse",
              isConnected ? "bg-emerald-500 text-emerald-500" : "bg-red-500 text-red-500"
            )} />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                MT5 Connection
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border",
                  isConnected
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                  {isConnected ? "Live" : "Offline"}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {isConnected ? (
                  <>Connected to <span className="text-foreground font-medium">{server}</span> as <span className="text-foreground font-medium">{accountId}</span></>
                ) : "Trading functionality unavailable"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4" />
              {isConnected ? "Switch Account" : "Connect"}
            </Button>
            {isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10"
              >
                {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
