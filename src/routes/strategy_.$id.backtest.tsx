import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { getOkaneClient } from "@/lib/okane-finance-api/okane-client";
import type { BacktestStats } from "@/lib/okane-finance-api/generated/models";

export const Route = createFileRoute("/strategy_/$id/backtest")({
	component: StrategyBacktestPage,
	loader: async ({ params }) => {
		const client = getOkaneClient();
		const strategyID = parseInt(params.id, 10);

		if (!strategyID || Number.isNaN(strategyID)) {
			return { replayData: null };
		}

		try {
			// Fetch replay data from the backend API
			const replayData = await client.replayBacktestEndpointSignalsBacktestReplayGet({
				backtestId: strategyID,
			});
			console.log("REPLAY DATA 🫡")
			console.log({ replayData })
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

	return (
		<Layout>
			<ProtectedRoute>
				<div className="flex flex-col p-4 overflow-y-auto">
					<div className="mb-4">
						<Link to="/strategy/$id" params={{ id }}>
							<Button variant="link" className="px-0">
								<ChevronLeft className="h-4 w-4 mr-1" />
								<span>Back to Strategy Details</span>
							</Button>
						</Link>
					</div>

					{/* Original backtest iframe */}
					<div className="h-200 mb-6 rounded-lg border border-border/50 overflow-hidden bg-background">
						<div className="bg-muted/50 px-4 py-2 border-b border-border/50">
							<h3 className="text-sm font-medium">Original Backtest</h3>
						</div>
						<div className="h-200">
							<iframe
								src={`/api/strategy/${id}/backtest`}
								title={`Backtest Strategy ${id}`}
								className="w-full h-full border-none"
								sandbox="allow-scripts allow-same-origin"
							/>
						</div>
					</div>

					{/* Replay results */}
					{replayData && replayData.data && (
						<div className="rounded-lg border border-border/50 bg-background">
							<div className="bg-muted/50 px-4 py-2 border-b border-border/50 flex items-center justify-between">
								<h3 className="text-sm font-medium">
									Replay Results (Fresh yfinance Data)
								</h3>
								<span className="text-xs text-muted-foreground">
									Trade Actions Re-applied to Current Price Data
								</span>
							</div>
							<div className="p-6">
								<ReplayStatsDisplay backtestData={replayData.data} />

								{/* Replay HTML visualization */}
								{replayData.data.html && (
									<div className="mt-6 rounded-lg border border-border/50 overflow-hidden">
										<div className="bg-muted/50 px-4 py-2 border-b border-border/50">
											<h4 className="text-sm font-medium">Visualization</h4>
										</div>
										<div className="h-200">
											<iframe
												srcDoc={replayData.data.html}
												title="Replay Visualization"
												className="w-full h-full border-none"
												sandbox="allow-scripts allow-same-origin allow-forms"
											/>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Error state */}
					{!replayData && (
						<div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-6">
							<p className="text-sm text-yellow-500">
								Unable to load replay results. The replay may still be processing or
								the data may not be available.
							</p>
						</div>
					)}
				</div>
			</ProtectedRoute>
		</Layout>
	);
}

// Simple stats display component for replay results
function ReplayStatsDisplay({ backtestData }: { backtestData: BacktestStats }) {
	const formatPercentage = (val: number) => `${val.toFixed(2)}%`;
	const formatNumber = (val: number) => val.toFixed(2);
	const isPositive = (val: number) => val >= 0;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Return Stats */}
			<div className="rounded-lg border border-border/50 p-4">
				<h4 className="text-sm font-medium text-muted-foreground mb-2">Return</h4>
				<div className="space-y-1">
					<div className="flex justify-between">
						<span className="text-xs">Return %:</span>
						<span
							className={`text-sm font-medium ${
								isPositive(backtestData.returnPercentage)
									? "text-green-500"
									: "text-red-500"
							}`}
						>
							{formatPercentage(backtestData.returnPercentage)}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs">Annualized:</span>
						<span
							className={`text-sm font-medium ${
								isPositive(backtestData.returnAnnualized)
									? "text-green-500"
									: "text-red-500"
							}`}
						>
							{formatPercentage(backtestData.returnAnnualized)}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs">Buy & Hold:</span>
						<span
							className={`text-sm font-medium ${
								isPositive(backtestData.buyAndHoldReturn)
									? "text-green-500"
									: "text-red-500"
							}`}
						>
							{formatPercentage(backtestData.buyAndHoldReturn)}
						</span>
					</div>
				</div>
			</div>

			{/* Risk Metrics */}
			<div className="rounded-lg border border-border/50 p-4">
				<h4 className="text-sm font-medium text-muted-foreground mb-2">Risk Metrics</h4>
				<div className="space-y-1">
					<div className="flex justify-between">
						<span className="text-xs">Sharpe Ratio:</span>
						<span className="text-sm font-medium">{formatNumber(backtestData.sharpeRatio)}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs">Sortino Ratio:</span>
						<span className="text-sm font-medium">{formatNumber(backtestData.sortinoRatio)}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs">Calmar Ratio:</span>
						<span className="text-sm font-medium">{formatNumber(backtestData.calmarRatio)}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs">Max Drawdown:</span>
						<span className="text-sm font-medium text-red-500">
							{formatPercentage(backtestData.maxDrawdownPercentage)}
						</span>
					</div>
				</div>
			</div>

			{/* Trading Stats */}
			<div className="rounded-lg border border-border/50 p-4">
				<h4 className="text-sm font-medium text-muted-foreground mb-2">Trading Stats</h4>
				<div className="space-y-1">
					<div className="flex justify-between">
						<span className="text-xs">Win Rate:</span>
						<span className="text-sm font-medium">{formatPercentage(backtestData.winRate)}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs">Trade Count:</span>
						<span className="text-sm font-medium">{backtestData.tradeCount}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs">Profit Factor:</span>
						<span className="text-sm font-medium">{formatNumber(backtestData.profitFactor)}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs">Avg Trade:</span>
						<span
							className={`text-sm font-medium ${
								isPositive(backtestData.avgTrade) ? "text-green-500" : "text-red-500"
							}`}
						>
							{formatPercentage(backtestData.avgTrade)}
						</span>
					</div>
				</div>
			</div>

			{/* Trade Range */}
			<div className="rounded-lg border border-border/50 p-4">
				<h4 className="text-sm font-medium text-muted-foreground mb-2">Trade Range</h4>
				<div className="space-y-1">
					<div className="flex justify-between">
						<span className="text-xs">Best Trade:</span>
						<span className="text-sm font-medium text-green-500">
							{formatPercentage(backtestData.bestTrade)}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs">Worst Trade:</span>
						<span className="text-sm font-medium text-red-500">
							{formatPercentage(backtestData.worstTrade)}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs">Volatility:</span>
						<span className="text-sm font-medium">
							{formatPercentage(backtestData.volatilityAnnualized)}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs">Exposure:</span>
						<span className="text-sm font-medium">
							{formatPercentage(backtestData.exposureTimePercentage)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
