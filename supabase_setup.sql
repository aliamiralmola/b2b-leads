-- 1. Create Affiliates Table
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    wallet_address TEXT, -- For payouts
    clicks_count INTEGER DEFAULT 0,
    signups_count INTEGER DEFAULT 0,
    earnings DECIMAL(10, 2) DEFAULT 0.00,
    last_payout_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Link Profiles to Affiliates for recurring tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.affiliates(id);

-- 3. Create Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referred_email TEXT NOT NULL,
    plan_name TEXT,
    amount_paid DECIMAL(10, 2) DEFAULT 0.00,
    commission DECIMAL(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Pending', -- 'Pending' (Signed up), 'Active' (Paid)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RPC to Increment Clicks
CREATE OR REPLACE FUNCTION public.increment_affiliate_clicks(code TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.affiliates
    SET clicks_count = clicks_count + 1
    WHERE referral_code = code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC to Increment Signups
CREATE OR REPLACE FUNCTION public.increment_affiliate_signups(code TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.affiliates
    SET signups_count = signups_count + 1
    WHERE referral_code = code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC to Record Conversion (Payment)
CREATE OR REPLACE FUNCTION public.record_affiliate_conversion(aff_id UUID, commission_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE public.affiliates
    SET earnings = earnings + commission_amount
    WHERE id = aff_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 7. Policies (Idempotent)
DROP POLICY IF EXISTS "Users can view their own affiliate data" ON public.affiliates;
CREATE POLICY "Users can view their own affiliate data" ON public.affiliates
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
CREATE POLICY "Users can view their own referrals" ON public.referrals
    FOR SELECT USING (
        affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
    );
