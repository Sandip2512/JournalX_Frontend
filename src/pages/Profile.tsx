import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const Profile = () => {
    const { user, login, token } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            // @ts-ignore
            setMobileNumber(user.mobile_number || "");
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const response = await api.put(`/api/users/profile/${user.user_id}`, {
                first_name: firstName,
                last_name: lastName,
                mobile_number: mobileNumber
            });

            if (token && response.data) {
                const updatedUser = { ...user, ...response.data };
                login(token, updatedUser);
            }

            toast({
                title: "Profile Updated",
                description: "Your personal information has been saved.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Update Failed",
                description: "Could not update profile. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Header />
            <main className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
                {/* Page Header */}
                <div className="space-y-2 mb-8 opacity-0 animate-fade-up">
                    <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Profile</h1>
                    </div>
                    <p className="text-muted-foreground">Manage your personal information</p>
                </div>

                <div className="space-y-8">
                    {/* Profile Section */}
                    <div className="glass-card p-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold">Personal Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="bg-muted/50"
                                    placeholder="Enter your first name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="bg-muted/50"
                                    placeholder="Enter your last name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-muted/50 opacity-70 cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground font-medium">Email cannot be changed.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Mobile Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="bg-muted/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                        <Button variant="outline" type="button">Cancel</Button>
                        <Button variant="hero" className="gap-2" onClick={handleSave} disabled={isLoading}>
                            <Save className="w-4 h-4" />
                            {isLoading ? "Saving..." : "Save Profile"}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
