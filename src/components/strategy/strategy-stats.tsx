// Strategy stats display with collapsible sections

import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Timer } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";
import { StrategyStatCard } from "./strategy-stat-card";

interface StrategyStatsProps {
	backtestData: KeyStrategyBacktestStats;
}

export function StrategyStats({ backtestData }: StrategyStatsProps) {
	const [open, setOpen] = useState(false);

	const isPositiveValue = (value: number) => value >= 0;

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<Card>
				<CardHeader className="flex flex-col items-start justify-between md:flex-row">
					<div>
						<CardTitle className="text-xl font-mono">
							{backtestData.ticker} | {backtestData.strategy}
							<span className="ml-4 text-xs font-light opacity-50">
								ID: {backtestData.id}
							</span>
						</CardTitle>
						<CardDescription>
							Updated: {new Date(backtestData.updated_at).toLocaleString()}
						</CardDescription>
					</div>
					<Button variant="secondary" asChild>
						{/* <a
							href={`/strategy/${backtestData.id}/backtest`}
							target="_blank"
							rel="noopener noreferrer"
						>
							View Backtest Performance
						</a> */}
						{/* @ts-ignore */}
						<Link to={`/strategy/${backtestData.id}/backtest`}>
							View Backtest Performance
						</Link>
					</Button>
				</CardHeader>

				<CardContent>
					{/* Badges */}
					<div className="mb-4 flex flex-wrap gap-2">
						{backtestData.sharpeRatio > 1.5 && (
							<Badge variant="secondary">High Sharpe Ratio</Badge>
						)}
						{backtestData.winRate > 0.5 && (
							<Badge variant="secondary">High Win Rate</Badge>
						)}
						{backtestData.notificationsOn && (
							<Badge variant="outline">🔔 Notifications On</Badge>
						)}
					</div>

					{/* Basic Stats - Always Visible */}
					<div className="flex flex-wrap gap-4">
						<StrategyStatCard
							field="Period"
							value={backtestData.period}
							description={`${new Date(backtestData.startTime).toLocaleString()} -> ${new Date(backtestData.endTime).toLocaleString()}`}
							icon={Timer}
						/>
						<StrategyStatCard
							field="Interval"
							value={backtestData.interval}
							description="Data interval"
							icon={Timer}
						/>
						<StrategyStatCard
							field="TPSL Ratio"
							value={backtestData.tpsl_ratio}
							description="Take profit / Stop loss ratio"
							icon={Timer}
						/>
						{!open && (
							<>
								<StrategyStatCard
									field="Return %"
									value={backtestData.returnPercentage}
									description="Return percentage"
									textColor={
										isPositiveValue(backtestData.returnPercentage)
											? "positive"
											: "negative"
									}
								/>
								<StrategyStatCard
									field="Max Drawdown %"
									value={backtestData.maxDrawdownPercentage}
									description="Maximum drawdown"
									textColor={
										backtestData.maxDrawdownPercentage <= -10
											? "negative"
											: "positive"
									}
								/>
								<StrategyStatCard
									field="Win Rate %"
									value={backtestData.winRate}
									description="Win percentage"
									textColor={
										"positive"
									}
								/>
							</>
						)}
					</div>

					<hr className="mx-[-24px] mt-6 border-border/30" />

					{/* Collapsible Detailed Stats */}
					<CollapsibleContent className="mt-4">
						{/* Returns Section */}
						<h3 className="py-4 text-lg font-semibold">Returns</h3>
						<div className="mb-6 flex flex-wrap gap-4">
							<StrategyStatCard
								field="Return %"
								value={backtestData.returnPercentage}
								description="Trading period return"
								textColor={
									isPositiveValue(backtestData.returnPercentage)
										? "positive"
										: "negative"
								}
							/>
							<StrategyStatCard
								field="Buy and Hold %"
								value={backtestData.buyAndHoldReturn}
								description="Buy & hold return"
								textColor={
									isPositiveValue(backtestData.buyAndHoldReturn)
										? "positive"
										: "negative"
								}
							/>
							<StrategyStatCard
								field="Annualized %"
								value={backtestData.returnAnnualized}
								description="Hypothetical annual return"
								textColor={
									isPositiveValue(backtestData.returnAnnualized)
										? "positive"
										: "negative"
								}
							/>
						</div>

						{/* Drawdown Section */}
						<h3 className="py-4 text-lg font-semibold">Drawdown</h3>
						<div className="mb-6 flex flex-wrap gap-4">
							<StrategyStatCard
								field="Max Drawdown %"
								value={backtestData.maxDrawdownPercentage}
								description="Maximum drawdown"
								textColor={
									backtestData.maxDrawdownPercentage <= -10
										? "negative"
										: "positive"
								}
							/>
							<StrategyStatCard
								field="Avg Drawdown %"
								value={backtestData.averageDrawdownPercentage}
								description="Average drawdown"
								textColor={
									backtestData.averageDrawdownPercentage <= -10
										? "negative"
										: "positive"
								}
							/>
						</div>

						{/* Performance Section */}
						<h3 className="py-4 text-lg font-semibold">Performance</h3>
						<div className="flex flex-wrap gap-4">
							<StrategyStatCard
								field="Sharpe Ratio"
								value={backtestData.sharpeRatio}
								description="Risk-adjusted return"
							/>
							<StrategyStatCard
								field="Sortino Ratio"
								value={backtestData.sortinoRatio}
								description="Downside risk return"
							/>
							<StrategyStatCard
								field="Calmar Ratio"
								value={backtestData.calmarRatio}
								description="Return/drawdown ratio"
							/>
							<StrategyStatCard
								field="Win Rate %"
								value={backtestData.winRate}
								description="Win percentage"
							/>
							<StrategyStatCard
								field="Avg Trade %"
								value={backtestData.avgTrade}
								description="Average trade"
							/>
							<StrategyStatCard
								field="Worst Trade %"
								value={backtestData.worstTrade}
								description="Worst trade"
							/>
							<StrategyStatCard
								field="Best Trade %"
								value={backtestData.bestTrade}
								description="Best trade"
							/>
						</div>
					</CollapsibleContent>

					<CollapsibleTrigger asChild>
						<Button variant="link" className="mt-4 w-full">
							{open ? (
								<>
									<ChevronUp className="h-4 w-4" /> Hide Detailed Stats
								</>
							) : (
								<>
									<ChevronDown className="h-4 w-4" /> Show Detailed Stats
								</>
							)}
						</Button>
					</CollapsibleTrigger>
				</CardContent>
			</Card>
		</Collapsible>
	);
}
