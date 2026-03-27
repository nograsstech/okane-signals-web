import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid, List, Plus, Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { StrategyGrid } from "@/components/strategy/strategy-grid";
import { StrategyTable } from "@/components/strategy/strategy-table";
import { FavoriteSection } from "@/components/favorite/favorite-section";
import { TableLoadingSkeleton } from "@/components/strategy/table-loading-skeleton";
import { useStrategies } from "@/hooks/use-strategies";
import { useFavorites } from "@/hooks/use-favorites";
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
	const { data: favorites } = useFavorites();
	const [viewMode, setViewMode] = useState<"table" | "grid">(() => {
		return storage.get<"table" | "grid">("strategy-view-mode") ?? "table";
	});
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

	// Filter strategies based on favorites status
	const filteredStrategies = useMemo(() => {
		if (!showFavoritesOnly || !favorites || !strategies) {
			return strategies;
		}

		const favoriteSet = new Set(
			favorites.map(fav => `${fav.ticker}-${fav.strategy}-${fav.period}-${fav.interval}`)
		);

		return strategies.filter(strategy =>
			favoriteSet.has(`${strategy.ticker}-${strategy.strategy}-${strategy.period}-${strategy.interval}`)
		);
	}, [strategies, favorites, showFavoritesOnly]);

	useEffect(() => {
		storage.set("strategy-view-mode", viewMode);
	}, [viewMode]);

	if (isLoading) {
		return <LoadingState />;
	}

	if (error) {
		return (
			<div className="min-h-screen w-full max-w-full overflow-x-hidden p-6">
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
		<div className="min-h-screen w-full max-w-full overflow-x-hidden p-4 sm:p-6">
			{/* Header - responsive layout */}
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
				<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
					Trading Strategies
				</h2>

				{/* Action buttons - stack on mobile, row on desktop */}
				<div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
					<div className="flex bg-muted/30 p-1 rounded-lg border border-border/50 gap-1">
						<button
							type="button"
							onClick={() => setViewMode("table")}
							className={`p-2 rounded-md transition-all ${viewMode === "table" ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
							title="Table View"
							aria-label="Table view"
						>
							<List className="w-5 h-5" />
						</button>
						<button
							type="button"
							onClick={() => setViewMode("grid")}
							className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
							title="Grid View"
							aria-label="Grid view"
						>
							<LayoutGrid className="w-5 h-5" />
						</button>
					</div>

					<Link to="/strategy/create" className="shrink-0">
						<Button size="sm" className="gap-2">
							<Plus className="w-4 h-4" />
							<span className="hidden sm:inline">Create Strategy</span>
							<span className="sm:hidden">Create</span>
						</Button>
					</Link>
				</div>

				{/* Filter buttons */}
				<div className="flex items-center gap-2">
					<Button
						variant={showFavoritesOnly ? "secondary" : "outline"}
						size="sm"
						onClick={() => setShowFavoritesOnly(false)}
						className="flex items-center gap-2"
					>
						<List className="w-4 h-4" />
						<span>All Strategies</span>
					</Button>
					<Button
						variant={showFavoritesOnly ? "outline" : "secondary"}
						size="sm"
						onClick={() => setShowFavoritesOnly(true)}
						className="flex items-center gap-2"
					>
						<Heart className="w-4 h-4" />
						<span>Favorites Only</span>
					</Button>
				</div>
			</div>

			{/* Favorite Strategies Section */}
			<div className="mb-8">
				<FavoriteSection />
			</div>

			{filteredStrategies &&
				(viewMode === "table" ? (
					<StrategyTable data={filteredStrategies} />
				) : (
					<StrategyGrid data={filteredStrategies} />
				))}
		</div>
	);
}

function LoadingState() {
	return (
		<div className="min-h-screen w-full max-w-full overflow-x-hidden p-4 sm:p-6">
			{/* Header - responsive layout */}
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
				<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
					Trading Strategies
				</h2>
				<Link to="/strategy/create" className="shrink-0 self-start sm:self-auto">
					<Button size="sm" className="gap-2" disabled>
						<Plus className="w-4 h-4" />
						<span className="hidden sm:inline">Create Strategy</span>
						<span className="sm:hidden">Create</span>
					</Button>
				</Link>
			</div>
			<TableLoadingSkeleton />
		</div>
	);
}
