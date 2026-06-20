-- Migration: add plan & stripe fields to subscribers table
-- Run this in Supabase SQL Editor

ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS plan_status TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Index for fast Stripe webhook lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_customer
  ON subscribers(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index for plan filtering
CREATE INDEX IF NOT EXISTS idx_subscribers_plan
  ON subscribers(plan, plan_status);
