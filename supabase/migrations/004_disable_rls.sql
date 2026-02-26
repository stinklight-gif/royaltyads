-- Migration 004: Disable RLS on all RoyaltyAds tables
-- RoyaltyAds is a personal dashboard with no user auth.
-- The anon key needs full read/write access to operate.
ALTER TABLE ad_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE ad_keywords DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_log DISABLE ROW LEVEL SECURITY;
