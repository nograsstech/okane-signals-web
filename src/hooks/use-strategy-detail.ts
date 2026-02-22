// Composite hook for strategy detail page
// Orchestrates multiple queries: strategy, trade actions, and signals
import { useStrategy } from "./use-strategy";
import { useTradeActions } from "./use-trade-actions";
import { useSignals } from "./use-signals";

export function useStrategyDetail(id: string) {
	// Fetch strategy details first
	const strategyQuery = useStrategy(id);

	// Fetch trade actions (independent)
	const tradeActionsQuery = useTradeActions(id);

	// Fetch signals (depends on strategy data for params)
	const signalsQuery = useSignals({
		ticker: strategyQuery.data?.ticker ?? "",
		period: strategyQuery.data?.period ?? "",
		interval: strategyQuery.data?.interval ?? "",
		strategy: strategyQuery.data?.strategy ?? "",
		enabled: !!strategyQuery.data,
	});

	return {
		strategy: strategyQuery.data,
		strategyisLoading: strategyQuery.isLoading,
		strategyError: strategyQuery.error,
		tradeActions: tradeActionsQuery.data,
		tradeActionsisLoading: tradeActionsQuery.isLoading,
		tradeActionsError: tradeActionsQuery.error,
		signals: signalsQuery.data,
		signalsisLoading: signalsQuery.isLoading,
		signalsError: signalsQuery.error,
		isLoading:
			strategyQuery.isLoading ||
			tradeActionsQuery.isLoading ||
			signalsQuery.isLoading,
		error: strategyQuery.error || tradeActionsQuery.error || signalsQuery.error,
	};
}
