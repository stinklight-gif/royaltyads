import {
  AutomationAction,
  AutomationLogEntry,
  AutomationRuleTriggered,
  Campaign,
  CampaignStatus,
  DailyReport,
  Keyword,
  MatchType,
} from "@/lib/types";

const round2 = (value: number) => Math.round(value * 100) / 100;

export const DEMO_BANNER_TEXT =
  "Demo mode — connect Amazon Ads API in Settings to go live";

export const calculateBudgetUtilization = (spend: number, budget: number): number => {
  if (budget <= 0) {
    return 0;
  }

  return (spend / budget) * 100;
};

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
    spend: 41.8,
    sales: 176.42,
    impressions: 48320,
    clicks: 1988,
  },
  {
    name: "Work Gifts - Exact",
    status: "ENABLED",
    budget: 35,
    spend: 31.6,
    sales: 132.91,
    impressions: 39870,
    clicks: 1652,
  },
  {
    name: "Corporate Jokes - Broad",
    status: "PAUSED",
    budget: 28,
    spend: 14.2,
    sales: 31.55,
    impressions: 27210,
    clicks: 973,
  },
  {
    name: "Manager Memes - Exact",
    status: "ENABLED",
    budget: 40,
    spend: 39.3,
    sales: 86.46,
    impressions: 33654,
    clicks: 1261,
  },
  {
    name: "Team Building - Phrase",
    status: "PAUSED",
    budget: 30,
    spend: 22.4,
    sales: 98.14,
    impressions: 22418,
    clicks: 756,
  },
  {
    name: "Office Humor - Exact Match",
    status: "ENABLED",
    budget: 50,
    spend: 46.9,
    sales: 188.66,
    impressions: 50771,
    clicks: 2190,
  },
  {
    name: "Work Gifts - Phrase",
    status: "ARCHIVED",
    budget: 18,
    spend: 5.2,
    sales: 10.03,
    impressions: 12833,
    clicks: 366,
  },
  {
    name: "HR Humor - Auto",
    status: "ENABLED",
    budget: 22,
    spend: 21.1,
    sales: 30.58,
    impressions: 16432,
    clicks: 592,
  },
];

export const mockCampaigns: Campaign[] = campaignSeedData.map((campaign, index) => ({
  id: `cmp-${index + 1}`,
  amazonCampaignId: `${100000 + index}`,
  ...campaign,
  budget_utilization: round2(calculateBudgetUtilization(campaign.spend, campaign.budget)),
  today_acos: round2(calculateAcos(campaign.spend, campaign.sales)),
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

const actionPattern: AutomationAction[] = [
  "increase",
  "no_action",
  "decrease",
  "increase",
  "no_action",
  "skipped_floor",
];

const buildReason = (
  action: AutomationAction,
  util: number,
  acos: number,
  oldBudget: number,
  newBudget: number,
) => {
  if (action === "increase" || action === "pending_increase") {
    return `Budget util ${util.toFixed(1)}% > 80% and ACoS ${acos.toFixed(
      1,
    )}% below target. Increase budget from $${oldBudget.toFixed(2)} to $${newBudget.toFixed(
      2,
    )}.`;
  }

  if (action === "decrease" || action === "pending_decrease") {
    return `ACoS ${acos.toFixed(1)}% exceeded threshold. Reduced budget from $${oldBudget.toFixed(
      2,
    )} to $${newBudget.toFixed(2)}.`;
  }

  if (action === "skipped_floor") {
    return `ACoS ${acos.toFixed(1)}% exceeded threshold but budget hit floor at $${newBudget.toFixed(
      2,
    )}.`;
  }

  return `No rules triggered. Util ${util.toFixed(1)}%, ACoS ${acos.toFixed(1)}%.`;
};

const mockAutomationLogBase: AutomationLogEntry[] = Array.from(
  { length: 24 },
  (_, index) => {
    const campaign = mockCampaigns[index % mockCampaigns.length];
    const action = actionPattern[index % actionPattern.length];

    const baseBudget = round2(campaign.budget * (0.9 + ((index % 5) * 0.04)));
    const baseUtil = round2(campaign.budget_utilization + ((index % 4) * 3 - 4));
    const baseAcos = round2(campaign.today_acos + ((index % 5) * 2.2 - 3.5));

    let newBudget = baseBudget;
    if (action === "increase") {
      newBudget = round2(baseBudget * 1.2);
    } else if (action === "decrease") {
      newBudget = round2(Math.max(baseBudget * 0.85, 5));
    } else if (action === "skipped_floor") {
      newBudget = 5;
    }

    const ruleTriggered: AutomationRuleTriggered =
      action === "increase"
        ? "scale_up"
        : action === "decrease" || action === "skipped_floor"
          ? "scale_down"
          : null;

    const createdAt = new Date(Date.now() - index * 60 * 60 * 1000).toISOString();

    return {
      id: `log-${index + 1}`,
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      action,
      rule_triggered: ruleTriggered,
      old_budget: baseBudget,
      new_budget: newBudget,
      budget_utilization: round2(Math.max(baseUtil, 0)),
      today_acos: round2(Math.max(baseAcos, 0)),
      acos_target: 30,
      acos_threshold: 40,
      reason: buildReason(action, Math.max(baseUtil, 0), Math.max(baseAcos, 0), baseBudget, newBudget),
      approved_at: new Date(Date.now() - (index + 1) * 60 * 60 * 1000).toISOString(),
      approved: true,
      created_at: createdAt,
    };
  },
);

const pendingRecommendations: AutomationLogEntry[] = [
  {
    id: "log-pending-1",
    campaign_id: "cmp-1",
    campaign_name: "Office Humor - Broad Match",
    action: "pending_increase",
    rule_triggered: "scale_up",
    old_budget: 45,
    new_budget: 54,
    budget_utilization: 83.6,
    today_acos: 23.7,
    acos_target: 30,
    acos_threshold: 40,
    reason: "ACoS 23.7% < 30.0% target and utilization 83.6% > 80%.",
    approved_at: null,
    approved: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "log-pending-2",
    campaign_id: "cmp-2",
    campaign_name: "Work Gifts - Exact",
    action: "pending_increase",
    rule_triggered: "scale_up",
    old_budget: 35,
    new_budget: 42,
    budget_utilization: 87.1,
    today_acos: 25.4,
    acos_target: 30,
    acos_threshold: 40,
    reason: "ACoS 25.4% < 30.0% target and utilization 87.1% > 80%.",
    approved_at: null,
    approved: false,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "log-pending-3",
    campaign_id: "cmp-4",
    campaign_name: "Manager Memes - Exact",
    action: "pending_decrease",
    rule_triggered: "scale_down",
    old_budget: 40,
    new_budget: 34,
    budget_utilization: 98.2,
    today_acos: 45.5,
    acos_target: 30,
    acos_threshold: 40,
    reason: "ACoS 45.5% exceeded 40.0% threshold.",
    approved_at: null,
    approved: false,
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: "log-pending-4",
    campaign_id: "cmp-8",
    campaign_name: "HR Humor - Auto",
    action: "pending_decrease",
    rule_triggered: "scale_down",
    old_budget: 22,
    new_budget: 18.7,
    budget_utilization: 95.9,
    today_acos: 41.2,
    acos_target: 30,
    acos_threshold: 40,
    reason: "ACoS 41.2% exceeded 40.0% threshold.",
    approved_at: null,
    approved: false,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

export const mockAutomationLog: AutomationLogEntry[] = [
  ...pendingRecommendations,
  ...mockAutomationLogBase,
].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
