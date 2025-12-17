import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    Users,
    TrendingUp,
    FileText,
    Bell,
    Settings,
    LogOut,
    Menu,
    ShieldAlert,
    BarChart3
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

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    // Auto-close sidebar on mobile route change
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
        { icon: Users, label: "User Management", path: "/admin/users" },
        { icon: TrendingUp, label: "Trade Management", path: "/admin/trades" },
        { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
        { icon: ShieldAlert, label: "System Logs", path: "/admin/logs" },
        { icon: Bell, label: "Announcements", path: "/admin/announcements" },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col lg:flex-row">
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 h-full bg-card border-r transition-all duration-300 flex flex-col
                    ${isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full w-64 lg:translate-x-0 lg:w-16"}
                `}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b bg-primary/5">
                    {isSidebarOpen && (
                        <div className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground p-1 rounded">TJ</span>
                            Admin
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="shrink-0" // Removed mx-auto to fix alignment
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link to={item.path} key={item.path}>
                                <Button
                                    variant={isActive ? "default" : "ghost"}
                                    onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                                    className={`w-full justify-start ${!isSidebarOpen ? "lg:px-0 lg:justify-center" : ""}`}
                                >
                                    <item.icon className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : "lg:mr-0"}`} />
                                    {isSidebarOpen && item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t space-y-2">
                    <div className={`flex items-center justify-between ${!isSidebarOpen && "lg:flex-col lg:gap-2"}`}>
                        <ThemeToggle />
                        {isSidebarOpen && <span className="text-xs text-muted-foreground">v1.0.0</span>}
                    </div>

                    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className={`w-full justify-start ${!isSidebarOpen ? "lg:px-0 lg:justify-center" : ""}`}
                            >
                                <LogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : "lg:mr-0"}`} />
                                {isSidebarOpen && "Logout"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You will be redirected to the login page.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>No</AlertDialogCancel>
                                <AlertDialogAction onClick={logout}>Yes, Logout</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`
                    flex-1 transition-all duration-300 min-h-screen
                    ${isSidebarOpen ? "lg:ml-64" : "lg:ml-16"}
                    ml-0 w-full
                `}
            >
                <header className="h-16 border-b bg-background/50 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-2 lg:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <span className="font-semibold">Admin</span>
                    </div>

                    <h2 className="text-lg font-semibold capitalize hidden lg:block">
                        {location.pathname.split("/").pop() || "Dashboard"}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.first_name?.[0]}
                        </div>
                    </div>
                </header>
                <div className="p-4 lg:p-6 pb-20 lg:pb-6 overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
