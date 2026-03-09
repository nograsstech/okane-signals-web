// Trades API client
// Handles all trades-related API calls

import { apiFetchOkaneSignals } from "./api-client";
import type { TradesParams, TradesResponse } from "@/lib/types/strategy";

export async function getTrades(params: TradesParams = {}): Promise<TradesResponse> {
	const searchParams = new URLSearchParams();

	// Only add params that are defined
	if (params.page) searchParams.set("page", String(params.page));
	if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
	if (params.ticker) searchParams.set("ticker", params.ticker);
	if (params.actionType) searchParams.set("actionType", params.actionType);
	if (params.startDate) searchParams.set("startDate", params.startDate);
	if (params.endDate) searchParams.set("endDate", params.endDate);
	if (params.search) searchParams.set("search", params.search);

	const queryString = searchParams.toString();
	const url = `/api/trades${queryString ? `?${queryString}` : ""}`;

	return apiFetchOkaneSignals<TradesResponse>(url);
}
