import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    ArrowRightLeft,
    BarChart3,
    Target,
    ClipboardList,
    MessageSquare,
    AlertTriangle,
    Settings,
    Plug,
    Users,
    ShieldAlert,
    Bell,
    Search,
    User
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/context/AuthContext";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search pages, trades, or symbols..." />
            <CommandList className="max-h-[500px]">
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Main">
                    <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                            <span>Dashboard</span>
                            <span className="text-[10px] text-muted-foreground">View your trading overview and stats</span>
                        </div>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/trades"))}>
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                            <span>Trades</span>
                            <span className="text-[10px] text-muted-foreground">View and manage all your trades</span>
                        </div>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/traders-diary"))}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                            <span>Journal</span>
                            <span className="text-[10px] text-muted-foreground">Write and review your trade journal entries</span>
                        </div>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Analytics">
                    <CommandItem onSelect={() => runCommand(() => navigate("/analytics"))}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                            <span>Performance Analysis</span>
                            <span className="text-[10px] text-muted-foreground">Analyze your trading performance metrics</span>
                        </div>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/mistakes"))}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                            <span>Trade Analysis (Mistakes)</span>
                            <span className="text-[10px] text-muted-foreground">Deep dive into individual trade analytics</span>
                        </div>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Tools">
                    <CommandItem onSelect={() => runCommand(() => navigate("/goals"))}>
                        <Target className="mr-2 h-4 w-4" />
                        <span>Goals</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/broker-connections"))}>
                        <Plug className="mr-2 h-4 w-4" />
                        <span>Broker Connections</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Community">
                    <CommandItem onSelect={() => runCommand(() => navigate("/community"))}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Community Hub</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/community/lounge"))}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Traders Lounge</span>
                    </CommandItem>
                </CommandGroup>

                {user?.role === "admin" && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Admin">
                            <CommandItem onSelect={() => runCommand(() => navigate("/admin"))}>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Admin Dashboard</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/admin/users"))}>
                                <Users className="mr-2 h-4 w-4" />
                                <span>User Management</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/admin/trades"))}>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                <span>Trade Management</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/admin/logs"))}>
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                <span>System Logs</span>
                            </CommandItem>
                        </CommandGroup>
                    </>
                )}

                <CommandSeparator />

                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => runCommand(() => navigate("/profile"))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>

            {/* Search Footer Hints */}
            <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-muted-foreground bg-muted/30">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <kbd className="rounded border bg-muted px-1.5 font-sans font-medium">↑</kbd>
                        <kbd className="rounded border bg-muted px-1.5 font-sans font-medium">↓</kbd>
                        Navigate
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="rounded border bg-muted px-1.5 font-sans font-medium">↵</kbd>
                        Select
                    </span>
                </div>
                <span className="flex items-center gap-1">
                    <kbd className="rounded border bg-muted px-1.5 font-sans font-medium">esc</kbd>
                    Close
                </span>
            </div>
        </CommandDialog>
    );
}
