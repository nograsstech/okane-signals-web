import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BacktestStats } from "@/lib/okane-finance-api/generated/models";
import { RouteLoadingPage } from "@/components/route-loading";
import { useBacktestReplay } from "@/hooks/use-backtest-replay";

export const Route = createFileRoute("/strategy_/$id/backtest")({
  component: StrategyBacktestPage,
  pendingComponent: ({ params }) => <RouteLoadingPage strategyId={params.id} />,
});

function StrategyBacktestPage() {
  const { id } = Route.useParams();
  const { data: replayResponse, isLoading, error } = useBacktestReplay(id);
  const replayData = replayResponse?.data ?? null;
  const [chartExpanded, setChartExpanded] = useState(false);
  const decompressedHtml = useDecompressedHtml(replayData?.html ?? null);

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <Layout>
        <ProtectedRoute>
          <RouteLoadingPage strategyId={id} />
        </ProtectedRoute>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <div className="relative border border-red-500/30 bg-red-500/5 p-6">
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-red-500/30" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-red-500/30" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-red-500/30" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-red-500/30" />
                <h3 className="text-lg font-semibold text-red-500 mb-2">
                  Failed to load backtest data
                </h3>
                <p className="text-sm text-foreground/70 mb-4">
                  {error.message || "An error occurred while fetching the backtest replay data."}
                </p>
                <Link to="/strategy">
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Strategies
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    );
  }

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
              {replayData && (
                <div className="border-border/50 bg-card overflow-hidden rounded-lg border">
                  <div className="bg-muted/50 border-border/50 border-b px-4 py-2">
                    <h3 className="text-sm font-semibold tracking-tight">
                      Performance Summary
                    </h3>
                  </div>
                  <div className="p-4">
                    <CompactStatsDisplay backtestData={replayData} />
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
                      {replayData?.html && (
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

                    {replayData?.html && (
                      <TabsContent value="replay" className="m-0 h-full">
                        {decompressedHtml === null ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              <span className="text-xs font-mono">Decompressing chart…</span>
                            </div>
                          </div>
                        ) : (
                          <iframe
                            srcDoc={decompressedHtml}
                            title="Replay Visualization"
                            className="h-full w-full border-none"
                            sandbox="allow-scripts allow-same-origin allow-forms"
                          />
                        )}
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

/**
 * Decompresses a zlib-compressed, base64-encoded HTML string.
 *
 * The replay API returns the Bokeh HTML as:
 *   base64( zlib.compress(html_content.encode('utf-8'), level=9) )
 *
 * We use the native browser DecompressionStream (deflate-raw) to reverse
 * this. Falls back gracefully to raw content if the value is already plain
 * HTML (e.g. during a rollback or API fallback path).
 *
 * Returns `null` while decompression is in progress — use as a loading signal.
 */
function useDecompressedHtml(compressed: string | null): string | null {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!compressed) {
      setHtml(null);
      return;
    }

    // Fast-path: already plain HTML — skip decompression entirely
    const trimmed = compressed.trimStart();
    if (trimmed.startsWith("<")) {
      setHtml(compressed);
      return;
    }

    let cancelled = false;

    // Capture in a const so the async closure doesn't need non-null assertions
    const encoded = compressed;

    async function decompress() {
      try {
        // Decode base64 → binary Uint8Array
        const binaryStr = atob(encoded);
        const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));

        // Python's zlib uses the RFC 1950 "deflate" format (with zlib header),
        // which the browser exposes as "deflate" in DecompressionStream.
        const ds = new DecompressionStream("deflate");
        const writer = ds.writable.getWriter();
        const reader = ds.readable.getReader();

        writer.write(bytes);
        writer.close();

        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
        const merged = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          merged.set(chunk, offset);
          offset += chunk.length;
        }

        const decoded = new TextDecoder("utf-8").decode(merged);
        if (!cancelled) setHtml(decoded);
      } catch (err) {
        console.error("[useDecompressedHtml] Decompression failed:", err);
        // Last resort: render the raw value as-is
        if (!cancelled) setHtml(compressed);
      }
    }

    setHtml(null); // reset to null (triggers loading indicator) while working
    decompress();

    return () => {
      cancelled = true;
    };
  }, [compressed]);

  return html;
}
