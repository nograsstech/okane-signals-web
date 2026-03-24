import { useQuery } from "@tanstack/react-query";
import { getOkaneClient } from "@/lib/okane-finance-api/okane-client";
import type { HMMResponseDTO } from "@/lib/okane-finance-api/generated";

interface UseHmmRegimesParams {
	ticker: string;
	period?: string;
	interval?: string;
	enabled?: boolean;
}

export function useHmmRegimes({
	ticker,
	period,
	interval,
	enabled = true,
}: UseHmmRegimesParams) {
	return useQuery<HMMResponseDTO>({
		queryKey: ["hmm-regimes", ticker, period, interval],
		queryFn: () =>
			getOkaneClient().getHmmRegimesSignalsHmmRegimesGet({
				ticker,
				// Period is an empty interface, cast as any for string values
				period: period as any,
				interval,
			}),
		enabled: enabled && !!ticker,
		staleTime: 5 * 60 * 1000,
	});
}
