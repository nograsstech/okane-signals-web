import * as React from "react";
import { Heart, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteToggle } from "./favorite-toggle";
import type { FavoriteStrategyConfig, FavoriteStrategy } from "@/lib/types/favorite";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";
import { getSignals } from "@/api/strategy-api";

interface FavoriteCardsProps {
	favorites: FavoriteStrategyConfig[];
	sortBy?: "winRate" | "return" | "sharpe" | "createdAt";
	emptyMessage?: string;
	className?: string;
}

// Fetch backtest stats for a favorite strategy
async function fetchFavoriteStats(config: FavoriteStrategyConfig): Promise<KeyStrategyBacktestStats | null> {
	try {
		const response = await fetch(`/api/strategy?ticker=${config.ticker}&period=${config.period}&interval=${config.interval}&strategy=${config.strategy}`);
		if (!response.ok) {
			return null;
		}
		const data = await response.json();
		return data[0] || null;
	} catch (error) {
		console.error("Failed to fetch stats for favorite:", error);
		return null;
	}
}

// Sort function for favorites
function sortFavorites(favorites: FavoriteStrategyConfig[], statsMap: Map<string, KeyStrategyBacktestStats>, sortBy: "winRate" | "return" | "sharpe" | "createdAt"): FavoriteStrategyConfig[] {
	return [...favorites].sort((a, b) => {
		const statsA = statsMap.get(`${a.ticker}-${a.strategy}-${a.period}-${a.interval}`);
		const statsB = statsMap.get(`${b.ticker}-${b.strategy}-${b.period}-${b.interval}`);

		switch (sortBy) {
			case "winRate":
				const winRateA = statsA?.winRate || 0;
				const winRateB = statsB?.winRate || 0;
				return winRateB - winRateA;
			case "return":
				const returnA = statsA?.returnPercentage || 0;
				const returnB = statsB?.returnPercentage || 0;
				return returnB - returnA;
			case "sharpe":
				const sharpeA = statsA?.sharpeRatio || 0;
				const sharpeB = statsB?.sharpeRatio || 0;
				return sharpeB - sharpeA;
			case "createdAt":
				const dateA = statsA?.created_at ? new Date(statsA.created_at).getTime() : 0;
				const dateB = statsB?.created_at ? new Date(statsB.created_at).getTime() : 0;
				return dateB - dateA;
			default:
				return 0;
		}
	});
}

// Helper to get color for win rate
function getWinRateColor(winRate: number): string {
	if (winRate >= 0.6) return "text-green-600";
	if (winRate >= 0.4) return "text-yellow-600";
	return "text-red-600";
}

// Helper to get color for return
function getReturnColor(returnPercentage: number): string {
	if (returnPercentage > 0) return "text-green-600";
	if (returnPercentage < 0) return "text-red-600";
	return "text-gray-600";
}

// Helper to format percentage
function formatPercentage(value: number): string {
	return `${(value * 100).toFixed(1)}%`;
}

// Helper to get trend icon for return
function getReturnIcon(returnPercentage: number) {
	if (returnPercentage > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
	if (returnPercentage < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
	return <Minus className="h-4 w-4 text-gray-600" />;
}

// Helper to get trend icon for win rate
function getWinRateIcon(winRate: number) {
	if (winRate >= 0.6) return <TrendingUp className="h-4 w-4 text-green-600" />;
	if (winRate >= 0.4) return <TrendingDown className="h-4 w-4 text-yellow-600" />;
	return <TrendingDown className="h-4 w-4 text-red-600" />;
}

const FavoriteCards = React.forwardRef<HTMLDivElement, FavoriteCardsProps>(
	({
		favorites,
		sortBy = "createdAt",
		emptyMessage = "No favorite strategies found. Start favoriting strategies to see them here!",
		className = ""
	}, ref) => {
		const [statsMap, setStatsMap] = React.useState<Map<string, KeyStrategyBacktestStats>>(new Map());
		const [loadingStats, setLoadingStats] = React.useState<boolean>(true);

		// Fetch stats for all favorites
		React.useEffect(() => {
			if (favorites.length === 0) {
				setLoadingStats(false);
				return;
			}

			const fetchAllStats = async () => {
				const newStatsMap = new Map<string, KeyStrategyBacktestStats>();
				const statsPromises = favorites.map(async (fav) => {
					const stats = await fetchFavoriteStats(fav);
					if (stats) {
						newStatsMap.set(`${fav.ticker}-${fav.strategy}-${fav.period}-${fav.interval}`, stats);
					}
				});

				await Promise.all(statsPromises);
				setStatsMap(newStatsMap);
				setLoadingStats(false);
			};

			fetchAllStats();
		}, [favorites]);

		// Sort favorites based on stats
		const sortedFavorites = sortFavorites(favorites, statsMap, sortBy);

		const renderFavoriteCard = (favorite: FavoriteStrategyConfig) => {
			const stats = statsMap.get(`${favorite.ticker}-${favorite.strategy}-${favorite.period}-${favorite.interval}`);

			return (
				<Card key={`${favorite.ticker}-${favorite.strategy}-${favorite.period}-${favorite.interval}`} className="h-full flex flex-col">
					<CardHeader className="flex flex-col h-48">
						<div className="flex justify-between items-start">
							<div className="flex-1 min-w-0">
								<CardTitle className="text-lg font-mono truncate">
									{favorite.ticker} | {favorite.strategy}
								</CardTitle>
								<CardDescription className="text-sm">
									{favorite.period} • {favorite.interval}
								</CardDescription>
							</div>
							<FavoriteToggle
								config={favorite}
								variant="ghost"
								size="sm"
								className="ml-2"
							/>
						</div>
					</CardHeader>
					<CardContent className="flex-1 flex flex-col space-y-4">
						{stats ? (
							<>
								{/* Win Rate */}
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Win Rate</span>
										{getWinRateIcon(stats.winRate)}
									</div>
									<p className={`text-lg font-semibold ${getWinRateColor(stats.winRate)}`}>
										{formatPercentage(stats.winRate)}
									</p>
								</div>

								{/* Return */}
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Return</span>
										{getReturnIcon(stats.returnPercentage)}
									</div>
									<p className={`text-lg font-semibold ${getReturnColor(stats.returnPercentage)}`}>
										{formatPercentage(stats.returnPercentage)}
									</p>
								</div>

								{/* Sharpe Ratio */}
								<div className="space-y-1">
									<span className="text-sm font-medium">Sharpe Ratio</span>
									<p className="text-lg font-semibold">
										{stats.sharpeRatio.toFixed(2)}
									</p>
								</div>

								 {/* Date Badge */}
								<div className="mt-auto pt-2">
									<Badge variant="outline" className="text-xs">
										{new Date(stats.created_at).toLocaleDateString()}
									</Badge>
								</div>
							</>
						) : (
							<div className="text-center text-muted-foreground py-8">
								<Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
								<p className="text-sm">Stats not available</p>
							</div>
						)}
					</CardContent>
				</Card>
			);
		};

		if (loadingStats) {
			return (
				<div ref={ref} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
					{Array.from({ length: Math.min(favorites.length, 8) }).map((_, i) => (
						<Card key={i} className="h-full">
							<CardHeader className="flex flex-col h-48">
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</CardHeader>
							<CardContent className="flex-1 flex flex-col space-y-4">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
								<Skeleton className="h-8 w-20" />
							</CardContent>
						</Card>
					))}
				</div>
			);
		}

		if (sortedFavorites.length === 0) {
			return (
				<div ref={ref} className={`flex flex-col items-center justify-center py-12 ${className}`}>
					<Heart className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-muted-foreground text-center">{emptyMessage}</p>
				</div>
			);
		}

		return (
			<div ref={ref} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
				{sortedFavorites.map(renderFavoriteCard)}
			</div>
		);
	}
);

FavoriteCards.displayName = "FavoriteCards";

export { FavoriteCards };