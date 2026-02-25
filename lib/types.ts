export type CampaignStatus = "ENABLED" | "PAUSED" | "ARCHIVED";

export type MatchType = "BROAD" | "PHRASE" | "EXACT";

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
  daily_budget_cap: number;
}
