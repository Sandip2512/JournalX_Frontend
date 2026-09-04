import React, { useState } from "react";
import UserLayout from "@/components/layout/UserLayout";
import {
  Settings as SettingsIcon, User, Bell, Shield, Palette, LogOut,
  LifeBuoy, MessageCircle, Mail, Instagram, Youtube, ChevronRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("support");

  // Passwords & data state
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [confirmClearText, setConfirmClearText] = useState("");

  const tabs = [
    { id: "support", label: "Connect", desc: "Support & Socials", icon: LifeBuoy, color: "text-blue-500", bg: "bg-blue-500/10", border: "hover:border-blue-500/50" },
    { id: "preferences", label: "Preferences", desc: "Theme & Display", icon: Palette, color: "text-purple-500", bg: "bg-purple-500/10", border: "hover:border-purple-500/50" },
    { id: "notifications", label: "Alerts", desc: "Manage notifications", icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50" },
    { id: "security", label: "Security", desc: "Passwords & 2FA", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50" },
    { id: "account", label: "Account", desc: "Danger Zone", icon: User, destructive: true, color: "text-destructive", bg: "bg-destructive/10", border: "hover:border-destructive/50" },
  ];

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    setIsPasswordLoading(true);
    try {
      if (!user) return;
      await api.post(`/api/users/profile/${user.user_id}/password`, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      toast({ title: "Success", description: "Password changed successfully" });
      setIsPasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password change error:", error);
      const msg = error.response?.data?.detail || "Failed to change password";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleClearData = async () => {
    if (confirmClearText !== "clear all") {
      toast({ title: "Error", description: "You must type 'clear all' to confirm", variant: "destructive" });
      return;
    }
    setIsClearingData(true);
    try {
      if (!user) return;
      await api.delete(`/api/users/${user.user_id}/data`);
      toast({ title: "Success", description: "All your data has been permanently deleted" });
      setIsClearOpen(false);
      window.location.reload();
    } catch (error: any) {
      console.error("Clear data error:", error);
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to clear data", variant: "destructive" });
    } finally {
      setIsClearingData(false);
      setConfirmClearText("");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({ title: "Error", description: "Password is required to delete your account", variant: "destructive" });
      return;
    }
    if (confirmDeleteText !== "delete") {
      toast({ title: "Error", description: "You must type 'delete' to confirm", variant: "destructive" });
      return;
    }
    setIsDeletingLoading(true);
    try {
      if (!user) return;
      await api.delete(`/api/users/${user.user_id}/account`, {
        data: { password: deletePassword }
      });
      toast({ title: "Action Complete", description: "Your account has been permanently deleted. Goodbye!", duration: 7000 });
      setIsDeleteOpen(false);
      setTimeout(() => {
        logout();
        window.location.href = "/";
      }, 7000);
    } catch (error: any) {
      console.error("Delete account error:", error);
      const msg = error.response?.data?.detail || "Failed to delete account. Incorrect password?";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsDeletingLoading(false);
      setConfirmDeleteText("");
      setDeletePassword("");
    }
  };

  return (
    <UserLayout>
      <main className="container mx-auto px-4 sm:px-6 py-4 md:py-6 max-w-[1000px] relative">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 left-[20%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 dark:opacity-20" />
        <div className="absolute bottom-0 right-[10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none opacity-50 dark:opacity-20" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start">

          {/* Futuristic Sidebar Overlay */}
          <aside className="w-full md:w-[240px] lg:w-[280px] shrink-0 sticky top-24 z-20">
            <div className="glass-card-premium p-4 rounded-[1.5rem] border border-white/10 dark:border-white/5 bg-background/60 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-inner">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">Settings Hub</h1>
                  <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">v2.0 Interface</p>
                </div>
              </div>

              {/* Ensure it is flex column on desktop but might want a horizontal scroll on mobile */}
              <nav className="flex flex-col gap-2 md:gap-3">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group relative flex items-center gap-4 w-full p-3 rounded-xl text-left transition-all duration-300 overflow-hidden
                        ${isActive
                          ? 'bg-foreground/5 shadow-md border border-foreground/10'
                          : `hover:bg-foreground/5 border border-transparent ${tab.border}`
                        }
                      `}
                    >
                      {/* Active Indicator Glow */}
                      {isActive && <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-transparent opacity-50" />}
                      {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-primary" />}

                      <div className={`relative z-10 w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-lg flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110 shadow-lg' : 'group-hover:scale-110'} ${tab.bg} ${tab.color}`}>
                        <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="relative z-10 flex-1 truncate">
                        <p className={`font-semibold text-sm transition-colors truncate ${isActive ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'}`}>
                          {tab.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{tab.desc}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform duration-300 hidden sm:block ${isActive ? 'translate-x-1 text-foreground' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Epic Main Content Canvas */}
          <div className="flex-1 w-full max-w-full min-w-0 relative min-h-[400px]">
            {activeTab === "support" && (
              <div className="animate-in fade-in zoom-in-95 duration-500 ease-out p-1">
                <div className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Connect with Us</h2>
                  <p className="text-muted-foreground mt-2 text-base md:text-lg">Join our community, get instant help, and follow our journey.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-3xl">
                  {/* WhatsApp Bento Card */}
                  <a href="https://wa.me/919075048554" target="_blank" rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-2xl p-4 md:p-5 glass-card-premium border-green-500/20 hover:border-green-500/50 bg-gradient-to-br from-green-500/5 to-transparent transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500 mb-3 border border-green-500/30 group-hover:scale-110 transition-transform shadow-inner">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">WhatsApp</h3>
                      <p className="text-muted-foreground mt-2 line-clamp-2 text-xs md:text-sm">Chat with our dedicated support team directly.</p>
                      <div className="mt-4 flex items-center gap-2 text-green-500 font-semibold text-[10px] md:text-sm uppercase tracking-wider">
                        Quick Support <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </a>

                  {/* Email Bento Card */}
                  <div onClick={() => { if (typeof navigator !== "undefined" && navigator.clipboard) { navigator.clipboard.writeText("sandipsalunkhe6640@gmail.com"); toast({ title: "Email Copied!" }) } }}
                    className="group relative overflow-hidden rounded-2xl p-4 md:p-5 glass-card-premium border-blue-500/20 hover:border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-transparent transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-3 border border-blue-500/30 group-hover:scale-110 transition-transform shadow-inner">
                        <Mail className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Email</h3>
                      <p className="text-muted-foreground mt-2 break-all line-clamp-2 text-xs md:text-sm">sandipsalunkhe6640@gmail.com</p>
                      <div className="mt-4 flex items-center gap-2 text-blue-500 font-semibold text-[10px] md:text-sm uppercase tracking-wider">
                        Copy Address <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Instagram Bento Card */}
                  <a href="https://www.instagram.com/fx.traders0?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-2xl p-4 md:p-5 glass-card-premium border-pink-500/20 hover:border-pink-500/50 bg-gradient-to-br from-pink-500/5 to-transparent transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-500/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-pink-500/20 rounded-2xl flex items-center justify-center text-pink-500 mb-3 border border-pink-500/30 group-hover:scale-110 transition-transform shadow-inner">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Instagram</h3>
                      <p className="text-muted-foreground mt-2 line-clamp-2 text-xs md:text-sm">Follow our daily insights and updates.</p>
                      <div className="mt-4 flex items-center gap-2 text-pink-500 font-semibold text-[10px] md:text-sm uppercase tracking-wider">
                        @fx.traders0 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </a>

                  {/* YouTube Bento Card */}
                  <a href="https://youtube.com/@fx_traders0?si=YfBy2grOSge2N8Fh" target="_blank" rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-2xl p-4 md:p-5 glass-card-premium border-red-500/20 hover:border-red-500/50 bg-gradient-to-br from-red-500/5 to-transparent transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-3 border border-red-500/30 group-hover:scale-110 transition-transform shadow-inner">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">YouTube</h3>
                      <p className="text-muted-foreground mt-2 line-clamp-2 text-xs md:text-sm">Watch high-quality trading breakdowns.</p>
                      <div className="mt-4 flex items-center gap-2 text-red-500 font-semibold text-[10px] md:text-sm uppercase tracking-wider">
                        Subscribe Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="animate-in fade-in zoom-in-95 duration-500 ease-out glass-card-premium rounded-[1.5rem] p-5 md:p-6 border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px]" />
                <div className="relative z-10">
                  <div className="mb-6 md:mb-8">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 md:mb-6 shadow-sm border border-primary/20">
                      <Palette className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Display & Data</h2>
                    <p className="text-muted-foreground mt-2 text-base md:text-lg">Customize your JournalX environment.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <div className="space-y-4 p-3 md:p-4 rounded-xl bg-background/50 border border-border/50">
                      <Label className="text-xs md:text-sm font-semibold">Workspace Theme</Label>
                      <div className="flex bg-muted/50 p-1.5 rounded-xl border border-border overflow-hidden">
                        <Button variant={theme === "light" ? "default" : "ghost"} className="flex-1 rounded-lg h-9 md:h-10 shadow-none font-semibold transition-all text-xs md:text-sm" onClick={() => setTheme("light")}>☀️ Light</Button>
                        <Button variant={theme === "dark" ? "default" : "ghost"} className="flex-1 rounded-lg h-9 md:h-10 shadow-none font-semibold transition-all text-xs md:text-sm" onClick={() => setTheme("dark")}>🌙 Dark</Button>
                      </div>
                    </div>
                    <div className="space-y-4 p-3 md:p-4 rounded-xl bg-background/50 border border-border/50">
                      <Label className="text-xs md:text-sm font-semibold">Local Currency</Label>
                      <Select defaultValue="usd">
                        <SelectTrigger className="h-10 md:h-12 bg-background/80 rounded-xl border-border hover:border-primary/50 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent><SelectItem value="usd">USD ($)</SelectItem><SelectItem value="eur">EUR (€)</SelectItem><SelectItem value="gbp">GBP (£)</SelectItem><SelectItem value="inr">INR (₹)</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="animate-in fade-in zoom-in-95 duration-500 ease-out glass-card-premium rounded-[1.5rem] p-5 md:p-6 border border-amber-500/10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-4 md:mb-3 border border-amber-500/20"><Bell className="w-5 h-5 md:w-6 md:h-6" /></div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-6 md:mb-8">Notification Desk</h2>
                <div className="space-y-4 md:space-y-6">
                  {[
                    { id: "email-trades", label: "Trade Execution Alerts", desc: "Get an email when a trade is automatically synced." },
                    { id: "email-daily", label: "Daily Summary Report", desc: "Receive your daily performance recap." },
                    { id: "push-alerts", label: "Browser Push Alerts", desc: "Instant visual notifications in the top corner." },
                  ].map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 gap-3 rounded-xl bg-background/40 border border-border/30 hover:border-amber-500/30 transition-colors">
                      <div>
                        <p className="font-semibold text-foreground text-base md:text-lg">{item.label}</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-amber-500 self-end sm:self-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="animate-in fade-in zoom-in-95 duration-500 ease-out glass-card-premium rounded-[1.5rem] p-5 md:p-6 border border-emerald-500/10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 md:mb-3 border border-emerald-500/20"><Shield className="w-5 h-5 md:w-6 md:h-6" /></div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-6 md:mb-8">Asset Security</h2>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <div>
                      <p className="font-bold text-base md:text-lg">Two-Factor Auth</p>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">Highly recommended for data safety.</p>
                    </div>
                    <Button className="mt-4 sm:mt-0 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl px-6 md:px-8 h-10 md:h-12 font-semibold text-sm">Enable 2FA</Button>
                  </div>

                  {/* Restore Password Changing */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <div>
                      <p className="font-bold text-base md:text-lg">Change Password</p>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">Update your existing account password.</p>
                    </div>
                    <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="mt-4 sm:mt-0 h-10 md:h-12 rounded-xl border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white px-6 font-bold text-sm">Update Password</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Update Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and a secure new one.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="current">Current Password</Label>
                            <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new">New Password</Label>
                            <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm">Confirm New Password</Label>
                            <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setIsPasswordOpen(false)}>Cancel</Button>
                          <Button onClick={handleChangePassword} disabled={isPasswordLoading}>
                            {isPasswordLoading ? "Updating..." : "Save Password"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="animate-in fade-in zoom-in-95 duration-500 ease-out glass-card-premium rounded-[1.5rem] p-5 md:p-6 border border-destructive/20 bg-destructive/5 shadow-2xl shadow-destructive/10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4 md:mb-3 border border-destructive/20"><User className="w-6 h-6 md:w-8 h-8" /></div>
                <h2 className="text-xl md:text-2xl font-extrabold text-destructive tracking-tight mb-2">Danger Zone</h2>
                <p className="text-muted-foreground text-sm md:text-lg mb-6 md:mb-8">Destructive actions. Proceed with extreme caution.</p>
                <div className="space-y-4">
                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl bg-background/50 border border-destructive/20 hover:border-destructive/40 transition-colors">
                    <div>
                      <p className="font-bold text-base md:text-lg text-foreground">Sign Out Globally</p>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">Disconnects this device securely.</p>
                    </div>
                    <Button variant="outline" className="mt-4 sm:mt-0 h-10 md:h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-white px-6 font-bold text-sm" onClick={() => logout()}>Logout Now</Button>
                  </div>

                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl bg-background/50 border border-destructive/20 hover:border-destructive/40 transition-colors">
                    <div>
                      <p className="font-bold text-base md:text-lg text-foreground">Clear All Data</p>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">Wipes manual trades, reports, and history.</p>
                    </div>
                    <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="mt-4 sm:mt-0 h-10 md:h-12 rounded-xl px-6 font-bold text-sm">Clear Data</Button>
                      </DialogTrigger>
                      <DialogContent className="border-destructive/30 sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-destructive flex items-center gap-2"><User className="w-5 h-5" /> Wipe Database</DialogTitle>
                          <DialogDescription className="pt-2">
                            This will erase all your manual trades and reports. Type <strong>clear all</strong> below to confirm.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="confirm-clear" className="font-bold">Confirmation Phrase: clear all</Label>
                            <Input id="confirm-clear" type="text" placeholder="clear all" value={confirmClearText} onChange={(e) => setConfirmClearText(e.target.value)} disabled={isClearingData} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setIsClearOpen(false)} disabled={isClearingData}>Cancel</Button>
                          <Button variant="destructive" onClick={handleClearData} disabled={isClearingData}>
                            {isClearingData ? "Clearing..." : "Wipe Everything"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl bg-background/50 border border-destructive/20 hover:border-destructive/40 transition-colors">
                    <div>
                      <p className="font-bold text-base md:text-lg text-foreground">Delete Account</p>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">Permanently deletes your account and data.</p>
                    </div>

                    <Dialog open={isDeleteOpen} onOpenChange={(open) => {
                      if (!isDeletingLoading) setIsDeleteOpen(open);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="mt-4 sm:mt-0 h-10 md:h-12 rounded-xl px-6 font-bold text-sm">Delete Account</Button>
                      </DialogTrigger>
                      <DialogContent className="border-destructive/30 sm:max-w-md" onPointerDownOutside={(e) => {
                        if (isDeletingLoading) e.preventDefault();
                      }}>
                        <DialogHeader>
                          <DialogTitle className="text-destructive flex items-center gap-2"><User className="w-5 h-5" /> Delete Account</DialogTitle>
                          <DialogDescription className="pt-2">
                            This action cannot be undone. Enter your password and type <strong>delete</strong> to confirm.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="delete-password">Your Password</Label>
                            <Input id="delete-password" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} disabled={isDeletingLoading} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-delete">Confirmation Phrase</Label>
                            <Input id="confirm-delete" type="text" placeholder="delete" value={confirmDeleteText} onChange={(e) => setConfirmDeleteText(e.target.value)} disabled={isDeletingLoading} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isDeletingLoading}>Cancel</Button>
                          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeletingLoading}>
                            {isDeletingLoading ? "Deleting..." : "Permanently Delete"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </UserLayout>
  );
};

export default Settings;
