// Custom hook for fetching and transforming chart data

import { useMemo } from "react";
import type { Signal, TradeAction } from "@/lib/types/strategy";
import { transformChartData } from "../utils/data-transformers";
import type { TransformedChartData } from "../types/chart.types";

interface UseChartDataParams {
	signals: Signal[] | undefined;
	tradeActions?: TradeAction[] | undefined;
	enabled?: boolean;
	daysBack?: number | null;
}

/**
 * Hook for fetching and transforming data for the trading chart
 * This hook accepts raw signals and trade actions data and transforms them
 * into the format expected by lightweight-charts
 *
 * @param params - Configuration object with signals, tradeActions, and enabled flag
 * @returns Transformed chart data with loading and error states
 */
export function useChartData({
	signals,
	tradeActions,
	daysBack = null,
}: UseChartDataParams): TransformedChartData & { isLoading: boolean; error: Error | null } {
	// Transform data using useMemo to avoid re-computation on every render
	const transformedData = useMemo(() => {
		if (!signals || signals.length === 0) {
			return {
				candlestickData: [],
				volumeData: [],
				tradeMarkers: [],
				priceLines: [],
			};
		}

		return transformChartData(signals, tradeActions, daysBack);
	}, [signals, tradeActions, daysBack]);

	return {
		...transformedData,
		isLoading: !signals || signals.length === 0,
		error: null,
	};
}
