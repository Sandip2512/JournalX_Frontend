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
            <DialogContent className="sm:max-w-md bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200 backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">
                        {activeTab === "login" ? "Welcome Back" : "Create Account"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {activeTab === "login" ? "Enter your details to sign in" : "Enter your info to get started"}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <form onSubmit={onLogin} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="loginEmail">Email</Label>
                                <Input id="loginEmail" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="loginPassword">Password</Label>
                                <Input id="loginPassword" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null} Sign In
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="register">
                        <form onSubmit={onRegister} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" value={regData.firstName} onChange={handleRegChange} required />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" value={regData.lastName} onChange={handleRegChange} required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={regData.email} onChange={handleRegChange} required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="mobileNumber">Mobile</Label>
                                <Input id="mobileNumber" value={regData.mobileNumber} onChange={handleRegChange} required />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" value={regData.password} onChange={handleRegChange} required />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="confirmPassword">Confirm</Label>
                                    <Input id="confirmPassword" type="password" value={regData.confirmPassword} onChange={handleRegChange} required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null} Create Account
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
