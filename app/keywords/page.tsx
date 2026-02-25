"use client";

import { useMemo, useState } from "react";

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
import { calculateAcos, calculateCpc, calculateCtr, mockKeywords } from "@/lib/mock-data";

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
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const rows = useMemo<KeywordRow[]>(() => {
    return mockKeywords.map((keyword) => {
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
  }, []);

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

    const csvRows = sortedRows.map((row) => [
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
    link.download = "royaltyads-keywords.csv";
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
        <Button onClick={exportCsv}>Export to CSV</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keyword Performance</CardTitle>
        </CardHeader>
        <CardContent>
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
              {sortedRows.map((row) => {
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
        </CardContent>
      </Card>
    </div>
  );
}
