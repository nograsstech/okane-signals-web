// Tanstack Query hook for fetching strategy list
import { useQuery } from "@tanstack/react-query";
import { getStrategyList } from "@/api/strategy-api";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";

export function useStrategies() {
	return useQuery<KeyStrategyBacktestStats[]>({
		queryKey: ["strategies"],
		queryFn: getStrategyList,
		staleTime: 20 * 1000, // 20 seconds - matches Svelte cache header
	});
}
