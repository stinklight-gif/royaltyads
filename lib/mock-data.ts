import { Campaign, CampaignStatus, DailyReport, Keyword, MatchType } from "@/lib/types";

const round2 = (value: number) => Math.round(value * 100) / 100;

export const DEMO_BANNER_TEXT =
  "Demo mode — connect Amazon Ads API in Settings to go live";

const campaignSeedData: Array<{
  name: string;
  status: CampaignStatus;
  budget: number;
  spend: number;
  sales: number;
  impressions: number;
  clicks: number;
}> = [
  {
    name: "Office Humor - Broad Match",
    status: "ENABLED",
    budget: 45,
    spend: 682.14,
    sales: 2412.77,
    impressions: 48320,
    clicks: 1988,
  },
  {
    name: "Work Gifts - Exact",
    status: "ENABLED",
    budget: 35,
    spend: 532.43,
    sales: 1961.18,
    impressions: 39870,
    clicks: 1652,
  },
  {
    name: "Corporate Jokes - Broad",
    status: "PAUSED",
    budget: 28,
    spend: 314.85,
    sales: 611.42,
    impressions: 27210,
    clicks: 973,
  },
  {
    name: "Manager Memes - Exact",
    status: "ENABLED",
    budget: 40,
    spend: 446.21,
    sales: 1758.36,
    impressions: 33654,
    clicks: 1261,
  },
  {
    name: "Team Building - Phrase",
    status: "PAUSED",
    budget: 30,
    spend: 271.66,
    sales: 703.92,
    impressions: 22418,
    clicks: 756,
  },
  {
    name: "Office Humor - Exact Match",
    status: "ENABLED",
    budget: 50,
    spend: 724.88,
    sales: 2824.55,
    impressions: 50771,
    clicks: 2190,
  },
  {
    name: "Work Gifts - Phrase",
    status: "ARCHIVED",
    budget: 18,
    spend: 112.07,
    sales: 205.12,
    impressions: 12833,
    clicks: 366,
  },
  {
    name: "HR Humor - Auto",
    status: "ENABLED",
    budget: 22,
    spend: 188.91,
    sales: 934.81,
    impressions: 16432,
    clicks: 592,
  },
];

export const mockCampaigns: Campaign[] = campaignSeedData.map((campaign, index) => ({
  id: `cmp-${index + 1}`,
  amazonCampaignId: `${100000 + index}`,
  ...campaign,
}));

const keywordTerms = [
  "office humor book",
  "funny office notebook",
  "coworker gift ideas",
  "office gag gift",
  "workplace satire",
  "boss joke book",
  "funny meeting notes",
  "corporate humor",
  "hr funny gift",
  "team gift notebook",
  "work anniversary gag",
  "manager meme book",
  "funny productivity planner",
  "office prank journal",
  "funny employee gift",
  "coffee break jokes",
  "funny cubicle decor",
  "office white elephant",
  "burnout humor",
  "remote work jokes",
  "funny office quotes",
  "snarky planner",
  "desk job humor",
  "corporate life jokes",
  "sarcastic notebook",
  "funny stationery gift",
  "work bestie gift",
  "coworker birthday gift",
  "funny business book",
  "meeting survival guide",
  "funny manager present",
  "promotion gift joke",
  "office christmas gift",
  "team morale gift",
  "funny hr notebook",
  "burnout journal",
  "office banter book",
  "funny leadership gift",
  "corporate meme notebook",
  "conference joke book",
  "work stress relief book",
  "office farewell gift",
  "funny promotion card",
  "office gift broad",
  "gift for boss funny",
  "office notebook exact",
  "work gift phrase",
  "kdp office humor",
  "amazon office gift",
  "funny employee appreciation",
];

const matchCycle: MatchType[] = ["BROAD", "PHRASE", "EXACT"];

export const mockKeywords: Keyword[] = keywordTerms.map((term, index) => {
  const campaign = mockCampaigns[index % mockCampaigns.length];
  const baseImpressions = 340 + ((index * 73) % 2600);
  const ctrRatio = 0.028 + (index % 6) * 0.008;
  const clicks = Math.max(6, Math.round(baseImpressions * ctrRatio));
  const bid = round2(0.34 + (index % 10) * 0.07 + (index % 3) * 0.03);
  const spend = round2(clicks * bid * (0.9 + (index % 4) * 0.06));

  let salesMultiplier = 1.55 + (index % 7) * 0.35;
  if (index % 13 === 0) {
    salesMultiplier = 0.42;
  } else if (index % 9 === 0 || index % 7 === 0) {
    salesMultiplier = 6.4;
  }

  const sales = round2(spend * salesMultiplier);

  return {
    id: `kw-${index + 1}`,
    amazonKeywordId: `${900000 + index}`,
    campaignId: campaign.id,
    keyword: term,
    matchType: matchCycle[index % matchCycle.length],
    bid,
    spend,
    sales,
    impressions: baseImpressions,
    clicks,
  };
});

export const mockDailyReports: DailyReport[] = Array.from(
  { length: 30 },
  (_, index) => {
    const daysAgo = 29 - index;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const spend = round2(
      58 + (index % 6) * 5.8 + Math.sin(index / 3.5) * 6.4 + (index % 2) * 2.1,
    );
    const revenueMultiplier =
      1.92 + (index % 7) * 0.08 + Math.cos(index / 4.2) * 0.09;
    const revenue = round2(spend * revenueMultiplier);

    return {
      date: date.toISOString().slice(0, 10),
      spend,
      revenue,
    };
  },
);

export const calculateAcos = (spend: number, sales: number): number => {
  if (sales <= 0) {
    return 0;
  }
  return (spend / sales) * 100;
};

export const calculateRoas = (spend: number, sales: number): number => {
  if (spend <= 0) {
    return 0;
  }
  return sales / spend;
};

export const calculateCtr = (clicks: number, impressions: number): number => {
  if (impressions <= 0) {
    return 0;
  }
  return (clicks / impressions) * 100;
};

export const calculateCpc = (spend: number, clicks: number): number => {
  if (clicks <= 0) {
    return 0;
  }
  return spend / clicks;
};
