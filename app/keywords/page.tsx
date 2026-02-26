"use client";

import { useEffect, useMemo, useState } from "react";

import { getCampaigns, getKeywords } from "@/lib/amazon-ads/client";
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
import { calculateAcos, calculateCpc, calculateCtr } from "@/lib/mock-data";
import type { Campaign, Keyword } from "@/lib/types";

const PAGE_SIZE = 50;

type SortKey =
  | "keyword"
  | "matchType"
  | "impressions"
  | "clicks"
  | "ctr"
  | "cpc"
  | "spend"
  | "sales"
  | "acos";

type SortDirection = "asc" | "desc";

interface KeywordRow {
  id: string;
  keyword: string;
  matchType: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spend: number;
  sales: number;
  acos: number;
}

const sortLabel = (key: SortKey, activeKey: SortKey, direction: SortDirection) => {
  if (key !== activeKey) {
    return "";
  }

  return direction === "asc" ? " ↑" : " ↓";
};

export default function KeywordsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    const loadCampaigns = async () => {
      setCampaignsLoading(true);
      const allCampaigns: Campaign[] = [];
      const seenCampaignIds = new Set<string>();
      let offset = 0;

      for (let batchIndex = 0; batchIndex < 200; batchIndex += 1) {
        const batch = await getCampaigns({ limit: PAGE_SIZE, offset });
        if (batch.length === 0) {
          break;
        }

        const uniqueBatch = batch.filter((campaign) => !seenCampaignIds.has(campaign.id));
        uniqueBatch.forEach((campaign) => seenCampaignIds.add(campaign.id));

        if (uniqueBatch.length === 0) {
          break;
        }

        allCampaigns.push(...uniqueBatch);

        if (uniqueBatch.length < PAGE_SIZE) {
          break;
        }

        offset += PAGE_SIZE;
      }

      if (!mounted) {
        return;
      }

      setCampaigns(allCampaigns);
      setCampaignsLoading(false);
    };

    void loadCampaigns();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadKeywords = async () => {
      if (!selectedCampaignId) {
        setKeywords([]);
        setPage(1);
        return;
      }

      setKeywordsLoading(true);
      const campaignKeywords = await getKeywords(selectedCampaignId);

      if (!mounted) {
        return;
      }

      setKeywords(campaignKeywords);
      setPage(1);
      setKeywordsLoading(false);
    };

    void loadKeywords();

    return () => {
      mounted = false;
    };
  }, [selectedCampaignId]);

  const rows = useMemo<KeywordRow[]>(() => {
    return keywords.map((keyword) => {
      const ctr = calculateCtr(keyword.clicks, keyword.impressions);
      const cpc = calculateCpc(keyword.spend, keyword.clicks);
      const acos = calculateAcos(keyword.spend, keyword.sales);

      return {
        id: keyword.id,
        keyword: keyword.keyword,
        matchType: keyword.matchType,
        impressions: keyword.impressions,
        clicks: keyword.clicks,
        ctr,
        cpc,
        spend: keyword.spend,
        sales: keyword.sales,
        acos,
      };
    });
  }, [keywords]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];

      if (typeof left === "string" && typeof right === "string") {
        return left.localeCompare(right);
      }

      return Number(left) - Number(right);
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [rows, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paginatedRows = sortedRows.slice(pageStart, pageStart + PAGE_SIZE);
  const rangeStart = sortedRows.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + PAGE_SIZE, sortedRows.length);

  const updateSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  };

  const exportCsv = () => {
    const headers = [
      "Keyword",
      "Match Type",
      "Impressions",
      "Clicks",
      "CTR",
      "CPC",
      "Spend",
      "Sales",
      "ACoS",
    ];

    const csvRows = paginatedRows.map((row) => [
      row.keyword,
      row.matchType,
      row.impressions.toString(),
      row.clicks.toString(),
      row.ctr.toFixed(2),
      row.cpc.toFixed(2),
      row.spend.toFixed(2),
      row.sales.toFixed(2),
      row.acos.toFixed(2),
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `royaltyads-keywords-${selectedCampaignId || "campaign"}-page-${safePage}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-2xl font-semibold text-zinc-100">Keywords</h2>
          <p className="text-sm text-zinc-400">
            Sort columns to isolate sweet spots and money pits fast.
          </p>
        </div>
        <Button onClick={exportCsv} disabled={!selectedCampaignId || paginatedRows.length === 0}>
          Export to CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign Scope</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedCampaignId || undefined}
            onValueChange={(value) => setSelectedCampaignId(value)}
            disabled={campaignsLoading}
          >
            <SelectTrigger className="w-full md:w-[420px]">
              <SelectValue
                placeholder={campaignsLoading ? "Loading campaigns..." : "Select a campaign"}
              />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {!selectedCampaignId ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-zinc-400">
            Select a campaign to view keywords
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Keyword Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {keywordsLoading ? (
              <p className="text-sm text-zinc-400">Loading keywords...</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => updateSort("keyword")}
                        >
                          Keyword{sortLabel("keyword", sortKey, sortDirection)}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => updateSort("matchType")}
                        >
                          Match Type{sortLabel("matchType", sortKey, sortDirection)}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => updateSort("impressions")}
                        >
                          Impressions{sortLabel("impressions", sortKey, sortDirection)}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => updateSort("clicks")}
                        >
                          Clicks{sortLabel("clicks", sortKey, sortDirection)}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => updateSort("ctr")}
                        >
                          CTR{sortLabel("ctr", sortKey, sortDirection)}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => updateSort("cpc")}
                        >
                          CPC{sortLabel("cpc", sortKey, sortDirection)}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => updateSort("spend")}
                        >
                          Spend{sortLabel("spend", sortKey, sortDirection)}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => updateSort("sales")}
                        >
                          Sales{sortLabel("sales", sortKey, sortDirection)}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => updateSort("acos")}
                        >
                          ACoS{sortLabel("acos", sortKey, sortDirection)}
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.map((row) => {
                      const isSweetSpot = row.acos < 20 && row.sales > 0;
                      const isMoneyPit = row.acos > 60 && row.spend > 5;

                      return (
                        <TableRow
                          key={row.id}
                          className={
                            isSweetSpot
                              ? "bg-emerald-950/40 hover:bg-emerald-900/30"
                              : isMoneyPit
                                ? "bg-red-950/40 hover:bg-red-900/30"
                                : ""
                          }
                        >
                          <TableCell className="font-medium">{row.keyword}</TableCell>
                          <TableCell>{row.matchType}</TableCell>
                          <TableCell className="text-right font-mono">
                            {row.impressions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {row.clicks.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatPercent(row.ctr)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(row.cpc)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(row.spend)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(row.sales)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatPercent(row.acos)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-3">
                  <p className="text-xs text-zinc-400">
                    Showing {rangeStart}-{rangeEnd} of {sortedRows.length} keywords
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={safePage <= 1}
                      onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                    >
                      Prev
                    </Button>
                    <span className="text-xs text-zinc-400">
                      Page {safePage} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setPage((previous) => Math.min(totalPages, previous + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
