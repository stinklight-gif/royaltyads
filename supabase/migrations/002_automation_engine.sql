ALTER TABLE ad_settings ADD COLUMN IF NOT EXISTS acos_threshold numeric DEFAULT 40;
ALTER TABLE ad_settings ADD COLUMN IF NOT EXISTS scale_up_pct numeric DEFAULT 20;
ALTER TABLE ad_settings ADD COLUMN IF NOT EXISTS scale_down_pct numeric DEFAULT 15;
ALTER TABLE ad_settings ADD COLUMN IF NOT EXISTS budget_floor numeric DEFAULT 5;
ALTER TABLE ad_settings ADD COLUMN IF NOT EXISTS automation_enabled boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS automation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id text,
  campaign_name text,
  action text,
  rule_triggered text,
  old_budget numeric,
  new_budget numeric,
  budget_utilization numeric,
  today_acos numeric,
  acos_target numeric,
  acos_threshold numeric,
  reason text,
  created_at timestamptz DEFAULT now()
);
