// Tanstack Query hook for fetching trade actions
import { useQuery } from "@tanstack/react-query";
import { getTradeActions } from "@/api/strategy-api";
import type { TradeAction } from "@/lib/types/strategy";

export function useTradeActions(backtestId: string) {
	return useQuery<{ tradeActionsList: TradeAction[] }>({
		queryKey: ["trade-actions", backtestId],
		queryFn: () => getTradeActions(backtestId),
		enabled: !!backtestId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
