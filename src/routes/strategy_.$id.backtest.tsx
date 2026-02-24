import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/auth";
import { TradingChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSignals } from "@/hooks/use-signals";
import { useStrategy } from "@/hooks/use-strategy";
import { useTradeActions } from "@/hooks/use-trade-actions";

import { useState } from "react";

import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/strategy_/$id/backtest")({
	component: StrategyBacktestPage,
});

function StrategyBacktestPage() {
	const { id } = Route.useParams();
	const { data: strategy, isLoading: isLoadingStrategy } = useStrategy(id);
	const [daysBack, setDaysBack] = useState<number | null>(null); // Default to all time
	const [selectedInterval, setSelectedInterval] = useState<string>(
		strategy?.interval || "",
	); // Default interval

	const { data: signalsData, isLoading: isLoadingSignals } = useSignals({
		ticker: strategy?.ticker || "",
		period: strategy?.period || "",
		interval: selectedInterval,
		strategy: strategy?.strategy || "",
	});

	const { data: tradeActionsData, isLoading: isLoadingTradeActions } =
		useTradeActions(id);

	const isLoading =
		isLoadingStrategy || isLoadingSignals || isLoadingTradeActions;

	return (
		<Layout>
			<ProtectedRoute>
				<div className="mb-4 flex flex-row items-center justify-between">
					<Link to="/strategy/$id" params={{ id }}>
						<Button variant="link" className="px-0">
							<ChevronLeft className="mr-1 h-4 w-4" />
							<span>Back to Strategy Details</span>
						</Button>
					</Link>

					<div className="flex items-center space-x-2">
						<span className="text-muted-foreground text-sm">Show history:</span>
						<Select
							value={daysBack ? daysBack.toString() : "all"}
							onValueChange={(val) =>
								setDaysBack(val === "all" ? null : parseInt(val, 10))
							}
						>
							<SelectTrigger className="w-30">
								<SelectValue placeholder="Select period" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="30">30 days</SelectItem>
								<SelectItem value="60">60 days</SelectItem>
								<SelectItem value="120">120 days</SelectItem>
								<SelectItem value="365">1 Year</SelectItem>
								<SelectItem value="730">2 Years</SelectItem>
								<SelectItem value="1825">5 Years</SelectItem>
								<SelectItem value="all">All time</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="flex h-200 flex-col p-4">
					<div className="border-border/50 bg-background flex-1 overflow-hidden rounded-lg border">
						<iframe
							src={`/api/strategy/${id}/backtest`}
							title={`Backtest Strategy ${id}`}
							className="h-full w-full border-none"
							sandbox="allow-scripts allow-same-origin"
						/>
					</div>
				</div>

				<div className="flex flex-col p-4">
					<div className="border-border/50 bg-background flex-1 overflow-hidden rounded-lg border">
						{isLoading ? (
							<Skeleton className="h-full w-full" />
						) : !strategy ? (
							<div className="text-muted-foreground flex h-full w-full items-center justify-center">
								Strategy not found.
							</div>
						) : (
							<TradingChart
								ticker={strategy.ticker}
								signals={
									(signalsData as any)?.signals?.data?.signals?.allSignals ||
									(signalsData as any)?.data?.signals?.allSignals ||
									(signalsData as any)?.allSignals ||
									(signalsData as any)?.signals?.signals ||
									(signalsData as any)?.signals ||
									[]
								}
								tradeActions={
									(tradeActionsData as any)?.tradeActionsList ||
									(tradeActionsData as any)?.tradeActions ||
									[]
								}
								daysBack={daysBack}
								height="100dvh"
								showMarkers={true}
								showVolume={false}
								interval={selectedInterval}
								onIntervalChange={setSelectedInterval}
								intervalOptions={[
									"1m",
									"5m",
									"15m",
									"30m",
									"1h",
									"4h",
									"1d",
									"1w",
								]}
							/>
						)}
					</div>
				</div>
			</ProtectedRoute>
		</Layout>
	);
}
