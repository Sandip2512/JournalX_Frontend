import re

with open("src/pages/Settings.tsx", "r", encoding="utf-8") as f:
    content = f.read()

parts = content.split("  return (\n    <UserLayout>", 1)
if len(parts) == 2:
    prefix = parts[0]
    
    if "const [activeTab, setActiveTab]" not in prefix:
        prefix = prefix.replace("  };\n\n", "  };\n\n  const [activeTab, setActiveTab] = useState(\"preferences\");\n\n  const tabs = [\n    { id: \"preferences\", label: \"Preferences\", icon: Palette },\n    { id: \"notifications\", label: \"Notifications\", icon: Bell },\n    { id: \"security\", label: \"Security\", icon: Shield },\n    { id: \"support\", label: \"Support & Connect\", icon: LifeBuoy },\n    { id: \"account\", label: \"Danger Zone\", icon: User, destructive: true },\n  ];\n\n")

    new_ui = """  return (
    <UserLayout>
      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="space-y-1 mb-8 opacity-0 animate-fade-up">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
          </div>
          <p className="text-muted-foreground mt-1 ml-11">Manage your account preferences and security.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0 overflow-x-auto md:sticky md:top-24 scrollbar-none">
            <nav className="flex md:flex-col gap-2 pb-2 md:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                      ${isActive 
                        ? (tab.destructive ? "bg-destructive/10 text-destructive shadow-sm border border-destructive/20" : "bg-primary text-primary-foreground shadow-sm") 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive && tab.destructive ? "text-destructive" : ""}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 w-full max-w-3xl min-h-[500px]">
            {activeTab === "preferences" && (
              <div className="glass-card-premium p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">Preferences</h2>
                  <p className="text-sm text-muted-foreground mt-1">Customize how JournalX looks and behaves for you.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-3">
                    <Label className="text-foreground/80">Theme</Label>
                    <div className="flex bg-muted/30 dark:bg-muted/20 p-[2px] rounded-lg border border-border">
                      <Button
                        variant={theme === "light" ? "secondary" : "ghost"}
                        className="flex-1 h-9 rounded-md shadow-none"
                        onClick={() => setTheme("light")}
                      >
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "secondary" : "ghost"}
                        className="flex-1 h-9 rounded-md shadow-none"
                        onClick={() => setTheme("dark")}
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-foreground/80">Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="inr">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-foreground/80">Timezone</Label>
                    <Select defaultValue="ist">
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                        <SelectItem value="est">EST (UTC-5)</SelectItem>
                        <SelectItem value="pst">PST (UTC-8)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-foreground/80">Date Format</Label>
                    <Select defaultValue="dmy">
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="glass-card-premium p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">Notifications</h2>
                  <p className="text-sm text-muted-foreground mt-1">Control over what alerts you receive and how.</p>
                </div>
                <div className="space-y-6">
                  {[
                    { id: "email-trades", label: "Trade Notifications", desc: "Get an email when a trade is logged or synced." },
                    { id: "email-daily", label: "Daily Summary", desc: "Receive your daily performance recap at 10 PM." },
                    { id: "email-weekly", label: "Weekly Report", desc: "In-depth analytics report every Sunday." },
                    { id: "push-alerts", label: "Push Alerts", desc: "Instant browser notifications for market alerts." },
                  ].map((item, idx) => (
                    <div key={item.id}>
                      <div className="flex items-center justify-between group">
                        <div className="pr-4">
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground leading-snug break-words">{item.desc}</p>
                        </div>
                        <Switch defaultChecked={item.id !== "push-alerts"} className="data-[state=checked]:bg-primary" />
                      </div>
                      {idx < 3 && <Separator className="bg-border/50 my-4" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="glass-card-premium p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">Security Settings</h2>
                  <p className="text-sm text-muted-foreground mt-1">Keep your JournalX account secured and protected.</p>
                </div>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of protection</p>
                    </div>
                    <Button variant="outline" className="h-9 w-full sm:w-auto shrink-0">Enable 2FA</Button>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">Password Management</p>
                      <p className="text-sm text-muted-foreground">Update your login credentials regularly</p>
                    </div>

                    <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-9 w-full sm:w-auto shrink-0">Change Password</Button>
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

            {activeTab === "support" && (
              <div className="glass-card-premium p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border-primary/20">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">Support & Connect</h2>
                  <p className="text-sm text-muted-foreground mt-1">Reach out to us or join the community.</p>
                </div>
                <div className="space-y-3">
                  <a href="https://wa.me/919075048554" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center justify-between p-4 group hover:bg-green-500/5 rounded-xl border border-transparent hover:border-green-500/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/10 text-green-500 rounded-xl shadow-sm">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-green-500 transition-colors">WhatsApp Support</p>
                        <p className="text-xs sm:text-sm text-muted-foreground break-all">+91 9075048554</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex h-9 px-4 shrink-0 items-center justify-center rounded-lg text-sm font-medium bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">Message</div>
                  </a>

                  <a href="mailto:sandipsalunkhe6640@gmail.com" 
                     onClick={() => {
                       if (typeof navigator !== "undefined" && navigator.clipboard) {
                         navigator.clipboard.writeText("sandipsalunkhe6640@gmail.com");
                       }
                     }}
                     className="flex items-center justify-between p-4 group hover:bg-blue-500/5 rounded-xl border border-transparent hover:border-blue-500/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shadow-sm">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-blue-500 transition-colors">Email Us</p>
                        <p className="text-xs sm:text-sm text-muted-foreground break-all">sandipsalunkhe6640@gmail.com</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex h-9 px-4 shrink-0 items-center justify-center rounded-lg text-sm font-medium bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">Send Email</div>
                  </a>

                  <a href="https://www.instagram.com/fx.traders0?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center justify-between p-4 group hover:bg-pink-500/5 rounded-xl border border-transparent hover:border-pink-500/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl shadow-sm">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-pink-500 transition-colors">Instagram</p>
                        <p className="text-xs sm:text-sm text-muted-foreground break-all">@fx.traders0</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex h-9 px-4 shrink-0 items-center justify-center rounded-lg text-sm font-medium bg-pink-500/10 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">Follow</div>
                  </a>

                  <a href="https://youtube.com/@fx_traders0?si=YfBy2grOSge2N8Fh" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center justify-between p-4 group hover:bg-red-500/5 rounded-xl border border-transparent hover:border-red-500/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-500/10 text-red-500 rounded-xl shadow-sm">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-red-500 transition-colors">YouTube</p>
                        <p className="text-xs sm:text-sm text-muted-foreground break-all">@fx_traders0</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex h-9 px-4 shrink-0 items-center justify-center rounded-lg text-sm font-medium bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">Subscribe</div>
                  </a>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="glass-card-premium p-6 md:p-8 border-destructive/20 bg-destructive/5 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-md">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground mt-1">Irreversible actions that affect your account and data.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-destructive/10 border border-destructive/20 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">Clear All Data</p>
                      <p className="text-sm text-muted-foreground mt-1">Wipes all manual trades, reports, and history.</p>
                    </div>
                    <Button variant="destructive" className="shrink-0 font-medium" onClick={handleClearData} disabled={isClearingData}>
                      {isClearingData ? "Clearing..." : "Clear Data"}
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-destructive/10 border border-destructive/20 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">Sign Out</p>
                      <p className="text-sm text-muted-foreground mt-1">Disconnects this device securely.</p>
                    </div>
                    <Button variant="destructive" className="shrink-0 gap-2 font-medium" onClick={() => { if (window.confirm("Are you sure?")) logout(); }}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-destructive/10 border border-destructive/20 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">Delete Account</p>
                      <p className="text-sm text-muted-foreground mt-1">Permanently deletes your account and all data.</p>
                    </div>
                    <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="shrink-0 font-medium">Delete Account</Button>
                      </DialogTrigger>
                      <DialogContent className="border-destructive/30 sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-destructive flex items-center gap-2"><User className="w-5 h-5"/> Delete Account</DialogTitle>
                          <DialogDescription className="pt-2">
                            This action cannot be undone. Please enter your password to confirm.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Label htmlFor="delete-password">Your Password</Label>
                          <Input id="delete-password" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                        </div>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
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
"""
    
    with open("src/pages/Settings.tsx", "w", encoding="utf-8") as out:
        out.write(prefix + new_ui)
        print("Updated Settings UI layout")
