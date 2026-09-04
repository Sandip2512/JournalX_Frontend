import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { onboardingService, TradingRules } from '@/services/onboardingService';
import { RefreshCw, Copy, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// Popup disabled — users can manage trading rules from Settings instead.
export function MonthlyRulePopup() {
  return null;
}
