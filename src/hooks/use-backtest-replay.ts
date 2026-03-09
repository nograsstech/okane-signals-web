// Tanstack Query hook for fetching backtest replay data
import { useQuery } from "@tanstack/react-query";
import { getBacktestReplay } from "@/api/backtest-api";

export function useBacktestReplay(backtestId: string | number) {
	const id = typeof backtestId === "string" ? parseInt(backtestId, 10) : backtestId;

	return useQuery({
		queryKey: ["backtestReplay", id],
		queryFn: () => getBacktestReplay(id),
		enabled: !!id && !Number.isNaN(id),
		staleTime: 10 * 60 * 1000, // 10 minutes - replay data doesn't change often
		retry: 1,
	});
}
