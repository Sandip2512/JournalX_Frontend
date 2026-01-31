
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, CheckCircle2, Shield, Zap, CreditCard, ChevronLeft, Lock } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SubscriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requiredTier?: 'pro' | 'elite';
}

export const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
    open,
    onOpenChange,
    requiredTier = 'pro'
}) => {
    const { user, updateUser } = useAuth();
    const [step, setStep] = useState<'plans' | 'checkout'>('plans');
    const [selectedPlan, setSelectedPlan] = useState<'pro' | 'elite'>(requiredTier);
    const [couponCode, setCouponCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [successData, setSuccessData] = useState<{ tier: string, expiry: string } | null>(null);

    const plans = {
        pro: {
            name: 'Pro',
            price: 5.99,
            features: ['Unlimited Manual Journaling', 'Advanced Analytics (Heatmap)', 'Full Community Access', 'JournalX AI Reports', 'Unlimited Goals'],
            color: 'bg-primary',
            textColor: 'text-primary'
        },
        elite: {
            name: 'Elite',
            price: 11.99,
            features: ['Everything in Pro', 'AI Trade Coach', 'Elite Badge', 'Yearly Tax & Performance PDFs', 'Access to "Trader Room"'],
            color: 'bg-yellow-500',
            textColor: 'text-yellow-500'
        }
    };

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mock Payment if no coupon, or enforce coupon for now?
        // User asked for "select payment method and apply coupon code".
        // If they enter a code, we try to redeem. 
        // If no code, we can't process (since we don't have stripe integrated yet).
        // I'll assume for this demo, they MUST enter a code to "pay". 
        // Or I can add a dummy "Pay" which just fails or mocks success?
        // Let's rely on the coupon for real functional upgrade.

        if (!couponCode.trim()) {
            toast({
                title: "Payment Required",
                description: "This is a demo. Please enter a valid access code/coupon to upgrade.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post('/api/subscriptions/redeem-coupon', { code: couponCode });

            // On success
            setSuccess(true);
            setSuccessData(res.data);

            // Update local user state
            if (user) {
                updateUser({
                    ...user,
                    subscription_tier: res.data.tier,
                    subscription_expiry: res.data.expiry
                });
            }

            toast({
                title: "Upgrade Successful! 🎉",
                description: `You are now on the ${res.data.tier} plan.`,
            });

            setTimeout(() => {
                onOpenChange(false);
                setSuccess(false);
                setCouponCode('');
                setStep('plans');
            }, 2500);

        } catch (error: any) {
            toast({
                title: "Transaction Failed",
                description: error.response?.data?.detail || "Invalid code or payment error.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={step === 'plans' && !success ? "sm:max-w-[800px]" : "sm:max-w-[425px]"}>
                {!success ? (
                    <>
                        <DialogHeader>
                            {step === 'checkout' && (
                                <Button variant="ghost" size="sm" className="w-fit -ml-2 mb-2 h-8" onClick={() => setStep('plans')}>
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                                </Button>
                            )}
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                {step === 'plans' ? 'Choose Your Plan' : 'Complete Purchase'}
                            </DialogTitle>
                            <DialogDescription>
                                {step === 'plans'
                                    ? 'Unlock your full trading potential with our premium tiers.'
                                    : 'Review your order and select a payment method.'}
                            </DialogDescription>
                        </DialogHeader>

                        {step === 'plans' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                                {/* Pro Plan */}
                                <div
                                    className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] ${selectedPlan === 'pro' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                    onClick={() => setSelectedPlan('pro')}
                                >
                                    <div className="absolute top-4 right-4">
                                        <Badge variant={selectedPlan === 'pro' ? "default" : "outline"}>Selected</Badge>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{plans.pro.name}</h3>
                                    <div className="text-3xl font-black mb-4">${plans.pro.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                    <ul className="space-y-3 mb-6">
                                        {plans.pro.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-primary" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Elite Plan */}
                                <div
                                    className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] ${selectedPlan === 'elite' ? 'border-yellow-500 bg-yellow-500/5' : 'border-border'}`}
                                    onClick={() => setSelectedPlan('elite')}
                                >
                                    {selectedPlan === 'elite' && (
                                        <div className="absolute top-4 right-4">
                                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Selected</Badge>
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold mb-2 text-yellow-500">{plans.elite.name}</h3>
                                    <div className="text-3xl font-black mb-4">${plans.elite.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                    <ul className="space-y-3 mb-6">
                                        {plans.elite.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <Sparkles className="w-4 h-4 text-yellow-500" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 space-y-6">
                                {/* Order Summary */}
                                <div className="bg-muted/30 p-4 rounded-xl space-y-3 border border-border/50">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-primary" /> Order Summary
                                    </h4>
                                    <div className="flex justify-between items-center text-sm">
                                        <span>{plans[selectedPlan].name} Plan (Monthly)</span>
                                        <span className="font-bold">${plans[selectedPlan].price}</span>
                                    </div>
                                    <div className="border-t border-border/50 my-2 pt-2 flex justify-between items-center font-bold text-lg">
                                        <span>Total</span>
                                        <span>${plans[selectedPlan].price}</span>
                                    </div>
                                </div>

                                <form onSubmit={handleRedeem} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label>Payment Method</Label>
                                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
                                            <div>
                                                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                                                <Label
                                                    htmlFor="card"
                                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                                >
                                                    <CreditCard className="mb-3 h-6 w-6" />
                                                    Credit Card
                                                </Label>
                                            </div>
                                            <div>
                                                <RadioGroupItem value="crypto" id="crypto" className="peer sr-only" />
                                                <Label
                                                    htmlFor="crypto"
                                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                                >
                                                    <Zap className="mb-3 h-6 w-6" />
                                                    Crypto
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Coupon / Access Code</Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                                <Lock className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter code (Optional)"
                                                className="w-full pl-9 pr-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono text-sm"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">If you have a promo code, enter it above.</p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-base"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay $${plans[selectedPlan].price} & Subscribe`}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {step === 'plans' && (
                            <DialogFooter>
                                <Button className="w-full sm:w-auto" onClick={() => setStep('checkout')}>
                                    Continue to Checkout <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                                </Button>
                            </DialogFooter>
                        )}
                    </>
                ) : (
                    <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Welcome to {successData?.tier.toUpperCase()}!</h2>
                        <p className="text-muted-foreground">
                            Your transaction was successful.<br />
                            Initializing premium features...
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
