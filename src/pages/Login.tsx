import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { TrendingUp, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate("/admin");
            } else if (user.is_onboarding_completed === false) {
                navigate("/setup");
            } else {
                navigate("/dashboard");
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post("/api/auth/login", {
                email,
                password,
            });

            const { access_token, user } = response.data;

            login(access_token, user);
            toast.success("Welcome back!");
        } catch (error: any) {
            console.error("Login error:", error);
            const message = error.response?.data?.detail || "Failed to login. Please check your credentials.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        try {
            const response = await api.post("/api/auth/google", {
                credential: credentialResponse.credential,
            });

            const { access_token, user } = response.data;

            login(access_token, user);
            toast.success("Welcome back!");
        } catch (error: any) {
            console.error("Google login error:", error);
            toast.error(error.response?.data?.detail || "Google login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md shadow-lg border-primary/10">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your email to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center w-full pt-2">
                             <div className="w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error("Google Login Failed")}
                                    theme="outline"
                                    shape="rectangular"
                                    width="100%"
                                />
                             </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
                    <div>
                        Don't have an account?{" "}
                        <Link to="/register" className="text-primary font-medium hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
