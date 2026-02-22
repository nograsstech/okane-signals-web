// Strategy list route
import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth";
import Layout from "@/components/Layout";
import { StrategyTable } from "@/components/strategy/strategy-table";
import { useStrategies } from "@/hooks/use-strategies";
import { TableLoadingSkeleton } from "@/components/strategy/table-loading-skeleton";

export const Route = createFileRoute("/strategy/")({
	component: StrategyListPage,
});

function StrategyListPage() {
	return (
		<Layout>
			<ProtectedRoute>
				<StrategyListContent />
			</ProtectedRoute>
		</Layout>
	);
}

function StrategyListContent() {
	const { data: strategies, isLoading, error } = useStrategies();

	if (isLoading) {
		return <LoadingState />;
	}

	if (error) {
		return (
			<div className="min-h-screen p-6">
				<div className="relative p-6 border border-red-500/30 bg-red-500/5">
					<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-red-500/30" />
					<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-red-500/30" />
					<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-red-500/30" />
					<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-red-500/30" />
					<h3 className="text-lg font-semibold text-red-500">
						Error Loading Strategies
					</h3>
					<p className="text-sm text-foreground/70">{error.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-6">
			<h2 className="text-4xl font-bold tracking-tight mb-8">
				Trading Strategies
			</h2>
			{strategies && <StrategyTable data={strategies} />}
		</div>
	);
}

function LoadingState() {
	return (
		<div className="min-h-screen p-6">
			<h2 className="text-4xl font-bold tracking-tight mb-8">
				Trading Strategies
			</h2>
			<TableLoadingSkeleton />
		</div>
	);
}
