// Strategy detail route
import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth";
import Layout from "@/components/Layout";
import { useStrategyDetail } from "@/hooks/use-strategy-detail";
import { StrategyStats } from "@/components/strategy/strategy-stats";
import { TradeActionsTable } from "@/components/strategy/trade-actions-table";
import { SignalsTable } from "@/components/strategy/signals-table";
import { TradingViewAnalysisWidget } from "@/components/tradingview/tradingview-analysis-widget";
import { TradingviewIframe } from "@/components/tradingview/tradingview-iframe";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatsLoadingSkeleton } from "@/components/strategy/stats-loading-skeleton";
import { TableLoadingSkeleton } from "@/components/strategy/table-loading-skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { getTradingViewSymbol } from "@/lib/utils/tradingview-mapper";

export const Route = createFileRoute("/strategy/$id")({
	component: StrategyDetailPage,
});

function StrategyDetailPage() {
	const { id } = Route.useParams();

	return (
		<Layout>
			<ProtectedRoute>
				<StrategyDetailContent id={id} />
			</ProtectedRoute>
		</Layout>
	)
}

function StrategyDetailContent({ id }: { id: string }) {
	const { strategy, tradeActions, signals, isLoading, error } =
		useStrategyDetail(id);

	if (error) {
		return (
			<div className="min-h-screen p-6">
				<Link to="/strategy">
					<Button variant="link" className="px-0">
						<ChevronLeft className="h-4 w-4" />
						<span>Back to Strategies</span>
					</Button>
				</Link>
				<div className="relative mt-6 p-6 border border-red-500/30 bg-red-500/5">
					<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-red-500/30" />
					<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-red-500/30" />
					<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-red-500/30" />
					<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-red-500/30" />
					<h3 className="text-lg font-semibold text-red-500">
						Error Loading Strategy
					</h3>
					<p className="text-sm text-foreground/70">{error.message}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen p-6">
			{/* Back Button */}
			<Link to="/strategy">
				<Button variant="link" className="px-0">
					<ChevronLeft className="h-4 w-4" />
					<span>Back to Strategies</span>
				</Button>
			</Link>

			{/* Stats Section */}
			{isLoading ? (
				<StatsLoadingSkeleton />
			) : strategy ? (
				<StrategyStats backtestData={strategy} />
			) : null}

			{/* Tabs Section */}
			{!isLoading && (
				<Tabs defaultValue="trade-actions" className="mt-8 w-full">
					<TabsList>
						<TabsTrigger value="trade-actions">Trade Actions</TabsTrigger>
						<TabsTrigger value="signals">Signals</TabsTrigger>
					</TabsList>

					<TabsContent value="trade-actions">
						{isLoading ? (
							<TableLoadingSkeleton />
						) : tradeActions ? (
							<>
								<div className="mt-8 flex gap-4">
									<h2 className="text-2xl font-semibold">Trade Actions</h2>
								</div>
								<TradeActionsTable
									tradeActionsData={tradeActions.tradeActionsList}
								/>
							</>
						) : null}
					</TabsContent>

					<TabsContent value="signals">
						{isLoading ? (
							<TableLoadingSkeleton />
						) : signals ? (
							<>
								<div className="mt-8 flex gap-4">
									<h2 className="text-2xl font-semibold">Trade Signals</h2>
								</div>
								<SignalsTable signalsData={signals} />
							</>
						) : null}
					</TabsContent>
				</Tabs>
			)}

			{/* TradingView Widgets */}
			{strategy && !isLoading && (
				<>
					<TradingViewAnalysisWidget
						symbol={getTradingViewSymbol(strategy.ticker)}
					/>
					<TradingviewIframe app="stock" />
				</>
			)}
		</div>
	)
}
