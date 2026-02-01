import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
    LayoutDashboard, Users, TrendingUp, FileText, Bell,
    Settings, LogOut, Menu, ShieldAlert, BarChart3,
    DollarSign, ChevronLeft, ChevronRight, Clock, Search, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { cn } from "@/lib/utils";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const saved = localStorage.getItem("sidebar-open");
        if (window.innerWidth < 1024) return false;
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Persist sidebar state
    useEffect(() => {
        if (window.innerWidth >= 1024) {
            localStorage.setItem("sidebar-open", JSON.stringify(isSidebarOpen));
        }
    }, [isSidebarOpen]);

    // Auto-close sidebar on mobile route change
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                const saved = localStorage.getItem("sidebar-open");
                setIsSidebarOpen(saved !== null ? JSON.parse(saved) : true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
        { icon: Users, label: "User Management", path: "/admin/users" },
        { icon: TrendingUp, label: "Trade Management", path: "/admin/trades" },
        { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
        { icon: DollarSign, label: "Sales", path: "/admin/sales" },
        { icon: ShieldAlert, label: "System Logs", path: "/admin/logs" },
        { icon: Bell, label: "Announcements", path: "/admin/announcements" },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col lg:flex-row relative overflow-hidden">
            {/* Background Glows (Aurora) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col
                    ${isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full w-64 lg:translate-x-0 lg:w-16"}
                `}
            >
                {/* Floating Toggle Button (Matching Reference) */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-10 z-[60] h-6 w-6 bg-[#111114] border border-white/10 rounded-full flex items-center justify-center text-muted-foreground hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95 group hidden lg:flex"
                >
                    {isSidebarOpen ? (
                        <ChevronLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
                    ) : (
                        <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    )}
                </button>

                <div className="h-20 flex items-center px-4 border-b border-sidebar-border bg-sidebar/50 backdrop-blur">
                    {isSidebarOpen ? (
                        <div className="font-bold text-xl tracking-tighter text-white flex items-center gap-2 group cursor-default">
                            <span className="bg-primary text-primary-foreground p-1.5 rounded-md shadow-[0_0_15px_rgba(11,102,228,0.6)]">TJ</span>
                            <div className="flex flex-col leading-none">
                                <span className="text-lg">JournalX</span>
                                <span className="text-[9px] text-amber-500 font-bold tracking-widest mt-0.5">BETA</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center w-full">
                            <span className="bg-primary text-primary-foreground p-1 rounded-md shadow-[0_0_10px_rgba(11,102,228,0.4)] text-xs font-bold">TJ</span>
                        </div>
                    )}

                    {/* Mobile Only Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="shrink-0 text-muted-foreground hover:text-white hover:bg-white/5 ml-auto lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {/* User Profile Section (Exact Reference Layout) */}
                {isSidebarOpen && (
                    <div className="p-3 mx-3 mt-6 rounded-[14px] bg-[#111114]/80 border border-white/5 flex items-center gap-3 hover:bg-[#1a1a1f] transition-all cursor-pointer group shadow-lg">
                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold shadow-[0_0_15px_rgba(11,102,228,0.2)] border border-primary/20 overflow-hidden shrink-0">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span>{user?.first_name?.[0]}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="font-bold text-[13px] text-white truncate leading-tight">{user?.first_name} {user?.last_name?.[0]}.</p>
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-muted-foreground font-black tracking-tighter uppercase leading-none">Free</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                    </div>
                )}

                <nav className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link to={item.path} key={item.path} className="block relative group">
                                <Button
                                    variant="ghost"
                                    onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                                    className={cn(
                                        "w-full justify-start transition-all duration-300 h-11 px-4 relative group overflow-hidden",
                                        !isSidebarOpen && "lg:px-0 lg:justify-center",
                                        isActive
                                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full shadow-[0_0_15px_rgba(11,102,228,0.8)] z-10" />
                                    )}
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                                        isSidebarOpen ? "mr-3" : "lg:mr-0",
                                        isActive ? "text-primary drop-shadow-[0_0_8px_rgba(11,102,228,0.5)]" : ""
                                    )} />
                                    {isSidebarOpen && <span className={cn(
                                        "text-sm tracking-tight transition-all duration-300",
                                        isActive ? "font-bold" : "font-medium"
                                    )}>{item.label}</span>}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-sidebar-border space-y-2">
                    <div className={`flex items-center justify-between ${!isSidebarOpen && "lg:flex-col lg:gap-2"}`}>
                        <ThemeToggle />
                        {isSidebarOpen && <span className="text-xs text-muted-foreground">v1.0.0</span>}
                    </div>

                    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 ${!isSidebarOpen ? "lg:px-0 lg:justify-center" : ""}`}
                            >
                                <LogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : "lg:mr-0"}`} />
                                {isSidebarOpen && "Logout"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-card-border">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Are you sure you want to logout?</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    You will be redirected to the login page.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-muted text-foreground hover:bg-muted/80 border-none">No</AlertDialogCancel>
                                <AlertDialogAction onClick={logout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-none">Yes, Logout</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`
                    flex-1 transition-all duration-300 min-h-screen relative z-10
                    ${isSidebarOpen ? "lg:ml-64" : "lg:ml-16"}
                    ml-0 w-full
                `}
            >
                {/* Header (Refined to match Reference) */}
                <header className="h-20 bg-background/50 backdrop-blur-md border-b border-border/50 sticky top-0 z-30 px-8 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-white tracking-tight">Dashboard</h2>
                        <span className="text-xs text-muted-foreground font-medium">{format(new Date(), "EEE, MMM d")}</span>
                    </div>

                    {/* Search Bar (Matching Reference) */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <button
                            onClick={() => {
                                // Dispatch custom event to open command menu
                                const event = new KeyboardEvent('keydown', {
                                    key: 'k',
                                    ctrlKey: true,
                                    bubbles: true,
                                    metaKey: true
                                });
                                document.dispatchEvent(event);
                            }}
                            className="relative w-full group text-left"
                        >
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="w-full bg-[#111114] border border-white/5 rounded-xl py-2.5 pl-10 pr-16 text-sm text-muted-foreground hover:border-primary/50 transition-all shadow-inner">
                                Search pages, trades, or symbols...
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-muted-foreground font-medium">
                                <span>Ctrl</span>
                                <span className="opacity-50">+</span>
                                <span>K</span>
                            </div>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <ThemeToggle />
                            <Button variant="default" size="icon" className="bg-primary text-white rounded-xl shadow-[0_0_15px_rgba(11,102,228,0.5)] hover:bg-primary/90">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Live Clock (Matching Reference style) */}
                        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-white">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-mono tracking-wider">{currentTime.toLocaleTimeString()}</span>
                        </div>

                        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_rgba(11,102,228,0.8)]" />
                        </Button>

                        <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/10 shadow-lg cursor-pointer hover:border-primary/50 transition-colors">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {user?.first_name?.[0]}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-8 pb-10">
                    {children}
                </div>
                <ChatWidget />
            </main>
        </div>
    );
};

export default AdminLayout;
