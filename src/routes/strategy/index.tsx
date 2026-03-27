import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, LayoutGrid, List, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth";
import { FavoriteSection } from "@/components/favorite/favorite-section";
import Layout from "@/components/Layout";
import { StrategyGrid } from "@/components/strategy/strategy-grid";
import { StrategyTable } from "@/components/strategy/strategy-table";
import { TableLoadingSkeleton } from "@/components/strategy/table-loading-skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavorites } from "@/hooks/use-favorites";
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
	const { data: favorites } = useFavorites();
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

	const favoriteCount = favorites?.length ?? 0;

	return (
		<div className="min-h-screen w-full max-w-full overflow-x-hidden p-4 sm:p-6">
			{/* Page header */}
			<div className="flex items-center justify-between mb-6 sm:mb-8">
				<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
					Trading Strategies
				</h2>
				<Link to="/strategy/create" className="shrink-0">
					<Button size="sm" className="gap-2">
						<Plus className="w-4 h-4" />
						<span className="hidden sm:inline">Create Strategy</span>
						<span className="sm:hidden">Create</span>
					</Button>
				</Link>
			</div>

			<Tabs defaultValue="strategies">
				{/* Unified tab + view control bar */}
				<div className="flex items-center justify-between gap-4 mb-6">
					<TabsList className="h-9">
						<TabsTrigger value="strategies" className="gap-1.5 text-sm">
							<List className="w-3.5 h-3.5" />
							<span>Strategies</span>
							{strategies && (
								<span className="ml-0.5 font-mono text-muted-foreground tabular-nums">
									({strategies.length})
								</span>
							)}
						</TabsTrigger>
						<TabsTrigger value="favorites" className="gap-1.5 text-sm">
							<Heart className="w-3.5 h-3.5" />
							<span>Favorites</span>
							{favoriteCount > 0 && (
								<span className="ml-0.5 font-mono text-muted-foreground tabular-nums">
									({favoriteCount})
								</span>
							)}
						</TabsTrigger>
					</TabsList>

					{/* View mode toggle — only meaningful on the strategies tab */}
					<div className="flex bg-muted/30 p-1 rounded-lg border border-border/50 gap-1">
						<button
							type="button"
							onClick={() => setViewMode("table")}
							className={`p-1.5 rounded-md transition-all ${
								viewMode === "table"
									? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
									: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
							}`}
							title="Table view"
							aria-label="Table view"
						>
							<List className="w-4 h-4" />
						</button>
						<button
							type="button"
							onClick={() => setViewMode("grid")}
							className={`p-1.5 rounded-md transition-all ${
								viewMode === "grid"
									? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
									: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
							}`}
							title="Grid view"
							aria-label="Grid view"
						>
							<LayoutGrid className="w-4 h-4" />
						</button>
					</div>
				</div>

				<TabsContent value="strategies" className="mt-0">
					{strategies &&
						(viewMode === "table" ? (
							<StrategyTable data={strategies} />
						) : (
							<StrategyGrid data={strategies} />
						))}
				</TabsContent>

				<TabsContent value="favorites" className="mt-0">
					<FavoriteSection />
				</TabsContent>
			</Tabs>
		</div>
	);
}

function LoadingState() {
	return (
		<div className="min-h-screen w-full max-w-full overflow-x-hidden p-4 sm:p-6">
			<div className="flex items-center justify-between mb-6 sm:mb-8">
				<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
					Trading Strategies
				</h2>
				<Link to="/strategy/create" className="shrink-0">
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
