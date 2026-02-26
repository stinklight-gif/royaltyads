import {
  calculateAcos,
  calculateBudgetUtilization,
  mockAutomationLog,
  mockCampaigns,
  mockDailyReports,
  mockKeywords,
} from "@/lib/mock-data";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  AdSettings,
  AutomationLogEntry,
  Campaign,
  CampaignStatus,
  DailyReport,
  Keyword,
} from "@/lib/types";

const AMAZON_BASE_URL = "https://advertising-api.amazon.com";
const AMAZON_AUTH_URL = "https://api.amazon.com/auth/o2/token";
const DEFAULT_PAGE_SIZE = 50;

interface CampaignQueryOptions {
  limit?: number;
  offset?: number;
}

type StoredCredentials = Pick<
  AdSettings,
  | "amazon_client_id"
  | "amazon_client_secret"
  | "amazon_refresh_token"
  | "amazon_profile_id"
>;

const mockCampaignMap = new Map(
  mockCampaigns.map((campaign) => [campaign.id, { ...campaign }]),
);
const mockKeywordMap = new Map(
  mockKeywords.map((keyword) => [keyword.id, { ...keyword }]),
);
const mockLogMap = new Map(
  mockAutomationLog.map((entry) => [entry.id, { ...entry }]),
);

const normalize = (value?: string | null) => value?.trim() ?? "";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const hasCredentials = (
  settings: StoredCredentials | null,
): settings is StoredCredentials => {
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

const fetchAmazonJson = async <T>(
  url: string,
  init: RequestInit,
): Promise<T | null> => {
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
  const budget = Number(raw.dailyBudget) || Number(raw.budget) || 0;
  const spend = Number(raw.spend) || Number(raw.cost) || 0;
  const sales = Number(raw.sales) || Number(raw.revenue) || 0;
  const impressions = Number(raw.impressions) || 0;
  const clicks = Number(raw.clicks) || 0;

  return {
    id: String(raw.campaignId ?? raw.id ?? `live-cmp-${index}`),
    amazonCampaignId: String(raw.campaignId ?? raw.id ?? `live-cmp-${index}`),
    name: String(raw.name ?? `Live Campaign ${index + 1}`),
    status: String(raw.state ?? raw.status ?? "ENABLED") as CampaignStatus,
    budget,
    spend,
    sales,
    impressions,
    clicks,
    budget_utilization:
      Number(raw.budget_utilization) ||
      calculateBudgetUtilization(spend, budget),
    today_acos: Number(raw.today_acos) || calculateAcos(spend, sales),
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

export const getCampaigns = async (
  options: CampaignQueryOptions = {},
): Promise<Campaign[]> => {
  const limit = Math.max(1, options.limit ?? DEFAULT_PAGE_SIZE);
  const offset = Math.max(0, options.offset ?? 0);

  const sortedMockCampaigns = [...mockCampaignMap.values()].sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  const settings = await loadStoredCredentials();
  if (!hasCredentials(settings)) {
    return sortedMockCampaigns.slice(offset, offset + limit);
  }

  const accessToken = await refreshAccessToken(settings);
  if (!accessToken) {
    return sortedMockCampaigns.slice(offset, offset + limit);
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
        count: limit,
        startIndex: offset,
      }),
    },
  );

  const liveCampaigns = payload?.campaigns;
  if (!Array.isArray(liveCampaigns) || liveCampaigns.length === 0) {
    return sortedMockCampaigns.slice(offset, offset + limit);
  }

  const mapped = liveCampaigns.map(mapCampaign);
  if (mapped.length > limit) {
    return mapped.slice(offset, offset + limit);
  }

  return mapped;
};

export const getAllCampaignsBatched = async (): Promise<Campaign[]> => {
  const pageSize = DEFAULT_PAGE_SIZE;
  const allCampaigns: Campaign[] = [];
  const seenCampaignIds = new Set<string>();
  const maxBatches = 200;
  let offset = 0;

  for (let batchIndex = 0; batchIndex < maxBatches; batchIndex += 1) {
    const batch = await getCampaigns({ limit: pageSize, offset });
    if (batch.length === 0) {
      break;
    }

    const uniqueBatch = batch.filter((campaign) => !seenCampaignIds.has(campaign.id));
    uniqueBatch.forEach((campaign) => seenCampaignIds.add(campaign.id));

    if (uniqueBatch.length === 0) {
      break;
    }

    allCampaigns.push(...uniqueBatch);

    if (uniqueBatch.length < pageSize) {
      break;
    }

    offset += pageSize;
    await sleep(200);
  }

  return allCampaigns;
};

export const getKeywords = async (campaignId?: string): Promise<Keyword[]> => {
  if (!campaignId) {
    return [];
  }

  const filteredMockKeywords = [...mockKeywordMap.values()].filter(
    (keyword) => keyword.campaignId === campaignId,
  );

  const settings = await loadStoredCredentials();
  if (!hasCredentials(settings)) {
    return filteredMockKeywords;
  }

  const accessToken = await refreshAccessToken(settings);
  if (!accessToken) {
    return filteredMockKeywords;
  }

  type KeywordResponse = { keywords?: Array<Record<string, unknown>> };

  const payload = await fetchAmazonJson<KeywordResponse>(
    `${AMAZON_BASE_URL}/sp/keywords/list`,
    {
      method: "POST",
      headers: buildAmazonHeaders(settings, accessToken),
      body: JSON.stringify({
        campaignIdFilter: {
          include: [campaignId],
        },
        stateFilter: {
          include: ["ENABLED", "PAUSED"],
        },
      }),
    },
  );

  const liveKeywords = payload?.keywords;
  if (!Array.isArray(liveKeywords) || liveKeywords.length === 0) {
    return filteredMockKeywords;
  }

  return liveKeywords
    .map(mapKeyword)
    .filter((keyword) => keyword.campaignId === campaignId);
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
    rows?: Array<{
      date?: string;
      spend?: number;
      sales?: number;
      revenue?: number;
    }>;
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

export const updateBudget = async (
  campaignId: string,
  newBudget: number,
): Promise<Campaign | null> => {
  const existingCampaign =
    mockCampaignMap.get(campaignId) ||
    [...mockCampaignMap.values()].find(
      (campaign) => campaign.amazonCampaignId === campaignId,
    );

  const patchCampaign = (target: Campaign) => {
    const updatedCampaign: Campaign = {
      ...target,
      budget: newBudget,
      budget_utilization: calculateBudgetUtilization(target.spend, newBudget),
      today_acos: target.today_acos || calculateAcos(target.spend, target.sales),
    };

    mockCampaignMap.set(updatedCampaign.id, updatedCampaign);
    return updatedCampaign;
  };

  const settings = await loadStoredCredentials();
  if (!hasCredentials(settings)) {
    if (!existingCampaign) {
      return null;
    }

    return patchCampaign(existingCampaign);
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
          dailyBudget: newBudget,
        },
      ]),
    },
  );

  if (!response || !existingCampaign) {
    return existingCampaign ?? null;
  }

  return patchCampaign(existingCampaign);
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

  if (!response || !existingCampaign) {
    return existingCampaign ?? null;
  }

  const updatedCampaign = { ...existingCampaign, status };
  mockCampaignMap.set(updatedCampaign.id, updatedCampaign);
  return updatedCampaign;
};

export const getAutomationLogFallback = (): AutomationLogEntry[] =>
  [...mockLogMap.values()].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

export { AMAZON_AUTH_URL, AMAZON_BASE_URL };
