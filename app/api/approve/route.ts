import { NextRequest, NextResponse } from "next/server";

import { updateBudget } from "@/lib/amazon-ads/client";
import { getSupabaseClient } from "@/lib/supabase/client";
import { AutomationAction } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ApproveBody {
  id?: string;
  approved?: boolean;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ApproveBody;

  if (!body.id || typeof body.approved !== "boolean") {
    return NextResponse.json(
      { success: false, message: "Invalid body. Expected { id, approved }" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseClient();
  const { data: entry, error: fetchError } = await supabase
    .from("automation_log")
    .select("id, campaign_id, new_budget, action")
    .eq("id", body.id)
    .maybeSingle();

  if (fetchError || !entry) {
    return NextResponse.json(
      { success: false, message: "Pending action not found" },
      { status: 404 },
    );
  }

  const action = String(entry.action) as AutomationAction;
  if (action !== "pending_increase" && action !== "pending_decrease") {
    return NextResponse.json(
      { success: false, message: "Action is not pending approval" },
      { status: 400 },
    );
  }

  const approvedAt = new Date().toISOString();

  if (body.approved) {
    const updatedCampaign = await updateBudget(
      String(entry.campaign_id),
      Number(entry.new_budget),
    );

    if (!updatedCampaign) {
      return NextResponse.json(
        { success: false, message: "Budget update failed" },
        { status: 500 },
      );
    }

    const resolvedAction: AutomationAction =
      action === "pending_increase" ? "increase" : "decrease";

    const { error: updateError } = await supabase
      .from("automation_log")
      .update({
        approved: true,
        approved_at: approvedAt,
        action: resolvedAction,
      })
      .eq("id", body.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: `Update failed: ${updateError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: "Budget updated" });
  }

  const { error: rejectError } = await supabase
    .from("automation_log")
    .update({
      approved: false,
      approved_at: approvedAt,
      action: "rejected",
    })
    .eq("id", body.id);

  if (rejectError) {
    return NextResponse.json(
      { success: false, message: `Reject failed: ${rejectError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, message: "Action rejected" });
}
