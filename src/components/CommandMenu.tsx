import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    TrendingUp,
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

        const handleToggle = () => {
            console.log("Command Menu: Toggle event received");
            setOpen((open) => !open);
        };

        window.addEventListener("keydown", down);
        window.addEventListener("journalx-search-open", handleToggle);

        // Add a global trigger function as ultimate fallback
        (window as any).__JOURNALX_TOGGLE_SEARCH = handleToggle;

        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("journalx-search-open", handleToggle);
            delete (window as any).__JOURNALX_TOGGLE_SEARCH;
        };
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            {/* DEBUG INDICATOR - REMOVE AFTER FIXING */}
            <div
                className="fixed bottom-4 left-4 z-[9999] px-2 py-1 rounded bg-red-600/80 text-white text-[10px] font-mono pointer-events-none"
                style={{ backdropFilter: 'blur(4px)' }}
            >
                CMD_MENU_STATUS: {open ? 'OPEN' : 'CLOSED'}
            </div>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <div className="relative z-[9999]">
                    <CommandInput placeholder="Search pages, trades, or symbols..." />
                    <CommandList className="max-h-[500px]">
                        <CommandEmpty>No results found.</CommandEmpty>

                        <CommandGroup heading="Main">
                            <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <div className="flex flex-col text-left">
                                    <span className="font-semibold">Dashboard</span>
                                    <span className="text-[10px] text-muted-foreground line-clamp-1">View your trading overview and stats</span>
                                </div>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/trades"))}>
                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                <div className="flex flex-col text-left">
                                    <span className="font-semibold">Trades</span>
                                    <span className="text-[10px] text-muted-foreground line-clamp-1">View and manage all your trades</span>
                                </div>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/traders-diary"))}>
                                <ClipboardList className="mr-2 h-4 w-4" />
                                <div className="flex flex-col text-left">
                                    <span className="font-semibold">Journal</span>
                                    <span className="text-[10px] text-muted-foreground line-clamp-1">Write and review your trade journal entries</span>
                                </div>
                            </CommandItem>
                        </CommandGroup>

                        <CommandSeparator />

                        <CommandGroup heading="Analytics">
                            <CommandItem onSelect={() => runCommand(() => navigate("/analytics"))}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                <div className="flex flex-col text-left">
                                    <span className="font-semibold">Performance Analysis</span>
                                    <span className="text-[10px] text-muted-foreground line-clamp-1">Analyze your trading performance metrics</span>
                                </div>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate("/mistakes"))}>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                <div className="flex flex-col text-left">
                                    <span className="font-semibold">Trade Analysis (Mistakes)</span>
                                    <span className="text-[10px] text-muted-foreground line-clamp-1">Deep dive into individual trade analytics</span>
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

                        <CommandGroup heading="Personal">
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
                </div>
            </CommandDialog>
        </>
    );
}
