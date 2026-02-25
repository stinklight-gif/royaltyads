"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatPercent } from "@/lib/format";
import { calculateAcos, mockKeywords } from "@/lib/mock-data";

const clampBid = (value: number) => Math.max(0.02, Number(value.toFixed(2)));

export default function OptimizerPage() {
  const [targetAcos, setTargetAcos] = useState(30);
  const [keywords, setKeywords] = useState(mockKeywords);

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
          <Button onClick={applyAll}>Apply All</Button>
        </div>
      </div>

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
        </CardHeader>
        <CardContent>
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
              {rows.map((row) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
