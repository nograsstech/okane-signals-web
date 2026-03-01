import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { ProtectedRoute } from "@/components/auth";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BacktestStats } from "@/lib/okane-finance-api/generated/models";
import { getOkaneClient } from "@/lib/okane-finance-api/okane-client";

export const Route = createFileRoute("/strategy_/$id/backtest")({
  component: StrategyBacktestPage,
  loader: async ({ params }) => {
    const client = getOkaneClient();
    const strategyID = parseInt(params.id, 10);

    if (!strategyID || Number.isNaN(strategyID)) {
      return { replayData: null };
    }

    try {
      const replayData =
        await client.replayBacktestEndpointSignalsBacktestReplayGet({
          backtestId: strategyID,
        });
      return { replayData };
    } catch (error) {
      console.error("Failed to fetch replay data:", error);
      return { replayData: null };
    }
  },
});

function StrategyBacktestPage() {
  const { id } = Route.useParams();
  const { replayData } = Route.useLoaderData();
  const [chartExpanded, setChartExpanded] = useState(false);

  return (
    <Layout>
      <ProtectedRoute>
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header with back button */}
          <div className="border-border/50 bg-muted/30 flex items-center justify-between border-b px-6 py-4">
            <Link to="/strategy/$id" params={{ id }}>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-muted/80 gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Strategy</span>
              </Button>
            </Link>
            <Badge variant="outline" className="font-mono text-xs">
              Strategy #{id}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-6">
              {/* Compact Stats Summary */}
              {replayData && replayData.data && (
                <div className="border-border/50 bg-card overflow-hidden rounded-lg border">
                  <div className="bg-muted/50 border-border/50 border-b px-4 py-2">
                    <h3 className="text-sm font-semibold tracking-tight">
                      Performance Summary
                    </h3>
                  </div>
                  <div className="p-4">
                    <CompactStatsDisplay backtestData={replayData.data} />
                  </div>
                </div>
              )}

              {/* Chart Viewer with Tabs */}
              <div className="border-border/50 bg-card overflow-hidden rounded-lg border">
                <div className="bg-muted/50 border-border/50 flex items-center justify-between border-b px-4 py-2">
                  <h3 className="text-sm font-semibold tracking-tight">
                    Chart Analysis
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChartExpanded(!chartExpanded)}
                    className="h-7 gap-1 text-xs"
                  >
                    {chartExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        <span>Compact</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        <span>Expand</span>
                      </>
                    )}
                  </Button>
                </div>

                <Separator orientation="vertical" className="bg-foreground" />

                <Tabs defaultValue="original" className="w-full">
                  <div className="border-border/50 border-b px-4">
                    <TabsList className="h-10 gap-2 rounded-none border-0 bg-transparent">
                      <TabsTrigger
                        value="original"
                        className="data-[state=active]:bg-muted data-[state=active]:border-primary rounded-none px-4 data-[state=active]:border-b-2"
                      >
                        Original Backtest
                      </TabsTrigger>
                      {replayData?.data?.html && (
                        <TabsTrigger
                          value="replay"
                          className="data-[state=active]:bg-muted data-[state=active]:border-primary rounded-none px-4 data-[state=active]:border-b-2"
                        >
                          Replay Visualization
                          <Badge
                            variant="secondary"
                            className="ml-2 h-4 px-1.5 text-[10px]"
                          >
                            LIVE
                          </Badge>
                        </TabsTrigger>
                      )}
                    </TabsList>
                  </div>

                  <div
                    className={`transition-all duration-300 ${chartExpanded ? "h-[700px]" : "h-[450px]"}`}
                  >
                    <TabsContent value="original" className="m-0 h-full">
                      <iframe
                        src={`/api/strategy/${id}/backtest`}
                        title={`Backtest Strategy ${id}`}
                        className="h-full w-full border-none"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </TabsContent>

                    {replayData?.data?.html && (
                      <TabsContent value="replay" className="m-0 h-full">
                        <iframe
                          srcDoc={replayData.data.html}
                          title="Replay Visualization"
                          className="h-full w-full border-none"
                          sandbox="allow-scripts allow-same-origin allow-forms"
                        />
                      </TabsContent>
                    )}
                  </div>
                </Tabs>
              </div>

              {/* Error state */}
              {!replayData && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-6">
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">
                    Unable to load replay results. The replay may still be
                    processing or the data may not be available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}

// Compact stats display with better information density
function CompactStatsDisplay({
  backtestData,
}: {
  backtestData: BacktestStats;
}) {
  const formatPercentage = (val: number) => `${val.toFixed(2)}%`;
  const formatNumber = (val: number) => val.toFixed(2);
  const isPositive = (val: number) => val > 0;
  const isNeutral = (val: number) => val === 0;

  const statRow = (
    label: string,
    value: string,
    highlight: "positive" | "negative" | "neutral" | "none" = "none",
  ) => {
    const colorClass =
      highlight === "positive"
        ? "text-emerald-500 dark:text-emerald-400"
        : highlight === "negative"
          ? "text-red-500 dark:text-red-400"
          : highlight === "neutral"
            ? "text-muted-foreground"
            : "text-foreground";

    return (
      <div className="flex items-center justify-between py-1.5">
        <span className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
          {label}
        </span>
        <span className={`font-mono text-sm font-semibold ${colorClass}`}>
          {value}
        </span>
      </div>
    );
  };

  const getReturnIcon = (val: number) => {
    if (val > 0)
      return <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />;
    if (val < 0) return <TrendingDown className="mr-1 h-3 w-3 text-red-500" />;
    return <Minus className="text-muted-foreground mr-1 h-3 w-3" />;
  };

  return (
    <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-8">
      {/* Return */}
      <div className="space-y-2">
        <div className="flex items-center">
          {getReturnIcon(backtestData.returnPercentage)}
          <h4 className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
            Return
          </h4>
        </div>
        <div className="space-y-0.5">
          {statRow(
            "Total",
            formatPercentage(backtestData.returnPercentage),
            backtestData.returnPercentage > 0
              ? "positive"
              : backtestData.returnPercentage < 0
                ? "negative"
                : "neutral",
          )}
          {statRow(
            "Annual",
            formatPercentage(backtestData.returnAnnualized),
            backtestData.returnAnnualized > 0
              ? "positive"
              : backtestData.returnAnnualized < 0
                ? "negative"
                : "neutral",
          )}
          {statRow(
            "B&H",
            formatPercentage(backtestData.buyAndHoldReturn),
            backtestData.buyAndHoldReturn > 0
              ? "positive"
              : backtestData.buyAndHoldReturn < 0
                ? "negative"
                : "neutral",
          )}
        </div>
      </div>

      {/* Risk */}
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="mr-1 h-3 w-3 rounded-full bg-amber-500/20" />
          <h4 className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
            Risk
          </h4>
        </div>
        <div className="space-y-0.5">
          {statRow("Sharpe", formatNumber(backtestData.sharpeRatio))}
          {statRow("Sortino", formatNumber(backtestData.sortinoRatio))}
          {statRow("Calmar", formatNumber(backtestData.calmarRatio))}
          {statRow(
            "Max DD",
            formatPercentage(backtestData.maxDrawdownPercentage),
            "negative",
          )}
        </div>
      </div>

      {/* Trading */}
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="mr-1 h-3 w-3 rounded-full bg-blue-500/20" />
          <h4 className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
            Trading
          </h4>
        </div>
        <div className="space-y-0.5">
          {statRow("Win Rate", formatPercentage(backtestData.winRate))}
          {statRow("Trades", backtestData.tradeCount.toString())}
          {statRow("Profit Factor", formatNumber(backtestData.profitFactor))}
          {statRow(
            "Avg Trade",
            formatPercentage(backtestData.avgTrade),
            backtestData.avgTrade > 0
              ? "positive"
              : backtestData.avgTrade < 0
                ? "negative"
                : "neutral",
          )}
        </div>
      </div>

      {/* Range */}
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="mr-1 h-3 w-3 rounded-full bg-violet-500/20" />
          <h4 className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
            Range
          </h4>
        </div>
        <div className="space-y-0.5">
          {statRow(
            "Best",
            formatPercentage(backtestData.bestTrade),
            "positive",
          )}
          {statRow(
            "Worst",
            formatPercentage(backtestData.worstTrade),
            "negative",
          )}
          {statRow(
            "Volatility",
            formatPercentage(backtestData.volatilityAnnualized),
          )}
          {statRow(
            "Exposure",
            formatPercentage(backtestData.exposureTimePercentage),
          )}
        </div>
      </div>
    </div>
  );
}
