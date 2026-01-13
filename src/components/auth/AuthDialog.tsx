import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Login State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register State
    const [regData, setRegData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        password: "",
        confirmPassword: "",
    });

    const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegData({ ...regData, [e.target.id]: e.target.value });
    };

    const onLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post("/api/auth/login", {
                email: loginEmail,
                password: loginPassword,
            });
            const { access_token, user } = response.data;
            login(access_token, user);
            toast.success("Welcome back!");
            onOpenChange(false);
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to login");
        } finally {
            setIsLoading(false);
        }
    };

    const onRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (regData.password !== regData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setIsLoading(true);
        try {
            await api.post("/register", {
                first_name: regData.firstName,
                last_name: regData.lastName,
                email: regData.email,
                mobile_number: regData.mobileNumber,
                password: regData.password,
                confirm_password: regData.confirmPassword,
            });

            // Auto Login
            const loginResponse = await api.post("/api/auth/login", {
                email: regData.email,
                password: regData.password,
            });
            const { access_token, user } = loginResponse.data;
            login(access_token, user);
            toast.success("Account created successfully!");
            onOpenChange(false);
            navigate("/dashboard");
        } catch (error: any) {
            let message = "Failed to create account.";
            if (error.response?.data?.detail) {
                const d = error.response.data.detail;
                message = Array.isArray(d) ? d.map((x: any) => x.msg).join(", ") : (typeof d === 'string' ? d : JSON.stringify(d));
            }
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200"
                style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}>
                <DialogHeader>
                    <DialogTitle className="text-center text-xl" style={{ color: '#ffffff' }}>
                        {activeTab === "login" ? "Welcome Back" : "Create Account"}
                    </DialogTitle>
                    <DialogDescription className="text-center" style={{ color: '#94a3b8' }}>
                        {activeTab === "login" ? "Enter your details to sign in" : "Enter your info to get started"}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2" style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '4px'
                    }}>
                        <TabsTrigger value="login" style={{
                            color: activeTab === 'login' ? '#ffffff' : '#94a3b8',
                            background: activeTab === 'login' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            border: activeTab === 'login' ? '1px solid rgba(59, 130, 246, 0.3)' : 'none'
                        }}>Login</TabsTrigger>
                        <TabsTrigger value="register" style={{
                            color: activeTab === 'register' ? '#ffffff' : '#94a3b8',
                            background: activeTab === 'register' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            border: activeTab === 'register' ? '1px solid rgba(59, 130, 246, 0.3)' : 'none'
                        }}>Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <form onSubmit={onLogin} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="loginEmail" style={{ color: '#e2e8f0' }}>Email</Label>
                                <Input id="loginEmail" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required
                                    style={{
                                        background: 'rgba(30, 41, 59, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#ffffff'
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="loginPassword" style={{ color: '#e2e8f0' }}>Password</Label>
                                <Input id="loginPassword" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required
                                    style={{
                                        background: 'rgba(30, 41, 59, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#ffffff'
                                    }}
                                />
                            </div>
                            <Button type="submit" className="w-full text-white" disabled={isLoading}
                                style={{
                                    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                }}>
                                {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null} Sign In
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="register">
                        <form onSubmit={onRegister} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="firstName" style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>First Name</Label>
                                    <Input id="firstName" value={regData.firstName} onChange={handleRegChange} required
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.5)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff'
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="lastName" style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>Last Name</Label>
                                    <Input id="lastName" value={regData.lastName} onChange={handleRegChange} required
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.5)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff'
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email" style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>Email</Label>
                                <Input id="email" type="email" value={regData.email} onChange={handleRegChange} required
                                    style={{
                                        background: 'rgba(30, 41, 59, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#ffffff'
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="mobileNumber" style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>Mobile</Label>
                                <Input id="mobileNumber" value={regData.mobileNumber} onChange={handleRegChange} required
                                    style={{
                                        background: 'rgba(30, 41, 59, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#ffffff'
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="password" style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>Password</Label>
                                    <Input id="password" type="password" value={regData.password} onChange={handleRegChange} required
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.5)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff'
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="confirmPassword" style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>Confirm</Label>
                                    <Input id="confirmPassword" type="password" value={regData.confirmPassword} onChange={handleRegChange} required
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.5)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff'
                                        }}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full text-white" disabled={isLoading}
                                style={{
                                    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                }}>
                                {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null} Create Account
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
