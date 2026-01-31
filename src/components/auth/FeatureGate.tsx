import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock } from 'lucide-react';
import { SubscriptionDialog } from '@/components/subscription/SubscriptionDialog';

interface FeatureGateProps {
    children: React.ReactNode;
    tier: 'pro' | 'elite';
    fallback?: React.ReactNode;
    showLock?: boolean; // Whether to show a lock overlay instead of completely hiding
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
    children,
    tier,
    fallback,
    showLock = true
}) => {
    const { user } = useAuth();
    const [showUpgrade, setShowUpgrade] = useState(false);

    const levels = { free: 0, pro: 1, elite: 2 };
    const userLevel = levels[user?.subscription_tier || 'free'] || 0;
    const requiredLevel = levels[tier];

    if (userLevel >= requiredLevel) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (showLock) {
        return (
            <div className="relative overflow-hidden rounded-lg group">
                <div className="blur-sm select-none pointer-events-none opacity-50">
                    {children}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px] transition-all duration-300">
                    <div className="p-6 text-center">
                        <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">
                            {tier === 'elite' ? 'Elite Feature' : 'Pro Feature'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
                            Upgrade to {tier === 'elite' ? 'Elite' : 'Pro'} to unlock this feature.
                        </p>
                        <button
                            onClick={() => setShowUpgrade(true)}
                            className="btn btn-primary text-sm px-4 py-2"
                        >
                            Unlock Access
                        </button>
                    </div>
                </div>

                <SubscriptionDialog
                    open={showUpgrade}
                    onOpenChange={setShowUpgrade}
                    requiredTier={tier}
                />
            </div>
        );
    }

    // Default: render nothing if not authorized and no lock/fallback
    return null;
};
