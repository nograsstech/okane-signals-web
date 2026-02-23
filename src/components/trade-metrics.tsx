// Trade metrics display component

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TradeMetrics } from "@/lib/utils/trade-metrics";

interface TradeMetricsDisplayProps {
	metrics: TradeMetrics;
	className?: string;
}

interface MetricItem {
	label: string;
	value: string;
	valueType?: "currency" | "percentage" | "number";
	color?: "green" | "red" | "neutral";
}

export function TradeMetricsDisplay({ metrics, className }: TradeMetricsDisplayProps) {
	// Helper to determine color based on value
	const getColor = (value: number): "green" | "red" | "neutral" => {
		if (value > 0) return "green";
		if (value < 0) return "red";
		return "neutral";
	};

	const colorClass = {
		green: "text-emerald-500",
		red: "text-red-500",
		neutral: "text-foreground",
	};

	// Define metrics to display
	const metricsByCategory: Record<string, MetricItem[]> = {
		Performance: [
			{ label: "Total PnL", value: `$${metrics.totalPnL.toFixed(2)}`, color: getColor(metrics.totalPnL) },
			{ label: "PnL %", value: `${metrics.totalPnLPercentage.toFixed(2)}%`, color: getColor(metrics.totalPnLPercentage) },
			{ label: "Win Rate", value: `${metrics.winRate.toFixed(2)}%`, color: metrics.winRate >= 50 ? "green" : metrics.winRate > 0 ? "neutral" : "red" },
			{ label: "Profit Factor", value: metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2), color: metrics.profitFactor >= 1 ? "green" : "red" },
		],
		"Trade Stats": [
			{ label: "Total Trades", value: metrics.totalTrades.toString() },
			{ label: "Winning Trades", value: metrics.winningTrades.toString() },
			{ label: "Losing Trades", value: metrics.losingTrades.toString() },
			{ label: "Expectancy", value: `$${metrics.expectancy.toFixed(2)}`, color: getColor(metrics.expectancy) },
		],
		"Avg Trades": [
			{ label: "Avg PnL", value: `$${metrics.averagePnL.toFixed(2)}`, color: getColor(metrics.averagePnL) },
			{ label: "Avg Win", value: `$${metrics.averageWin.toFixed(2)}`, color: "green" },
			{ label: "Avg Loss", value: `$${Math.abs(metrics.averageLoss).toFixed(2)}`, color: "red" },
			{ label: "Best Trade", value: `$${metrics.bestTrade.toFixed(2)}`, color: "green" },
			{ label: "Worst Trade", value: `$${metrics.worstTrade.toFixed(2)}`, color: "red" },
		],
		"Risk Metrics": [
			{ label: "Sharpe Ratio", value: metrics.sharpeRatio.toFixed(2), color: metrics.sharpeRatio >= 1 ? "green" : metrics.sharpeRatio > 0 ? "neutral" : "red" },
			{ label: "Sortino Ratio", value: metrics.sortinoRatio.toFixed(2), color: metrics.sortinoRatio >= 1 ? "green" : metrics.sortinoRatio > 0 ? "neutral" : "red" },
			{ label: "Max Drawdown", value: `$${metrics.maxDrawdown.toFixed(2)}`, color: "red" },
			{ label: "Max Drawdown %", value: `${metrics.maxDrawdownPercentage.toFixed(2)}%`, color: "red" },
			{ label: "Avg Drawdown", value: `$${metrics.averageDrawdown.toFixed(2)}`, color: "red" },
		],
	};

	return (
		<Card className={cn("p-4 bg-background", className)}>
			<div className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-foreground/20" />
			<div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-foreground/20" />
			<div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-foreground/20" />
			<div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-foreground/20" />

			<h3 className="mb-4 text-lg font-mono font-semibold">Trade Metrics</h3>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Object.entries(metricsByCategory).map(([category, items]) => (
					<div key={category} className="space-y-2">
						<h4 className="text-muted-foreground border-b border-border/50 pb-1 text-xs font-mono uppercase">
							{category}
						</h4>
						<div className="space-y-1">
							{items.map((item) => (
								<div key={item.label} className="flex justify-between gap-2 text-sm">
									<span className="text-muted-foreground">{item.label}:</span>
									<span className={cn("font-mono font-medium", item.color && colorClass[item.color])}>
										{item.value}
									</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</Card>
	);
}
