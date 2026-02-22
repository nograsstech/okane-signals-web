// Tanstack Query hook for fetching trading signals
import { useQuery } from "@tanstack/react-query";
import { getSignals } from "@/api/strategy-api";
import type { SignalResponseDTO } from "@/lib/types/strategy";

interface UseSignalsParams {
	ticker: string;
	period: string;
	interval: string;
	strategy: string;
	enabled?: boolean;
}

export function useSignals({
	ticker,
	period,
	interval,
	strategy,
	enabled = true,
}: UseSignalsParams) {
	return useQuery<{ signals: SignalResponseDTO }>({
		queryKey: ["signals", ticker, period, interval, strategy],
		queryFn: () => getSignals({ ticker, period, interval, strategy }),
		enabled: enabled && !!ticker && !!period && !!interval && !!strategy,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
