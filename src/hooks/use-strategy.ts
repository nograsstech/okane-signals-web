// Tanstack Query hook for fetching a single strategy
import { useQuery } from "@tanstack/react-query";
import { getStrategy } from "@/api/strategy-api";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";

export function useStrategy(id: string) {
	return useQuery<
		KeyStrategyBacktestStats[],
		Error,
		KeyStrategyBacktestStats | undefined
	>({
		queryKey: ["strategy", id],
		queryFn: () => getStrategy(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		select: (data) => data[0], // Return first item
	});
}
