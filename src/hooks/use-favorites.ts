import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FavoriteStrategyConfig } from "@/lib/types/favorite";

interface FavoriteResponse {
	ticker: string;
	strategy: string;
	period: string;
	interval: string;
	createdAt: Date;
}

// Query key factory
export const favoritesKeys = {
	all: ["favorites"] as const,
	list: () => [...favoritesKeys.all, "list"] as const,
};

// Fetch all favorites
export function useFavorites() {
	return useQuery({
		queryKey: favoritesKeys.list(),
		queryFn: async (): Promise<FavoriteStrategyConfig[]> => {
			const response = await fetch("/api/user/favorites");
			if (!response.ok) {
				throw new Error("Failed to fetch favorites");
			}
			const data: FavoriteResponse[] = await response.json();
			return data.map((fav) => ({
				ticker: fav.ticker,
				strategy: fav.strategy,
				period: fav.period,
				interval: fav.interval,
			}));
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Toggle favorite (add or remove)
export function useFavoriteToggle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (config: FavoriteStrategyConfig & { isCurrentlyFavorite: boolean }) => {
			const { isCurrentlyFavorite, ...favoriteConfig } = config;

			if (isCurrentlyFavorite) {
				// Remove favorite
				const params = new URLSearchParams(favoriteConfig as any);
				const response = await fetch(`/api/user/favorites?${params}`, {
					method: "DELETE",
				});
				if (!response.ok) {
					throw new Error("Failed to remove favorite");
				}
				return { action: "removed", config: favoriteConfig };
			} else {
				// Add favorite
				const response = await fetch("/api/user/favorites", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(favoriteConfig),
				});
				if (!response.ok) {
					throw new Error("Failed to add favorite");
				}
				return { action: "added", config: favoriteConfig };
			}
		},
		onMutate: async (variables) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: favoritesKeys.list() });

			// Snapshot previous value
			const previousFavorites = queryClient.getQueryData<FavoriteStrategyConfig[]>(
				favoritesKeys.list(),
			);

			// Optimistically update
			if (variables.isCurrentlyFavorite) {
				// Remove from cache
				queryClient.setQueryData<FavoriteStrategyConfig[]>(
					favoritesKeys.list(),
					(old = []) =>
						old.filter(
							(fav) =>
								fav.ticker !== variables.ticker ||
								fav.strategy !== variables.strategy ||
								fav.period !== variables.period ||
								fav.interval !== variables.interval,
						),
				);
			} else {
				// Add to cache
				queryClient.setQueryData<FavoriteStrategyConfig[]>(
					favoritesKeys.list(),
					(old = []) => [
						...old,
						{
							ticker: variables.ticker,
							strategy: variables.strategy,
							period: variables.period,
							interval: variables.interval,
						},
					],
				);
			}

			// Return context with previous value
			return { previousFavorites };
		},
		onError: (err, variables, context) => {
			// Rollback on error
			if (context?.previousFavorites) {
				queryClient.setQueryData(favoritesKeys.list(), context.previousFavorites);
			}
			toast.error("Failed to update favorites", {
				description: "Please try again.",
			});
		},
		onSuccess: (data) => {
			const message = data.action === "added" ? "Added to favorites" : "Removed from favorites";
			toast.success(message);
		},
		onSettled: () => {
			// Refetch to ensure consistency
			queryClient.invalidateQueries({ queryKey: favoritesKeys.list() });
		},
	});
}

// Helper hook to check if a config is favorited
export function useIsFavorite(config: FavoriteStrategyConfig) {
	const { data: favorites } = useFavorites();

	return {
		isFavorite: favorites?.some(
			(fav) =>
				fav.ticker === config.ticker &&
				fav.strategy === config.strategy &&
				fav.period === config.period &&
				fav.interval === config.interval,
		),
	};
}
