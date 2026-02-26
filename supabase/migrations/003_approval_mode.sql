ALTER TABLE ad_settings ADD COLUMN IF NOT EXISTS automation_mode text DEFAULT 'off';

ALTER TABLE automation_log ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE automation_log ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false;

-- automation_log.action supports:
-- 'increase' | 'decrease' | 'skipped_floor' | 'no_action'
-- 'pending_increase' | 'pending_decrease'
-- 'rejected'
