// Strategy API client
// Handles all strategy-related API calls

import { apiFetch } from "./api-client";
import type {
	KeyStrategyBacktestStats,
	TradeAction,
	SignalResponseDTO,
} from "@/lib/types/strategy";

// Get all strategies list
export function getStrategyList(): Promise<KeyStrategyBacktestStats[]> {
	return apiFetch<KeyStrategyBacktestStats[]>("/api/strategy/list");
}

// Get single strategy backtest data
export function getStrategy(id: string): Promise<KeyStrategyBacktestStats[]> {
	return apiFetch<KeyStrategyBacktestStats[]>(`/api/strategy?id=${id}`);
}

// Get trade actions for a backtest
export function getTradeActions(
	backtestId: string,
): Promise<{ tradeActionsList: TradeAction[] }> {
	return apiFetch(`/api/strategy/tradeActions?backtest_id=${backtestId}`);
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
	return apiFetch(`/api/strategy/signals?${searchParams}`);
}

// Get backtest HTML (compressed with pako)
// This function fetches and decompresses the backtest HTML for visualization
export async function getBacktestHtml(id: string): Promise<string> {
	const API_BASE_URL =
		import.meta.env.PUBLIC_OKANE_FINANCE_API_URL ||
		import.meta.env.OKANE_FINANCE_API_URL ||
		"http://localhost:8000";

	const response = await fetch(
		`${API_BASE_URL}/api/strategy?id=${id}&html=true`,
	);
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
