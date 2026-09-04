import re

with open("src/pages/Settings.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update state declarations
# We need `confirmDeleteText` and `confirmClearData`.
state_inject = """  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");"""
text = text.replace('  const [isDeletingLoading, setIsDeletingLoading] = useState(false);', state_inject)

state_inject2 = """  const [isClearingData, setIsClearingData] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [confirmClearText, setConfirmClearText] = useState("");"""
text = text.replace('  const [isClearingData, setIsClearingData] = useState(false);', state_inject2)

# 2. Rewrite handleClearData
handleClearData = """  const handleClearData = async () => {
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
  };"""
text = re.sub(r'  const handleClearData = async \(\) => \{.+?  \};', handleClearData, text, flags=re.DOTALL)

# 3. Rewrite handleDeleteAccount
handleDeleteAccount = """  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({ title: "Error", description: "Password is required", variant: "destructive" });
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
      // Show toaster for 7 seconds
      toast({ title: "Action Complete", description: "Your account has been permanently deleted. Goodbye!", duration: 7000 });
      setIsDeleteOpen(false);
      
      // Delay logout/redirect slightly to let the toast show
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
  };"""
text = re.sub(r'  const handleDeleteAccount = async \(\) => \{.+?  \};', handleDeleteAccount, text, flags=re.DOTALL)

# 4. Rewrite the Danger Zone UI
danger_zone_old = """                    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 gap-3 rounded-xl bg-background/50 border border-destructive/20 hover:border-destructive/40 transition-colors">
                      <div>
                        <p className="font-bold text-base md:text-lg text-foreground">Clear All Data</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">Wipes manual trades, reports, and history.</p>
                      </div>
                      <Button variant="destructive" className="mt-4 sm:mt-0 h-10 md:h-12 rounded-xl px-6 font-bold text-sm" onClick={handleClearData} disabled={isClearingData}>
                        {isClearingData ? "Clearing..." : "Clear Data"}
                      </Button>
                    </div>

                    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl bg-background/50 border border-destructive/20 hover:border-destructive/40 transition-colors">
                      <div>
                        <p className="font-bold text-base md:text-lg text-foreground">Delete Account</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">Permanently deletes your account and data.</p>
                      </div>
                      
                      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="mt-4 sm:mt-0 h-10 md:h-12 rounded-xl px-6 font-bold text-sm">Delete Account</Button>
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
                    </div>"""

# Try matching varying styles of padding
# Use a broad regex to capture from "Clear All Data" block down to the end of Danger zone.
danger_zone_regex = r'<p className="font-bold[^>]*>Clear All Data</p>.*?</Dialog>$'
text_parts = text.split('<p className="font-bold text-base md:text-lg text-foreground">Clear All Data</p>')

danger_zone_ui = """<div>
                        <p className="font-bold text-base md:text-lg text-foreground">Clear All Data</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">Wipes manual trades, reports, and history.</p>
                      </div>
                      
                      <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="mt-4 sm:mt-0 h-10 md:h-12 rounded-xl px-6 font-bold text-sm">Clear Data</Button>
                        </DialogTrigger>
                        <DialogContent className="border-destructive/30 sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-2"><User className="w-5 h-5"/> Wipe Database</DialogTitle>
                            <DialogDescription className="pt-2">
                              This will erase all your manual trades and reports. Type <strong>clear all</strong> below to confirm.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Label htmlFor="confirm-clear" className="font-bold">Confirmation Phrase: clear all</Label>
                            <Input id="confirm-clear" type="text" placeholder="clear all" value={confirmClearText} onChange={(e) => setConfirmClearText(e.target.value)} />
                          </div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsClearOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleClearData} disabled={isClearingData}>
                              {isClearingData ? "Clearing..." : "Wipe Everything"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 gap-3 rounded-xl bg-background/50 border border-destructive/20 hover:border-destructive/40 transition-colors">
                      <div>
                        <p className="font-bold text-base md:text-lg text-foreground">Delete Account</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">Permanently deletes your account and data.</p>
                      </div>
                      
                      <Dialog open={isDeleteOpen} onOpenChange={(open) => {
                          if(!isDeletingLoading) setIsDeleteOpen(open);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="mt-4 sm:mt-0 h-10 md:h-12 rounded-xl px-6 font-bold text-sm">Delete Account</Button>
                        </DialogTrigger>
                        <DialogContent className="border-destructive/30 sm:max-w-md" onPointerDownOutside={(e) => {
                            if(isDeletingLoading) e.preventDefault();
                        }}>
                          <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-2"><User className="w-5 h-5"/> Delete Account</DialogTitle>
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
                              {isDeletingLoading ? "Deleting Account..." : "Permanently Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>"""

text = text_parts[0] + danger_zone_ui + text_parts[1].split('</Dialog>\n                    </div>')[1]

with open("src/pages/Settings.tsx", "w", encoding="utf-8") as f:
    f.write(text)
print("Updated successfully!")
