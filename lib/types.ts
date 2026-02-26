export type CampaignStatus = "ENABLED" | "PAUSED" | "ARCHIVED";

export type MatchType = "BROAD" | "PHRASE" | "EXACT";

export type AutomationMode = "off" | "approval" | "auto";

export type AutomationAction =
  | "increase"
  | "decrease"
  | "skipped_floor"
  | "no_action"
  | "pending_increase"
  | "pending_decrease"
  | "rejected";

export type AutomationRuleTriggered = "scale_up" | "scale_down" | null;

export interface Campaign {
  id: string;
  amazonCampaignId: string;
  name: string;
  status: CampaignStatus;
  budget: number;
  spend: number;
  sales: number;
  impressions: number;
  clicks: number;
  budget_utilization: number;
  today_acos: number;
}

export interface Keyword {
  id: string;
  amazonKeywordId: string;
  campaignId: string;
  keyword: string;
  matchType: MatchType;
  bid: number;
  spend: number;
  sales: number;
  impressions: number;
  clicks: number;
}

export interface DailyReport {
  date: string;
  spend: number;
  revenue: number;
}

export interface AdSettings {
  id?: string;
  amazon_client_id: string;
  amazon_client_secret: string;
  amazon_refresh_token: string;
  amazon_profile_id: string;
  target_acos: number;
  acos_threshold: number;
  scale_up_pct: number;
  scale_down_pct: number;
  budget_floor: number;
  automation_mode: AutomationMode;
  daily_budget_cap: number;
}

export interface AutomationLogEntry {
  id: string;
  campaign_id: string;
  campaign_name: string;
  action: AutomationAction;
  rule_triggered: AutomationRuleTriggered;
  old_budget: number;
  new_budget: number;
  budget_utilization: number;
  today_acos: number;
  acos_target: number;
  acos_threshold: number;
  reason: string;
  approved_at: string | null;
  approved: boolean;
  created_at: string;
}
