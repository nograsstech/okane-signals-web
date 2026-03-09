// Tanstack Query hook for fetching trades
import { useQuery } from "@tanstack/react-query";
import { getTrades } from "@/api/trades-api";
import type { TradesParams } from "@/lib/types/strategy";

export function useTrades(params: TradesParams = {}) {
	return useQuery({
		queryKey: ["trades", params],
		queryFn: () => getTrades(params),
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: true,
		retry: 3,
	});
}
