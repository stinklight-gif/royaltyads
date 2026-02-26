import { NextResponse } from "next/server";

import { getCampaigns, updateBudget } from "@/lib/amazon-ads/client";
import { DEFAULT_AUTOMATION_SETTINGS, normalizeAdSettings } from "@/lib/automation";
import { calculateAcos, calculateBudgetUtilization } from "@/lib/mock-data";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  AdSettings,
  AutomationAction,
  AutomationRuleTriggered,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const round2 = (value: number) => Math.round(value * 100) / 100;

const loadSettings = async (): Promise<AdSettings> => {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("ad_settings")
      .select(
        "id, amazon_client_id, amazon_client_secret, amazon_refresh_token, amazon_profile_id, target_acos, acos_threshold, scale_up_pct, scale_down_pct, budget_floor, automation_mode, automation_enabled, daily_budget_cap",
      )
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return normalizeAdSettings(
      (data ?? null) as Partial<AdSettings> & { automation_enabled?: boolean },
    );
  } catch {
    return { ...DEFAULT_AUTOMATION_SETTINGS };
  }
};

interface LogPayload {
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
  approved: boolean;
  approved_at: string | null;
  created_at: string;
}

export async function GET() {
  const settings = await loadSettings();

  if (settings.automation_mode === "off") {
    return NextResponse.json({
      ran: false,
      reason: "automation_mode_off",
      settings: {
        target_acos: settings.target_acos,
        acos_threshold: settings.acos_threshold,
        scale_up_pct: settings.scale_up_pct,
        scale_down_pct: settings.scale_down_pct,
        budget_floor: settings.budget_floor,
        automation_mode: settings.automation_mode,
      },
    });
  }

  const campaigns = (await getCampaigns()).filter(
    (campaign) => campaign.status === "ENABLED",
  );

  const logs: LogPayload[] = [];
  const summary = {
    evaluated: 0,
    pending_increase: 0,
    pending_decrease: 0,
    increased: 0,
    decreased: 0,
    skipped_floor: 0,
    no_action: 0,
    update_errors: 0,
  };

  for (const campaign of campaigns) {
    summary.evaluated += 1;

    const oldBudget = round2(campaign.budget);
    const budgetUtilization = round2(
      campaign.budget_utilization ||
        calculateBudgetUtilization(campaign.spend, campaign.budget),
    );
    const todayAcos = round2(
      campaign.today_acos || calculateAcos(campaign.spend, campaign.sales),
    );

    let action: AutomationAction = "no_action";
    let ruleTriggered: AutomationRuleTriggered = null;
    let newBudget = oldBudget;
    let reason = `No rules triggered. Util ${budgetUtilization.toFixed(2)}%, ACoS ${todayAcos.toFixed(2)}%.`;
    let approved = settings.automation_mode === "auto";
    let approvedAt: string | null = settings.automation_mode === "auto" ? new Date().toISOString() : null;

    if (budgetUtilization > 80 && todayAcos < settings.target_acos) {
      ruleTriggered = "scale_up";
      newBudget = round2(
        Math.min(oldBudget * (1 + settings.scale_up_pct / 100), oldBudget * 2),
      );
      reason = `Budget util ${budgetUtilization.toFixed(2)}% > 80% and ACoS ${todayAcos.toFixed(2)}% < target ${settings.target_acos.toFixed(2)}%.`;

      if (settings.automation_mode === "approval") {
        action = "pending_increase";
        approved = false;
        approvedAt = null;
        summary.pending_increase += 1;
      } else {
        action = "increase";
        summary.increased += 1;
        const updatedCampaign = await updateBudget(campaign.id, newBudget);
        if (!updatedCampaign) {
          summary.update_errors += 1;
          reason += " Budget update failed.";
        }
      }
    } else if (todayAcos > settings.acos_threshold) {
      ruleTriggered = "scale_down";
      newBudget = round2(
        Math.max(oldBudget * (1 - settings.scale_down_pct / 100), settings.budget_floor),
      );
      reason = `ACoS ${todayAcos.toFixed(2)}% > threshold ${settings.acos_threshold.toFixed(2)}%.`;

      if (settings.automation_mode === "approval") {
        action = "pending_decrease";
        approved = false;
        approvedAt = null;
        summary.pending_decrease += 1;
      } else {
        action = newBudget <= settings.budget_floor ? "skipped_floor" : "decrease";
        if (action === "skipped_floor") {
          reason += ` Budget held at floor ${settings.budget_floor.toFixed(2)}.`;
          summary.skipped_floor += 1;
        } else {
          summary.decreased += 1;
        }

        const updatedCampaign = await updateBudget(campaign.id, newBudget);
        if (!updatedCampaign) {
          summary.update_errors += 1;
          reason += " Budget update failed.";
        }
      }
    } else {
      summary.no_action += 1;
      if (settings.automation_mode === "approval") {
        approved = true;
        approvedAt = new Date().toISOString();
      }
    }

    logs.push({
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      action,
      rule_triggered: ruleTriggered,
      old_budget: oldBudget,
      new_budget: newBudget,
      budget_utilization: budgetUtilization,
      today_acos: todayAcos,
      acos_target: settings.target_acos,
      acos_threshold: settings.acos_threshold,
      reason,
      approved,
      approved_at: approvedAt,
      created_at: new Date().toISOString(),
    });
  }

  let insertError: { message: string } | null = null;
  if (logs.length > 0) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("automation_log").insert(logs);
    insertError = error ? { message: error.message } : null;
  }

  return NextResponse.json({
    ran: true,
    mode: settings.automation_mode,
    campaign_count: campaigns.length,
    settings: {
      target_acos: settings.target_acos,
      acos_threshold: settings.acos_threshold,
      scale_up_pct: settings.scale_up_pct,
      scale_down_pct: settings.scale_down_pct,
      budget_floor: settings.budget_floor,
      automation_mode: settings.automation_mode,
    },
    summary,
    log_inserted: insertError ? 0 : logs.length,
    log_error: insertError?.message ?? null,
  });
}
