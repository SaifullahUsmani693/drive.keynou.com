ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS link_limit INTEGER NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_link_limit_check CHECK (link_limit >= 0);

CREATE TABLE IF NOT EXISTS public.subscription_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create subscription requests"
ON public.subscription_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own subscription requests"
ON public.subscription_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles admin_profile
    WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.is_admin = true
  )
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles admin_profile
    WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.is_admin = true
  )
);

CREATE POLICY "Admins can view all subscription requests"
ON public.subscription_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles admin_profile
    WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.is_admin = true
  )
);

CREATE POLICY "Admins can update subscription requests"
ON public.subscription_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles admin_profile
    WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.is_admin = true
  )
);

CREATE TRIGGER update_subscription_requests_updated_at BEFORE UPDATE ON public.subscription_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
