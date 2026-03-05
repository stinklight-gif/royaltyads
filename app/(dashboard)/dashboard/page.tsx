"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_AUTOMATION_SETTINGS, normalizeAdSettings } from "@/lib/automation";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  calculateAcos,
  calculateRoas,
  mockAutomationLog,
  mockCampaigns,
  mockDailyReports,
} from "@/lib/mock-data";
import { getSupabaseClient } from "@/lib/supabase/client";
import { AdSettings, AutomationAction, AutomationLogEntry, CampaignStatus } from "@/lib/types";

const statusBadgeClass: Record<CampaignStatus, string> = {
  ENABLED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  PAUSED: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  ARCHIVED: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
};

const actionBadgeClass: Record<AutomationAction, string> = {
  increase: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  decrease: "bg-red-500/20 text-red-300 border-red-500/40",
  skipped_floor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  no_action: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
  pending_increase: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  pending_decrease: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  rejected: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
};

const mapLog = (entry: Partial<AutomationLogEntry>): AutomationLogEntry => ({
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
  reason: String(entry.reason ?? ""),
  approved_at: entry.approved_at ? String(entry.approved_at) : null,
  approved: Boolean(entry.approved),
  created_at: String(entry.created_at ?? new Date().toISOString()),
});

export default function DashboardPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [settings, setSettings] = useState<AdSettings>({
    ...DEFAULT_AUTOMATION_SETTINGS,
  });
  const [logs, setLogs] = useState<AutomationLogEntry[]>(mockAutomationLog);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      const [settingsResult, logsResult] = await Promise.all([
        supabase
          .from("ad_settings")
          .select(
            "id, amazon_client_id, amazon_client_secret, amazon_refresh_token, amazon_profile_id, target_acos, acos_threshold, scale_up_pct, scale_down_pct, budget_floor, automation_mode, automation_enabled, daily_budget_cap",
          )
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("automation_log")
          .select(
            "id, campaign_id, campaign_name, action, rule_triggered, old_budget, new_budget, budget_utilization, today_acos, acos_target, acos_threshold, reason, approved_at, approved, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (!mounted) {
        return;
      }

      if (!settingsResult.error && settingsResult.data) {
        setSettings(
          normalizeAdSettings(
            settingsResult.data as Partial<AdSettings> & {
              automation_enabled?: boolean;
            },
          ),
        );
      }

      if (!logsResult.error && logsResult.data && logsResult.data.length > 0) {
        setLogs((logsResult.data as Partial<AutomationLogEntry>[]).map(mapLog));
      }
    };

    void loadDashboardData();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const totalSpend = mockCampaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
  const totalRevenue = mockCampaigns.reduce((sum, campaign) => sum + campaign.sales, 0);
  const blendedAcos = calculateAcos(totalSpend, totalRevenue);
  const roas = calculateRoas(totalSpend, totalRevenue);

  const campaigns = [...mockCampaigns]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 8);

  const lastActionByCampaign = useMemo(() => {
    const byCampaign = new Map<string, AutomationLogEntry>();

    [...logs]
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .forEach((entry) => {
        if (!byCampaign.has(entry.campaign_id)) {
          byCampaign.set(entry.campaign_id, entry);
        }
      });

    return byCampaign;
  }, [logs]);

  const chartData = mockDailyReports.map((day) => ({
    ...day,
    label: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-mono text-2xl font-semibold text-zinc-100">Dashboard</h2>
        <p className="text-sm text-zinc-400">
          Hourly automation outcomes and campaign efficiency snapshot.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardDescription>Total Spend</CardDescription>
            <CardTitle className="font-mono text-2xl">{formatCurrency(totalSpend)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="font-mono text-2xl">{formatCurrency(totalRevenue)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardDescription>Blended ACoS</CardDescription>
            <CardTitle className="font-mono text-2xl text-amber-300">
              {formatPercent(blendedAcos)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardDescription>ROAS</CardDescription>
            <CardTitle className="font-mono text-2xl text-emerald-300">
              {roas.toFixed(2)}x
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Spend vs Revenue</CardTitle>
          <CardDescription>Daily trend over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="label" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => {
                    const numericValue = Array.isArray(value)
                      ? Number(value[0])
                      : Number(value);
                    return formatCurrency(
                      Number.isFinite(numericValue) ? numericValue : 0,
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="spend"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  name="Spend"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Campaigns</CardTitle>
          <CardDescription>
            Live rule context. Target ACoS: {settings.target_acos}% | Threshold: {settings.acos_threshold}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Today Spend</TableHead>
                <TableHead className="text-right">Daily Budget</TableHead>
                <TableHead className="text-right">Util %</TableHead>
                <TableHead className="text-right">Today ACoS</TableHead>
                <TableHead>Last Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const util = campaign.budget_utilization;
                const acos = campaign.today_acos;
                const lastAction = lastActionByCampaign.get(campaign.id);

                const utilClass =
                  util < 80
                    ? "text-emerald-300"
                    : util <= 95
                      ? "text-amber-300"
                      : "text-red-300";

                const acosClass =
                  acos < settings.target_acos
                    ? "text-emerald-300"
                    : acos > settings.acos_threshold
                      ? "text-red-300"
                      : "text-zinc-300";

                const action = lastAction?.action ?? "no_action";

                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass[campaign.status]}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(campaign.spend)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(campaign.budget)}
                    </TableCell>
                    <TableCell className={`text-right font-mono ${utilClass}`}>
                      {formatPercent(util)}
                    </TableCell>
                    <TableCell className={`text-right font-mono ${acosClass}`}>
                      {formatPercent(acos)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={actionBadgeClass[action]}>
                        {action}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
