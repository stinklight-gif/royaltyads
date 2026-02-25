"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  calculateAcos,
  calculateCtr,
  calculateRoas,
  mockCampaigns,
} from "@/lib/mock-data";
import { CampaignStatus } from "@/lib/types";

type StatusFilter = "ALL" | CampaignStatus;

const statusBadgeClass: Record<CampaignStatus, string> = {
  ENABLED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  PAUSED: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  ARCHIVED: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const filteredCampaigns = useMemo(() => {
    if (statusFilter === "ALL") {
      return campaigns;
    }

    return campaigns.filter((campaign) => campaign.status === statusFilter);
  }, [campaigns, statusFilter]);

  const allVisibleSelected =
    filteredCampaigns.length > 0 &&
    filteredCampaigns.every((campaign) => selectedIds.has(campaign.id));

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      filteredCampaigns.forEach((campaign) => {
        if (checked) {
          next.add(campaign.id);
        } else {
          next.delete(campaign.id);
        }
      });

      return next;
    });
  };

  const toggleRowSelection = (campaignId: string, checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(campaignId);
      } else {
        next.delete(campaignId);
      }
      return next;
    });
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns((previous) =>
      previous.map((campaign) => {
        if (campaign.id !== campaignId) {
          return campaign;
        }

        const nextStatus: CampaignStatus =
          campaign.status === "ENABLED" ? "PAUSED" : "ENABLED";

        return {
          ...campaign,
          status: nextStatus,
        };
      }),
    );
  };

  const applyBulkStatus = (status: CampaignStatus) => {
    if (selectedIds.size === 0) {
      return;
    }

    setCampaigns((previous) =>
      previous.map((campaign) =>
        selectedIds.has(campaign.id)
          ? {
              ...campaign,
              status,
            }
          : campaign,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-2xl font-semibold text-zinc-100">Campaigns</h2>
          <p className="text-sm text-zinc-400">
            Monitor campaign efficiency and control status in bulk.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => applyBulkStatus("PAUSED")}>
            Pause Selected
          </Button>
          <Button size="sm" onClick={() => applyBulkStatus("ENABLED")}>
            Enable Selected
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">All Campaigns</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Status Filter</span>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="ENABLED">ENABLED</SelectItem>
                <SelectItem value="PAUSED">PAUSED</SelectItem>
                <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    aria-label="Select all campaigns"
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
                    checked={allVisibleSelected}
                    onChange={(event) => toggleSelectAll(event.target.checked)}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">ACoS</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => {
                const acos = calculateAcos(campaign.spend, campaign.sales);
                const roas = calculateRoas(campaign.spend, campaign.sales);
                const ctr = calculateCtr(campaign.clicks, campaign.impressions);
                const selected = selectedIds.has(campaign.id);

                return (
                  <TableRow key={campaign.id} data-state={selected ? "selected" : "none"}>
                    <TableCell>
                      <input
                        aria-label={`Select ${campaign.name}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
                        checked={selected}
                        onChange={(event) =>
                          toggleRowSelection(campaign.id, event.target.checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass[campaign.status]}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(campaign.budget)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(campaign.spend)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(campaign.sales)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPercent(acos)}
                    </TableCell>
                    <TableCell className="text-right font-mono">{roas.toFixed(2)}x</TableCell>
                    <TableCell className="text-right font-mono">
                      {campaign.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {campaign.clicks.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPercent(ctr)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleCampaignStatus(campaign.id)}
                      >
                        {campaign.status === "ENABLED" ? "Pause" : "Enable"}
                      </Button>
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
