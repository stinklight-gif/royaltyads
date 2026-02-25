import {
  mockCampaigns,
  mockDailyReports,
  mockKeywords,
} from "@/lib/mock-data";
import { getSupabaseClient } from "@/lib/supabase/client";
import { AdSettings, Campaign, CampaignStatus, DailyReport, Keyword } from "@/lib/types";

const AMAZON_BASE_URL = "https://advertising-api.amazon.com";
const AMAZON_AUTH_URL = "https://api.amazon.com/auth/o2/token";

type StoredCredentials = Pick<
  AdSettings,
  | "amazon_client_id"
  | "amazon_client_secret"
  | "amazon_refresh_token"
  | "amazon_profile_id"
>;

const mockCampaignMap = new Map(mockCampaigns.map((campaign) => [campaign.id, { ...campaign }]));
const mockKeywordMap = new Map(mockKeywords.map((keyword) => [keyword.id, { ...keyword }]));

const normalize = (value?: string | null) => value?.trim() ?? "";

const hasCredentials = (settings: StoredCredentials | null): settings is StoredCredentials => {
  if (!settings) {
    return false;
  }

  return (
    normalize(settings.amazon_client_id).length > 0 &&
    normalize(settings.amazon_client_secret).length > 0 &&
    normalize(settings.amazon_refresh_token).length > 0 &&
    normalize(settings.amazon_profile_id).length > 0
  );
};

const loadStoredCredentials = async (): Promise<StoredCredentials | null> => {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("ad_settings")
      .select(
        "amazon_client_id, amazon_client_secret, amazon_refresh_token, amazon_profile_id",
      )
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      return null;
    }

    return {
      amazon_client_id: normalize(data.amazon_client_id),
      amazon_client_secret: normalize(data.amazon_client_secret),
      amazon_refresh_token: normalize(data.amazon_refresh_token),
      amazon_profile_id: normalize(data.amazon_profile_id),
    };
  } catch {
    return null;
  }
};

const refreshAccessToken = async (
  settings: StoredCredentials,
): Promise<string | null> => {
  try {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: settings.amazon_refresh_token,
      client_id: settings.amazon_client_id,
      client_secret: settings.amazon_client_secret,
    });

    const response = await fetch(AMAZON_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { access_token?: string };
    return payload.access_token ?? null;
  } catch {
    return null;
  }
};

const fetchAmazonJson = async <T>(url: string, init: RequestInit): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const buildAmazonHeaders = (settings: StoredCredentials, accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  "Amazon-Advertising-API-ClientId": settings.amazon_client_id,
  "Amazon-Advertising-API-Scope": settings.amazon_profile_id,
  "Content-Type": "application/json",
});

const mapCampaign = (raw: Record<string, unknown>, index: number): Campaign => {
  const spend = Number(raw.spend) || Number(raw.cost) || 0;
  const sales = Number(raw.sales) || Number(raw.revenue) || 0;
  const impressions = Number(raw.impressions) || 0;
  const clicks = Number(raw.clicks) || 0;

  return {
    id: String(raw.campaignId ?? raw.id ?? `live-cmp-${index}`),
    amazonCampaignId: String(raw.campaignId ?? raw.id ?? `live-cmp-${index}`),
    name: String(raw.name ?? `Live Campaign ${index + 1}`),
    status: String(raw.state ?? raw.status ?? "ENABLED") as CampaignStatus,
    budget: Number(raw.dailyBudget) || Number(raw.budget) || 0,
    spend,
    sales,
    impressions,
    clicks,
  };
};

const mapKeyword = (raw: Record<string, unknown>, index: number): Keyword => {
  const spend = Number(raw.spend) || Number(raw.cost) || 0;
  const sales = Number(raw.sales) || Number(raw.revenue) || 0;
  const impressions = Number(raw.impressions) || 0;
  const clicks = Number(raw.clicks) || 0;

  return {
    id: String(raw.keywordId ?? raw.id ?? `live-kw-${index}`),
    amazonKeywordId: String(raw.keywordId ?? raw.id ?? `live-kw-${index}`),
    campaignId: String(raw.campaignId ?? raw.adGroupId ?? ""),
    keyword: String(raw.keywordText ?? raw.keyword ?? `keyword-${index + 1}`),
    matchType: String(raw.matchType ?? "BROAD") as Keyword["matchType"],
    bid: Number(raw.bid) || Number(raw.currentBid) || 0,
    spend,
    sales,
    impressions,
    clicks,
  };
};

export const isDemoMode = async (): Promise<boolean> => {
  const settings = await loadStoredCredentials();
  return !hasCredentials(settings);
};

export const getCampaigns = async (): Promise<Campaign[]> => {
  const settings = await loadStoredCredentials();
  if (!hasCredentials(settings)) {
    return [...mockCampaignMap.values()];
  }

  const accessToken = await refreshAccessToken(settings);
  if (!accessToken) {
    return [...mockCampaignMap.values()];
  }

  type CampaignResponse = { campaigns?: Array<Record<string, unknown>> };

  const payload = await fetchAmazonJson<CampaignResponse>(
    `${AMAZON_BASE_URL}/sp/campaigns/list`,
    {
      method: "POST",
      headers: buildAmazonHeaders(settings, accessToken),
      body: JSON.stringify({
        stateFilter: {
          include: ["ENABLED", "PAUSED", "ARCHIVED"],
        },
      }),
    },
  );

  const liveCampaigns = payload?.campaigns;
  if (!Array.isArray(liveCampaigns) || liveCampaigns.length === 0) {
    return [...mockCampaignMap.values()];
  }

  return liveCampaigns.map(mapCampaign);
};

export const getKeywords = async (): Promise<Keyword[]> => {
  const settings = await loadStoredCredentials();
  if (!hasCredentials(settings)) {
    return [...mockKeywordMap.values()];
  }

  const accessToken = await refreshAccessToken(settings);
  if (!accessToken) {
    return [...mockKeywordMap.values()];
  }

  type KeywordResponse = { keywords?: Array<Record<string, unknown>> };

  const payload = await fetchAmazonJson<KeywordResponse>(
    `${AMAZON_BASE_URL}/sp/keywords/list`,
    {
      method: "POST",
      headers: buildAmazonHeaders(settings, accessToken),
      body: JSON.stringify({
        stateFilter: {
          include: ["ENABLED", "PAUSED"],
        },
      }),
    },
  );

  const liveKeywords = payload?.keywords;
  if (!Array.isArray(liveKeywords) || liveKeywords.length === 0) {
    return [...mockKeywordMap.values()];
  }

  return liveKeywords.map(mapKeyword);
};

export const getReports = async (): Promise<DailyReport[]> => {
  const settings = await loadStoredCredentials();
  if (!hasCredentials(settings)) {
    return [...mockDailyReports];
  }

  const accessToken = await refreshAccessToken(settings);
  if (!accessToken) {
    return [...mockDailyReports];
  }

  type ReportResponse = {
    rows?: Array<{ date?: string; spend?: number; sales?: number; revenue?: number }>;
  };

  const payload = await fetchAmazonJson<ReportResponse>(
    `${AMAZON_BASE_URL}/reporting/reports`,
    {
      method: "POST",
      headers: buildAmazonHeaders(settings, accessToken),
      body: JSON.stringify({
        reportTypeId: "spCampaigns",
        columns: ["date", "spend", "sales"],
        timeUnit: "DAILY",
      }),
    },
  );

  const rows = payload?.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return [...mockDailyReports];
  }

  return rows.map((row) => ({
    date: String(row.date ?? new Date().toISOString().slice(0, 10)),
    spend: Number(row.spend) || 0,
    revenue: Number(row.sales ?? row.revenue) || 0,
  }));
};

export const updateBid = async (
  keywordId: string,
  bid: number,
): Promise<Keyword | null> => {
  const existingKeyword =
    mockKeywordMap.get(keywordId) ||
    [...mockKeywordMap.values()].find(
      (keyword) => keyword.amazonKeywordId === keywordId,
    );

  const settings = await loadStoredCredentials();
  if (!hasCredentials(settings)) {
    if (!existingKeyword) {
      return null;
    }

    const updatedKeyword = { ...existingKeyword, bid };
    mockKeywordMap.set(updatedKeyword.id, updatedKeyword);
    return updatedKeyword;
  }

  const accessToken = await refreshAccessToken(settings);
  if (!accessToken) {
    return existingKeyword ?? null;
  }

  const response = await fetchAmazonJson<Record<string, unknown>>(
    `${AMAZON_BASE_URL}/sp/keywords`,
    {
      method: "PUT",
      headers: buildAmazonHeaders(settings, accessToken),
      body: JSON.stringify([
        {
          keywordId,
          bid,
        },
      ]),
    },
  );

  if (!response) {
    return existingKeyword ?? null;
  }

  if (!existingKeyword) {
    return null;
  }

  const updatedKeyword = { ...existingKeyword, bid };
  mockKeywordMap.set(updatedKeyword.id, updatedKeyword);
  return updatedKeyword;
};

export const toggleCampaign = async (
  campaignId: string,
  status: CampaignStatus,
): Promise<Campaign | null> => {
  const existingCampaign =
    mockCampaignMap.get(campaignId) ||
    [...mockCampaignMap.values()].find(
      (campaign) => campaign.amazonCampaignId === campaignId,
    );

  const settings = await loadStoredCredentials();
  if (!hasCredentials(settings)) {
    if (!existingCampaign) {
      return null;
    }

    const updatedCampaign = { ...existingCampaign, status };
    mockCampaignMap.set(updatedCampaign.id, updatedCampaign);
    return updatedCampaign;
  }

  const accessToken = await refreshAccessToken(settings);
  if (!accessToken) {
    return existingCampaign ?? null;
  }

  const response = await fetchAmazonJson<Record<string, unknown>>(
    `${AMAZON_BASE_URL}/sp/campaigns`,
    {
      method: "PUT",
      headers: buildAmazonHeaders(settings, accessToken),
      body: JSON.stringify([
        {
          campaignId,
          state: status,
        },
      ]),
    },
  );

  if (!response) {
    return existingCampaign ?? null;
  }

  if (!existingCampaign) {
    return null;
  }

  const updatedCampaign = { ...existingCampaign, status };
  mockCampaignMap.set(updatedCampaign.id, updatedCampaign);
  return updatedCampaign;
};

export { AMAZON_AUTH_URL, AMAZON_BASE_URL };
