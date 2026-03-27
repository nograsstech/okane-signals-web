import { useQuery } from "@tanstack/react-query";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";
import { getStrategyList } from "@/api/strategy-api";

// Query key factory
export const backtestListKeys = {
	all: ["backtestList"] as const,
	list: () => [...backtestListKeys.all, "list"] as const,
};

// Fetch all backtest strategies
export function useBacktestList() {
	return useQuery({
		queryKey: backtestListKeys.list(),
		queryFn: async (): Promise<KeyStrategyBacktestStats[]> => {
			try {
				return await getStrategyList();
			} catch (error) {
				console.error("Failed to fetch backtest list:", error);
				throw new Error("Failed to load strategies");
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 1,
	});
}