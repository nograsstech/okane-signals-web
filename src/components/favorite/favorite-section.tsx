import * as React from "react";
import { SortAsc, SortDesc, RotateCcw, Heart } from "lucide-react";
import { storage } from "@/lib/utils/storage";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FavoriteCards, type FavoriteWithStats } from "./favorite-cards";
import { useFavorites } from "@/hooks/use-favorites";
import { useBacktestList } from "@/hooks/use-backtest-list";
import type { FavoriteStrategyConfig } from "@/lib/types/favorite";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";

type FavoriteWithBacktest = FavoriteWithStats;

type SortBy = "winRate" | "return" | "sharpe" | "createdAt";
type SortOrder = "asc" | "desc";

interface FavoriteSectionProps {
	className?: string;
}

// Helper function to match favorites with backtest data
function matchFavoritesWithBacktests(
	favorites: FavoriteStrategyConfig[],
	backtests: KeyStrategyBacktestStats[]
): FavoriteWithBacktest[] {
	const backtestMap = new Map<string, KeyStrategyBacktestStats>();

	backtests.forEach(backtest => {
		const key = `${backtest.ticker}-${backtest.strategy}-${backtest.period}-${backtest.interval}`;
		backtestMap.set(key, backtest);
	});

	return favorites.map(favorite => {
		const key = `${favorite.ticker}-${favorite.strategy}-${favorite.period}-${favorite.interval}`;
		const matchingBacktest = backtestMap.get(key);

		return {
			...favorite,
			// Add backtest data if available
			backtestId: matchingBacktest?.id || null,
			winRate: matchingBacktest?.winRate || null,
			returnPercentage: matchingBacktest?.returnPercentage || null,
			sharpeRatio: matchingBacktest?.sharpeRatio || null,
			lastUpdated: matchingBacktest?.created_at || null,
		};
	});
}

// Helper function to sort favorites
function sortFavorites(
	favorites: FavoriteWithBacktest[],
	sortBy: SortBy,
	sortOrder: SortOrder
): FavoriteWithBacktest[] {
	return [...favorites].sort((a, b) => {
		let compareValue = 0;

		switch (sortBy) {
			case "winRate":
				const winRateA = a.winRate || 0;
				const winRateB = b.winRate || 0;
				compareValue = winRateB - winRateA;
				break;
			case "return":
				const returnA = a.returnPercentage || 0;
				const returnB = b.returnPercentage || 0;
				compareValue = returnB - returnA;
				break;
			case "sharpe":
				const sharpeA = a.sharpeRatio || 0;
				const sharpeB = b.sharpeRatio || 0;
				compareValue = sharpeB - sharpeA;
				break;
			case "createdAt":
				const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
				const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
				compareValue = dateB - dateA;
				break;
		}

		return sortOrder === "desc" ? compareValue : -compareValue;
	});
}

export function FavoriteSection({ className }: FavoriteSectionProps) {
	const [sortBy, setSortBy] = React.useState<SortBy>(() => {
		return storage.get<SortBy>("favorites-sort-by") ?? "createdAt";
	});
	const [sortOrder, setSortOrder] = React.useState<SortOrder>(() => {
		return storage.get<SortOrder>("favorites-sort-order") ?? "desc";
	});

	const { data: favorites, isLoading: favoritesLoading, error: favoritesError, refetch: refetchFavorites } = useFavorites();
	const { data: backtests, isLoading: backtestsLoading, error: backtestsError, refetch: refetchBacktests } = useBacktestList();

	const [loading, setLoading] = React.useState(false);

	// Match favorites with backtest data
	const favoritesWithBacktests: FavoriteWithBacktest[] = React.useMemo(() => {
		if (!favorites || !backtests) return [];
		return matchFavoritesWithBacktests(favorites, backtests);
	}, [favorites, backtests]);

	// Sort favorites
	const sortedFavorites = React.useMemo(() => {
		if (!favoritesWithBacktests) return [];
		return sortFavorites(favoritesWithBacktests, sortBy, sortOrder);
	}, [favoritesWithBacktests, sortBy, sortOrder]);

	const handleSortChange = (value: SortBy) => {
		setSortBy(value as SortBy);
	};

	const handleSortOrderToggle = () => {
		setSortOrder(prev => prev === "asc" ? "desc" : "asc");
	};

	// Persist sort preferences to localStorage
	React.useEffect(() => {
		storage.set("favorites-sort-by", sortBy);
	}, [sortBy]);

	React.useEffect(() => {
		storage.set("favorites-sort-order", sortOrder);
	}, [sortOrder]);

	const handleRetry = async () => {
		setLoading(true);
		try {
			await refetchFavorites();
			await refetchBacktests();
			toast.success("Data refreshed successfully");
		} catch (error) {
			toast.error("Failed to refresh data");
		} finally {
			setLoading(false);
		}
	};

	if (favoritesError || backtestsError) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Heart className="h-5 w-5 text-red-500" />
						Error Loading Favorites
					</CardTitle>
					<CardDescription>
						Unable to load your favorite strategies. Please check your connection and try again.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-8 space-y-4">
						<div className="text-center space-y-2">
							{favoritesError && (
								<p className="text-sm text-muted-foreground">
									Favorites Error: {favoritesError.message}
								</p>
							)}
							{backtestsError && (
								<p className="text-sm text-muted-foreground">
									Strategy Data Error: {backtestsError.message}
								</p>
							)}
						</div>
						<Button onClick={handleRetry} disabled={loading} className="w-full">
							{loading ? (
								<>
									<RotateCcw className="mr-2 h-4 w-4 animate-spin" />
									Refreshing...
								</>
							) : (
								<>
									<RotateCcw className="mr-2 h-4 w-4" />
									Retry
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (favoritesLoading || backtestsLoading) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Heart className="h-5 w-5 animate-pulse" />
						Favorite Strategies
					</CardTitle>
					<CardDescription>Loading your favorite strategies...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="animate-pulse space-y-3">
								<div className="flex items-center justify-between">
									<div className="space-y-2">
										<div className="h-4 bg-gray-200 rounded w-3/4"></div>
										<div className="h-4 bg-gray-200 rounded w-1/2"></div>
									</div>
									<div className="h-8 bg-gray-200 rounded w-8"></div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const hasFavorites = sortedFavorites.length > 0;

	return (
		<Card className={className}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Heart className="h-5 w-5" />
							Favorite Strategies
						</CardTitle>
						<CardDescription>
							{hasFavorites
								? `${sortedFavorites.length} favorite strategies`
								: "No favorite strategies yet. Add strategies to your favorites to see them here!"
							}
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Select value={sortBy} onValueChange={handleSortChange}>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="createdAt">Date</SelectItem>
								<SelectItem value="winRate">Win Rate</SelectItem>
								<SelectItem value="return">Return</SelectItem>
								<SelectItem value="sharpe">Sharpe Ratio</SelectItem>
							</SelectContent>
						</Select>
						<Button
							variant="outline"
							size="sm"
							onClick={handleSortOrderToggle}
							className="whitespace-nowrap"
						>
							{sortOrder === "asc" ? (
								<SortAsc className="h-4 w-4" />
							) : (
								<SortDesc className="h-4 w-4" />
							)}
							<span className="ml-1">{sortOrder === "asc" ? "A-Z" : "Z-A"}</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleRetry}
							disabled={loading}
							className="whitespace-nowrap"
						>
							<RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
							<span className="ml-1">Refresh</span>
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{hasFavorites ? (
					<FavoriteCards
						favorites={sortedFavorites}
						sortBy={sortBy}
						className="mt-6"
					/>
				) : (
					<div className="flex flex-col items-center justify-center py-12">
						<Heart className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-muted-foreground text-center max-w-md">
							No favorite strategies found. Start favoriting strategies to see them here!
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}