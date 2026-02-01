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
        <CommandDialog open={open} onOpenChange={setOpen}>
            <div className="relative z-[9999] bg-[#09090b]">
                <CommandInput placeholder="Search pages, trades, or symbols..." className="border-none focus:ring-0 text-lg py-6" />
                <CommandList className="max-h-[500px] pb-4">
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Main" className="px-3">
                        <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <LayoutDashboard className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-[15px]">Dashboard</span>
                                <span className="text-[12px] text-muted-foreground group-data-[selected=true]:text-white/80 line-clamp-1">View your trading overview and stats</span>
                            </div>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/trades"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <ArrowRightLeft className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-[15px]">Trades</span>
                                <span className="text-[12px] text-muted-foreground group-data-[selected=true]:text-white/80 line-clamp-1">View and manage all your trades</span>
                            </div>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/traders-diary"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <ClipboardList className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-[15px]">Journal</span>
                                <span className="text-[12px] text-muted-foreground group-data-[selected=true]:text-white/80 line-clamp-1">Write and review your trade journal entries</span>
                            </div>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator className="my-2 bg-white/5" />

                    <CommandGroup heading="Analytics" className="px-3">
                        <CommandItem onSelect={() => runCommand(() => navigate("/analytics"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-[15px]">Performance Analysis</span>
                                <span className="text-[12px] text-muted-foreground group-data-[selected=true]:text-white/80 line-clamp-1">Analyze your trading performance metrics</span>
                            </div>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/mistakes"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-[15px]">Trade Analysis (Mistakes)</span>
                                <span className="text-[12px] text-muted-foreground group-data-[selected=true]:text-white/80 line-clamp-1">Deep dive into individual trade analytics</span>
                            </div>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator className="my-2 bg-white/5" />

                    <CommandGroup heading="Tools" className="px-3">
                        <CommandItem onSelect={() => runCommand(() => navigate("/goals"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-[15px]">Goals</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/broker-connections"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <Plug className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-[15px]">Broker Connections</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/settings"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <Settings className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-[15px]">Settings</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator className="my-2 bg-white/5" />

                    <CommandGroup heading="Community" className="px-3">
                        <CommandItem onSelect={() => runCommand(() => navigate("/community"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-[15px]">Community Hub</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/community/lounge"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-[15px]">Traders Lounge</span>
                        </CommandItem>
                    </CommandGroup>

                    {user?.role === "admin" && (
                        <>
                            <CommandSeparator className="my-2 bg-white/5" />
                            <CommandGroup heading="Admin" className="px-3">
                                <CommandItem onSelect={() => runCommand(() => navigate("/admin"))} className="mb-1">
                                    <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                        <LayoutDashboard className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-bold text-[15px]">Admin Dashboard</span>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => navigate("/admin/users"))} className="mb-1">
                                    <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-bold text-[15px]">User Management</span>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => navigate("/admin/trades"))} className="mb-1">
                                    <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-bold text-[15px]">Trade Management</span>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => navigate("/admin/logs"))} className="mb-1">
                                    <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                        <ShieldAlert className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-bold text-[15px]">System Logs</span>
                                </CommandItem>
                            </CommandGroup>
                        </>
                    )}

                    <CommandSeparator className="my-2 bg-white/5" />

                    <CommandGroup heading="Personal" className="px-3">
                        <CommandItem onSelect={() => runCommand(() => navigate("/profile"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-[15px]">Profile</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/settings"))} className="mb-1">
                            <div className="mr-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-data-[selected=true]:bg-white/20 transition-colors">
                                <Settings className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-[15px]">Settings</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>

                {/* Search Footer Hints */}
                <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-[11px] text-muted-foreground bg-[#0c0c0e]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1">
                                <kbd className="rounded bg-white/5 px-2 py-1 font-sans font-bold text-white border border-white/10 shadow-sm">↑</kbd>
                                <kbd className="rounded bg-white/5 px-2 py-1 font-sans font-bold text-white border border-white/10 shadow-sm">↓</kbd>
                            </div>
                            <span className="font-medium">Navigate</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <kbd className="rounded bg-white/5 px-2 py-1 font-sans font-bold text-white border border-white/10 shadow-sm">↵</kbd>
                            <span className="font-medium">Select</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="rounded bg-white/5 px-2 py-1 font-sans font-bold text-white border border-white/10 shadow-sm uppercase">esc</kbd>
                        <span className="font-medium">Close</span>
                    </div>
                </div>
            </div>
        </CommandDialog>
    );
}
