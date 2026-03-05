"use client";

import { useEffect, useMemo, useState } from "react";

import { getCampaigns, getKeywords } from "@/lib/amazon-ads/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { calculateAcos } from "@/lib/mock-data";
import type { Campaign, Keyword } from "@/lib/types";

const PAGE_SIZE = 50;
const clampBid = (value: number) => Math.max(0.02, Number(value.toFixed(2)));

export default function OptimizerPage() {
  const [targetAcos, setTargetAcos] = useState(30);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
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

  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId);

  const rows = useMemo(() => {
    return keywords.map((keyword) => {
      const currentAcos = calculateAcos(keyword.spend, keyword.sales);
      const safeAcos = currentAcos <= 0 ? targetAcos : currentAcos;
      const recommendedBid = clampBid(keyword.bid * (targetAcos / safeAcos));
      const changePercent = ((recommendedBid - keyword.bid) / keyword.bid) * 100;

      return {
        ...keyword,
        currentAcos,
        recommendedBid,
        changePercent,
      };
    });
  }, [keywords, targetAcos]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paginatedRows = rows.slice(pageStart, pageStart + PAGE_SIZE);
  const rangeStart = rows.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + PAGE_SIZE, rows.length);

  const estimatedCurrentSpend = rows.reduce(
    (sum, row) => sum + row.bid * row.clicks,
    0,
  );
  const estimatedOptimizedSpend = rows.reduce(
    (sum, row) => sum + row.recommendedBid * row.clicks,
    0,
  );
  const estimatedDelta = estimatedOptimizedSpend - estimatedCurrentSpend;

  const applyBid = (keywordId: string, recommendedBid: number) => {
    setKeywords((previous) =>
      previous.map((keyword) =>
        keyword.id === keywordId
          ? {
              ...keyword,
              bid: recommendedBid,
            }
          : keyword,
      ),
    );
  };

  const applyAll = () => {
    setKeywords((previous) =>
      previous.map((keyword) => {
        const currentAcos = calculateAcos(keyword.spend, keyword.sales);
        const safeAcos = currentAcos <= 0 ? targetAcos : currentAcos;
        const recommendedBid = clampBid(keyword.bid * (targetAcos / safeAcos));

        return {
          ...keyword,
          bid: recommendedBid,
        };
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-2xl font-semibold text-zinc-100">Bid Optimizer</h2>
          <p className="text-sm text-zinc-400">
            Formula: recommended bid = current bid * (target ACoS / current ACoS)
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <label htmlFor="target-acos" className="text-xs text-zinc-400">
              Target ACoS %
            </label>
            <Input
              id="target-acos"
              type="number"
              min={1}
              max={200}
              value={targetAcos}
              onChange={(event) => setTargetAcos(Number(event.target.value) || 0)}
              className="w-32"
            />
          </div>
          <Button onClick={applyAll} disabled={!selectedCampaignId || rows.length === 0}>
            Apply All
          </Button>
        </div>
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
                placeholder={
                  campaignsLoading ? "Loading campaigns..." : "Select a campaign"
                }
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
            Select a campaign to optimise
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estimated Spend Impact</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-xs text-zinc-400">Current Est. Spend</p>
                <p className="font-mono text-lg">{formatCurrency(estimatedCurrentSpend)}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-xs text-zinc-400">Optimized Est. Spend</p>
                <p className="font-mono text-lg">{formatCurrency(estimatedOptimizedSpend)}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-xs text-zinc-400">Delta</p>
                <p
                  className={`font-mono text-lg ${
                    estimatedDelta <= 0 ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {estimatedDelta >= 0 ? "+" : ""}
                  {formatCurrency(estimatedDelta)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Keyword Recommendations</CardTitle>
              <p className="text-xs text-zinc-400">
                Campaign / {selectedCampaign?.name ?? selectedCampaignId}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {keywordsLoading ? (
                <p className="text-sm text-zinc-400">Loading keywords...</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead className="text-right">Current Bid</TableHead>
                        <TableHead className="text-right">Current ACoS</TableHead>
                        <TableHead className="text-right">Recommended Bid</TableHead>
                        <TableHead className="text-right">Change %</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.keyword}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(row.bid)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatPercent(row.currentAcos)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sky-300">
                            {formatCurrency(row.recommendedBid)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-mono ${
                              row.changePercent <= 0 ? "text-emerald-300" : "text-amber-300"
                            }`}
                          >
                            {row.changePercent >= 0 ? "+" : ""}
                            {formatPercent(row.changePercent)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => applyBid(row.id, row.recommendedBid)}
                            >
                              Apply
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-3">
                    <p className="text-xs text-zinc-400">
                      Showing {rangeStart}-{rangeEnd} of {rows.length} keywords
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
        </>
      )}
    </div>
  );
}
