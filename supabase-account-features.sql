-- GeekCV account, membership, order and export feature tables.
-- Run once in Supabase Dashboard -> SQL Editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.memberships (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan         TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no       TEXT NOT NULL UNIQUE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name   TEXT NOT NULL,
  amount_cents   INTEGER NOT NULL CHECK (amount_cents >= 0),
  status         TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'refunded', 'cancelled')),
  invoice_status TEXT NOT NULL DEFAULT 'none' CHECK (invoice_status IN ('none', 'requested', 'issued')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.export_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_name TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_events_user_created ON public.export_events(user_id, created_at DESC);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own membership" ON public.memberships;
CREATE POLICY "Users manage own membership" ON public.memberships
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
CREATE POLICY "Users create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own invoices" ON public.orders;
CREATE POLICY "Users update own invoices" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own exports" ON public.export_events;
CREATE POLICY "Users read own exports" ON public.export_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own exports" ON public.export_events;
CREATE POLICY "Users create own exports" ON public.export_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_account_feature_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS memberships_updated_at ON public.memberships;
CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_account_feature_timestamp();
