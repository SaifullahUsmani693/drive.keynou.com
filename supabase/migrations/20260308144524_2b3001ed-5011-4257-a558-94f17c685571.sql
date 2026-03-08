-- Replace overly permissive insert policy with one scoped to links the user owns
DROP POLICY "Anyone can insert click events" ON public.click_events;

-- Click events are inserted by edge functions (service role), not directly by users
-- So we remove direct insert and only allow select for link owners
-- The edge function will use service role to insert click events
REVOKE INSERT ON public.click_events FROM anon, authenticated;
