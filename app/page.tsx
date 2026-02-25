"use client";

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
import { formatCurrency, formatPercent } from "@/lib/format";
import { calculateAcos, calculateRoas, mockCampaigns, mockDailyReports } from "@/lib/mock-data";
import { CampaignStatus } from "@/lib/types";

const statusBadgeClass: Record<CampaignStatus, string> = {
  ENABLED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  PAUSED: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  ARCHIVED: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
};

export default function DashboardPage() {
  const totalSpend = mockCampaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
  const totalRevenue = mockCampaigns.reduce((sum, campaign) => sum + campaign.sales, 0);
  const blendedAcos = calculateAcos(totalSpend, totalRevenue);
  const roas = calculateRoas(totalSpend, totalRevenue);

  const topCampaigns = [...mockCampaigns]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

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
          Last 30 days performance snapshot across all KDP campaigns.
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
          <CardDescription>Ranked by sales</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">ACoS</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCampaigns.map((campaign) => {
                const acos = calculateAcos(campaign.spend, campaign.sales);

                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(campaign.spend)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(campaign.sales)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPercent(acos)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass[campaign.status]}>
                        {campaign.status}
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
