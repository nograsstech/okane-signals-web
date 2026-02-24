import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { StrategyGrid } from "@/components/strategy/strategy-grid";
import { StrategyTable } from "@/components/strategy/strategy-table";
import { TableLoadingSkeleton } from "@/components/strategy/table-loading-skeleton";
import { useStrategies } from "@/hooks/use-strategies";
import { storage } from "@/lib/utils/storage";

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
	const [viewMode, setViewMode] = useState<"table" | "grid">(() => {
		return storage.get<"table" | "grid">("strategy-view-mode") ?? "table";
	});

	useEffect(() => {
		storage.set("strategy-view-mode", viewMode);
	}, [viewMode]);

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
			<div className="flex justify-between items-center mb-8">
				<h2 className="text-4xl font-bold tracking-tight">
					Trading Strategies
				</h2>

				<div className="flex items-center gap-3">
					<Link to="/strategy/create">
						<Button size="sm" className="gap-2">
							<Plus className="w-4 h-4" />
							<span>Create Strategy</span>
						</Button>
					</Link>
					<div className="flex bg-muted/30 p-1 rounded-lg border border-border/50 gap-1">
						<button
							type="button"
							onClick={() => setViewMode("table")}
							className={`p-2 rounded-md transition-all ${viewMode === "table" ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
							title="Table View"
						>
							<List className="w-5 h-5" />
						</button>
						<button
							type="button"
							onClick={() => setViewMode("grid")}
							className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
							title="Grid View"
						>
							<LayoutGrid className="w-5 h-5" />
						</button>
					</div>
				</div>
			</div>

			{strategies &&
				(viewMode === "table" ? (
					<StrategyTable data={strategies} />
				) : (
					<StrategyGrid data={strategies} />
				))}
		</div>
	);
}

function LoadingState() {
	return (
		<div className="min-h-screen p-6">
			<div className="flex justify-between items-center mb-8">
				<h2 className="text-4xl font-bold tracking-tight">
					Trading Strategies
				</h2>
				<Link to="/strategy/create">
					<Button size="sm" className="gap-2" disabled>
						<Plus className="w-4 h-4" />
						<span>Create Strategy</span>
					</Button>
				</Link>
			</div>
			<TableLoadingSkeleton />
		</div>
	);
}
