// Strategy API client
// Handles all strategy-related API calls

import type {
	KeyStrategyBacktestStats,
	SignalResponseDTO,
	TradeAction,
} from "@/lib/types/strategy";
import { apiFetchOkaneSignals } from "./api-client";

// Get all strategies list
export function getStrategyList(): Promise<KeyStrategyBacktestStats[]> {
	return apiFetchOkaneSignals<KeyStrategyBacktestStats[]>("/api/strategy/list");
}

// Get single strategy backtest data
export function getStrategy(id: string): Promise<KeyStrategyBacktestStats[]> {
	return apiFetchOkaneSignals<KeyStrategyBacktestStats[]>(`/api/strategy?id=${id}`);
}

// Get trade actions for a backtest
export function getTradeActions(
	backtestId: string,
): Promise<{ tradeActionsList: TradeAction[] }> {
	return apiFetchOkaneSignals(`/api/strategy/tradeActions?backtest_id=${backtestId}`);
}

// Get signals for a strategy
export function getSignals(params: {
	ticker: string;
	period: string;
	interval: string;
	strategy: string;
}): Promise<{ signals: SignalResponseDTO }> {
	const searchParams = new URLSearchParams({
		ticker: params.ticker,
		period: params.period,
		interval: params.interval,
		strategy: params.strategy,
	});
	return apiFetchOkaneSignals(`/api/strategy/signals?${searchParams}`);
}

// Get backtest HTML (compressed with pako)
// This function fetches and decompresses the backtest HTML for visualization
export async function getBacktestHtml(id: string): Promise<string> {
	// Use the local API endpoint which will query the database
	const response = await fetch(`/api/strategy?id=${id}&html=true`);
	if (!response.ok) {
		throw new Error(`Failed to fetch backtest HTML: ${response.statusText}`);
	}

	const data = await response.json();
	if (!data || !data[0] || !data[0].html) {
		throw new Error("Invalid backtest data received");
	}

	// The HTML is compressed with pako and base64 encoded
	const compressedBase64 = data[0].html;

	// Convert base64 to Uint8Array
	const compressedData = Uint8Array.from(atob(compressedBase64), (c) =>
		c.charCodeAt(0),
	);

	// Decompress using pako
	const pako = await import("pako");
	const decompressedData = pako.inflate(compressedData, { to: "string" });

	return decompressedData;
}

export interface ToggleNotificationParams {
	id: string;
	notificationsOn: boolean;
}

// Toggle notification for a strategy
export async function toggleNotification(
	params: ToggleNotificationParams,
): Promise<KeyStrategyBacktestStats> {
	const response = await fetch(`/api/strategy/${params.id}/notification`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ notificationsOn: params.notificationsOn }),
	});

	if (!response.ok) {
		const error = (await response.json()) as { error: string };
		throw new Error(error.error || "Failed to update notification");
	}

	return response.json();
}
