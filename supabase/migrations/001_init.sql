create extension if not exists "pgcrypto";

CREATE TABLE ad_settings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), amazon_client_id text, amazon_client_secret text, amazon_refresh_token text, amazon_profile_id text, target_acos numeric DEFAULT 30, daily_budget_cap numeric DEFAULT 100, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE ad_campaigns (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), amazon_campaign_id text UNIQUE, name text, status text, budget numeric, spend numeric, sales numeric, impressions int, clicks int, date_synced timestamptz DEFAULT now());
CREATE TABLE ad_keywords (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), amazon_keyword_id text UNIQUE, campaign_id text, keyword text, match_type text, bid numeric, spend numeric, sales numeric, impressions int, clicks int, date_synced timestamptz DEFAULT now());
