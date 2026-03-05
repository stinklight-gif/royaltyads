"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatPercent } from "@/lib/format";
import { mockAutomationLog } from "@/lib/mock-data";
import { getSupabaseClient } from "@/lib/supabase/client";
import { AutomationAction, AutomationLogEntry } from "@/lib/types";

const actionBadgeClass: Record<AutomationAction, string> = {
  increase: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  decrease: "bg-red-500/20 text-red-300 border-red-500/40",
  skipped_floor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  no_action: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
  pending_increase: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  pending_decrease: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  rejected: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
};

const mapEntry = (entry: Partial<AutomationLogEntry>): AutomationLogEntry => ({
  id: String(entry.id ?? crypto.randomUUID()),
  campaign_id: String(entry.campaign_id ?? ""),
  campaign_name: String(entry.campaign_name ?? "Unknown Campaign"),
  action: (entry.action as AutomationAction) ?? "no_action",
  rule_triggered:
    entry.rule_triggered === "scale_up" || entry.rule_triggered === "scale_down"
      ? entry.rule_triggered
      : null,
  old_budget: Number(entry.old_budget) || 0,
  new_budget: Number(entry.new_budget) || 0,
  budget_utilization: Number(entry.budget_utilization) || 0,
  today_acos: Number(entry.today_acos) || 0,
  acos_target: Number(entry.acos_target) || 30,
  acos_threshold: Number(entry.acos_threshold) || 40,
  reason: String(entry.reason ?? "No reason recorded."),
  approved_at: entry.approved_at ? String(entry.approved_at) : null,
  approved: Boolean(entry.approved),
  created_at: String(entry.created_at ?? new Date().toISOString()),
});

const isPendingAction = (action: AutomationAction) =>
  action === "pending_increase" || action === "pending_decrease";

const actionLabel = (action: AutomationAction) => {
  if (action === "pending_increase" || action === "pending_decrease") {
    return "Pending";
  }

  return action;
};

export default function ActivityPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [rows, setRows] = useState<AutomationLogEntry[]>(mockAutomationLog.slice(0, 100));
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [workingIds, setWorkingIds] = useState<Set<string>>(new Set());

  const loadLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from("automation_log")
      .select(
        "id, campaign_id, campaign_name, action, rule_triggered, old_budget, new_budget, budget_utilization, today_acos, acos_target, acos_threshold, reason, approved_at, approved, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data) {
      setMessage("Showing mock log data. Run migration/cron to load live automation logs.");
      setLoading(false);
      return;
    }

    setRows((data as Partial<AutomationLogEntry>[]).map(mapEntry));
    setMessage("Live logs loaded.");
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      await loadLogs();
      if (!mounted) {
        return;
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [loadLogs]);

  const pendingRows = rows.filter((entry) => isPendingAction(entry.action));

  const setWorking = (id: string, working: boolean) => {
    setWorkingIds((previous) => {
      const next = new Set(previous);
      if (working) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleDecision = async (id: string, approved: boolean) => {
    setWorking(id, true);
    setMessage("");

    try {
      const response = await fetch("/api/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, approved }),
      });

      const payload = (await response.json()) as { success: boolean; message: string };
      if (!response.ok || !payload.success) {
        setMessage(payload.message || "Action failed.");
        setWorking(id, false);
        return;
      }

      setRows((previous) =>
        previous.map((entry) => {
          if (entry.id !== id) {
            return entry;
          }

          if (approved) {
            return {
              ...entry,
              action: entry.action === "pending_increase" ? "increase" : "decrease",
              approved: true,
              approved_at: new Date().toISOString(),
            };
          }

          return {
            ...entry,
            action: "rejected",
            approved: false,
            approved_at: new Date().toISOString(),
          };
        }),
      );

      setMessage(payload.message);
    } catch {
      setMessage("Action failed.");
    } finally {
      setWorking(id, false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-mono text-2xl font-semibold text-zinc-100">Activity Log</h2>
        <p className="text-sm text-zinc-400">
          Last 100 automation actions from hourly budget rules.
        </p>
      </div>

      {pendingRows.length > 0 ? (
        <Card className="border-yellow-600/50 bg-yellow-900/10">
          <CardHeader>
            <CardTitle className="text-base text-yellow-200">
              {pendingRows.length} actions waiting for your approval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRows.map((entry) => {
              const pendingIncrease = entry.action === "pending_increase";
              const working = workingIds.has(entry.id);

              return (
                <div
                  key={`pending-${entry.id}`}
                  className="rounded-md border border-yellow-700/60 bg-zinc-900/60 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-100">{entry.campaign_name}</p>
                      <p className="text-xs text-zinc-300">
                        Recommended action: {pendingIncrease ? "increase budget" : "decrease budget"}
                      </p>
                      <p className="text-xs font-mono text-zinc-300">
                        {formatCurrency(entry.old_budget)}
                        {" -> "}
                        {formatCurrency(entry.new_budget)}
                      </p>
                      <p className="text-xs text-zinc-400">{entry.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={working}
                        onClick={() => handleDecision(entry.id, true)}
                        className="bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        APPROVE
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={working}
                        onClick={() => handleDecision(entry.id, false)}
                      >
                        REJECT
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automation History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-zinc-400">
            {loading ? "Loading logs..." : message || "Ready."}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Old Budget</TableHead>
                <TableHead className="text-right">New Budget</TableHead>
                <TableHead className="text-right">Util %</TableHead>
                <TableHead className="text-right">ACoS</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-xs">
                    {new Date(entry.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-medium">{entry.campaign_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={actionBadgeClass[entry.action]}>
                      {actionLabel(entry.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(entry.old_budget)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(entry.new_budget)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatPercent(entry.budget_utilization)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatPercent(entry.today_acos)}
                  </TableCell>
                  <TableCell className="max-w-md text-xs text-zinc-300">{entry.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
