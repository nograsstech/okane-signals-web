// Backtest API client
// Handles backtest replay data fetching

import { getOkaneClient } from "@/lib/okane-finance-api/okane-client";
import type { BacktestStats } from "@/lib/okane-finance-api/generated/models";

export interface BacktestReplayResponse {
	data: BacktestStats | null;
}

// Get backtest replay data from backend API
export async function getBacktestReplay(
	backtestId: number,
): Promise<BacktestReplayResponse> {
	const client = getOkaneClient();

	if (!backtestId || Number.isNaN(backtestId)) {
		return { data: null };
	}

	try {
		const replayData =
			await client.replayBacktestEndpointSignalsBacktestReplayGet({
				backtestId,
			});
		return { data: replayData.data ?? null };
	} catch (error) {
		console.error("Failed to fetch replay data:", error);
		return { data: null };
	}
}
